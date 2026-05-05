import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register, login } from '../services/auth'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // passa a preferência de notificação para o backend
      await register(name, email, password, emailNotifications)
      await login(email, password)
      navigate('/preferences')
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao criar conta')
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <i className="fa-solid fa-dragon" style={{ fontSize: '70px', color: '#4f46e5', marginBottom: '4px' }} />
            <h1 style={{ ...S.brandLogo, marginBottom: 0 }}>SHIFTO</h1>
          </div>
          <p style={S.brandTagline}>Crie sua conta e personalize seu feed de lançamentos.</p>
          <div style={S.brandTags}>
            {['🎮 Jogos', '🎬 Filmes', '🎵 Músicas'].map(t => (
              <span key={t} style={S.tag}>{t}</span>
            ))}
          </div>
        </div>

        {/* form */}
        <div style={S.card}>
          <h2 style={S.cardTitle}>Criar conta</h2>
          <p style={S.cardSub}>Rápido e gratuito</p>

          <form onSubmit={handleSubmit} style={S.form}>
            <div style={S.field}>
              <label style={S.label}>Nome</label>
              <div style={{ position: 'relative' }}>
                <span style={S.fieldIcon}>👤</span>
                <input
                  style={{ ...inputStyle('name'), paddingLeft: '40px' }}
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  required
                />
              </div>
            </div>

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

            {/* checkbox de notificações */}
            <div style={S.checkboxRow} onClick={() => setEmailNotifications(!emailNotifications)}>
              <div style={{
                ...S.checkbox,
                background: emailNotifications ? '#4f46e5' : 'transparent',
                borderColor: emailNotifications ? '#4f46e5' : 'rgba(255,255,255,0.2)',
              }}>
                {emailNotifications && <span style={S.checkmark}>✓</span>}
              </div>
              <div>
                <p style={S.checkboxLabel}>Receber notificações por email</p>
                <p style={S.checkboxSub}>Avisos de novos lançamentos todo dia às 8h</p>
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
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div style={S.divider}>
            <span style={S.dividerLine} />
            <span style={S.dividerText}>ou</span>
            <span style={S.dividerLine} />
          </div>

          <p style={S.footer}>
            Já tem conta?{' '}
            <Link to="/login" style={S.link}>Entrar →</Link>
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
    right: '-10%',
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
    fontSize: '20px',
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
  checkboxRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    cursor: 'pointer',
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.02)',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    borderRadius: '6px',
    border: '1.5px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '1px',
    transition: 'all 0.15s',
  },
  checkmark: {
    fontSize: '12px',
    color: '#fff',
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#fff',
    marginBottom: '2px',
  },
  checkboxSub: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.4)',
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