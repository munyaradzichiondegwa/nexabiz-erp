import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import moduleRegistryReducer from './slices/moduleRegistrySlice'
import uiReducer from './slices/uiSlice'
import notificationReducer from './slices/notificationSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    moduleRegistry: moduleRegistryReducer,
    ui: uiReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setTokens'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
