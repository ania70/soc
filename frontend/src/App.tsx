import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './store/authStore'
import { Login } from './pages/Login'
import { LiveEvents } from './pages/LiveEvents'
import { HistoricalEvents } from './pages/HistoricalEvents'
import { Nodes } from './pages/Nodes'
import { TopNav } from './components/TopNav'

const queryClient = new QueryClient()

type Page = 'live' | 'historical' | 'nodes'

function App() {
  const token = useAuthStore((s) => s.token)
  const setToken = useAuthStore((s) => s.setToken)
  const logout = useAuthStore((s) => s.logout)
  const [page, setPage] = useState<Page>('live')

  useEffect(() => {
    const stored = localStorage.getItem('token')
    if (stored) setToken(stored)
  }, [setToken])

  const handleLogout = () => {
    localStorage.removeItem('token')
    logout()
  }

  if (!token) {
    return <Login />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ minHeight: '100vh' }}>
        <TopNav
          connected={page === 'live' ? true : undefined}
          onLogout={handleLogout}
          activePage={page}
          onNavigate={(p) => setPage(p as Page)}
        />
        {page === 'live' && <LiveEvents token={token} />}
        {page === 'historical' && <HistoricalEvents />}
        {page === 'nodes' && <Nodes />}
      </div>
    </QueryClientProvider>
  )
}

export default App
