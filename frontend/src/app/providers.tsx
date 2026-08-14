// Client boundary that mounts the Redux store and restores any existing session
// on first load. We dispatch `bootstrapThunk` directly via the store singleton
// (rather than a hook) so it runs regardless of where the tree is mounted.
"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";

import { store } from "@/store";
import { bootstrapThunk } from "@/store/authSlice";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Refresh cookie → access token → /me. Safe to fire on every load; it
    // resolves to "anonymous" when there is no valid refresh cookie.
    void store.dispatch(bootstrapThunk());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
