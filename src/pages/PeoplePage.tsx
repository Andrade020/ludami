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

const tag: React.CSSProperties = {
  fontSize: 10.5,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  fontWeight: 600,
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

  function ActionBtn({ kind, onClick, children }: { kind: 'primary' | 'ghost' | 'soft'; onClick: () => void; children: React.ReactNode }) {
    const styles: Record<string, React.CSSProperties> = {
      primary: { background: 'var(--fg)', color: 'var(--bg)' },
      ghost:   { background: 'transparent', color: 'var(--fg-muted)', border: '1px solid var(--border-2)' },
      soft:    { background: 'var(--card)', color: 'var(--accent)' },
    }
    return (
      <button
        onClick={onClick}
        className="font-mono px-3 py-2 transition-opacity active:opacity-80"
        style={{ ...styles[kind], ...tag, fontSize: 10 }}
      >
        {children}
      </button>
    )
  }

  return (
    <Layout title="pessoas" session={session}>
      <div className="flex gap-6 mb-5" style={{ borderBottom: '1px solid var(--border)' }}>
        {([['search', 'Buscar'], ['requests', `Pedidos${requests.length ? ` · ${String(requests.length).padStart(2, '0')}` : ''}`]] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k as 'search' | 'requests')}
            className="font-mono pb-2.5 transition-colors"
            style={{
              ...tag,
              fontSize: 11,
              color: tab === k ? 'var(--fg)' : 'var(--fg-faint)',
              borderBottom: tab === k ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'search' && (
        <>
          <div className="flex items-end gap-3 mb-6">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="@username"
              className="flex-1"
              style={{ background: 'transparent', color: 'var(--fg)', borderBottom: '1px solid var(--border-2)', fontSize: 16, outline: 'none', padding: '10px 0' }}
              onFocus={e => (e.currentTarget.style.borderBottomColor = 'var(--accent)')}
              onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-2)')}
            />
            <button
              onClick={search}
              disabled={searching}
              className="font-mono px-4 py-2.5 transition-opacity active:opacity-80"
              style={{ background: 'var(--fg)', color: 'var(--bg)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, opacity: searching ? 0.6 : 1 }}
            >
              buscar
            </button>
          </div>

          {!searched && (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <p className="font-display" style={{ fontSize: 26, color: 'var(--fg)', lineHeight: 1.1 }}>
                encontre pessoas
              </p>
              <p className="mt-2" style={{ fontSize: 13.5, color: 'var(--fg-muted)', maxWidth: 280, lineHeight: 1.5 }}>
                Busque por username e siga para ver os mundos delas.
              </p>
            </div>
          )}

          {searching && (
            <div className="flex justify-center py-12">
              <div className="w-7 h-7 rounded-full animate-spin" style={{ borderWidth: 2, borderStyle: 'solid', borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
            </div>
          )}

          {searched && !searching && results.length === 0 && (
            <p className="text-center py-12 font-display" style={{ fontSize: 20, color: 'var(--fg-muted)' }}>
              nenhum username encontrado
            </p>
          )}

          <div>
            {results.map(user => (
              <div
                key={user.id}
                className="flex items-center gap-3 py-3"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <Avatar profile={user} size={42} />
                <p className="font-display flex-1 min-w-0 truncate" style={{ fontSize: 18, color: 'var(--fg)', lineHeight: 1.1 }}>
                  @{user.username}
                </p>
                {user.followStatus === 'self' ? (
                  <span className="font-mono" style={{ ...tag, fontSize: 10, color: 'var(--fg-faint)' }}>você</span>
                ) : user.followStatus === 'accepted' ? (
                  <ActionBtn kind="ghost" onClick={() => cancelFollow(user.id)}>seguindo</ActionBtn>
                ) : user.followStatus === 'pending' ? (
                  <ActionBtn kind="soft" onClick={() => cancelFollow(user.id)}>solicitado</ActionBtn>
                ) : (
                  <ActionBtn kind="primary" onClick={() => sendRequest(user.id)}>seguir</ActionBtn>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'requests' && (
        loadingRequests ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 rounded-full animate-spin" style={{ borderWidth: 2, borderStyle: 'solid', borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <p className="font-display" style={{ fontSize: 26, color: 'var(--fg)', lineHeight: 1.1 }}>
              tudo em dia
            </p>
            <p className="mt-2" style={{ fontSize: 13.5, color: 'var(--fg-muted)', maxWidth: 260, lineHeight: 1.5 }}>
              Quando alguém pedir pra te seguir, aparece aqui.
            </p>
          </div>
        ) : (
          <div>
            {requests.map(req => {
              const follower = req.follower
              if (!follower) return null
              const when = new Date(req.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
              return (
                <div
                  key={req.follower_id}
                  className="py-4"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar profile={follower} size={42} />
                    <div className="flex-1 min-w-0">
                      <p className="font-display truncate" style={{ fontSize: 18, color: 'var(--fg)', lineHeight: 1.1 }}>
                        @{follower.username}
                      </p>
                      <p className="font-mono mt-0.5" style={{ ...tag, fontSize: 9.5, color: 'var(--fg-faint)' }}>
                        {when}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <ActionBtn kind="primary" onClick={() => accept(req.follower_id)}>aceitar</ActionBtn>
                    <ActionBtn kind="ghost" onClick={() => reject(req.follower_id)}>recusar</ActionBtn>
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
