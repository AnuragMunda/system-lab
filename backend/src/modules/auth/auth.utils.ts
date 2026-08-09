import { User } from "@/domain/auth/user.types.js";
import { UserResponseDto } from "./auth.dto.js";
import { env } from "@/config/env.js";
import ms from "ms";

export function calculateExpiry(): Date {
  const duration =
    typeof env.JWT_REFRESH_EXPIRES_IN === "number"
      ? env.JWT_REFRESH_EXPIRES_IN
      : ms(env.JWT_REFRESH_EXPIRES_IN);

  return new Date(Date.now() + duration);
}

export const toUserResponseDto = (user: User): UserResponseDto => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  };
};
