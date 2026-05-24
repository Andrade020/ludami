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
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-8 h-8 rounded-full animate-spin" style={{ borderWidth: 2, borderStyle: 'solid', borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  const tag: React.CSSProperties = { fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-faint)', fontWeight: 500 }

  return (
    <Layout title="perfil" back="/" session={session}>
      <div className="flex flex-col items-center pt-6 pb-8">
        <button
          className="relative mb-5"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          aria-label="Trocar avatar"
        >
          <Avatar profile={profile} size={112} />
          <div
            className="absolute flex items-center justify-center"
            style={{
              bottom: -4,
              right: -4,
              width: 30,
              height: 30,
              background: 'var(--fg)',
              color: 'var(--bg)',
            }}
          >
            {uploading ? (
              <div className="w-3 h-3 rounded-full animate-spin" style={{ borderWidth: 1.5, borderStyle: 'solid', borderColor: 'currentColor', borderTopColor: 'transparent' }} />
            ) : (
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
              </svg>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </button>

        <h2 className="font-display" style={{ fontSize: 36, lineHeight: 1, color: 'var(--fg)' }}>
          @{profile.username}
        </h2>
        <p className="font-mono mt-2" style={tag}>{session.user.email}</p>

        <div className="flex gap-10 mt-7">
          <div className="text-center">
            <p className="font-display" style={{ fontSize: 30, lineHeight: 1, color: 'var(--fg)' }}>{followerCount}</p>
            <p className="font-mono mt-1.5" style={tag}>seguidores</p>
          </div>
          <div style={{ width: 1, background: 'var(--border)' }} />
          <div className="text-center">
            <p className="font-display" style={{ fontSize: 30, lineHeight: 1, color: 'var(--fg)' }}>{followingCount}</p>
            <p className="font-mono mt-1.5" style={tag}>seguindo</p>
          </div>
        </div>
      </div>

      <div className="mt-2 mb-6" style={{ background: 'var(--card)', padding: 18 }}>
        <p className="font-mono" style={tag}>Compartilhar links</p>
        <p className="mt-2" style={{ fontSize: 13.5, color: 'var(--fg-muted)', lineHeight: 1.55 }}>
          Em qualquer app, toque em <strong style={{ color: 'var(--fg)' }}>Compartilhar → Ludami</strong>. Ou cole qualquer link diretamente dentro de um mundo.
        </p>
      </div>

      <button
        onClick={() => supabase.auth.signOut()}
        className="w-full py-4 font-mono transition-opacity active:opacity-70"
        style={{ background: 'transparent', color: 'var(--fg-muted)', border: '1px solid var(--border-2)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 500 }}
      >
        sair da conta
      </button>
    </Layout>
  )
}
