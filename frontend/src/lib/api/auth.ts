// Auth API surface — one function per backend endpoint under `/api/v1/auth`.
// Each returns the envelope's `data` payload (typed). Token/refresh-cookie
// concerns are handled by the HTTP wrapper and the auth slice, not here.
import { apiFetch } from "./http";

// User profile returned by register/login/me. `createdAt` arrives as an ISO
// string over JSON; `avatarUrl` may be null/absent.
export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  emailVerified: boolean;
  createdAt: string;
}

// Payload sent to POST /register (avatarUrl optional, matches the Zod schema).
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
}

// Payload sent to POST /login.
export interface LoginInput {
  email: string;
  password: string;
}

// Registers a new user. The backend returns only the user (no tokens), so the
// caller should redirect to login rather than treat the session as authed.
export async function register(input: RegisterInput): Promise<UserResponseDto> {
  return apiFetch<UserResponseDto>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// Authenticates and returns the access token + user. The refresh token is set
// as an HttpOnly cookie by the backend and is not returned in the body.
export async function login(
  input: LoginInput,
): Promise<{ accessToken: string; user: UserResponseDto }> {
  return apiFetch("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// Rotates the refresh cookie and returns a fresh access token. Uses the cookie
// only (no body); throws if the cookie is missing/expired.
export async function refresh(): Promise<{ accessToken: string }> {
  return apiFetch("/api/v1/auth/refresh", { method: "POST" });
}

// Revokes the current session (clears the refresh cookie).
export async function logout(): Promise<void> {
  await apiFetch("/api/v1/auth/logout", { method: "POST" });
}

// Revokes every session for the user (clears the refresh cookie).
export async function logoutAll(): Promise<void> {
  await apiFetch("/api/v1/auth/logout-all", { method: "POST" });
}

// Returns the currently authenticated user (requires a valid access token).
export async function me(): Promise<UserResponseDto> {
  return apiFetch<UserResponseDto>("/api/v1/auth/me");
}
