import React from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectNotifications, markAsRead, markAllRead } from '@/store/slices/notificationSlice'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/utils/cn'

interface Props { onClose: () => void }

export const NotificationPanel: React.FC<Props> = ({ onClose }) => {
  const dispatch = useAppDispatch()
  const notifications = useAppSelector(selectNotifications)

  const typeColor = {
    info: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-lg border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b p-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="text-sm font-semibold">Notifications</span>
          </div>
          <button
            onClick={() => dispatch(markAllRead())}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <CheckCheck className="h-3 w-3" /> Mark all read
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.slice(0, 20).map((n) => (
              <div
                key={n.id}
                onClick={() => dispatch(markAsRead(n.id))}
                className={cn(
                  'flex gap-3 p-3 border-b last:border-0 cursor-pointer hover:bg-accent transition-colors',
                  !n.read && 'bg-primary/5'
                )}
              >
                <span className={cn('mt-0.5 flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium h-fit', typeColor[n.type])}>
                  {n.type.toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!n.read && <div className="h-2 w-2 rounded-full bg-primary mt-1 flex-shrink-0" />}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
