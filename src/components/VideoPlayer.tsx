import { useEffect, useRef, useState } from 'react'
import type { Link as LinkType } from '../lib/types'
import { extractYouTubeId } from '../lib/youtube'

interface Props {
  links: LinkType[]
  initialIndex: number
  onClose: () => void
}

export default function VideoPlayer({ links, initialIndex, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex)
  const touchY = useRef(0)
  const touchX = useRef(0)

  const link = links[index]
  const videoId = link ? extractYouTubeId(link.url) : null

  function go(delta: number) {
    setIndex(i => Math.min(Math.max(i + delta, 0), links.length - 1))
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchY.current = e.touches[0].clientY
    touchX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dy = touchY.current - e.changedTouches[0].clientY
    const dx = Math.abs(touchX.current - e.changedTouches[0].clientX)
    if (Math.abs(dy) > 55 && dx < 80) go(dy > 0 ? 1 : -1)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') { e.preventDefault(); go(1) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); go(-1) }
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="fixed inset-0 z-50" style={{ background: '#000' }}>
      {videoId && (
        <iframe
          key={videoId}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1`}
          className="absolute inset-0 w-full h-full"
          style={{ border: 'none' }}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
        />
      )}

      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between gap-4 px-4 pt-safe-top pb-10"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, transparent 100%)' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center flex-shrink-0"
          style={{ color: '#fff' }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-end gap-2 pt-1">
          <span className="font-mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {index + 1} / {links.length}
          </span>
          {index > 0 && (
            <button
              onClick={() => go(-1)}
              className="font-mono flex items-center gap-1"
              style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase' }}
            >
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
              anterior
            </button>
          )}
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-safe-bottom pt-14"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {link?.title && (
          <p className="font-display mb-1" style={{ fontSize: 17, color: '#fff', lineHeight: 1.3 }}>
            {link.title}
          </p>
        )}
        {link?.notes && (
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4, marginBottom: 6 }}>
            {link.notes}
          </p>
        )}
        {index < links.length - 1 && (
          <button
            onClick={() => go(1)}
            className="font-mono flex items-center gap-1 mt-3"
            style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            próximo
            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
