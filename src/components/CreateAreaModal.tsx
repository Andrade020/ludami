import { useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { WORLD_PALETTES, GLYPH_KINDS, type GlyphKind } from '../lib/colors'
import type { AreaVisibility } from '../lib/types'
import type { Session } from '@supabase/supabase-js'
import WorldGlyph from './WorldGlyph'

interface Props {
  session: Session
  onClose: () => void
  onCreated: () => void
}

const tag: React.CSSProperties = {
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
  fontSize: 16,
  outline: 'none',
  width: '100%',
  padding: '10px 0',
}

const VISIBILITY_OPTIONS: { value: AreaVisibility; label: string; desc: string }[] = [
  { value: 'public',    label: 'público',  desc: 'qualquer pessoa pode ver e participar' },
  { value: 'followers', label: 'amigos',   desc: 'só quem você aceitar como seguidor' },
  { value: 'private',   label: 'privado',  desc: 'apenas membros que você adicionar' },
]

export default function CreateAreaModal({ session, onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [paletteIdx, setPaletteIdx] = useState(0)
  const [glyphKind, setGlyphKind] = useState<GlyphKind>('arch')
  const [visibility, setVisibility] = useState<AreaVisibility>('public')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const palette = useMemo(() => WORLD_PALETTES[paletteIdx], [paletteIdx])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')

    const { data: area, error: areaErr } = await supabase.from('areas').insert({
      name: name.trim(),
      description: description.trim() || null,
      color: palette[0],
      owner_id: session.user.id,
      visibility,
    }).select().single()

    if (areaErr || !area) { setLoading(false); setError(areaErr?.message ?? 'Erro ao criar mundo.'); return }
    await supabase.from('area_members').insert({ area_id: area.id, user_id: session.user.id })

    setLoading(false)
    onCreated()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg p-6 pb-safe-bottom"
        style={{ background: 'var(--bg)', maxHeight: '92dvh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ width: 32, height: 2, background: 'var(--border-2)', margin: '0 auto 22px' }} />
        <p className="font-mono" style={tag}>Novo mundo</p>
        <h2 className="font-display mt-1 mb-5" style={{ fontSize: 32, lineHeight: 1.05, color: 'var(--fg)' }}>
          criar
        </h2>

        <div className="flex items-center gap-4 mb-6 p-3" style={{ background: 'var(--card)' }}>
          <WorldGlyph size={84} palette={palette} kind={glyphKind} />
          <div className="flex-1 min-w-0">
            <p className="font-display truncate" style={{ fontSize: 22, color: 'var(--fg)', lineHeight: 1.1 }}>
              {name || 'sem nome'}
            </p>
            <p className="font-mono mt-1" style={{ ...tag, color: 'var(--fg-faint)' }}>
              000 itens · você
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="font-mono block mb-1" style={tag}>Nome</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="cozinha lenta, leitura tarde, ..."
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderBottomColor = 'var(--accent)')}
              onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-2)')}
              autoFocus
              required
            />
          </div>

          <div>
            <label className="font-mono block mb-1" style={tag}>Descrição</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="do que se trata este mundo?"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderBottomColor = 'var(--accent)')}
              onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-2)')}
            />
          </div>

          <div>
            <label className="font-mono block mb-3" style={tag}>Paleta</label>
            <div className="grid grid-cols-4 gap-2">
              {WORLD_PALETTES.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPaletteIdx(i)}
                  aria-label={`Paleta ${i + 1}`}
                  style={{
                    aspectRatio: '1 / 1',
                    padding: 0,
                    background: 'transparent',
                    outline: paletteIdx === i ? '2px solid var(--fg)' : '1px solid var(--border)',
                    outlineOffset: paletteIdx === i ? 2 : 0,
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', width: '100%', height: '100%' }}>
                    <span style={{ background: p[0] }} />
                    <span style={{ background: p[1] }} />
                    <span style={{ background: p[1] }} />
                    <span style={{ background: p[2] }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-mono block mb-3" style={tag}>Glifo</label>
            <div className="grid grid-cols-5 gap-2">
              {GLYPH_KINDS.map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setGlyphKind(k)}
                  aria-label={`Glifo ${k}`}
                  style={{
                    aspectRatio: '1 / 1',
                    padding: 0,
                    background: 'transparent',
                    outline: glyphKind === k ? '2px solid var(--fg)' : '1px solid var(--border)',
                    outlineOffset: glyphKind === k ? 2 : 0,
                  }}
                >
                  <WorldGlyph
                    palette={palette}
                    kind={k}
                    style={{ width: '100%', height: '100%', display: 'block' }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-mono block mb-3" style={tag}>Visibilidade</label>
            <div className="space-y-2">
              {VISIBILITY_OPTIONS.map(opt => {
                const active = visibility === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setVisibility(opt.value)}
                    className="w-full flex items-center gap-3 p-3 text-left transition-colors"
                    style={{
                      background: active ? 'var(--card)' : 'transparent',
                      border: `1px solid ${active ? 'var(--fg)' : 'var(--border)'}`,
                    }}
                  >
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        border: `1px solid ${active ? 'var(--fg)' : 'var(--border-2)'}`,
                        background: active ? 'var(--fg)' : 'transparent',
                        flexShrink: 0,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-display" style={{ fontSize: 18, color: 'var(--fg)', lineHeight: 1 }}>
                        {opt.label}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {error && <p style={{ fontSize: 13, color: '#c25040' }}>{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="font-mono flex-1 py-3.5 transition-opacity active:opacity-70"
              style={{ background: 'transparent', color: 'var(--fg-muted)', border: '1px solid var(--border-2)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}
            >
              cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="font-mono flex-1 py-3.5 transition-opacity active:opacity-80"
              style={{ background: 'var(--fg)', color: 'var(--bg)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Criando' : 'Criar mundo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
