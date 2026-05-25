import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Area, Link as LinkType } from '../lib/types'
import { deriveWorld } from '../lib/colors'
import Layout from '../components/Layout'
import LinkCard from '../components/LinkCard'
import WorldGlyph from '../components/WorldGlyph'
import AddLinkModal from '../components/AddLinkModal'

const VISIBILITY_LABEL: Record<string, string> = {
  public:    'público',
  followers: 'amigos',
  private:   'privado',
}

interface Props { session: Session }

const tag: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--fg-faint)',
  fontWeight: 500,
}

export default function AreaPage({ session }: Props) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [area, setArea] = useState<Area | null>(null)
  const [links, setLinks] = useState<LinkType[]>([])
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [joining, setJoining] = useState(false)
  const [actionsOpen, setActionsOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function loadArea() {
    if (!id) return
    setLoading(true)
    const [{ data: areaData }, { data: linksData }, { data: memberRow }] = await Promise.all([
      supabase.from('areas').select('*, owner:profiles!areas_owner_id_fkey(*)').eq('id', id).single(),
      supabase.from('links').select('*, profile:profiles!links_added_by_fkey(*)').eq('area_id', id).order('created_at', { ascending: false }),
      supabase.from('area_members').select('user_id').eq('area_id', id).eq('user_id', session.user.id).maybeSingle(),
    ])
    if (!areaData) { navigate('/'); return }
    setArea(areaData as Area)
    setLinks((linksData ?? []) as LinkType[])
    setIsMember(!!memberRow || areaData?.owner_id === session.user.id)
    setLoading(false)
  }

  useEffect(() => { loadArea() }, [id])

  async function joinArea() {
    if (!id) return
    setJoining(true)
    const { error } = await supabase.from('area_members').insert({ area_id: id, user_id: session.user.id })
    if (!error) setIsMember(true)
    setJoining(false)
  }

  async function leaveArea() {
    if (!id) return
    await supabase.from('area_members').delete().eq('area_id', id).eq('user_id', session.user.id)
    navigate('/')
  }

  async function toggleArchive() {
    if (!area) return
    await supabase.from('areas').update({ is_archived: !area.is_archived }).eq('id', area.id)
    setActionsOpen(false)
    navigate('/')
  }

  async function deleteArea() {
    if (!area) return
    await supabase.from('areas').delete().eq('id', area.id)
    navigate('/')
  }

  async function deleteLink(linkId: string) {
    await supabase.from('links').delete().eq('id', linkId)
    setLinks(prev => prev.filter(l => l.id !== linkId))
  }

  if (loading || !area) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-8 h-8 rounded-full animate-spin" style={{ borderWidth: 2, borderStyle: 'solid', borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  const isOwner = area.owner_id === session.user.id
  const ownerUsername = (area.owner as unknown as { username: string })?.username ?? 'usuário'
  const { palette, kind } = deriveWorld(area)

  const headerActions = (
    <div className="flex gap-2">
      {isMember && (
        <button
          onClick={() => setShowAdd(true)}
          aria-label="Adicionar link"
          className="transition-opacity active:opacity-70"
          style={{ background: 'var(--fg)', color: 'var(--bg)' }}
        >
          <span className="w-9 h-9 flex items-center justify-center md:hidden">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
            </svg>
          </span>
          <span className="hidden md:flex items-center gap-2 px-3 h-9 font-mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            adicionar
          </span>
        </button>
      )}
      {isOwner && (
        <button
          onClick={() => { setActionsOpen(true); setConfirmDelete(false) }}
          aria-label="Mais opções"
          className="w-9 h-9 flex items-center justify-center"
          style={{ color: 'var(--fg-muted)' }}
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" />
          </svg>
        </button>
      )}
    </div>
  )

  return (
    <Layout title="" back="/" action={headerActions} session={session}>
      <div className="mb-7">
        <div className="flex items-start gap-4">
          <WorldGlyph size={84} palette={palette} kind={kind} />
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="font-display" style={{ fontSize: 30, lineHeight: 1.05, color: 'var(--fg)' }}>
              {area.name}
            </h1>
            <div className="font-mono mt-1.5 flex items-center gap-2 flex-wrap" style={tag}>
              <span>@{ownerUsername}</span>
              <span aria-hidden="true">·</span>
              <span>{VISIBILITY_LABEL[area.visibility] ?? area.visibility}</span>
              {area.is_archived && (<><span aria-hidden="true">·</span><span>arquivado</span></>)}
            </div>
          </div>
        </div>

        {area.description && (
          <p className="mt-4" style={{ fontSize: 14.5, color: 'var(--fg-muted)', lineHeight: 1.55 }}>
            {area.description}
          </p>
        )}

        <div className="mt-5 flex items-center gap-3 flex-wrap">
          <span className="font-mono" style={tag}>
            {String(links.length).padStart(3, '0')} itens
          </span>
          <span aria-hidden="true" style={{ color: 'var(--fg-faint)' }}>·</span>
          <span className="font-mono" style={tag}>{String(area.member_count ?? 0).padStart(2, '0')} pessoas</span>

          {!isOwner && (
            <span style={{ marginLeft: 'auto' }}>
              {area.visibility === 'private' && !isMember ? (
                <span className="font-mono" style={{ ...tag, color: 'var(--fg-muted)' }}>privado</span>
              ) : isMember ? (
                <button
                  onClick={leaveArea}
                  className="font-mono px-3 py-2 transition-opacity active:opacity-70"
                  style={{ background: 'transparent', color: 'var(--fg-muted)', border: '1px solid var(--border-2)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500 }}
                >
                  sair
                </button>
              ) : (
                <button
                  onClick={joinArea}
                  disabled={joining}
                  className="font-mono px-4 py-2 transition-opacity active:opacity-80"
                  style={{ background: 'var(--fg)', color: 'var(--bg)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}
                >
                  {joining ? '...' : 'participar'}
                </button>
              )}
            </span>
          )}
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--border)', marginBottom: 20 }} />

      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="font-display" style={{ fontSize: 26, color: 'var(--fg)', lineHeight: 1.1 }}>
            nada por aqui
          </p>
          <p className="mt-2" style={{ fontSize: 13.5, color: 'var(--fg-muted)', maxWidth: 240, lineHeight: 1.5 }}>
            {isMember ? 'Adicione o primeiro link e este mundo começa.' : 'Ainda nenhum item neste mundo.'}
          </p>
          {isMember && (
            <button
              onClick={() => setShowAdd(true)}
              className="mt-5 px-5 py-3 font-mono transition-opacity active:opacity-80"
              style={{ background: 'var(--fg)', color: 'var(--bg)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}
            >
              adicionar link
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {links.map(link => (
              <LinkCard key={link.id} link={link} canDelete={isMember && (link.added_by === session.user.id || isOwner)} onDelete={deleteLink} />
            ))}
          </div>
          {isMember && (
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-4 font-mono transition-opacity active:opacity-70"
              style={{ border: '1px dashed var(--border-2)', color: 'var(--fg-muted)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
              </svg>
              adicionar link
            </button>
          )}
        </>
      )}

      {showAdd && <AddLinkModal areaId={area.id} session={session} onClose={() => setShowAdd(false)} onAdded={loadArea} />}

      {actionsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}
          onClick={() => setActionsOpen(false)}
        >
          <div
            className="w-full max-w-lg p-6 pb-safe-bottom"
            style={{ background: 'var(--bg)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: 32, height: 2, background: 'var(--border-2)', margin: '0 auto 22px' }} />
            <p className="font-mono" style={{ ...tag, color: 'var(--fg-muted)' }}>{area.name}</p>
            <h3 className="font-display mt-1 mb-5" style={{ fontSize: 26, color: 'var(--fg)', lineHeight: 1.1 }}>
              ações do mundo
            </h3>

            <button
              onClick={toggleArchive}
              className="w-full flex items-center justify-between p-4 text-left transition-opacity active:opacity-80"
              style={{ background: 'var(--card)', marginBottom: 10 }}
            >
              <div>
                <p className="font-display" style={{ fontSize: 18, color: 'var(--fg)', lineHeight: 1 }}>
                  {area.is_archived ? 'desarquivar' : 'arquivar'}
                </p>
                <p className="mt-1" style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
                  {area.is_archived ? 'volta para a lista principal' : 'oculta da lista, não apaga'}
                </p>
              </div>
              <span style={{ color: 'var(--fg-faint)' }}>›</span>
            </button>

            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full flex items-center justify-between p-4 text-left transition-opacity active:opacity-80"
                style={{ background: 'transparent', border: '1px solid var(--border-2)' }}
              >
                <div>
                  <p className="font-display" style={{ fontSize: 18, color: '#c25040', lineHeight: 1 }}>
                    excluir mundo
                  </p>
                  <p className="mt-1" style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
                    remove permanentemente, com todos os links
                  </p>
                </div>
                <span style={{ color: '#c25040' }}>›</span>
              </button>
            ) : (
              <div style={{ background: 'var(--card)', padding: 18, border: '1px solid #c2504055' }}>
                <p style={{ fontSize: 14, color: '#c25040', lineHeight: 1.45, marginBottom: 14 }}>
                  Tem certeza? Essa ação não pode ser desfeita.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="font-mono flex-1 py-3 transition-opacity active:opacity-70"
                    style={{ background: 'transparent', color: 'var(--fg-muted)', border: '1px solid var(--border-2)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}
                  >
                    cancelar
                  </button>
                  <button
                    onClick={deleteArea}
                    className="font-mono flex-1 py-3 transition-opacity active:opacity-80"
                    style={{ background: '#c25040', color: '#fff', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}
                  >
                    excluir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}
