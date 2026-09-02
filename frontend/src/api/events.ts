import { useQuery } from '@tanstack/react-query'
import type { EventItem, PaginatedEvents } from './types'

const API = '/api'

export function useEvents(params: {
  page: number
  perPage: number
  syscallType?: string
  pod?: string
  namespace?: string
}) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: async (): Promise<PaginatedEvents> => {
      const sp = new URLSearchParams({
        page: String(params.page),
        per_page: String(params.perPage),
      })
      if (params.syscallType) sp.set('syscall_type', params.syscallType)
      if (params.pod) sp.set('pod', params.pod)
      if (params.namespace) sp.set('namespace', params.namespace)
      const token = useAuthToken()
      const res = await fetch(`${API}/events?${sp}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch events')
      return res.json()
    },
  })
}

export function useEventDetail(id: number | null) {
  return useQuery({
    queryKey: ['event', id],
    enabled: id !== null,
    queryFn: async (): Promise<EventItem | null> => {
      if (id === null) return null
      const token = useAuthToken()
      const res = await fetch(`${API}/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch event')
      return res.json()
    },
  })
}

export async function login(username: string, password: string): Promise<string> {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error('Invalid username or password')
  const data = await res.json()
  return data.access_token
}

function useAuthToken(): string {
  const token = localStorage.getItem('token')
  return token || ''
}
