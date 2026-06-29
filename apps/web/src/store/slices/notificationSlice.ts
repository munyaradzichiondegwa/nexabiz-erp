import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

export interface AppNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
}

interface NotificationState {
  notifications: AppNotification[]
  unreadCount: number
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<AppNotification>) {
      state.notifications.unshift(action.payload)
      if (!action.payload.read) state.unreadCount += 1
    },
    markAsRead(state, action: PayloadAction<string>) {
      const n = state.notifications.find((n) => n.id === action.payload)
      if (n && !n.read) { n.read = true; state.unreadCount = Math.max(0, state.unreadCount - 1) }
    },
    markAllRead(state) {
      state.notifications.forEach((n) => { n.read = true })
      state.unreadCount = 0
    },
    clearAll(state) {
      state.notifications = []
      state.unreadCount = 0
    },
  },
})

export const { addNotification, markAsRead, markAllRead, clearAll } = notificationSlice.actions
export const selectNotifications = (state: RootState) => state.notifications.notifications
export const selectUnreadCount = (state: RootState) => state.notifications.unreadCount
export default notificationSlice.reducer
