import { useState } from 'react'
import { useEvents } from '../api/events'
import { EventTable } from '../components/EventTable'
import { FilterBar, type FilterValues } from '../components/FilterBar'
import { EventDetail } from '../components/EventDetail'

export function HistoricalEvents() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<FilterValues>({ syscallType: '', pod: '', namespace: '' })
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data, isLoading } = useEvents({
    page,
    perPage: 50,
    syscallType: filters.syscallType || undefined,
    pod: filters.pod || undefined,
    namespace: filters.namespace || undefined,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 52px)' }}>
      <FilterBar
        filters={filters}
        onChange={(f) => { setFilters(f); setPage(1) }}
        onClear={() => { setFilters({ syscallType: '', pod: '', namespace: '' }); setPage(1) }}
      />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>Loading...</div>
        ) : data && data.events.length > 0 ? (
          <EventTable events={data.events} onRowClick={setSelectedId} selectedId={selectedId} />
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-dim)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div>No events found</div>
          </div>
        )}
      </div>
      {data && data.pages > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 12, borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          <button className="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
          <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>Page {page} of {data.pages}</span>
          <button className="secondary" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next →</button>
        </div>
      )}
      {selectedId !== null && (
        <EventDetail eventId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  )
}
