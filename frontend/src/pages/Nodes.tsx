import { useNodes } from '../api/nodes'

export function Nodes() {
  const { data: nodes, isLoading } = useNodes()

  const active = nodes?.filter((n) => n.probe_status === 'active').length || 0
  const inactive = nodes?.filter((n) => n.probe_status === 'inactive').length || 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 52px)' }}>
      <div style={{ display: 'flex', gap: 24, padding: '12px 20px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="status-dot status-active" />
          <span style={{ fontSize: 13 }}>{active} Active</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="status-dot status-inactive" />
          <span style={{ fontSize: 13 }}>{inactive} Inactive</span>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>Loading...</div>
        ) : nodes && nodes.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Node Name</th>
                <th>IP Address</th>
                <th>Probe Status</th>
                <th>Last Report</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((n) => (
                <tr key={n.id}>
                  <td>{n.node_name}</td>
                  <td className="mono">{n.ip_address}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className={`status-dot ${n.probe_status === 'active' ? 'status-active' : 'status-inactive'}`} />
                      <span style={{ fontSize: 12, textTransform: 'capitalize' }}>{n.probe_status}</span>
                    </div>
                  </td>
                  <td className="mono" style={{ fontSize: 12 }}>{new Date(n.last_report).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-dim)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🖥️</div>
            <div>No nodes registered yet — make sure the DaemonSet is installed</div>
          </div>
        )}
      </div>
    </div>
  )
}
