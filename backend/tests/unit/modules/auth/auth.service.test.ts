/**
 * @file auth.service.test.ts
 *
 * @description Unit tests for AuthService. The user/session repositories and
 * the bcrypt/jwt/auth.utils dependencies are mocked so only the service's
 * business rules (conflicts, 401 paths, refresh rotation) are exercised.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../src/modules/auth/user.repository.js", () => ({
  UserRepository: class {},
}));

vi.mock("../../../../src/modules/auth/session.repository.js", () => ({
  SessionRepository: class {},
}));

vi.mock("../../../../src/infrastructure/auth/bcrypt.js", () => ({
  hashData: vi.fn(),
  verifyData: vi.fn(),
  hashTokenData: vi.fn(),
  verifyTokenData: vi.fn(),
}));

vi.mock("../../../../src/infrastructure/auth/jwt.js", () => ({
  signAccessToken: vi.fn(),
  signRefreshToken: vi.fn(),
  verifyRefreshToken: vi.fn(),
}));

vi.mock("../../../../src/modules/auth/auth.utils.js", () => ({
  calculateExpiry: vi.fn(),
  toUserResponseDto: vi.fn(),
}));

import { AuthService } from "../../../../src/modules/auth/auth.service.js";
import { UserRepository } from "../../../../src/modules/auth/user.repository.js";
import { SessionRepository } from "../../../../src/modules/auth/session.repository.js";
import {
  hashData,
  hashTokenData,
  verifyData,
  verifyTokenData,
} from "../../../../src/infrastructure/auth/bcrypt.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../../../src/infrastructure/auth/jwt.js";
import {
  calculateExpiry,
  toUserResponseDto,
} from "../../../../src/modules/auth/auth.utils.js";
import { ApiError, UnauthorizedError } from "../../../../src/lib/apiError.js";

/** Mock user repository injected into the service under test. */
const userRepository = {
  findUserByEmail: vi.fn(),
  createUser: vi.fn(),
  findUserById: vi.fn(),
} as unknown as UserRepository;

/** Mock session repository injected into the service under test. */
const sessionRepository = {
  createSession: vi.fn(),
  findSessionById: vi.fn(),
  updateSession: vi.fn(),
  revokeSession: vi.fn(),
  revokeAllUserSessions: vi.fn(),
} as unknown as SessionRepository;

const service = new AuthService(userRepository, sessionRepository);

const uuid = "5b47bb24-2f9b-4e40-a1c5-4d2d5bce0f91";

/** A representative existing user row returned by the mocked repository. */
const existingUser = {
  id: uuid,
  name: "Ada Lovelace",
  email: "ada@test.local",
  passwordHash: "$2b$12$hashedpasswordvalue",
  avatarUrl: null,
  emailVerified: false,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

/** A representative non-revoked session row returned by the mocked repository. */
const existingSession = {
  id: "5e6f7g8h-1111-4e40-a1c5-4d2d5bce0f91",
  userId: uuid,
  refreshTokenHash: "$2b$12$hashedrefreshvalue",
  userAgent: null,
  ipAddress: null,
  expiresAt: new Date("2099-01-01T00:00:00.000Z"),
  lastUsedAt: null,
  revokedAt: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
};

const userResponseDto = {
  id: existingUser.id,
  name: existingUser.name,
  email: existingUser.email,
  avatarUrl: null,
  emailVerified: false,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
};

const registerDto = {
  name: "Ada Lovelace",
  email: "ada@test.local",
  password: "supersecret1",
};

const loginDto = {
  email: "ada@test.local",
  password: "supersecret1",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(calculateExpiry).mockReturnValue(
    new Date("2026-02-01T00:00:00.000Z"),
  );
});

