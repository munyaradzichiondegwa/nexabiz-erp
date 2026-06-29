import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

interface UIState {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  theme: 'light' | 'dark' | 'system'
  locale: string
}

const initialState: UIState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  theme: 'light',
  locale: 'en',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) { state.sidebarOpen = !state.sidebarOpen },
    setSidebarOpen(state, action: PayloadAction<boolean>) { state.sidebarOpen = action.payload },
    toggleSidebarCollapsed(state) { state.sidebarCollapsed = !state.sidebarCollapsed },
    setTheme(state, action: PayloadAction<'light' | 'dark' | 'system'>) { state.theme = action.payload },
    setLocale(state, action: PayloadAction<string>) { state.locale = action.payload },
  },
})

export const { toggleSidebar, setSidebarOpen, toggleSidebarCollapsed, setTheme, setLocale } = uiSlice.actions
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen
export const selectSidebarCollapsed = (state: RootState) => state.ui.sidebarCollapsed
export const selectTheme = (state: RootState) => state.ui.theme
export default uiSlice.reducer
