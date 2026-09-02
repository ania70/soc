import { useEffect, useRef, useState, useCallback } from 'react'
import type { EventItem } from '../api/types'

export function useWebSocket(token: string | null) {
  const [events, setEvents] = useState<EventItem[]>([])
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const connect = useCallback(() => {
    if (!token) return
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws/events?token=${token}`)
    wsRef.current = ws

    ws.onopen = () => setConnected(true)
    ws.onclose = () => {
      setConnected(false)
      reconnectTimer.current = setTimeout(connect, 3000)
    }
    ws.onerror = () => {
      ws.close()
    }
    ws.onmessage = (e) => {
      const event: EventItem = JSON.parse(e.data)
      setEvents((prev) => [event, ...prev].slice(0, 500))
    }
  }, [token])

  useEffect(() => {
    connect()
    return () => {
      wsRef.current?.close()
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
    }
  }, [connect])

  const clearEvents = useCallback(() => setEvents([]), [])

  return { events, connected, clearEvents }
}
