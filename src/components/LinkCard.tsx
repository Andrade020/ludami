import { useState } from 'react'
import type { Link as LinkType } from '../lib/types'
import { extractYouTubeId, youtubeThumbnail } from '../lib/youtube'

interface Props {
  link: LinkType
  canDelete: boolean
  onDelete: (id: string) => void
}

export default function LinkCard({ link, canDelete, onDelete }: Props) {
  const [notesOpen, setNotesOpen] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [playerOpen, setPlayerOpen] = useState(false)

  const videoId = extractYouTubeId(link.url)
  const thumbnail = link.thumbnail_url || (videoId ? youtubeThumbnail(videoId) : null)
  const host = (() => { try { return new URL(link.url).hostname.replace(/^www\./, '') } catch { return '' } })()
  const when = new Date(link.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')

  function handleOpen() {
    if (videoId) {
      setPlayerOpen(true)
    } else {
      window.open(link.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <>
      <article style={{ background: 'var(--card)', padding: 12 }}>
        {thumbnail && !imgError && (
          <button
            onClick={handleOpen}
            className="w-full block relative"
            style={{ background: 'var(--bg-3)' }}
          >
            <img
              src={thumbnail}
              alt={link.title ?? ''}
              className="w-full aspect-video object-cover"
              onError={() => setImgError(true)}
            />
            {videoId && (
              <span
                className="absolute inset-0 flex items-center justify-center"
              >
                <span style={{
                  width: 44, height: 44,
                  background: 'rgba(0,0,0,0.65)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>
            )}
          </button>
        )}

        <div className="px-1 pt-3 pb-1">
          <button onClick={handleOpen} className="text-left w-full">
            <h3
              className="font-display"
              style={{ fontSize: 22, lineHeight: 1.15, color: 'var(--fg)' }}
            >
              {link.title ?? link.url}
            </h3>
          </button>

          <div
            className="mt-2.5 flex items-center gap-2"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--fg-faint)',
            }}
          >
            {host && <><span>{host}</span><span aria-hidden="true">·</span></>}
            <span>{when}</span>
            {link.profile?.username && (
              <>
                <span aria-hidden="true">·</span>
                <span>@{link.profile.username}</span>
              </>
            )}
          </div>

          {link.notes && (
            <div className="mt-3">
              <button
                onClick={() => setNotesOpen(v => !v)}
                className="font-mono"
                style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600 }}
              >
                {notesOpen ? '— ocultar nota' : '+ ver nota'}
              </button>
              {notesOpen && (
                <p
                  className="mt-2 font-display"
                  style={{
                    fontSize: 18,
                    fontStyle: 'italic',
                    lineHeight: 1.45,
                    color: 'var(--fg-muted)',
                    borderLeft: '2px solid var(--accent)',
                    paddingLeft: 12,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {link.notes}
                </p>
              )}
            </div>
          )}

          {canDelete && (
            <button
              onClick={() => onDelete(link.id)}
              className="font-mono mt-3"
              style={{ fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-faint)', fontWeight: 500 }}
            >
              remover
            </button>
          )}
        </div>
      </article>

      {playerOpen && videoId && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={() => setPlayerOpen(false)}
        >
          <div className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              className="w-full"
              style={{ aspectRatio: '16/9', border: 'none', display: 'block' }}
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
          <button
            onClick={() => setPlayerOpen(false)}
            className="mt-5 font-mono"
            style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}
          >
            fechar
          </button>
        </div>
      )}
    </>
  )
}
