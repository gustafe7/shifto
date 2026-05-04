import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../services/auth'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/feed')
    } catch (err) {
      setError(err.response?.data?.detail || 'Credenciais inválidas')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (name) => ({
    ...S.input,
    borderColor: focused === name ? '#4f46e5' : 'rgba(255,255,255,0.08)',
    boxShadow: focused === name ? '0 0 0 3px rgba(79,70,229,0.15)' : 'none',
  })

  return (
    <div style={S.root}>
      <div style={S.bgGrid} />
      <div style={S.bgGlow} />

      <div style={S.wrapper}>
        {/* branding */}
        <div style={S.brand}>
          <h1 style={S.brandLogo}>SHIFTO</h1>
          <p style={S.brandTagline}>Seus lançamentos.<br />Jogos, filmes e músicas<br />em um só lugar.</p>
          <div style={S.brandTags}>
            {['🎮 Jogos', '🎬 Filmes', '🎵 Músicas'].map(t => (
              <span key={t} style={S.tag}>{t}</span>
            ))}
          </div>
        </div>

        {/* form */}
        <div style={S.card}>
          <h2 style={S.cardTitle}>Entrar</h2>
          <p style={S.cardSub}>Bem-vindo(a)!</p>

          <form onSubmit={handleSubmit} style={S.form}>
            <div style={S.field}>
              <label style={S.label}>Email</label>
              <div style={{ position: 'relative' }}>
                <span style={S.fieldIcon}>✉</span>
                <input
                  style={{ ...inputStyle('email'), paddingLeft: '40px' }}
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  required
                />
              </div>
            </div>

            <div style={S.field}>
              <label style={S.label}>Senha</label>
              <div style={{ position: 'relative' }}>
                <span style={S.fieldIcon}>🔒</span>
                <input
                  style={{ ...inputStyle('password'), paddingLeft: '40px' }}
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  required
                />
              </div>
            </div>

            {error && (
              <div style={S.errorBox}>
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span style={S.btnLoading}>
                  <span style={S.spinnerSmall} /> Entrando...
                </span>
              ) : 'Entrar'}
            </button>
          </form>

          <div style={S.divider}>
            <span style={S.dividerLine} />
            <span style={S.dividerText}>ou</span>
            <span style={S.dividerLine} />
          </div>

          <p style={S.footer}>
            Não tem conta?{' '}
            <Link to="/register" style={S.link}>Criar conta grátis →</Link>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080810 !important; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input { outline: none; }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}

const S = {
  root: {
    minHeight: '100vh',
    background: '#080810',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'DM Sans', sans-serif",
  },
  bgGrid: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(79,70,229,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(79,70,229,0.04) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
  },
  bgGlow: {
    position: 'fixed',
    top: '-20%',
    left: '-10%',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '4rem',
    width: '100%',
    maxWidth: '860px',
    position: 'relative',
    zIndex: 1,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  brand: {
    flex: '1',
    minWidth: '260px',
    maxWidth: '340px',
  },
  brandLogo: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '64px',
    letterSpacing: '8px',
    color: '#4f46e5',
    lineHeight: 1,
    marginBottom: '1.25rem',
  },
  brandTagline: {
    fontSize: '22px',
    fontWeight: '300',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 1.5,
    marginBottom: '1.5rem',
  },
  brandTags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  tag: {
    padding: '5px 14px',
    borderRadius: '20px',
    border: '1px solid rgba(79,70,229,0.3)',
    color: 'rgba(79,70,229,0.9)',
    fontSize: '13px',
    background: 'rgba(79,70,229,0.08)',
  },
  card: {
    flex: '1',
    minWidth: '300px',
    maxWidth: '380px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
    padding: '2.5rem',
    backdropFilter: 'blur(20px)',
  },
  cardTitle: {
    fontSize: '26px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '4px',
  },
  cardSub: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  fieldIcon: {
    position: 'absolute',
    left: '13px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '13px',
    pointerEvents: 'none',
    opacity: 0.4,
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '13px 14px',
    color: '#fff',
    fontSize: '14px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: "'DM Sans', sans-serif",
  },
  btn: {
    background: '#4f46e5',
    border: 'none',
    borderRadius: '12px',
    padding: '14px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '4px',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'opacity 0.2s',
    letterSpacing: '0.3px',
  },
  btnLoading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinnerSmall: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.2)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  errorBox: {
    background: 'rgba(255,77,77,0.1)',
    border: '1px solid rgba(255,77,77,0.2)',
    borderRadius: '10px',
    padding: '10px 14px',
    color: '#ff6b6b',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '1.5rem 0 1rem',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255,255,255,0.07)',
  },
  dividerText: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.3)',
  },
  footer: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
  link: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '500',
  },
}