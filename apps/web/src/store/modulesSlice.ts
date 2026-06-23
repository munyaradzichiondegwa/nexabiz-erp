import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/** All 20 modules; core modules cannot be toggled off in the UI */
interface ModulesState {
  enabled: Record<string, boolean>;
}

const initialState: ModulesState = {
  enabled: {
    "MOD-01": true, "MOD-02": true, "MOD-03": true, "MOD-04": true,
    "MOD-05": true, "MOD-06": true, "MOD-07": true, "MOD-08": true,
    "MOD-09": true, "MOD-10": true, "MOD-11": true, "MOD-12": true,
    "MOD-13": true, "MOD-14": true, "MOD-15": true, "MOD-16": true,
    "MOD-17": true, "MOD-18": true, "MOD-19": true, "MOD-20": true,
  },
};

const CORE = new Set(["MOD-01","MOD-02","MOD-06","MOD-07","MOD-13","MOD-14"]);

const modulesSlice = createSlice({
  name: "modules",
  initialState,
  reducers: {
    toggle(state, action: PayloadAction<string>) {
      const code = action.payload;
      if (CORE.has(code)) return; // core modules cannot be disabled
      state.enabled[code] = !state.enabled[code];
    },
  },
});

export const { toggle } = modulesSlice.actions;
export default modulesSlice.reducer;