/**
 * @file auth.service.ts
 *
 * @description Business logic layer for authentication: registration, login,
 * refresh-token rotation, session revocation, and current-user lookup. Passwords
 * are bcrypt-hashed directly; refresh tokens are SHA-256 pre-hashed before
 * bcrypt so token rotation stays effective.
 */

import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "@/lib/apiError.js";
import { SessionRepository } from "./session.repository.js";
import { UserRepository } from "./user.repository.js";
import {
  hashData,
  hashTokenData,
  verifyData,
  verifyTokenData,
} from "@/infrastructure/auth/bcrypt.js";
import {
  AuthResponseDto,
  LoginDto,
  RegisterDto,
  UserResponseDto,
} from "./auth.dto.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/infrastructure/auth/jwt.js";
import { calculateExpiry, toUserResponseDto } from "./auth.utils.js";

/** Coordinates auth operations with the user and session repositories. */
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  /** Registers a user, rejecting duplicate emails and hashing the password. */
  async register(dto: RegisterDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findUserByEmail(dto.email);

    if (existingUser) throw ConflictError("User already exists.");

    const passwordHash = await hashData(dto.password);

    const res = await this.userRepository.createUser({
      name: dto.name,
      email: dto.email,
      passwordHash,
      avatarUrl: dto.avatarUrl,
    });

    return toUserResponseDto(res);
  }

  /**
   * Verifies credentials, creates a session, and signs access + refresh tokens,
   * persisting the hashed refresh token with the session.
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findUserByEmail(dto.email);

    if (!user) throw UnauthorizedError("Invalid email or password");

    const validPassword = await verifyData(dto.password, user.passwordHash);

    if (!validPassword) throw UnauthorizedError("Invalid email or password");

    const session = await this.sessionRepository.createSession({
      userId: user.id,
      refreshTokenHash: "",
      expiresAt: calculateExpiry(),
    });

    const payload = {
      sub: user.id,
      email: user.email,
      sid: session.id,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    const refreshTokenHash = await hashTokenData(refreshToken);

    await this.sessionRepository.updateSession(session.id, {
      refreshTokenHash,
    });

    return {
      accessToken,
      refreshToken,
      user: toUserResponseDto(user),
    };
  }

  /**
   * Validates a refresh token against its session and rotates it, updating the
   * stored hash so a previously issued (reused) token is rejected.
   */
  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);

    const session = await this.sessionRepository.findSessionById(payload.sid);

    if (!session) throw UnauthorizedError();

    if (session.revokedAt) throw UnauthorizedError("Session revoked.");

    if (session.expiresAt <= new Date())
      throw UnauthorizedError("Session expired.");

    const valid = await verifyTokenData(refreshToken, session.refreshTokenHash);

    if (!valid) throw UnauthorizedError();

    // Rotate refresh token
    const accessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);
    const newRefreshTokenHash = await hashTokenData(newRefreshToken);

    await this.sessionRepository.updateSession(session.id, {
      refreshTokenHash: newRefreshTokenHash,
    });

    return {
      accessToken,
      newRefreshToken,
    };
  }

  /** Revokes the session for the given session id. */
  async logout(sessionId: string) {
    await this.sessionRepository.revokeSession(sessionId);
  }

  /** Revokes every session belonging to the given user id. */
  async logoutAll(userId: string) {
    await this.sessionRepository.revokeAllUserSessions(userId);
  }

  /** Fetches a user by id, propagating NotFoundError when missing. */
  async getCurrentUser(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findUserById(userId);

    if (!user) throw NotFoundError();

    return toUserResponseDto(user);
  }
}
