// Auth slice: holds the in-memory session (user + access token) and exposes
// async thunks that call the API layer. The access token is mirrored into the
// module-level holder in `lib/api/auth-token` so the HTTP client can attach it.
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  login as apiLogin,
  logout as apiLogout,
  logoutAll as apiLogoutAll,
  me as apiMe,
  refresh as apiRefresh,
  register as apiRegister,
  type LoginInput,
  type RegisterInput,
  type UserResponseDto,
} from "@/lib/api/auth";
import { setAccessToken } from "@/lib/api/auth-token";

export type AuthStatus = "idle" | "loading" | "authenticated" | "anonymous";

interface AuthState {
  user: UserResponseDto | null;
  accessToken: string | null;
  status: AuthStatus;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: "idle",
  error: null,
};

// Logs in, mirrors the token to the holder, and returns the credentials.
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (input: LoginInput) => {
    const res = await apiLogin(input);
    setAccessToken(res.accessToken);
    return res;
  },
);

// Registers a user. The backend issues no tokens, so this does NOT authenticate;
// callers should redirect to login afterwards.
export const registerThunk = createAsyncThunk(
  "auth/register",
  async (input: RegisterInput) => {
    return apiRegister(input);
  },
);

// Rotates the refresh cookie and returns a fresh access token.
export const refreshThunk = createAsyncThunk("auth/refresh", async () => {
  const res = await apiRefresh();
  setAccessToken(res.accessToken);
  return res;
});

// Fetches the current user profile using the held access token.
export const meThunk = createAsyncThunk("auth/me", async () => {
  return apiMe();
});

// Restores the session on app load: refresh (cookie) → access token → /me.
// Rejects (→ anonymous) when there is no valid refresh cookie.
export const bootstrapThunk = createAsyncThunk(
  "auth/bootstrap",
  async () => {
    const { accessToken } = await apiRefresh();
    setAccessToken(accessToken);
    const user = await apiMe();
    return { accessToken, user };
  },
);

// Revokes the current session and clears the local token.
export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  await apiLogout();
  setAccessToken(null);
});

// Revokes every session for the user and clears the local token.
export const logoutAllThunk = createAsyncThunk("auth/logoutAll", async () => {
  await apiLogoutAll();
  setAccessToken(null);
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Sets the full session (used by login/bootstrap fulfillments).
    setCredentials(
      state,
      action: { payload: { accessToken: string; user: UserResponseDto } },
    ) {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.status = "authenticated";
      state.error = null;
    },
    // Updates just the user (used by /me).
    setUser(state, action: { payload: UserResponseDto }) {
      state.user = action.payload;
    },
    // Resets to a logged-out state.
    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
      state.status = "anonymous";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.status = "authenticated";
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.error = action.error.message ?? "Login failed.";
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.error = action.error.message ?? "Registration failed.";
      })
      .addCase(refreshThunk.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.status = "authenticated";
      })
      .addCase(meThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(bootstrapThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(bootstrapThunk.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.status = "authenticated";
        state.error = null;
      })
      .addCase(bootstrapThunk.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.status = "anonymous";
        state.error = null;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.status = "anonymous";
        state.error = null;
      })
      .addCase(logoutAllThunk.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.status = "anonymous";
        state.error = null;
      });
  },
});

export const { setCredentials, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
