import { Link, useLocation } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Lockup from './Lockup'
import { useTheme } from '../hooks/useTheme'

interface Props {
  children: React.ReactNode
  title?: string
  back?: string
  action?: React.ReactNode
  session?: Session
}

export default function Layout({ children, title, back, action, session }: Props) {
  const location = useLocation()
  const [pendingCount, setPendingCount] = useState(0)
  const { mode, toggle } = useTheme()

  useEffect(() => {
    if (!session) return
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', session.user.id)
      .eq('status', 'pending')
      .then(({ count }) => setPendingCount(count ?? 0))
  }, [session, location.pathname])

  const navItems = [
    {
      to: '/',
      label: 'Mundos',
      active: location.pathname === '/' || location.pathname.startsWith('/area'),
    },
    {
      to: '/people',
      label: 'Pessoas',
      active: location.pathname === '/people',
      badge: pendingCount,
    },
    {
      to: '/profile',
      label: 'Perfil',
      active: location.pathname === '/profile',
    },
  ]

  return (
    <div className="min-h-dvh flex flex-col max-w-lg mx-auto" style={{ background: 'var(--bg)' }}>
      <header
        className="sticky top-0 z-40 px-5 pt-safe-top pb-3 flex items-center gap-3"
        style={{ background: 'color-mix(in srgb, var(--bg) 92%, transparent)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border)' }}
      >
        {back && (
          <Link
            to={back}
            aria-label="Voltar"
            className="w-9 h-9 flex items-center justify-center"
            style={{ color: 'var(--fg)' }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        )}
        {title ? (
          <h1 className="flex-1 font-display text-2xl truncate" style={{ color: 'var(--fg)', lineHeight: 1.1 }}>
            {title}
          </h1>
        ) : (
          <div className="flex-1">
            <Lockup markSize={24} wordSize={28} />
          </div>
        )}
        <button
          onClick={toggle}
          aria-label={mode === 'dark' ? 'Modo claro' : 'Modo escuro'}
          className="w-9 h-9 flex items-center justify-center"
          style={{ color: 'var(--fg-muted)' }}
        >
          {mode === 'dark' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
        {action}
      </header>

      <main className={`flex-1 px-5 py-5 ${session ? 'pb-24' : ''}`}>
        {children}
      </main>

      {session && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto pb-safe-bottom"
          style={{ background: 'color-mix(in srgb, var(--bg) 94%, transparent)', backdropFilter: 'blur(8px)', borderTop: '1px solid var(--border)' }}
        >
          <div className="flex">
            {navItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="flex-1 flex flex-col items-center justify-center py-3 gap-1 relative transition-colors"
                style={{ color: item.active ? 'var(--fg)' : 'var(--fg-faint)' }}
              >
                <span
                  className="font-mono"
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </span>
                {item.active && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 24,
                      height: 2,
                      background: 'var(--accent)',
                    }}
                  />
                )}
                {item.badge ? (
                  <span
                    className="absolute font-mono"
                    style={{
                      top: 6,
                      right: '28%',
                      minWidth: 16,
                      height: 16,
                      padding: '0 4px',
                      background: 'var(--accent)',
                      color: 'var(--bg)',
                      borderRadius: 999,
                      fontSize: 9,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
