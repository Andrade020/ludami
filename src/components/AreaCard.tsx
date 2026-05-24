import { Link } from 'react-router-dom'
import type { Area } from '../lib/types'
import { colorToShadow } from '../lib/colors'

interface Props {
  area: Area
}

export default function AreaCard({ area }: Props) {
  return (
    <Link
      to={`/area/${area.id}`}
      className="block rounded-2xl p-4 text-white transition-transform active:scale-95"
      style={{ backgroundColor: area.color, boxShadow: colorToShadow(area.color) }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-lg leading-tight truncate">{area.name}</h3>
          {area.description && (
            <p className="text-white/80 text-sm mt-1 line-clamp-2">{area.description}</p>
          )}
        </div>
        <div className="bg-white/20 rounded-xl p-2 flex-shrink-0">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3 text-white/70 text-xs">
        <span className="flex items-center gap-1">
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          {area.link_count ?? 0} links
        </span>
        <span className="flex items-center gap-1">
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {area.member_count ?? 0} membros
        </span>
        {area.is_member && (
          <span className="ml-auto bg-white/30 rounded-full px-2 py-0.5 text-white text-xs font-semibold">Membro</span>
        )}
      </div>
    </Link>
  )
}
