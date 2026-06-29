import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiClient } from '@/lib/api-client'
import type { RootState } from '@/store'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  tenantId: string
  roles: string[]
  permissions: string[]
  avatarUrl?: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string; mfaCode?: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post('/auth/login', credentials)
      return res.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Login failed')
    }
  }
)

export const refreshTokens = createAsyncThunk(
  'auth/refreshTokens',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.post('/auth/refresh')
      return res.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Token refresh failed')
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get('/auth/me')
      return res.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to fetch user')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      state.error = null
    },
    setTokens(state, action: PayloadAction<{ accessToken: string }>) {
      state.accessToken = action.payload.accessToken
      state.isAuthenticated = true
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.accessToken = action.payload.accessToken
        state.user = action.payload.user
        state.isAuthenticated = true
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(refreshTokens.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken
        state.isAuthenticated = true
      })
      .addCase(refreshTokens.rejected, (state) => {
        state.user = null
        state.accessToken = null
        state.isAuthenticated = false
      })
      .addCase(fetchCurrentUser.pending, (state) => { state.isLoading = true })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
        state.isLoading = false
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
      })
  },
})

export const { logout, setTokens, clearError } = authSlice.actions
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectAuthLoading = (state: RootState) => state.auth.isLoading
export const selectCurrentUser = (state: RootState) => state.auth.user
export default authSlice.reducer