describe("AuthService.register", () => {
  it("creates a user with a hashed password and maps the response dto", async () => {
    vi.mocked(userRepository.findUserByEmail).mockResolvedValue(null);
    vi.mocked(hashData).mockResolvedValue("$2b$12$generatedhash");
    vi.mocked(userRepository.createUser).mockResolvedValue(existingUser);
    vi.mocked(toUserResponseDto).mockReturnValue(userResponseDto);

    const result = await service.register(registerDto);

    expect(userRepository.findUserByEmail).toHaveBeenCalledWith(
      registerDto.email,
    );
    expect(hashData).toHaveBeenCalledWith(registerDto.password);
    expect(userRepository.createUser).toHaveBeenCalledWith({
      name: registerDto.name,
      email: registerDto.email,
      passwordHash: "$2b$12$generatedhash",
      avatarUrl: undefined,
    });
    expect(toUserResponseDto).toHaveBeenCalledWith(existingUser);
    expect(result).toEqual(userResponseDto);
  });

  it("throws ConflictError when the email is already registered", async () => {
    vi.mocked(userRepository.findUserByEmail).mockResolvedValue(existingUser);

    const promise = service.register(registerDto);

    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({
      message: "User already exists.",
      statusCode: 409,
      code: "CONFLICT",
    });
    expect(userRepository.createUser).not.toHaveBeenCalled();
  });

  it("propagates repository errors", async () => {
    const error = new Error("db down");
    vi.mocked(userRepository.findUserByEmail).mockRejectedValue(error);

    await expect(service.register(registerDto)).rejects.toThrow("db down");
  });

  it("propagates hashing errors", async () => {
    vi.mocked(userRepository.findUserByEmail).mockResolvedValue(null);
    const error = new Error("hash failed");
    vi.mocked(hashData).mockRejectedValue(error);

    await expect(service.register(registerDto)).rejects.toThrow("hash failed");
  });
});

