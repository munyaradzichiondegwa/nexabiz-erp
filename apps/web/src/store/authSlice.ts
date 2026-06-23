import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState { userId: string | null; role: string; }
const initialState: AuthState = { userId: null, role: "guest" };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ userId: string; role: string }>) {
      state.userId = action.payload.userId;
      state.role   = action.payload.role;
    },
    clearUser(state) { state.userId = null; state.role = "guest"; },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;