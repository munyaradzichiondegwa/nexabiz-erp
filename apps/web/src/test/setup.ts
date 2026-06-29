import "@testing-library/jest-dom"
import { queryClient } from "@/lib/query-client"

// Reset React Query cache between tests
beforeEach(() => { queryClient.clear() })

// Mock window.crypto.randomUUID
Object.defineProperty(window, "crypto", {
  value: { randomUUID: () => "test-uuid-" + Math.random().toString(36).slice(2) }
})
