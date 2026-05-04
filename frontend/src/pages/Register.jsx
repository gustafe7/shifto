import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register, login } from '../services/auth'

export default function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(name, email, password)
      // após registrar, já faz login automático
      await login(email, password)
      navigate('/preferences') // novo usuário vai direto para configurar preferências
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.logo}>SHIFTO</h1>
        <p style={styles.subtitle}>Crie sua conta e personalize seu feed</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p style={styles.link}>
          Já tem conta?{' '}
          <Link to="/login" style={styles.linkAnchor}>Entrar</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem'
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    background: '#111118',
    border: '1px solid #1e1e2e',
    borderRadius: '16px',
    padding: '2rem'
  },
  logo: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1D9E75',
    textAlign: 'center',
    marginBottom: '8px',
    letterSpacing: '4px'
  },
  subtitle: {
    fontSize: '13px',
    color: '#888',
    textAlign: 'center',
    marginBottom: '2rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  input: {
    background: '#1a1a24',
    border: '1px solid #1e1e2e',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none'
  },
  button: {
    background: '#1D9E75',
    border: 'none',
    borderRadius: '8px',
    padding: '13px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px'
  },
  error: {
    color: '#e24b4a',
    fontSize: '13px',
    textAlign: 'center'
  },
  link: {
    fontSize: '13px',
    color: '#888',
    textAlign: 'center',
    marginTop: '1.5rem'
  },
  linkAnchor: {
    color: '#1D9E75',
    textDecoration: 'none'
  }
}