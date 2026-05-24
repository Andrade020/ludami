import { Link } from 'react-router-dom'
import type { Area } from '../lib/types'
import { deriveWorld } from '../lib/colors'
import WorldGlyph from './WorldGlyph'

const VISIBILITY_LABEL: Record<string, string> = {
  public:    'público',
  followers: 'amigos',
  private:   'privado',
}

interface Props {
  area: Area
}

export default function AreaCard({ area }: Props) {
  const { palette, kind } = deriveWorld(area)
  const itens = area.link_count ?? 0
  const membros = area.member_count ?? 0

  return (
    <Link
      to={`/area/${area.id}`}
      className="block transition-transform active:scale-[0.985]"
      style={{ background: 'var(--card)', padding: 12 }}
    >
      <WorldGlyph size={240} palette={palette} kind={kind} style={{ width: '100%', height: 'auto', aspectRatio: '1 / 1' }} />
      <div className="px-1 pt-3 pb-1">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-display flex-1 min-w-0 truncate"
            style={{ fontSize: 22, lineHeight: 1.1, color: 'var(--fg)' }}
          >
            {area.name}
          </h3>
          {area.is_member && (
            <span
              className="font-mono flex-shrink-0"
              style={{
                fontSize: 9,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                fontWeight: 600,
                paddingTop: 6,
              }}
            >
              membro
            </span>
          )}
        </div>
        {area.description && (
          <p
            className="line-clamp-2 mt-1"
            style={{ fontSize: 12.5, color: 'var(--fg-muted)', lineHeight: 1.5 }}
          >
            {area.description}
          </p>
        )}
        <div
          className="font-mono mt-2.5 flex items-center gap-2"
          style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-faint)' }}
        >
          <span>{String(itens).padStart(3, '0')} itens</span>
          <span aria-hidden="true">·</span>
          <span>{String(membros).padStart(2, '0')} pessoas</span>
          <span aria-hidden="true">·</span>
          <span>{VISIBILITY_LABEL[area.visibility] ?? area.visibility}</span>
        </div>
      </div>
    </Link>
  )
}
