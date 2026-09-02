import { useState } from 'react'
import { login } from '../api/events'
import { useAuthStore } from '../store/authStore'

export function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const setToken = useAuthStore((s) => s.setToken)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const token = await login(username, password)
      localStorage.setItem('token', token)
      setToken(token)
    } catch {
      setError('Invalid username or password')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 8, padding: 32,
        border: '1px solid var(--border)', width: 360,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 22, color: 'var(--text)' }}>KubeShield</h2>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>Kubernetes Security Monitor</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box' }}
              autoFocus
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          {error && (
            <div style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 12 }}>{error}</div>
          )}
          <button type="submit" style={{ width: '100%' }}>Sign In</button>
        </form>
      </div>
    </div>
  )
}
