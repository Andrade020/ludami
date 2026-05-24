import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import Home from './pages/Home'
import AreaPage from './pages/AreaPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import ShareReceiver from './pages/ShareReceiver'
import PeoplePage from './pages/PeoplePage'

function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div
          className="w-8 h-8 rounded-full animate-spin"
          style={{ borderWidth: 2, borderStyle: 'solid', borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={session ? <Navigate to="/" /> : <Register />} />
        <Route path="/" element={session ? <Home session={session} /> : <Navigate to="/login" />} />
        <Route path="/area/:id" element={session ? <AreaPage session={session} /> : <Navigate to="/login" />} />
        <Route path="/profile" element={session ? <Profile session={session} /> : <Navigate to="/login" />} />
        <Route path="/people" element={session ? <PeoplePage session={session} /> : <Navigate to="/login" />} />
        <Route path="/requests" element={<Navigate to="/people" />} />
        <Route path="/share" element={session ? <ShareReceiver session={session} /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
