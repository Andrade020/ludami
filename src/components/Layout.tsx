import { Link, useLocation } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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
      label: 'Início',
      active: location.pathname === '/' || location.pathname.startsWith('/area'),
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
        </svg>
      ),
    },
    {
      to: '/people',
      label: 'Pessoas',
      active: location.pathname === '/people',
      badge: pendingCount,
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      to: '/profile',
      label: 'Perfil',
      active: location.pathname === '/profile',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-dvh bg-[#FAF5EE] flex flex-col max-w-lg mx-auto">
      <header className="sticky top-0 z-40 bg-[#FAF5EE]/95 backdrop-blur-sm px-4 pt-safe-top pb-3 flex items-center gap-3 border-b border-black/5">
        {back && (
          <Link to={back} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-gray-600">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        )}
        {title ? (
          <h1 className="flex-1 text-xl font-extrabold text-gray-900 truncate">{title}</h1>
        ) : (
          <span className="flex-1 text-2xl font-extrabold text-[#C8624A]">Ludami</span>
        )}
        {action}
      </header>

      <main className={`flex-1 px-4 py-4 ${session ? 'pb-24' : ''}`}>
        {children}
      </main>

      {session && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto bg-white/95 backdrop-blur-sm border-t border-black/5 pb-safe-bottom">
          <div className="flex">
            {navItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${item.active ? 'text-[#C8624A]' : 'text-gray-400'}`}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge ? (
                    <span className="absolute -top-1 -right-1.5 min-w-4 h-4 px-0.5 bg-[#FF6B6B] rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
