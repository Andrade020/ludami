import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { AREA_COLORS, randomAreaColor } from '../lib/colors'
import type { Session } from '@supabase/supabase-js'

interface Props {
  session: Session
  onClose: () => void
  onCreated: () => void
}

export default function CreateAreaModal({ session, onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(randomAreaColor)
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')

    const { data: area, error: areaErr } = await supabase.from('areas').insert({
      name: name.trim(),
      description: description.trim() || null,
      color,
      owner_id: session.user.id,
      is_public: isPublic,
    }).select().single()

    if (areaErr || !area) { setLoading(false); setError('Erro ao criar espaço.'); return }

    await supabase.from('area_members').insert({ area_id: area.id, user_id: session.user.id })

    setLoading(false)
    onCreated()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-[#FFFBF7] rounded-t-3xl p-6 pb-safe-bottom" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
        <h2 className="text-xl font-extrabold text-gray-900 mb-4">Criar espaço</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Dicas de Trabalho, Dieta, ..."
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#9B5DE5] focus:outline-none transition-colors"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Descrição (opcional)</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Do que se trata esse espaço?"
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#9B5DE5] focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cor</label>
            <div className="flex gap-2 flex-wrap">
              {AREA_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-9 h-9 rounded-full transition-transform"
                  style={{ backgroundColor: c, outline: color === c ? `3px solid ${c}` : 'none', outlineOffset: '2px', transform: color === c ? 'scale(1.15)' : 'scale(1)' }}
                />
              ))}
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`w-12 h-6 rounded-full transition-colors relative ${isPublic ? 'bg-[#9B5DE5]' : 'bg-gray-300'}`}
              onClick={() => setIsPublic(v => !v)}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm font-semibold text-gray-700">Espaço público</span>
          </label>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl text-white font-extrabold text-lg disabled:opacity-60 transition-opacity"
            style={{ backgroundColor: color, boxShadow: `0 4px 20px ${color}66` }}
          >
            {loading ? 'Criando...' : 'Criar espaço'}
          </button>
        </form>
      </div>
    </div>
  )
}
