import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Lockup from '../components/Lockup'

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
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col items-center justify-center px-8 pt-16 pb-8" style={{ minHeight: '40dvh' }}>
        <Lockup orientation="v" markSize={88} wordSize={48} />
        <p
          className="mt-7 text-center max-w-xs"
          style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--fg-muted)' }}
        >
          Sua curadoria de links em mundos compartilhados.
          <br />
          <span style={{ color: 'var(--fg-faint)' }}>Salve, organize, descubra.</span>
        </p>
      </div>

      <div className="flex-1 px-6 py-6 max-w-sm mx-auto w-full">
        <p className="font-mono mb-4" style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-faint)' }}>
          Entrar
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-mono block mb-1.5" style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-3 transition-colors"
              style={{
                background: 'transparent',
                color: 'var(--fg)',
                borderBottom: '1px solid var(--border-2)',
                fontSize: 16,
                outline: 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderBottomColor = 'var(--accent)')}
              onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-2)')}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="font-mono block mb-1.5" style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-3 transition-colors"
              style={{
                background: 'transparent',
                color: 'var(--fg)',
                borderBottom: '1px solid var(--border-2)',
                fontSize: 16,
                outline: 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderBottomColor = 'var(--accent)')}
              onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-2)')}
              required
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p style={{ fontSize: 13, color: '#c25040', textAlign: 'center' }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 font-mono mt-4 transition-opacity active:opacity-80"
            style={{
              background: 'var(--fg)',
              color: 'var(--bg)',
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              fontWeight: 600,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Entrando' : 'Entrar'}
          </button>
        </form>

        <p className="text-center mt-7" style={{ fontSize: 13, color: 'var(--fg-faint)' }}>
          Não tem conta?{' '}
          <Link to="/register" className="font-display" style={{ color: 'var(--fg)', fontSize: 16 }}>
            criar agora
          </Link>
        </p>
      </div>
    </div>
  )
}
