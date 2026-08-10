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

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

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

  async logout(sessionId: string) {
    await this.sessionRepository.revokeSession(sessionId);
  }

  async logoutAll(userId: string) {
    await this.sessionRepository.revokeAllUserSessions(userId);
  }

  async getCurrentUser(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findUserById(userId);

    if (!user) throw NotFoundError();

    return toUserResponseDto(user);
  }
}
