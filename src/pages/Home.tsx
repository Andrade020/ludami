import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Area, Profile } from '../lib/types'
import Layout from '../components/Layout'
import AreaCard from '../components/AreaCard'
import CreateAreaModal from '../components/CreateAreaModal'

interface Props { session: Session }

const GREETINGS = [
  'o que voltou a importar',
  'o que vale guardar hoje',
  'sua coleção, devagar',
  'pequenos mundos seus',
]

const TABS = [
  ['mine', 'Meus'],
  ['friends', 'Amigos'],
  ['popular', 'Popular'],
] as const

type Tab = 'mine' | 'friends' | 'popular'

export default function Home({ session }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [activeAreas, setActiveAreas] = useState<Area[]>([])
  const [archivedAreas, setArchivedAreas] = useState<Area[]>([])
  const [friendsAreas, setFriendsAreas] = useState<Area[]>([])
  const [popularAreas, setPopularAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [tab, setTab] = useState<Tab>('mine')
  const [showArchived, setShowArchived] = useState(false)
  const [greeting] = useState(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)])

  async function loadAll() {
    setLoading(true)
    const [{ data: profileData }, { data: memberRows }, { data: areas }, { data: followRows }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', session.user.id).single(),
      supabase.from('area_members').select('area_id').eq('user_id', session.user.id),
      supabase.from('areas').select(`*, owner:profiles!areas_owner_id_fkey(id, username, avatar_color, avatar_url), link_count:links(count), member_count:area_members(count)`).order('created_at', { ascending: false }),
      supabase.from('follows').select('following_id').eq('follower_id', session.user.id).eq('status', 'accepted'),
    ])

    setProfile(profileData)
    const memberAreaIds = (memberRows ?? []).map(r => r.area_id)
    const followedIds = new Set((followRows ?? []).map(r => r.following_id))
    const enriched: Area[] = (areas ?? []).map((a: Area & { link_count: { count: number }[]; member_count: { count: number }[] }) => ({
      ...a,
      link_count: a.link_count?.[0]?.count ?? 0,
      member_count: a.member_count?.[0]?.count ?? 0,
      is_member: memberAreaIds.includes(a.id) || a.owner_id === session.user.id,
    }))

    const nonMembers = enriched.filter(a => !a.is_member)
    setActiveAreas(enriched.filter(a => a.is_member && !a.is_archived))
    setArchivedAreas(enriched.filter(a => a.is_member && a.is_archived))
    setFriendsAreas(nonMembers.filter(a => followedIds.has(a.owner_id)))
    setPopularAreas(
      nonMembers
        .filter(a => a.visibility === 'public')
        .sort((a, b) => (b.member_count as number) - (a.member_count as number))
    )
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])

  const createButton = (
    <button
      onClick={() => setShowCreate(true)}
      aria-label="Criar mundo"
      className="w-9 h-9 flex items-center justify-center transition-opacity active:opacity-70"
      style={{ background: 'var(--fg)', color: 'var(--bg)' }}
    >
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
      </svg>
    </button>
  )

  const list = tab === 'mine' ? activeAreas : tab === 'friends' ? friendsAreas : popularAreas

  const emptyTitle: Record<Tab, string> = {
    mine:    'nenhum mundo ainda',
    friends: 'nada dos seus amigos',
    popular: 'nada público por aqui',
  }
  const emptyBody: Record<Tab, string> = {
    mine:    'Crie o primeiro e comece a colecionar com calma.',
    friends: 'Siga pessoas para ver os mundos delas aparecerem aqui.',
    popular: 'Nenhum mundo público disponível no momento.',
  }

  return (
    <Layout action={createButton} session={session}>
      {profile && (
        <div className="mb-6 mt-1">
          <p className="font-mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-faint)' }}>
            @{profile.username} · {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')}
          </p>
          <h1 className="font-display mt-2" style={{ fontSize: 36, lineHeight: 1, color: 'var(--fg)' }}>
            {greeting}
          </h1>
        </div>
      )}

      <div className="flex gap-5 mb-5" style={{ borderBottom: '1px solid var(--border)' }}>
        {TABS.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className="font-mono pb-2.5 transition-colors whitespace-nowrap"
            style={{
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: tab === k ? 'var(--fg)' : 'var(--fg-faint)',
              borderBottom: tab === k ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="font-display" style={{ fontSize: 28, color: 'var(--fg)', lineHeight: 1.1 }}>
            {emptyTitle[tab]}
          </p>
          <p className="mt-2" style={{ fontSize: 13.5, color: 'var(--fg-muted)', maxWidth: 260, lineHeight: 1.5 }}>
            {emptyBody[tab]}
          </p>
          {tab === 'mine' && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-6 px-5 py-3 font-mono transition-opacity active:opacity-80"
              style={{ background: 'var(--fg)', color: 'var(--bg)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}
            >
              Criar mundo
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {list.map(area => <AreaCard key={area.id} area={area} />)}
          </div>

          {tab === 'mine' && archivedAreas.length > 0 && (
            <div className="mt-8">
              <button
                onClick={() => setShowArchived(v => !v)}
                className="font-mono flex items-center gap-2 mb-3"
                style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-faint)' }}
              >
                <span style={{ transform: showArchived ? 'rotate(90deg)' : 'none', transition: 'transform 120ms', display: 'inline-block' }}>›</span>
                Arquivados · {archivedAreas.length}
              </button>
              {showArchived && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3" style={{ opacity: 0.6 }}>
                  {archivedAreas.map(area => <AreaCard key={area.id} area={area} />)}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {showCreate && <CreateAreaModal session={session} onClose={() => setShowCreate(false)} onCreated={loadAll} />}
    </Layout>
  )
}
