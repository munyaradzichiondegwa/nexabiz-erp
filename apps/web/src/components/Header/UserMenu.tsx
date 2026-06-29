import React, { useState } from 'react'
import { User, LogOut, Settings, HelpCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { logout } from '@/store/slices/authSlice'
import type { User as UserType } from '@/store/slices/authSlice'

interface UserMenuProps { user: UserType | null }

export const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const [open, setOpen] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg p-1 hover:bg-accent transition-colors"
        aria-label="User menu"
        aria-expanded={open}
      >
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
          {user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
        </div>
        {user && (
          <span className="hidden md:block text-sm font-medium">
            {user.firstName} {user.lastName}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-lg border bg-card shadow-lg p-1">
            {user && (
              <div className="px-3 py-2 border-b mb-1">
                <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            )}
            <button onClick={() => { navigate('/settings/profile'); setOpen(false) }}
              className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-accent transition-colors">
              <User className="h-4 w-4" /> Profile
            </button>
            <button onClick={() => { navigate('/settings'); setOpen(false) }}
              className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-accent transition-colors">
              <Settings className="h-4 w-4" /> Settings
            </button>
            <button onClick={() => { navigate('/docs'); setOpen(false) }}
              className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-accent transition-colors">
              <HelpCircle className="h-4 w-4" /> Help
            </button>
            <div className="border-t mt-1 pt-1">
              <button onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
