/**
 * WebSocket Provider — connects to the backend for real-time updates:
 * - GL posting confirmations
 * - Module toggle broadcasts (PRD Section 23.2)
 * - Notification push (PRD Section 22.4)
 * - Dashboard KPI live refresh (PRD Section 4 MOD-02)
 */
import React, { createContext, useContext, useEffect, useRef } from 'react'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectIsAuthenticated } from '@/store/slices/authSlice'
import { addNotification } from '@/store/slices/notificationSlice'
import { moduleActivated, moduleDeactivated } from '@/store/slices/moduleRegistrySlice'

interface WSContextValue {
  send: (message: object) => void
  isConnected: boolean
}

const WSContext = createContext<WSContextValue>({
  send: () => {},
  isConnected: false,
})

export const useWebSocket = () => useContext(WSContext)

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const wsRef = useRef<WebSocket | null>(null)
  const isConnectedRef = useRef(false)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>()

  const connect = () => {
    if (!isAuthenticated) return

    const wsUrl = (import.meta as any).env?.VITE_WS_URL ?? 'ws://localhost:8000'
    const ws = new WebSocket(`${wsUrl}/ws`)

    ws.onopen = () => {
      isConnectedRef.current = true
      console.log('[NexaBiz WS] Connected')
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        switch (msg.type) {
          case 'MODULE_ACTIVATED':
            dispatch(moduleActivated(msg.payload.code))
            window.dispatchEvent(new CustomEvent('nexabiz:module-toggle', {
              detail: { code: msg.payload.code, action: 'activated' },
            }))
            break
          case 'MODULE_DEACTIVATED':
            dispatch(moduleDeactivated(msg.payload.code))
            window.dispatchEvent(new CustomEvent('nexabiz:module-toggle', {
              detail: { code: msg.payload.code, action: 'deactivated' },
            }))
            break
          case 'NOTIFICATION':
            dispatch(addNotification(msg.payload))
            break
          case 'GL_POSTED':
            window.dispatchEvent(new CustomEvent('nexabiz:gl-posted', { detail: msg.payload }))
            break
          case 'KPI_UPDATE':
            window.dispatchEvent(new CustomEvent('nexabiz:kpi-update', { detail: msg.payload }))
            break
        }
      } catch (err) {
        console.error('[NexaBiz WS] Parse error:', err)
      }
    }

    ws.onclose = () => {
      isConnectedRef.current = false
      reconnectTimer.current = setTimeout(connect, 5000)
    }

    ws.onerror = (err) => {
      console.error('[NexaBiz WS] Error:', err)
      ws.close()
    }

    wsRef.current = ws
  }

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
    }
  }, [isAuthenticated])

  const send = (message: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }

  return (
    <WSContext.Provider value={{ send, isConnected: isConnectedRef.current }}>
      {children}
    </WSContext.Provider>
  )
}
