import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectIsAuthenticated, selectAuthLoading } from '@/store/slices/authSlice'
import { PageLoader } from '@/components/ui/PageLoader'

interface AuthGuardProps {
  children: React.ReactNode
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isLoading = useAppSelector(selectAuthLoading)
  const location = useLocation()

  if (isLoading) return <PageLoader />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
