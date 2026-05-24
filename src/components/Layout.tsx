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

const IconMundos = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
)

const IconPessoas = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const IconPerfil = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

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
      icon: <IconMundos />,
      badge: 0,
    },
    {
      to: '/people',
      label: 'Pessoas',
      active: location.pathname === '/people',
      icon: <IconPessoas />,
      badge: pendingCount,
    },
    {
      to: '/profile',
      label: 'Perfil',
      active: location.pathname === '/profile',
      icon: <IconPerfil />,
      badge: 0,
    },
  ]

  const themeIcon = mode === 'dark' ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )

  return (
    <div className="min-h-dvh" style={{ background: 'var(--bg)' }}>
      {session && (
        <aside
          className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:z-40"
          style={{ width: 260, borderRight: '1px solid var(--border)', background: 'var(--bg)' }}
        >
          <div className="px-6 pt-6 pb-5">
            <Lockup markSize={30} wordSize={36} />
          </div>

          <nav className="flex-1 flex flex-col px-4 gap-0.5 mt-1">
            {navItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="relative flex items-center gap-3 px-3 py-3 font-mono transition-colors"
                style={{
                  fontSize: 12,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  color: item.active ? 'var(--fg)' : 'var(--fg-faint)',
                  background: item.active ? 'var(--card)' : 'transparent',
                }}
              >
                {item.active && (
                  <span style={{
                    position: 'absolute',
                    left: 0, top: 6, bottom: 6,
                    width: 3,
                    background: 'var(--accent)',
                  }} />
                )}
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {item.label}
                {item.badge > 0 && (
                  <span style={{
                    minWidth: 18, height: 18, padding: '0 5px',
                    background: 'var(--accent)', color: 'var(--bg)',
                    borderRadius: 999, fontSize: 9, fontWeight: 700,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <button
              onClick={toggle}
              aria-label={mode === 'dark' ? 'Modo claro' : 'Modo escuro'}
              className="w-9 h-9 flex items-center justify-center"
              style={{ color: 'var(--fg-muted)' }}
            >
              {themeIcon}
            </button>
          </div>
        </aside>
      )}

      <div className={`flex flex-col min-h-dvh${session ? ' md:ml-[260px]' : ''}`}>
        <header
          className="sticky top-0 z-40"
          style={{ background: 'color-mix(in srgb, var(--bg) 92%, transparent)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="max-w-4xl mx-auto px-5 pt-safe-top pb-3 flex items-center gap-3">
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

            <div className="flex-1 min-w-0">
              {title ? (
                <h1 className="font-display text-2xl truncate" style={{ color: 'var(--fg)', lineHeight: 1.1 }}>
                  {title}
                </h1>
              ) : (
                <div className="md:hidden">
                  <Lockup markSize={24} wordSize={28} />
                </div>
              )}
            </div>

            <button
              onClick={toggle}
              aria-label={mode === 'dark' ? 'Modo claro' : 'Modo escuro'}
              className="md:hidden w-9 h-9 flex items-center justify-center"
              style={{ color: 'var(--fg-muted)' }}
            >
              {themeIcon}
            </button>

            {action}
          </div>
        </header>

        <main className={`flex-1${session ? ' pb-24 md:pb-0' : ''}`}>
          <div className="max-w-4xl mx-auto px-5 py-5">
            {children}
          </div>
        </main>

        {session && (
          <nav
            className="md:hidden fixed bottom-0 left-0 right-0 z-40 pb-safe-bottom"
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
                  <span className="font-mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>
                    {item.label}
                  </span>
                  {item.active && (
                    <span style={{
                      position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                      width: 24, height: 2, background: 'var(--accent)',
                    }} />
                  )}
                  {item.badge > 0 && (
                    <span className="absolute font-mono" style={{
                      top: 6, right: '28%', minWidth: 16, height: 16, padding: '0 4px',
                      background: 'var(--accent)', color: 'var(--bg)', borderRadius: 999,
                      fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </div>
  )
}
