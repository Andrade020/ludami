import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile, Follow, FollowStatus } from '../lib/types'
import Layout from '../components/Layout'
import Avatar from '../components/Avatar'

interface Props { session: Session }

interface UserResult extends Profile {
  followStatus: FollowStatus | 'none' | 'self'
}

export default function PeoplePage({ session }: Props) {
  const [tab, setTab] = useState<'search' | 'requests'>('search')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [requests, setRequests] = useState<Follow[]>([])
  const [loadingRequests, setLoadingRequests] = useState(true)

  useEffect(() => { loadRequests() }, [])

  async function loadRequests() {
    setLoadingRequests(true)
    const { data } = await supabase
      .from('follows')
      .select('*, follower:profiles!follows_follower_id_fkey(*)')
      .eq('following_id', session.user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    setRequests((data ?? []) as Follow[])
    setLoadingRequests(false)
  }

  async function search() {
    if (!query.trim()) return
    setSearching(true)
    setSearched(true)

    const [{ data: profiles }, { data: myFollows }] = await Promise.all([
      supabase.from('profiles').select('*').ilike('username', `%${query.trim()}%`).limit(20),
      supabase.from('follows').select('following_id, status').eq('follower_id', session.user.id),
    ])

    const followMap = new Map((myFollows ?? []).map(f => [f.following_id, f.status as FollowStatus]))
    setResults((profiles ?? []).map(p => ({
      ...p,
      followStatus: p.id === session.user.id ? 'self' : (followMap.get(p.id) ?? 'none'),
    })))
    setSearching(false)
  }

  async function sendRequest(userId: string) {
    await supabase.from('follows').insert({ follower_id: session.user.id, following_id: userId })
    setResults(prev => prev.map(u => u.id === userId ? { ...u, followStatus: 'pending' } : u))
  }

  async function cancelFollow(userId: string) {
    await supabase.from('follows').delete().eq('follower_id', session.user.id).eq('following_id', userId)
    setResults(prev => prev.map(u => u.id === userId ? { ...u, followStatus: 'none' } : u))
  }

  async function accept(followerId: string) {
    await supabase.from('follows').update({ status: 'accepted' }).eq('follower_id', followerId).eq('following_id', session.user.id)
    setRequests(prev => prev.filter(r => r.follower_id !== followerId))
  }

  async function reject(followerId: string) {
    await supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', session.user.id)
    setRequests(prev => prev.filter(r => r.follower_id !== followerId))
  }

  return (
    <Layout title="Pessoas" session={session}>
      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab('search')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${tab === 'search' ? 'bg-[#C8624A] text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
          Buscar
        </button>
        <button onClick={() => setTab('requests')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors relative ${tab === 'requests' ? 'bg-[#C8624A] text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
          Pedidos
          {requests.length > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-[#FF6B6B] rounded-full text-white text-[10px] font-bold flex items-center justify-center">
              {requests.length > 9 ? '9+' : requests.length}
            </span>
          )}
        </button>
      </div>

      {tab === 'search' && (
        <>
          <div className="flex gap-2 mb-5">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="Buscar por username..."
              className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#C8624A] focus:outline-none transition-colors"
            />
            <button onClick={search} disabled={searching} className="w-12 h-12 rounded-xl bg-[#C8624A] text-white flex items-center justify-center disabled:opacity-60" style={{ boxShadow: '0 4px 12px #C8624A44' }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
            </button>
          </div>

          {!searched && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-3xl bg-[#C8624A]/10 flex items-center justify-center mb-4">
                <svg width="36" height="36" fill="none" stroke="#C8624A" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
              </div>
              <p className="text-gray-700 font-bold">Busque por username</p>
              <p className="text-gray-400 text-sm mt-1">Encontre pessoas e siga para ver os espaços delas</p>
            </div>
          )}

          {searching && <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-[#C8624A] border-t-transparent rounded-full animate-spin" /></div>}
          {searched && !searching && results.length === 0 && <p className="text-center text-gray-400 py-16">Nenhum usuário encontrado</p>}

          <div className="space-y-3">
            {results.map(user => (
              <div key={user.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-gray-100">
                <Avatar profile={user} size={48} />
                <p className="flex-1 font-bold text-gray-900">@{user.username}</p>
                {user.followStatus === 'self' ? (
                  <span className="text-xs text-gray-400 font-semibold">Você</span>
                ) : user.followStatus === 'accepted' ? (
                  <button onClick={() => cancelFollow(user.id)} className="text-sm font-bold px-4 py-2 rounded-xl bg-gray-100 text-gray-600">Seguindo</button>
                ) : user.followStatus === 'pending' ? (
                  <button onClick={() => cancelFollow(user.id)} className="text-sm font-bold px-4 py-2 rounded-xl bg-[#C8624A]/10 text-[#C8624A]">Solicitado</button>
                ) : (
                  <button onClick={() => sendRequest(user.id)} className="text-sm font-bold px-4 py-2 rounded-xl bg-[#C8624A] text-white" style={{ boxShadow: '0 2px 8px #C8624A44' }}>Seguir</button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'requests' && (
        loadingRequests ? (
          <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-[#C8624A] border-t-transparent rounded-full animate-spin" /></div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-3xl bg-[#C8624A]/10 flex items-center justify-center mb-4">
              <svg width="36" height="36" fill="none" stroke="#C8624A" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-gray-700 font-bold">Nenhum pedido pendente</p>
            <p className="text-gray-400 text-sm mt-1">Quando alguém quiser te seguir, aparece aqui</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(req => {
              const follower = req.follower
              if (!follower) return null
              return (
                <div key={req.follower_id} className="bg-white rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar profile={follower} size={48} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900">@{follower.username}</p>
                      <p className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => accept(req.follower_id)} className="flex-1 py-2.5 rounded-xl bg-[#4A9E6B] text-white font-bold text-sm" style={{ boxShadow: '0 2px 8px #4A9E6B44' }}>Aceitar</button>
                    <button onClick={() => reject(req.follower_id)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm">Recusar</button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}
    </Layout>
  )
}
