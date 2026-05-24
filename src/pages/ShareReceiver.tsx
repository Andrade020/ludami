import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Area } from '../lib/types'
import { fetchYouTubeInfo } from '../lib/youtube'
import { colorToShadow } from '../lib/colors'

interface Props { session: Session }

export default function ShareReceiver({ session }: Props) {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [areas, setAreas] = useState<Area[]>([])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'pick' | 'note'>('pick')
  const [selectedArea, setSelectedArea] = useState<Area | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sharedUrl = params.get('url') || params.get('text') || ''
    setUrl(sharedUrl)

    supabase
      .from('area_members')
      .select('area_id')
      .eq('user_id', session.user.id)
      .then(async ({ data: memberRows }) => {
        const ids = (memberRows ?? []).map(r => r.area_id)
        if (ids.length === 0) return
        const { data } = await supabase.from('areas').select('*').in('id', ids)
        setAreas((data ?? []) as Area[])
      })
  }, [session])

  async function saveLink() {
    if (!selectedArea || !url) return
    setLoading(true)
    const info = await fetchYouTubeInfo(url)
    await supabase.from('links').insert({
      area_id: selectedArea.id,
      url,
      title: info?.title ?? null,
      thumbnail_url: info?.thumbnail_url ?? null,
      notes: notes.trim() || null,
      added_by: session.user.id,
    })
    setLoading(false)
    navigate(`/area/${selectedArea.id}`)
  }

  return (
    <div className="min-h-dvh bg-[#FAF5EE] flex flex-col">
      <header className="px-4 pt-safe-top pb-3 flex items-center gap-3 border-b border-black/5">
        <button onClick={() => navigate('/')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-gray-600">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <span className="text-xl font-extrabold text-gray-900">Salvar link</span>
      </header>

      <div className="flex-1 px-4 py-4">
        <div className="bg-white rounded-2xl p-4 mb-5 border border-gray-100">
          <p className="text-xs text-gray-400 font-semibold mb-1">Link compartilhado</p>
          <p className="text-sm text-gray-700 break-all">{url || '—'}</p>
        </div>

        {step === 'pick' ? (
          <>
            <h2 className="font-extrabold text-gray-900 text-lg mb-3">Salvar em qual espaço?</h2>
            {areas.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Você ainda não é membro de nenhum espaço.</p>
            ) : (
              <div className="space-y-3">
                {areas.map(area => (
                  <button
                    key={area.id}
                    onClick={() => { setSelectedArea(area); setStep('note') }}
                    className="w-full text-left rounded-2xl p-4 text-white transition-transform active:scale-95"
                    style={{ backgroundColor: area.color, boxShadow: colorToShadow(area.color) }}
                  >
                    <span className="font-extrabold">{area.name}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <button onClick={() => setStep('pick')} className="text-[#C8624A] font-semibold text-sm mb-4">← Trocar espaço</button>
            <div className="rounded-2xl p-3 text-white mb-5" style={{ backgroundColor: selectedArea?.color }}>
              <span className="font-extrabold">{selectedArea?.name}</span>
            </div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nota (opcional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="O que achou? Para que serve?"
              rows={4}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#C8624A] focus:outline-none transition-colors resize-none mb-4"
            />
            <button
              onClick={saveLink}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#C8624A] text-white font-extrabold text-lg disabled:opacity-60"
              style={{ boxShadow: '0 4px 20px #C8624A66' }}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
