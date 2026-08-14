// Redux store configuration. Single store instance shared across the app; the
// HTTP client reads the access token from the module-level holder (not from
// here) to avoid import cycles, while React components use the typed hooks.
import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
