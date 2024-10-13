export interface ApiListResponse<T> {
  message?: string
  status?: number
  error?: number
  totalPage?: number
  page?: number
  limit?: number
  data?: Array<T>
}
