import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile as ProfileType } from '../lib/types'
import Layout from '../components/Layout'

interface Props { session: Session }

export default function Profile({ session }: Props) {
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => {
      setProfile(data)
      setLoading(false)
    })
  }, [session])

  async function signOut() {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#FFFBF7]">
        <div className="w-10 h-10 border-4 border-[#9B5DE5] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Layout title="Perfil" back="/">
      <div className="flex flex-col items-center py-8">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-3xl font-extrabold mb-4"
          style={{ backgroundColor: profile?.avatar_color ?? '#9B5DE5', boxShadow: `0 8px 32px ${profile?.avatar_color ?? '#9B5DE5'}66` }}
        >
          {(profile?.username ?? '?')[0].toUpperCase()}
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900">@{profile?.username ?? 'usuário'}</h2>
        <p className="text-gray-400 text-sm mt-1">{session.user.email}</p>
        <p className="text-gray-400 text-xs mt-1">Membro desde {new Date(profile?.created_at ?? '').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="mt-4 space-y-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500 font-semibold mb-1">Para compartilhar do YouTube</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            No app do YouTube, toque em <strong>Compartilhar → LinkSpot</strong>. Se o app não aparecer, abra o link aqui e toque em <strong>Adicionar link</strong>.
          </p>
        </div>
      </div>

      <button
        onClick={signOut}
        className="w-full mt-8 py-4 rounded-2xl border-2 border-red-200 text-red-500 font-bold text-lg transition-colors hover:bg-red-50"
      >
        Sair da conta
      </button>
    </Layout>
  )
}
