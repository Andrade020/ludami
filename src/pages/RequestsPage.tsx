import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Follow } from '../lib/types'
import Layout from '../components/Layout'

interface Props { session: Session }

export default function RequestsPage({ session }: Props) {
  const [requests, setRequests] = useState<Follow[]>([])
  const [loading, setLoading] = useState(true)

  async function loadRequests() {
    const { data } = await supabase
      .from('follows')
      .select('*, follower:profiles!follows_follower_id_fkey(*)')
      .eq('following_id', session.user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    setRequests((data ?? []) as Follow[])
    setLoading(false)
  }

  useEffect(() => { loadRequests() }, [])

  async function accept(followerId: string) {
    await supabase
      .from('follows')
      .update({ status: 'accepted' })
      .eq('follower_id', followerId)
      .eq('following_id', session.user.id)
    setRequests(prev => prev.filter(r => r.follower_id !== followerId))
  }

  async function reject(followerId: string) {
    await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', session.user.id)
    setRequests(prev => prev.filter(r => r.follower_id !== followerId))
  }

  return (
    <Layout title="Pedidos de seguir" session={session}>
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-[#9B5DE5] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-3xl bg-[#9B5DE5]/10 flex items-center justify-center mb-4">
            <svg width="36" height="36" fill="none" stroke="#9B5DE5" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p className="text-gray-500 font-semibold">Nenhum pedido pendente</p>
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
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0"
                    style={{ backgroundColor: follower.avatar_color }}
                  >
                    {follower.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">@{follower.username}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(req.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => accept(req.follower_id)}
                    className="flex-1 py-2.5 rounded-xl bg-[#06D6A0] text-white font-bold text-sm"
                    style={{ boxShadow: '0 2px 8px #06D6A044' }}
                  >
                    Aceitar
                  </button>
                  <button
                    onClick={() => reject(req.follower_id)}
                    className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm"
                  >
                    Recusar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}
