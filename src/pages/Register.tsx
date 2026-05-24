import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { randomAvatarColor } from '../lib/colors'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (username.trim().length < 3) { setError('Username deve ter ao menos 3 caracteres.'); return }
    setLoading(true)
    setError('')

    const { data, error: signUpErr } = await supabase.auth.signUp({ email, password })
    if (signUpErr) { setLoading(false); setError(signUpErr.message); return }
    if (!data.user) { setLoading(false); setError('Conta não pôde ser criada. Verifique seu e-mail ou tente outro.'); return }

    const { error: profileErr } = await supabase.from('profiles').insert({
      id: data.user.id,
      username: username.trim().toLowerCase(),
      avatar_color: randomAvatarColor(),
    })

    setLoading(false)
    if (profileErr) setError(profileErr.message)
  }

  return (
    <div className="min-h-dvh bg-[#FFFBF7] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-[#06D6A0] flex items-center justify-center mx-auto mb-4" style={{ boxShadow: '0 8px 32px #06D6A066' }}>
            <svg width="36" height="36" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Criar conta</h1>
          <p className="text-gray-500 mt-1">Bem-vindo ao Ludami!</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="seunome"
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#06D6A0] focus:outline-none transition-colors"
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-[#06D6A0] focus:outline-none transition-colors"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-[#06D6A0] focus:outline-none transition-colors"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-[#06D6A0] text-white font-extrabold text-lg disabled:opacity-60 mt-2"
            style={{ boxShadow: '0 4px 20px #06D6A066' }}
          >
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-[#9B5DE5] font-semibold">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
