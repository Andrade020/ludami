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

  const videoId = extractYouTubeId(link.url)
  const thumbnail = link.thumbnail_url || (videoId ? youtubeThumbnail(videoId) : null)

  function openLink() {
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">
      {thumbnail && !imgError && (
        <button onClick={openLink} className="w-full block relative">
          <img
            src={thumbnail}
            alt={link.title ?? ''}
            className="w-full aspect-video object-cover"
            onError={() => setImgError(true)}
          />
          {videoId && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 bg-black/60 rounded-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </button>
      )}
      <div className="p-4">
        <button onClick={openLink} className="text-left w-full">
          <h3 className="font-bold text-gray-900 leading-snug hover:text-[#9B5DE5] transition-colors">
            {link.title ?? link.url}
          </h3>
        </button>
        {link.notes && (
          <div className="mt-2">
            <button
              onClick={() => setNotesOpen(v => !v)}
              className="flex items-center gap-1.5 text-sm text-[#9B5DE5] font-semibold"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {notesOpen ? 'Ocultar nota' : 'Ver nota'}
            </button>
            {notesOpen && (
              <p className="mt-2 text-sm text-gray-600 bg-[#FFFBF7] rounded-xl p-3 leading-relaxed whitespace-pre-wrap">
                {link.notes}
              </p>
            )}
          </div>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {link.profile?.username ?? 'Usuário'} · {new Date(link.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          </span>
          {canDelete && (
            <button
              onClick={() => onDelete(link.id)}
              className="text-xs text-red-400 hover:text-red-600 transition-colors font-medium"
            >
              Remover
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
