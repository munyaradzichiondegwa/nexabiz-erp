import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar/Sidebar'
import { Header } from '@/components/Header/Header'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectSidebarOpen } from '@/store/slices/uiSlice'
import { WebSocketProvider } from '@/components/AppShell/WebSocketProvider'

export const AppShell: React.FC = () => {
  const sidebarOpen = useAppSelector(selectSidebarOpen)

  return (
    <WebSocketProvider>
      <div className="flex h-full overflow-hidden bg-background">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div
          className="flex flex-1 flex-col overflow-hidden transition-all duration-200"
          style={{ marginLeft: sidebarOpen ? 'var(--sidebar-width)' : '0' }}
        >
          <Header />
          <main
            className="flex-1 overflow-y-auto p-6"
            id="main-content"
            role="main"
          >
            <Outlet />
          </main>
        </div>
      </div>
    </WebSocketProvider>
  )
}
