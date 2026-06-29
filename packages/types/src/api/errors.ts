export interface ApiError {
  statusCode: number
  message: string
  error: string
  correlationId?: string
  timestamp: string
}

export interface ValidationError extends ApiError {
  details: Array<{ field: string; message: string }>
}
