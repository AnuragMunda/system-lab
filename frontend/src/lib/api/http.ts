// Thin fetch wrapper for the SystemLab API. Centralises the base URL, JSON
// handling, the Bearer access token, credentialed requests (refresh cookie),
// and the `{ success, message, data }` envelope used by every backend response.
import { getAccessToken } from "./auth-token";

// Base URL points at the Fastify/Express backend. Falls back to the local dev
// port (4000) when the env var is absent so the app still runs without config.
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

// Success envelope returned by controllers via ApiResponse (data is optional).
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
}

// Error thrown for any non-2xx or `success: false` response, carrying the
// backend's status/message/code so callers can map them to UI states.
export class ApiClientError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Performs a request against the API and returns the envelope's `data`.
// Always sends credentials so the HttpOnly refresh cookie travels with the
// request; attaches the Bearer token when one is currently held.
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await response.json()) as ApiEnvelope<T>;
  } catch {
    // Non-JSON bodies (e.g. empty) are treated as a generic failure below.
  }

  const ok = response.ok && body?.success === true;
  if (!ok) {
    throw new ApiClientError(
      body?.message ?? `Request failed (${response.status})`,
      response.status,
      body?.code,
      (body as { details?: unknown } | null)?.details,
    );
  }

  return body!.data as T;
}
