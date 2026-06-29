import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <Search className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      <button onClick={() => navigate('/dashboard')} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
        Go to Dashboard
      </button>
    </div>
  )
}
