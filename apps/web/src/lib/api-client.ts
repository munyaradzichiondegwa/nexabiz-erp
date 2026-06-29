/**
 * NexaBiz API Client — Axios with auth token refresh, tenant context,
 * and distributed tracing correlation IDs (PRD Section 21.2)
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { store } from '@/store'
import { logout, refreshTokens } from '@/store/slices/authSlice'

const BASE_URL = (import.meta as any).env?.VITE_API_URL ?? ''

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState()
    const token = (state as any).auth.accessToken
    if (token) config.headers.Authorization = `Bearer ${token}`
    config.headers['X-Correlation-ID'] = crypto.randomUUID()
    const tenantId = (state as any).auth.user?.tenantId
    if (tenantId) config.headers['X-Tenant-ID'] = tenantId
    return config
  },
  (error) => Promise.reject(error),
)

let isRefreshing = false
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: Error) => void }> = []

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
  failedQueue = []
}

apiClient.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const req = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status === 401 && !req._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((t) => { req.headers.Authorization = `Bearer ${t}`; return apiClient(req) })
      }
      req._retry = true
      isRefreshing = true
      try {
        const newToken = await (store.dispatch as any)(refreshTokens()).unwrap()
        processQueue(null, newToken.accessToken)
        req.headers.Authorization = `Bearer ${newToken.accessToken}`
        return apiClient(req)
      } catch (e) {
        processQueue(e as Error, null)
        store.dispatch(logout() as any)
        window.location.href = '/login'
        return Promise.reject(e)
      } finally { isRefreshing = false }
    }
    return Promise.reject(error)
  },
)
