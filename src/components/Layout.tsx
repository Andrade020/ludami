import { Link, useLocation } from 'react-router-dom'

interface Props {
  children: React.ReactNode
  title?: string
  back?: string
  action?: React.ReactNode
}

export default function Layout({ children, title, back, action }: Props) {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-dvh bg-[#FFFBF7] flex flex-col max-w-lg mx-auto">
      <header className="sticky top-0 z-40 bg-[#FFFBF7]/95 backdrop-blur-sm px-4 pt-safe-top pb-3 flex items-center gap-3 border-b border-black/5">
        {back && (
          <Link to={back} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        )}
        {title && <h1 className="flex-1 text-xl font-extrabold text-gray-900 truncate">{title}</h1>}
        {!title && !back && (
          <span className="flex-1 text-2xl font-extrabold text-[#9B5DE5]">Ludami</span>
        )}
        {action}
        {isHome && (
          <Link to="/profile" className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#9B5DE5]/10 text-[#9B5DE5] font-bold text-sm hover:bg-[#9B5DE5]/20 transition-colors">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
        )}
      </header>
      <main className="flex-1 px-4 py-4">
        {children}
      </main>
    </div>
  )
}
