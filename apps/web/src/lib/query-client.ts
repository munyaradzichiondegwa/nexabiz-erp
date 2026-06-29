import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: (failureCount: number, error: any) => {
        if (error?.response?.status >= 400 && error?.response?.status < 500) return false
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
    },
    mutations: { retry: false },
  },
})
