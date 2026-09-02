export interface EventItem {
  id: number
  syscall_type: string
  timestamp: string
  pid: number
  process_name: string
  pod_name: string | null
  node_name: string
  namespace: string | null
  container_id: string | null
  args: string
}

export interface PaginatedEvents {
  events: EventItem[]
  total: number
  page: number
  per_page: number
  pages: number
}

export interface NodeItem {
  id: number
  node_name: string
  ip_address: string
  probe_status: string
  last_report: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}
