interface FilterValues {
  syscallType: string
  pod: string
  namespace: string
}

interface Props {
  filters: FilterValues
  onChange: (f: FilterValues) => void
  onClear: () => void
  eventCount?: number
  eventRate?: number
}

export function FilterBar({ filters, onChange, onClear, eventCount, eventRate }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
      <select
        value={filters.syscallType}
        onChange={(e) => onChange({ ...filters, syscallType: e.target.value })}
        style={{ width: 120 }}
      >
        <option value="">All</option>
        <option value="execve">execve</option>
        <option value="openat">openat</option>
        <option value="connect">connect</option>
      </select>
      <input
        type="text"
        placeholder="Pod name"
        value={filters.pod}
        onChange={(e) => onChange({ ...filters, pod: e.target.value })}
        style={{ width: 140 }}
      />
      <input
        type="text"
        placeholder="Namespace"
        value={filters.namespace}
        onChange={(e) => onChange({ ...filters, namespace: e.target.value })}
        style={{ width: 140 }}
      />
      <button className="secondary" onClick={onClear}>Clear Filters</button>
      {eventCount !== undefined && (
        <div style={{ marginLeft: 'auto', color: 'var(--text-dim)', fontSize: 12 }}>
          {eventCount} events{eventRate !== undefined ? ` · ${eventRate.toFixed(1)} ev/s` : ''}
        </div>
      )}
    </div>
  )
}

export type { FilterValues }
