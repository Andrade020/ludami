import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { AREA_COLORS, randomAreaColor } from '../lib/colors'
import type { AreaVisibility } from '../lib/types'
import type { Session } from '@supabase/supabase-js'

interface Props {
  session: Session
  onClose: () => void
  onCreated: () => void
}

const VISIBILITY_OPTIONS: { value: AreaVisibility; label: string; desc: string; icon: string }[] = [
  { value: 'public', label: 'Público', desc: 'Qualquer pessoa pode ver e participar', icon: '🌍' },
  { value: 'followers', label: 'Amigos', desc: 'Só quem você aceitar como seguidor', icon: '👥' },
  { value: 'private', label: 'Privado', desc: 'Apenas membros que você adicionar', icon: '🔒' },
]

export default function CreateAreaModal({ session, onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(randomAreaColor)
  const [visibility, setVisibility] = useState<AreaVisibility>('public')
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
      visibility,
    }).select().single()

    if (areaErr || !area) { setLoading(false); setError(areaErr?.message ?? 'Erro ao criar espaço.'); return }

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
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Visibilidade</label>
            <div className="space-y-2">
              {VISIBILITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setVisibility(opt.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors ${visibility === opt.value ? 'border-[#9B5DE5] bg-[#9B5DE5]/5' : 'border-gray-200 bg-white'}`}
                >
                  <span className="text-xl">{opt.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm ${visibility === opt.value ? 'text-[#9B5DE5]' : 'text-gray-800'}`}>{opt.label}</p>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${visibility === opt.value ? 'border-[#9B5DE5] bg-[#9B5DE5]' : 'border-gray-300'}`} />
                </button>
              ))}
            </div>
          </div>
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
