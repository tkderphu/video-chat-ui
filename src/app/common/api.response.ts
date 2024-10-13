export interface ApiResponse<T> {
  message?: string
  status?: number
  error?: number
  data: T
}
