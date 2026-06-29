import React from 'react'
import { Bell, Menu, Search, Moon, Sun } from 'lucide-react'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { toggleSidebar, selectTheme, setTheme } from '@/store/slices/uiSlice'
import { selectCurrentUser } from '@/store/slices/authSlice'
import { selectUnreadCount } from '@/store/slices/notificationSlice'
import { UserMenu } from './UserMenu'
import { NotificationPanel } from './NotificationPanel'
import { cn } from '@/utils/cn'

export const Header: React.FC = () => {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector(selectCurrentUser)
  const unreadCount = useAppSelector(selectUnreadCount)
  const theme = useAppSelector(selectTheme)
  const [notifOpen, setNotifOpen] = React.useState(false)

  const toggleTheme = () => {
    dispatch(setTheme(theme === 'light' ? 'dark' : 'light'))
    document.documentElement.classList.toggle('dark')
  }

  return (
    <header
      className="sticky top-0 z-30 flex h-[var(--header-height)] items-center border-b bg-card px-4 gap-4"
      role="banner"
    >
      {/* Sidebar toggle */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="rounded-lg p-2 hover:bg-accent transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Global search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search transactions, products, customers…"
            className="w-full rounded-lg border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Global search"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 hover:bg-accent transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="rounded-lg p-2 hover:bg-accent transition-colors relative"
            aria-label={`Notifications (${unreadCount} unread)`}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
        </div>

        {/* User menu */}
        <UserMenu user={currentUser} />
      </div>
    </header>
  )
}
