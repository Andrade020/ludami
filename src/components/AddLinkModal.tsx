import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { fetchYouTubeInfo } from '../lib/youtube'
import type { Session } from '@supabase/supabase-js'

interface Props {
  areaId: string
  session: Session
  onClose: () => void
  onAdded: () => void
}

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--fg-muted)',
  fontWeight: 500,
}

const inputStyle: React.CSSProperties = {
  background: 'transparent',
  color: 'var(--fg)',
  borderBottom: '1px solid var(--border-2)',
  fontSize: 15,
  outline: 'none',
  width: '100%',
  padding: '10px 0',
}

export default function AddLinkModal({ areaId, session, onClose, onAdded }: Props) {
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setError('')
    const info = await fetchYouTubeInfo(url.trim())
    const { error: err } = await supabase.from('links').insert({
      area_id: areaId,
      url: url.trim(),
      title: info?.title ?? null,
      thumbnail_url: info?.thumbnail_url ?? null,
      notes: notes.trim() || null,
      added_by: session.user.id,
    })
    setLoading(false)
    if (err) { setError(`Erro ${err.code}: ${err.message}`); return }
    onAdded()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div
        className="w-full max-w-lg p-6 pb-safe-bottom"
        style={{ background: 'var(--bg)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ width: 32, height: 2, background: 'var(--border-2)', margin: '0 auto 24px' }} />
        <p className="font-mono" style={labelStyle}>Novo link</p>
        <h2 className="font-display mt-1 mb-5" style={{ fontSize: 30, lineHeight: 1.1, color: 'var(--fg)' }}>
          adicionar
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="font-mono block mb-1" style={labelStyle}>URL</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              style={inputStyle}
              autoFocus
              required
              onFocus={e => (e.currentTarget.style.borderBottomColor = 'var(--accent)')}
              onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-2)')}
            />
          </div>
          <div>
            <label className="font-mono block mb-1" style={labelStyle}>Nota</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="O que achou. Para que serve. Assistir depois..."
              rows={3}
              style={{ ...inputStyle, resize: 'none' }}
              onFocus={e => (e.currentTarget.style.borderBottomColor = 'var(--accent)')}
              onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-2)')}
            />
          </div>
          {error && <p style={{ fontSize: 13, color: '#c25040' }}>{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="font-mono flex-1 py-3.5 transition-opacity active:opacity-70"
              style={{ background: 'transparent', color: 'var(--fg-muted)', border: '1px solid var(--border-2)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="font-mono flex-1 py-3.5 transition-opacity active:opacity-80"
              style={{ background: 'var(--fg)', color: 'var(--bg)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Salvando' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
