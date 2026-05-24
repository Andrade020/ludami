import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Area, Link as LinkType } from '../lib/types'
import Layout from '../components/Layout'
import LinkCard from '../components/LinkCard'
import AddLinkModal from '../components/AddLinkModal'

interface Props { session: Session }

export default function AreaPage({ session }: Props) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [area, setArea] = useState<Area | null>(null)
  const [links, setLinks] = useState<LinkType[]>([])
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [joining, setJoining] = useState(false)

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
    setIsMember(!!memberRow)
    setLoading(false)
  }

  useEffect(() => { loadArea() }, [id])

  async function joinArea() {
    if (!id) return
    setJoining(true)
    await supabase.from('area_members').insert({ area_id: id, user_id: session.user.id })
    setIsMember(true)
    setJoining(false)
  }

  async function leaveArea() {
    if (!id) return
    await supabase.from('area_members').delete().eq('area_id', id).eq('user_id', session.user.id)
    navigate('/')
  }

  async function deleteLink(linkId: string) {
    await supabase.from('links').delete().eq('id', linkId)
    setLinks(prev => prev.filter(l => l.id !== linkId))
  }

  if (loading || !area) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#FFFBF7]">
        <div className="w-10 h-10 border-4 border-[#9B5DE5] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isOwner = area.owner_id === session.user.id

  const addButton = isMember ? (
    <button
      onClick={() => setShowAdd(true)}
      className="w-10 h-10 flex items-center justify-center rounded-xl text-white shadow-md"
      style={{ backgroundColor: area.color, boxShadow: `0 4px 12px ${area.color}66` }}
    >
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  ) : null

  return (
    <Layout title={area.name} back="/" action={addButton}>
      <div className="rounded-2xl p-4 mb-5 text-white" style={{ backgroundColor: area.color, boxShadow: `0 4px 20px ${area.color}55` }}>
        {area.description && <p className="text-white/90 text-sm mb-3">{area.description}</p>}
        <div className="flex items-center justify-between">
          <span className="text-white/70 text-xs">por @{(area.owner as unknown as { username: string })?.username ?? 'usuário'}</span>
          {!isOwner && (
            isMember ? (
              <button onClick={leaveArea} className="text-xs bg-white/20 text-white font-semibold px-3 py-1.5 rounded-full">
                Sair do espaço
              </button>
            ) : (
              <button
                onClick={joinArea}
                disabled={joining}
                className="text-xs bg-white text-gray-800 font-bold px-4 py-1.5 rounded-full disabled:opacity-60"
              >
                {joining ? '...' : 'Participar'}
              </button>
            )
          )}
        </div>
      </div>

      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4" style={{ backgroundColor: `${area.color}20` }}>
            <svg width="36" height="36" fill="none" stroke={area.color} strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <p className="text-gray-500 font-semibold">Nenhum link ainda</p>
          {isMember && (
            <button
              onClick={() => setShowAdd(true)}
              className="mt-5 px-6 py-3 rounded-2xl text-white font-bold"
              style={{ backgroundColor: area.color, boxShadow: `0 4px 16px ${area.color}66` }}
            >
              Adicionar link
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {links.map(link => (
            <LinkCard
              key={link.id}
              link={link}
              canDelete={isMember && (link.added_by === session.user.id || isOwner)}
              onDelete={deleteLink}
            />
          ))}
        </div>
      )}

      {showAdd && (
        <AddLinkModal
          areaId={area.id}
          session={session}
          onClose={() => setShowAdd(false)}
          onAdded={loadArea}
        />
      )}
    </Layout>
  )
}
