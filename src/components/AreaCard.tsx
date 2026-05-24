import { Link } from 'react-router-dom'
import type { Area } from '../lib/types'
import { colorToShadow } from '../lib/colors'

const VISIBILITY_LABEL: Record<string, string> = {
  public: '🌍 Público',
  followers: '👥 Amigos',
  private: '🔒 Privado',
}

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
        <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs font-semibold flex-shrink-0">
          {VISIBILITY_LABEL[area.visibility] ?? area.visibility}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3 text-white/70 text-xs">
        <span>{area.link_count ?? 0} links</span>
        <span>{area.member_count ?? 0} membros</span>
        {area.is_member && (
          <span className="ml-auto bg-white/30 rounded-full px-2 py-0.5 text-white text-xs font-semibold">Membro</span>
        )}
      </div>
    </Link>
  )
}
