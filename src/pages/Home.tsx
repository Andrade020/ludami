import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Area, Profile } from '../lib/types'
import Layout from '../components/Layout'
import AreaCard from '../components/AreaCard'
import Avatar from '../components/Avatar'
import CreateAreaModal from '../components/CreateAreaModal'

interface Props { session: Session }

export default function Home({ session }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [activeAreas, setActiveAreas] = useState<Area[]>([])
  const [archivedAreas, setArchivedAreas] = useState<Area[]>([])
  const [exploreAreas, setExploreAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [tab, setTab] = useState<'mine' | 'explore'>('mine')
  const [showArchived, setShowArchived] = useState(false)

  async function loadAll() {
    setLoading(true)

    const [{ data: profileData }, { data: memberRows }, { data: areas }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', session.user.id).single(),
      supabase.from('area_members').select('area_id').eq('user_id', session.user.id),
      supabase.from('areas').select(`*, owner:profiles!areas_owner_id_fkey(id, username, avatar_color, avatar_url), link_count:links(count), member_count:area_members(count)`).order('created_at', { ascending: false }),
    ])

    setProfile(profileData)

    const memberAreaIds = (memberRows ?? []).map(r => r.area_id)
    const enriched: Area[] = (areas ?? []).map((a: Area & { link_count: { count: number }[]; member_count: { count: number }[] }) => ({
      ...a,
      link_count: a.link_count?.[0]?.count ?? 0,
      member_count: a.member_count?.[0]?.count ?? 0,
      is_member: memberAreaIds.includes(a.id),
    }))

    setActiveAreas(enriched.filter(a => a.is_member && !a.is_archived))
    setArchivedAreas(enriched.filter(a => a.is_member && a.is_archived))
    setExploreAreas(enriched.filter(a => !a.is_member))
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])

  const createButton = (
    <button
      onClick={() => setShowCreate(true)}
      className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#7C3AED] text-white"
      style={{ boxShadow: '0 4px 12px #7C3AED55' }}
    >
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  )

  return (
    <Layout action={createButton} session={session}>
      {profile && (
        <div className="flex items-center gap-3 mb-6">
          <Avatar profile={profile} size={44} />
          <div>
            <p className="text-xs text-gray-400 font-medium">Bem-vindo de volta</p>
            <p className="text-base font-bold text-gray-900">@{profile.username}</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab('mine')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${tab === 'mine' ? 'bg-[#7C3AED] text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
          Meus Espaços
        </button>
        <button onClick={() => setTab('explore')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${tab === 'explore' ? 'bg-[#7C3AED] text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
          Explorar
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === 'mine' ? (
        <>
          {activeAreas.length === 0 && archivedAreas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-3xl bg-[#7C3AED]/10 flex items-center justify-center mb-4">
                <svg width="36" height="36" fill="none" stroke="#7C3AED" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <p className="text-gray-700 font-bold text-lg">Nenhum espaço ainda</p>
              <p className="text-gray-400 text-sm mt-1 mb-5">Crie seu primeiro espaço e comece a organizar</p>
              <button onClick={() => setShowCreate(true)} className="px-6 py-3 rounded-2xl bg-[#7C3AED] text-white font-bold" style={{ boxShadow: '0 4px 16px #7C3AED55' }}>
                Criar espaço
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {activeAreas.map(area => <AreaCard key={area.id} area={area} />)}
              </div>
              {archivedAreas.length > 0 && (
                <div className="mt-5">
                  <button onClick={() => setShowArchived(v => !v)} className="flex items-center gap-2 text-sm font-semibold text-gray-400 mb-3">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className={`transition-transform ${showArchived ? 'rotate-90' : ''}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    Arquivados ({archivedAreas.length})
                  </button>
                  {showArchived && (
                    <div className="space-y-3 opacity-60">
                      {archivedAreas.map(area => <AreaCard key={area.id} area={area} />)}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      ) : (
        exploreAreas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-gray-500 font-semibold">Nenhum espaço para explorar</p>
            <p className="text-gray-400 text-sm mt-1">Siga pessoas para ver os espaços delas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {exploreAreas.map(area => <AreaCard key={area.id} area={area} />)}
          </div>
        )
      )}

      {showCreate && <CreateAreaModal session={session} onClose={() => setShowCreate(false)} onCreated={loadAll} />}
    </Layout>
  )
}
