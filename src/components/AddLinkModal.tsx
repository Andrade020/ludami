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
    if (err) { setError('Erro ao salvar link.'); return }
    onAdded()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-[#FAF5EE] rounded-t-3xl p-6 pb-safe-bottom" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
        <h2 className="text-xl font-extrabold text-gray-900 mb-4">Adicionar link</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">URL</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#C8624A] focus:outline-none transition-colors"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nota (opcional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="O que achou? Para que serve? Assistir depois..."
              rows={3}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#C8624A] focus:outline-none transition-colors resize-none"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-[#C8624A] text-white font-extrabold text-lg disabled:opacity-60 transition-opacity"
            style={{ boxShadow: '0 4px 20px #C8624A66' }}
          >
            {loading ? 'Salvando...' : 'Salvar link'}
          </button>
        </form>
      </div>
    </div>
  )
}
