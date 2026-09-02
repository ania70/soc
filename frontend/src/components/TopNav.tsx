interface Props {
  connected?: boolean
  onLogout: () => void
  activePage: string
  onNavigate: (page: string) => void
}

export function TopNav({ connected, onLogout, activePage, onNavigate }: Props) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '0 20px', height: 52,
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text)' }}>
        KubeShield
      </div>

      <div style={{ display: 'flex', gap: 4, marginLeft: 24 }}>
        <NavButton label="Live" active={activePage === 'live'} onClick={() => onNavigate('live')} />
        <NavButton label="Historical" active={activePage === 'historical'} onClick={() => onNavigate('historical')} />
        <NavButton label="Nodes" active={activePage === 'nodes'} onClick={() => onNavigate('nodes')} />
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
        {connected !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-dim)' }}>
            <span className={`status-dot ${connected ? 'status-active' : 'status-inactive'}`} />
            {connected ? 'Connected' : 'Disconnected'}
          </div>
        )}
        <button className="secondary" onClick={onLogout} style={{ padding: '4px 12px' }}>Logout</button>
      </div>
    </div>
  )
}

function NavButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="secondary"
      style={{
        padding: '4px 12px',
        background: active ? 'var(--accent)' : 'var(--surface)',
        color: active ? 'white' : 'var(--text)',
        border: '1px solid var(--border)',
      }}
    >
      {label}
    </button>
  )
}
