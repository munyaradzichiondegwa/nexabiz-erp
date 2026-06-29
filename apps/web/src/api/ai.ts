import { apiClient } from "@/lib/api-client"

export interface NLQResult    { answer: string; chartData?: unknown; confidence?: number }
export interface Forecast     { day: number; predicted: number; lower: number; upper: number }
export interface Anomaly      { id: string; type: string; severity: "low" | "medium" | "high"; description: string; detectedAt: string }

export const aiApi = {
  ask:          (question: string) => apiClient.post<NLQResult>("/ai/nlq", { question }).then(r => r.data),
  getForecast:  (days = 30) => apiClient.get<Forecast[]>("/ai/forecast", { params: { days } }).then(r => r.data),
  getAnomalies: () => apiClient.get<Anomaly[]>("/ai/anomalies").then(r => r.data),
}
