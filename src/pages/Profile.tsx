import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile as ProfileType } from '../lib/types'
import Layout from '../components/Layout'

interface Props { session: Session }

export default function Profile({ session }: Props) {
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*').eq('id', session.user.id).single(),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', session.user.id).eq('status', 'accepted'),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', session.user.id).eq('status', 'accepted'),
    ]).then(([{ data }, { count: followers }, { count: following }]) => {
      setProfile(data)
      setFollowerCount(followers ?? 0)
      setFollowingCount(following ?? 0)
      setLoading(false)
    })
  }, [session])

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#FFFBF7]">
        <div className="w-10 h-10 border-4 border-[#9B5DE5] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Layout title="Perfil" back="/" session={session}>
      <div className="flex flex-col items-center py-8">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-3xl font-extrabold mb-4"
          style={{ backgroundColor: profile?.avatar_color ?? '#9B5DE5', boxShadow: `0 8px 32px ${profile?.avatar_color ?? '#9B5DE5'}66` }}
        >
          {(profile?.username ?? '?')[0].toUpperCase()}
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900">@{profile?.username ?? 'usuário'}</h2>
        <p className="text-gray-400 text-sm mt-1">{session.user.email}</p>
        <div className="flex gap-8 mt-4">
          <div className="text-center">
            <p className="text-xl font-extrabold text-gray-900">{followerCount}</p>
            <p className="text-xs text-gray-400">seguidores</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-extrabold text-gray-900">{followingCount}</p>
            <p className="text-xs text-gray-400">seguindo</p>
          </div>
        </div>
      </div>

      <div className="mt-2 space-y-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500 font-semibold mb-1">Compartilhar do YouTube</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            No app do YouTube, toque em <strong>Compartilhar → Ludami</strong>. Se não aparecer, cole o link manualmente em qualquer espaço.
          </p>
        </div>
      </div>

      <button
        onClick={() => supabase.auth.signOut()}
        className="w-full mt-8 py-4 rounded-2xl border-2 border-red-200 text-red-500 font-bold text-lg"
      >
        Sair da conta
      </button>
    </Layout>
  )
}
