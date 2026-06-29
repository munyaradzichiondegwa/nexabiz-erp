import React from 'react'
export const PageLoader: React.FC = () => (
  <div className="flex h-full items-center justify-center" role="status" aria-label="Loading">
    <div className="relative">
      <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
    </div>
  </div>
)
