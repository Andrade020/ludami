import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Area } from '../lib/types'
import { fetchYouTubeInfo } from '../lib/youtube'
import { deriveWorld } from '../lib/colors'
import WorldGlyph from '../components/WorldGlyph'
import Lockup from '../components/Lockup'

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

  const tag: React.CSSProperties = { fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-faint)', fontWeight: 500 }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg)' }}>
      <header
        className="px-5 pt-safe-top pb-3 flex items-center gap-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <button
          onClick={() => navigate('/')}
          aria-label="Cancelar"
          className="w-9 h-9 flex items-center justify-center"
          style={{ color: 'var(--fg)' }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex-1"><Lockup markSize={22} wordSize={26} /></div>
      </header>

      <div className="flex-1 px-5 py-5 max-w-lg mx-auto w-full">
        <p className="font-mono" style={tag}>Link compartilhado</p>
        <p className="mt-2 break-all" style={{ fontSize: 13.5, color: 'var(--fg-muted)', lineHeight: 1.45 }}>
          {url || '—'}
        </p>

        <div className="mt-6">
          {step === 'pick' ? (
            <>
              <h2 className="font-display" style={{ fontSize: 30, lineHeight: 1.1, color: 'var(--fg)' }}>
                salvar em qual mundo?
              </h2>
              {areas.length === 0 ? (
                <p className="mt-5" style={{ fontSize: 14, color: 'var(--fg-muted)' }}>
                  Você ainda não é membro de nenhum mundo.
                </p>
              ) : (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {areas.map(area => {
                    const { palette, kind } = deriveWorld(area)
                    return (
                      <button
                        key={area.id}
                        onClick={() => { setSelectedArea(area); setStep('note') }}
                        className="text-left transition-opacity active:opacity-80"
                        style={{ background: 'var(--card)', padding: 10 }}
                      >
                        <WorldGlyph size={200} palette={palette} kind={kind} style={{ width: '100%', height: 'auto', aspectRatio: '1 / 1' }} />
                        <p className="font-display mt-2.5 px-1 truncate" style={{ fontSize: 18, color: 'var(--fg)', lineHeight: 1.1 }}>
                          {area.name}
                        </p>
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => setStep('pick')}
                className="font-mono"
                style={{ ...tag, color: 'var(--accent)' }}
              >
                ← trocar mundo
              </button>
              {selectedArea && (
                <div className="mt-4 flex items-center gap-3" style={{ background: 'var(--card)', padding: 12 }}>
                  <WorldGlyph size={56} palette={deriveWorld(selectedArea).palette} kind={deriveWorld(selectedArea).kind} />
                  <p className="font-display flex-1 min-w-0 truncate" style={{ fontSize: 22, color: 'var(--fg)', lineHeight: 1 }}>
                    {selectedArea.name}
                  </p>
                </div>
              )}
              <label className="font-mono block mt-6 mb-1" style={{ ...tag, color: 'var(--fg-muted)' }}>Nota</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="O que achou. Para que serve."
                rows={4}
                style={{ background: 'transparent', color: 'var(--fg)', borderBottom: '1px solid var(--border-2)', fontSize: 15, outline: 'none', width: '100%', padding: '10px 0', resize: 'none' }}
                onFocus={e => (e.currentTarget.style.borderBottomColor = 'var(--accent)')}
                onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-2)')}
              />
              <button
                onClick={saveLink}
                disabled={loading}
                className="w-full mt-6 py-4 font-mono transition-opacity active:opacity-80"
                style={{ background: 'var(--fg)', color: 'var(--bg)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Salvando' : 'Salvar'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
