import { configureStore } from "@reduxjs/toolkit";
import modulesReducer from "./modulesSlice";
import authReducer    from "./authSlice";

export const store = configureStore({
  reducer: {
    modules: modulesReducer,
    auth:    authReducer,
  },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;