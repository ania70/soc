import type { EventItem } from '../api/types'

export function syscallBadgeClass(type: string): string {
  switch (type) {
    case 'execve': return 'badge-execve'
    case 'openat': return 'badge-openat'
    case 'connect': return 'badge-connect'
    default: return ''
  }
}

export function formatTime(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0')
}

export function displayValue(val: string | null | undefined): string {
  if (val === null || val === undefined || val === '') return '—'
  return val
}

interface Props {
  events: EventItem[]
  onRowClick: (id: number) => void
  selectedId?: number | null
}

export function EventTable({ events, onRowClick, selectedId }: Props) {
  if (events.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-dim)' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📡</div>
        <div>No events recorded yet</div>
      </div>
    )
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Syscall</th>
          <th>Process</th>
          <th>PID</th>
          <th>Pod</th>
          <th>Node</th>
          <th>Namespace</th>
        </tr>
      </thead>
      <tbody>
        {events.map((e) => (
          <tr
            key={e.id}
            onClick={() => onRowClick(e.id)}
            style={{ cursor: 'pointer', background: selectedId === e.id ? 'var(--surface-hover)' : undefined }}
          >
            <td className="mono" style={{ whiteSpace: 'nowrap' }}>{formatTime(e.timestamp)}</td>
            <td>
              <span className={syscallBadgeClass(e.syscall_type)} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500 }}>
                {e.syscall_type}
              </span>
            </td>
            <td>{e.process_name}</td>
            <td className="mono">{e.pid}</td>
            <td>{displayValue(e.pod_name)}</td>
            <td>{e.node_name}</td>
            <td>{displayValue(e.namespace)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
