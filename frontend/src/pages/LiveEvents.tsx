import { useState, useMemo, useEffect, useRef } from 'react'
import { useWebSocket } from '../hooks/useWebSocket'
import { EventTable } from '../components/EventTable'
import { FilterBar, type FilterValues } from '../components/FilterBar'
import { EventDetail } from '../components/EventDetail'

interface Props {
  token: string
}

export function LiveEvents({ token }: Props) {
  const { events, connected } = useWebSocket(token)
  const [filters, setFilters] = useState<FilterValues>({ syscallType: '', pod: '', namespace: '' })
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const rateRef = useRef<{ count: number; time: number }>({ count: 0, time: Date.now() })
  const [rate, setRate] = useState(0)

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (filters.syscallType && e.syscall_type !== filters.syscallType) return false
      if (filters.pod && !(e.pod_name || '').toLowerCase().includes(filters.pod.toLowerCase())) return false
      if (filters.namespace && !(e.namespace || '').toLowerCase().includes(filters.namespace.toLowerCase())) return false
      return true
    })
  }, [events, filters])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = (now - rateRef.current.time) / 1000
      if (elapsed > 0) {
        setRate(rateRef.current.count / elapsed)
      }
      rateRef.current = { count: 0, time: now }
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (events.length > 0) {
      rateRef.current.count++
    }
  }, [events])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 52px)' }}>
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters({ syscallType: '', pod: '', namespace: '' })}
        eventCount={filtered.length}
        eventRate={rate}
      />
      {!connected && (
        <div style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', fontSize: 12 }}>
          Disconnected — attempting to reconnect...
        </div>
      )}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <EventTable events={filtered} onRowClick={setSelectedId} selectedId={selectedId} />
      </div>
      {selectedId !== null && (
        <EventDetail eventId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  )
}
