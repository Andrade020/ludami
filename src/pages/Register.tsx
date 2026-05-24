import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { randomAvatarColor } from '../lib/colors'
import Lockup from '../components/Lockup'

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--fg-muted)',
  fontWeight: 500,
}
const inputStyle: React.CSSProperties = {
  background: 'transparent',
  color: 'var(--fg)',
  borderBottom: '1px solid var(--border-2)',
  fontSize: 16,
  outline: 'none',
  width: '100%',
  padding: '10px 4px',
}

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
    if (!data.user) { setLoading(false); setError('Conta não pôde ser criada. Tente outro e-mail.'); return }

    const { error: profileErr } = await supabase.from('profiles').insert({
      id: data.user.id,
      username: username.trim().toLowerCase(),
      avatar_color: randomAvatarColor(),
      avatar_url: null,
    })
    setLoading(false)
    if (profileErr) setError(profileErr.message)
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col items-center justify-center px-8 pt-16 pb-8" style={{ minHeight: '36dvh' }}>
        <Lockup orientation="v" markSize={72} wordSize={40} />
        <p className="mt-6 text-center max-w-xs" style={{ fontSize: 13.5, color: 'var(--fg-muted)', lineHeight: 1.5 }}>
          Comece a colecionar o que importa.
        </p>
      </div>

      <div className="flex-1 px-6 py-6 max-w-sm mx-auto w-full">
        <p className="font-mono mb-5" style={labelStyle}>Criar conta</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="font-mono block mb-1" style={labelStyle}>Username</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="seunome"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderBottomColor = 'var(--accent)')}
              onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-2)')}
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="font-mono block mb-1" style={labelStyle}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderBottomColor = 'var(--accent)')}
              onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-2)')}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="font-mono block mb-1" style={labelStyle}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderBottomColor = 'var(--accent)')}
              onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-2)')}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          {error && <p style={{ fontSize: 13, color: '#c25040', textAlign: 'center' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 font-mono mt-3 transition-opacity active:opacity-80"
            style={{ background: 'var(--fg)', color: 'var(--bg)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Criando' : 'Criar conta'}
          </button>
        </form>
        <p className="text-center mt-7" style={{ fontSize: 13, color: 'var(--fg-faint)' }}>
          Já tem conta?{' '}
          <Link to="/login" className="font-display" style={{ color: 'var(--fg)', fontSize: 16 }}>
            entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
