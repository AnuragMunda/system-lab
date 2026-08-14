// Typed Redux hooks. Use these instead of the plain `useDispatch`/`useSelector`
// so dispatch and state are correctly typed throughout the app.
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "./index";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

// Convenience selector for the auth slice.
export const useAuth = () => useAppSelector((state) => state.auth);
