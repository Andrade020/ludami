import { useEffect, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile as ProfileType } from '../lib/types'
import Layout from '../components/Layout'
import Avatar from '../components/Avatar'

interface Props { session: Session }

export default function Profile({ session }: Props) {
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*').eq('id', session.user.id).single(),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', session.user.id).eq('status', 'accepted'),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', session.user.id).eq('status', 'accepted'),
    ]).then(([{ data }, { count: followers }, { count: following }]) => {
      setProfile(data)
      setFollowerCount(followers ?? 0)
      setFollowingCount(following ?? 0)
    })
  }, [session])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploading(true)

    const path = `${session.user.id}/avatar`
    const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (uploadErr) { setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    const avatarUrl = `${publicUrl}?t=${Date.now()}`

    await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', session.user.id)
    setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : prev)
    setUploading(false)
  }

  if (!profile) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#FFFBF7]">
        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Layout title="Perfil" back="/" session={session}>
      <div className="flex flex-col items-center py-8">
        <button
          className="relative mb-4"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <Avatar profile={profile} size={96} rounded="rounded-3xl" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center border-2 border-[#FFFBF7]">
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="14" height="14" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900">@{profile.username}</h2>
        <p className="text-gray-400 text-sm mt-1">{session.user.email}</p>

        <div className="flex gap-10 mt-5">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{followerCount}</p>
            <p className="text-xs text-gray-400 font-medium">seguidores</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{followingCount}</p>
            <p className="text-xs text-gray-400 font-medium">seguindo</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
        <p className="text-sm font-bold text-gray-700 mb-1">Compartilhar do YouTube</p>
        <p className="text-sm text-gray-500 leading-relaxed">
          No app do YouTube, toque em <strong>Compartilhar → Ludami</strong>. Se não aparecer, cole o link manualmente em qualquer espaço.
        </p>
      </div>

      <button
        onClick={() => supabase.auth.signOut()}
        className="w-full py-4 rounded-2xl border-2 border-red-100 text-red-400 font-bold"
      >
        Sair da conta
      </button>
    </Layout>
  )
}
