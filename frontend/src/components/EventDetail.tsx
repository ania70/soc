import { useEffect, useState } from 'react'
import { useEventDetail } from '../api/events'
import { syscallBadgeClass, displayValue, formatTime } from './EventTable'

interface Props {
  eventId: number | null
  onClose: () => void
}

export function EventDetail({ eventId, onClose }: Props) {
  const { data: event } = useEventDetail(eventId)
  const [parsedArgs, setParsedArgs] = useState<Record<string, string> | null>(null)

  useEffect(() => {
    if (event?.args) {
      try {
        setParsedArgs(JSON.parse(event.args))
      } catch {
        setParsedArgs(null)
      }
    }
  }, [event])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!event) return null

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
      />
      <div
        style={{
          position: 'fixed', right: 0, top: 0, bottom: 0, width: 420,
          background: 'var(--surface)', borderLeft: '1px solid var(--border)',
          padding: 20, overflowY: 'auto', zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text)' }}>Event Detail</h3>
          <button className="secondary" onClick={onClose} style={{ padding: '4px 10px' }}>✕</button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <span className={syscallBadgeClass(event.syscall_type)} style={{ padding: '4px 12px', borderRadius: 4, fontSize: 13, fontWeight: 600 }}>
            {event.syscall_type}
          </span>
        </div>

        <DetailRow label="Time" value={formatTime(event.timestamp)} mono />
        <DetailRow label="PID" value={String(event.pid)} mono />
        <DetailRow label="Process" value={event.process_name} />
        <DetailRow label="Pod" value={displayValue(event.pod_name)} />
        <DetailRow label="Namespace" value={displayValue(event.namespace)} />
        <DetailRow label="Node" value={event.node_name} />
        <DetailRow label="Container ID" value={displayValue(event.container_id)} mono />

        <div style={{ marginTop: 20, marginBottom: 8, fontSize: 12, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Syscall Arguments
        </div>
        {parsedArgs ? (
          <div style={{ background: 'var(--bg)', borderRadius: 6, padding: 12, border: '1px solid var(--border)' }}>
            {Object.entries(parsedArgs).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-dim)', minWidth: 80, fontSize: 12 }}>{k}:</span>
                <span className="mono" style={{ fontSize: 12, wordBreak: 'break-all' }}>{v}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mono" style={{ fontSize: 12, color: 'var(--text-dim)' }}>{event.args}</div>
        )}
      </div>
    </>
  )
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 8, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
      <span style={{ color: 'var(--text-dim)', minWidth: 100, fontSize: 12 }}>{label}</span>
      <span className={mono ? 'mono' : ''} style={{ fontSize: 13, wordBreak: 'break-all' }}>{value}</span>
    </div>
  )
}
