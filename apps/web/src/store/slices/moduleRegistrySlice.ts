/**
 * Module Registry Slice — PRD Section 23
 * Tracks which modules are active for the current tenant.
 * Synced on load from API; updated in real time via WebSocket.
 * Settings page can toggle modules which calls the API and updates this slice.
 */
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { apiClient } from "@/lib/api-client"
import type { RootState } from "@/store"

export interface ModuleStatus {
  code: string
  name: string
  desc: string
  isCore: boolean
  isActive: boolean
}

interface ModuleRegistryState {
  modules: ModuleStatus[]
  isLoading: boolean
  lastFetched: string | null
}

// Default all active so app works before API is connected
const DEFAULT_MODULES: ModuleStatus[] = [
  "MOD-01","MOD-02","MOD-03","MOD-04","MOD-05","MOD-06","MOD-07",
  "MOD-08","MOD-09","MOD-10","MOD-11","MOD-12","MOD-13","MOD-14",
  "MOD-15","MOD-16","MOD-17","MOD-18","MOD-19","MOD-20",
].map(code => ({ code, name: code, desc: "", isCore: ["MOD-01","MOD-02","MOD-06","MOD-07","MOD-13","MOD-14"].includes(code), isActive: true }))

const initialState: ModuleRegistryState = {
  modules: DEFAULT_MODULES,
  isLoading: false,
  lastFetched: null,
}

export const fetchModuleStatus = createAsyncThunk(
  "moduleRegistry/fetchStatus",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/modules/status")
      return res.data as ModuleStatus[]
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

const CORE_CODES = new Set(["MOD-01","MOD-02","MOD-06","MOD-07","MOD-13","MOD-14"])

const moduleRegistrySlice = createSlice({
  name: "moduleRegistry",
  initialState,
  reducers: {
    // Optimistic toggle (for Settings page immediate feedback)
    toggle(state, action: PayloadAction<string>) {
      const code = action.payload
      if (CORE_CODES.has(code)) return
      const mod = state.modules.find(m => m.code === code)
      if (mod) mod.isActive = !mod.isActive
    },
    moduleActivated(state, action: PayloadAction<string>) {
      const mod = state.modules.find(m => m.code === action.payload)
      if (mod) mod.isActive = true
    },
    moduleDeactivated(state, action: PayloadAction<string>) {
      const mod = state.modules.find(m => m.code === action.payload)
      if (mod) mod.isActive = false
    },
    setModules(state, action: PayloadAction<ModuleStatus[]>) {
      state.modules = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchModuleStatus.pending, (state) => { state.isLoading = true })
      .addCase(fetchModuleStatus.fulfilled, (state, action) => {
        state.modules = action.payload
        state.isLoading = false
        state.lastFetched = new Date().toISOString()
      })
      .addCase(fetchModuleStatus.rejected, (state) => { state.isLoading = false })
  },
})

export const { toggle, moduleActivated, moduleDeactivated, setModules } = moduleRegistrySlice.actions

// Selectors
export const selectActiveModuleCodes = (state: RootState) =>
  state.moduleRegistry.modules.filter(m => m.isActive).map(m => m.code)
export const selectAllModules = (state: RootState) => state.moduleRegistry.modules
export const selectModuleRegistryLoading = (state: RootState) => state.moduleRegistry.isLoading

export default moduleRegistrySlice.reducer
