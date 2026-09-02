import { useQuery } from '@tanstack/react-query'
import type { NodeItem } from './types'

export function useNodes() {
  return useQuery({
    queryKey: ['nodes'],
    queryFn: async (): Promise<NodeItem[]> => {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/nodes', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch nodes')
      return res.json()
    },
  })
}
