// Module-level holder for the access token. Kept outside React/Redux so the
// HTTP client can read the latest token synchronously without stale closures.
// The auth slice writes here on login/refresh and clears it on logout.
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}