describe("AuthService.login", () => {
  it("throws UnauthorizedError for an unknown email", async () => {
    vi.mocked(userRepository.findUserByEmail).mockResolvedValue(null);

    const promise = service.login(loginDto);

    await expect(promise).rejects.toMatchObject({
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
    expect(verifyData).not.toHaveBeenCalled();
  });

  it("throws UnauthorizedError for a wrong password", async () => {
    vi.mocked(userRepository.findUserByEmail).mockResolvedValue(existingUser);
    vi.mocked(verifyData).mockResolvedValue(false);

    const promise = service.login(loginDto);

    await expect(promise).rejects.toMatchObject({
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
    expect(sessionRepository.createSession).not.toHaveBeenCalled();
  });

  it("creates a session, signs tokens, and persists the refresh token hash", async () => {
    vi.mocked(userRepository.findUserByEmail).mockResolvedValue(existingUser);
    vi.mocked(verifyData).mockResolvedValue(true);
    vi.mocked(sessionRepository.createSession).mockResolvedValue(
      existingSession,
    );
    vi.mocked(signAccessToken).mockReturnValue("access-token");
    vi.mocked(signRefreshToken).mockReturnValue("refresh-token");
    vi.mocked(hashTokenData).mockResolvedValue("$2b$12$refreshtokenhash");
    vi.mocked(sessionRepository.updateSession).mockResolvedValue(
      existingSession,
    );
    vi.mocked(toUserResponseDto).mockReturnValue(userResponseDto);

    const result = await service.login(loginDto);

    expect(verifyData).toHaveBeenCalledWith(
      loginDto.password,
      existingUser.passwordHash,
    );
    expect(sessionRepository.createSession).toHaveBeenCalledWith({
      userId: existingUser.id,
      refreshTokenHash: "",
      expiresAt: new Date("2026-02-01T00:00:00.000Z"),
    });
    expect(signAccessToken).toHaveBeenCalledWith({
      sub: existingUser.id,
      email: existingUser.email,
      sid: existingSession.id,
    });
    expect(signRefreshToken).toHaveBeenCalledWith({
      sub: existingUser.id,
      email: existingUser.email,
      sid: existingSession.id,
    });
    expect(hashTokenData).toHaveBeenCalledWith("refresh-token");
    expect(sessionRepository.updateSession).toHaveBeenCalledWith(
      existingSession.id,
      {
        refreshTokenHash: "$2b$12$refreshtokenhash",
      },
    );
    expect(result).toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      user: userResponseDto,
    });
  });

  it("propagates repository errors", async () => {
    const error = new Error("db down");
    vi.mocked(userRepository.findUserByEmail).mockRejectedValue(error);

    await expect(service.login(loginDto)).rejects.toThrow("db down");
  });
});

describe("AuthService.refresh", () => {
  const payload = {
    sub: existingUser.id,
    email: existingUser.email,
    sid: existingSession.id,
  };

  it("propagates an invalid token error from jwt verification", async () => {
    vi.mocked(verifyRefreshToken).mockImplementation(() => {
      throw UnauthorizedError("Invalid or expired refresh token.");
    });

    const promise = service.refresh("bad-token");

    await expect(promise).rejects.toMatchObject({
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
    expect(sessionRepository.findSessionById).not.toHaveBeenCalled();
  });

  it("throws UnauthorizedError when the session no longer exists", async () => {
    vi.mocked(verifyRefreshToken).mockReturnValue(payload);
    vi.mocked(sessionRepository.findSessionById).mockResolvedValue(null);

    const promise = service.refresh("refresh-token");

    await expect(promise).rejects.toMatchObject({
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  });

  it("throws UnauthorizedError when the session has been revoked", async () => {
    vi.mocked(verifyRefreshToken).mockReturnValue(payload);
    vi.mocked(sessionRepository.findSessionById).mockResolvedValue({
      ...existingSession,
      revokedAt: new Date("2026-01-05T00:00:00.000Z"),
    });

    const promise = service.refresh("refresh-token");

    await expect(promise).rejects.toMatchObject({
      message: "Session revoked.",
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  });

  it("throws UnauthorizedError when the session has expired", async () => {
    vi.mocked(verifyRefreshToken).mockReturnValue(payload);
    vi.mocked(sessionRepository.findSessionById).mockResolvedValue({
      ...existingSession,
      expiresAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const promise = service.refresh("refresh-token");

    await expect(promise).rejects.toMatchObject({
      message: "Session expired.",
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  });

  it("throws UnauthorizedError when the token hash does not match", async () => {
    vi.mocked(verifyRefreshToken).mockReturnValue(payload);
    vi.mocked(sessionRepository.findSessionById).mockResolvedValue(
      existingSession,
    );
    vi.mocked(verifyTokenData).mockResolvedValue(false);

    const promise = service.refresh("wrong-token");

    await expect(promise).rejects.toMatchObject({
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
    expect(sessionRepository.updateSession).not.toHaveBeenCalled();
  });

  it("rotates the refresh token and returns new tokens", async () => {
    vi.mocked(verifyRefreshToken).mockReturnValue(payload);
    vi.mocked(sessionRepository.findSessionById).mockResolvedValue(
      existingSession,
    );
    vi.mocked(verifyTokenData).mockResolvedValue(true);
    vi.mocked(signAccessToken).mockReturnValue("new-access-token");
    vi.mocked(signRefreshToken).mockReturnValue("new-refresh-token");
    vi.mocked(hashTokenData).mockResolvedValue("$2b$12$newrefreshtokenhash");
    vi.mocked(sessionRepository.updateSession).mockResolvedValue(
      existingSession,
    );

    const result = await service.refresh("refresh-token");

    expect(verifyTokenData).toHaveBeenCalledWith(
      "refresh-token",
      existingSession.refreshTokenHash,
    );
    expect(sessionRepository.updateSession).toHaveBeenCalledWith(
      existingSession.id,
      {
        refreshTokenHash: "$2b$12$newrefreshtokenhash",
      },
    );
    expect(result).toEqual({
      accessToken: "new-access-token",
      newRefreshToken: "new-refresh-token",
    });
  });
});

describe("AuthService.logout", () => {
  it("revokes the session for the given id", async () => {
    vi.mocked(sessionRepository.revokeSession).mockResolvedValue(undefined);

    await service.logout(existingSession.id);

    expect(sessionRepository.revokeSession).toHaveBeenCalledWith(
      existingSession.id,
    );
    expect(sessionRepository.revokeSession).toHaveBeenCalledOnce();
  });
});

describe("AuthService.logoutAll", () => {
  it("revokes every session belonging to the user", async () => {
    vi.mocked(sessionRepository.revokeAllUserSessions).mockResolvedValue(
      undefined,
    );

    await service.logoutAll(existingUser.id);

    expect(sessionRepository.revokeAllUserSessions).toHaveBeenCalledWith(
      existingUser.id,
    );
    expect(sessionRepository.revokeAllUserSessions).toHaveBeenCalledOnce();
  });
});

describe("AuthService.getCurrentUser", () => {
  it("throws NotFoundError for an unknown user", async () => {
    vi.mocked(userRepository.findUserById).mockResolvedValue(null);

    const promise = service.getCurrentUser(uuid);

    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
    });
  });

  it("maps the user to the response dto", async () => {
    vi.mocked(userRepository.findUserById).mockResolvedValue(existingUser);
    vi.mocked(toUserResponseDto).mockReturnValue(userResponseDto);

    const result = await service.getCurrentUser(uuid);

    expect(userRepository.findUserById).toHaveBeenCalledWith(uuid);
    expect(toUserResponseDto).toHaveBeenCalledWith(existingUser);
    expect(result).toEqual(userResponseDto);
  });
});
