import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) setError('E-mail ou senha incorretos.')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-[#FFFBF7]">
      <div className="flex flex-col items-center justify-center px-8 py-16 bg-gradient-to-br from-[#6B21E8] to-[#9B5DE5]" style={{ minHeight: '42dvh' }}>
        <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mb-5">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M6 4H26C27.1 4 28 4.9 28 6V28L16 22L4 28V6C4 4.9 4.9 4 6 4Z" fill="white" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">LUDAMI</h1>
        <p className="text-white/75 text-center text-base leading-snug max-w-xs">
          Pare de perder o que importa.<br />
          <span className="text-white/60 text-sm">Organize, cuide e evolua todo dia.</span>
        </p>
      </div>

      <div className="flex-1 px-6 py-8 max-w-sm mx-auto w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Entrar</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-[#9B5DE5] focus:outline-none transition-colors"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-[#9B5DE5] focus:outline-none transition-colors"
              required
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-[#7C3AED] text-white font-bold text-base disabled:opacity-60 mt-2"
            style={{ boxShadow: '0 4px 20px #7C3AED55' }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="text-center text-gray-400 text-sm mt-6">
          Não tem conta?{' '}
          <Link to="/register" className="text-[#7C3AED] font-semibold">Criar agora</Link>
        </p>
      </div>
    </div>
  )
}
