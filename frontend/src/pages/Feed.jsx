import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getReleases } from '../services/releases'
import { logout, isAuthenticated } from '../services/auth'

const FILTERS = [
  { key: 'all', label: 'Tudo' },
  { key: 'game', label: 'Jogos' },
  { key: 'movie', label: 'Filmes' },
  { key: 'album', label: 'Músicas' },
]

const CATEGORY_COLOR = {
  game: '#4f46e5',
  movie: '#1877F2',
  album: '#E91E8C',
}

const BADGE_LABEL = (release) => {
  if (release.category === 'game') return 'Jogo'
  if (release.category === 'movie') return 'Filme'
  return release.record_type === 'single' ? 'Música' : 'Álbum'
}

const PLACEHOLDER_ICON = { game: '🎮', movie: '🎬', album: '🎵' }

export default function Feed() {
  const navigate = useNavigate()
  const [releases, setReleases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const heroRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated()) { navigate('/login'); return }
    fetchReleases()
  }, [])

  const fetchReleases = async () => {
    setLoading(true)
    try {
      const data = await getReleases()
      const seen = new Set()
      const unique = data.releases.filter(r => {
        const key = `${r.external_id}-${r.category}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      setReleases(unique)
    } catch {
      setError('Erro ao carregar lançamentos')
    } finally {
      setLoading(false)
    }
  }

  const filtered = filter === 'all' ? releases : releases.filter(r => r.category === filter)
  const hero = releases[0]
  const rest = filtered.slice(filter === 'all' ? 1 : 0)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080810 !important; overflow-x: hidden; }

        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }

        .shifto-root {
          min-height: 100vh;
          background: #080810;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
        }

        /* ── Navbar ── */
        .shifto-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          height: 52px;
          background: rgba(8,8,16,0.95);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .shifto-logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px;
          letter-spacing: 4px;
          color: #4f46e5;
          flex-shrink: 0;
        }
        .shifto-nav-right {
          display: flex;
          gap: 6px;
          align-items: center;
          flex-shrink: 0;
        }
        .shifto-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 20px;
          padding: 4px 10px;
          color: rgba(255,255,255,0.7);
          font-size: 12px;
          cursor: pointer;
          white-space: nowrap;
          font-family: 'DM Sans', sans-serif;
        }
        .shifto-btn-danger {
          background: transparent;
          border: 1px solid rgba(220,50,50,0.4);
          border-radius: 20px;
          padding: 4px 10px;
          color: rgba(220,80,80,0.9);
          font-size: 12px;
          cursor: pointer;
          white-space: nowrap;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Hero ── */
        .shifto-hero {
          position: relative;
          width: 100%;
          height: 200px;
          background-size: cover;
          background-position: center top;
          background-repeat: no-repeat;
        }
        .shifto-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, #080810 0%, rgba(8,8,16,0.5) 60%, transparent 100%);
        }
        .shifto-hero-content {
          position: absolute;
          bottom: 12px;
          left: 16px;
          right: 16px;
          animation: fadeUp 0.5s ease;
        }
        .shifto-hero-badge {
          display: inline-block;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 20px;
          color: #fff;
          margin-bottom: 4px;
        }
        .shifto-hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px;
          letter-spacing: 1px;
          line-height: 1.1;
          text-shadow: 0 2px 12px rgba(0,0,0,0.9);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .shifto-hero-date {
          font-size: 11px;
          color: rgba(255,255,255,0.5);
          margin-top: 2px;
        }

        /* ── Body ── */
        .shifto-body {
          padding: 12px 16px 80px;
        }

        /* ── Filtros ── */
        .shifto-filters {
          display: flex;
          gap: 6px;
          margin-bottom: 12px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .shifto-filters::-webkit-scrollbar { display: none; }
        .shifto-pill {
          flex-shrink: 0;
          padding: 5px 14px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: rgba(255,255,255,0.5);
          font-size: 12px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }
        .shifto-pill-active {
          background: #4f46e5;
          border-color: #4f46e5;
          color: #fff;
          font-weight: 600;
        }

        /* ── Grid ── */
        .shifto-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .shifto-card { animation: fadeUp 0.4s ease both; }
        .shifto-card-img {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          aspect-ratio: 1/1;
          background: #1a1a1a;
          margin-bottom: 6px;
        }
        .shifto-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .shifto-card-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
        }
        .shifto-card-badge {
          position: absolute;
          bottom: 5px;
          left: 5px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          padding: 2px 6px;
          border-radius: 20px;
          color: #fff;
        }
        .shifto-card-title {
          font-size: 12px;
          font-weight: 500;
          color: #fff;
          line-height: 1.3;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          margin-bottom: 2px;
        }
        .shifto-card-date {
          font-size: 10px;
          color: rgba(255,255,255,0.35);
        }

        /* ── Estados ── */
        .shifto-state {
          text-align: center;
          padding: 3rem 0;
        }
        .shifto-state p {
          color: rgba(255,255,255,0.4);
          font-size: 13px;
          margin-bottom: 1rem;
        }
        .shifto-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(255,255,255,0.1);
          border-top: 2px solid #4f46e5;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 1rem;
        }
        .shifto-cta {
          background: #4f46e5;
          border: none;
          border-radius: 20px;
          padding: 10px 24px;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Desktop ── */
        @media (min-width: 768px) {
          .shifto-nav { padding: 0 24px; height: 60px; }
          .shifto-logo { font-size: 22px; }
          .shifto-btn, .shifto-btn-danger { font-size: 13px; padding: 5px 14px; }
          .shifto-hero { height: 400px; }
          .shifto-hero-title { font-size: 36px; white-space: normal; }
          .shifto-hero-badge { font-size: 10px; padding: 3px 10px; margin-bottom: 6px; }
          .shifto-hero-date { font-size: 13px; }
          .shifto-hero-content { bottom: 24px; left: 24px; right: 24px; }
          .shifto-body { padding: 20px 24px 60px; max-width: 1200px; margin: 0 auto; }
          .shifto-filters { gap: 8px; margin-bottom: 20px; }
          .shifto-pill { font-size: 13px; padding: 6px 18px; }
          .shifto-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
          .shifto-card-title { font-size: 13px; }
          .shifto-card-date { font-size: 11px; }
          .shifto-card-badge { font-size: 10px; }
        }

        @media (min-width: 1024px) {
          .shifto-hero { height: 480px; }
          .shifto-hero-title { font-size: 42px; }
        }
      `}</style>

      <div className="shifto-root">
        {/* Navbar */}
        <nav className="shifto-nav">
          <span className="shifto-logo">SHIFTO</span>
          <div className="shifto-nav-right">
            <button className="shifto-btn" onClick={fetchReleases} disabled={loading}>
              {loading ? '⏳' : '🔄'}
            </button>
            <button className="shifto-btn" onClick={() => navigate('/preferences')}>Preferências</button>
            <button className="shifto-btn-danger" onClick={() => { logout(); navigate('/login') }}>Sair</button>
          </div>
        </nav>

        {/* Hero */}
        {!loading && hero && filter === 'all' && (
          <div
            className="shifto-hero"
            style={{ backgroundImage: `url(${hero.cover_url})` }}
            ref={heroRef}
          >
            <div className="shifto-hero-overlay" />
            <div className="shifto-hero-content">
              <span className="shifto-hero-badge" style={{ background: CATEGORY_COLOR[hero.category] }}>
                {BADGE_LABEL(hero)}
              </span>
              <h2 className="shifto-hero-title">{hero.title}</h2>
              {hero.release_date && <p className="shifto-hero-date">📅 {hero.release_date}</p>}
            </div>
          </div>
        )}

        <div className="shifto-body">
          {/* Filtros */}
          <div className="shifto-filters">
            {FILTERS.map(f => (
              <button
                key={f.key}
                className={`shifto-pill${filter === f.key ? ' shifto-pill-active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Estados */}
          {loading && (
            <div className="shifto-state">
              <div className="shifto-spinner" />
              <p>Carregando lançamentos...</p>
            </div>
          )}
          {error && <div className="shifto-state"><p style={{ color: '#e24b4a' }}>{error}</p></div>}
          {!loading && filtered.length === 0 && (
            <div className="shifto-state">
              <p>Nenhum lançamento encontrado.</p>
              <button className="shifto-cta" onClick={() => navigate('/preferences')}>
                Configurar preferências
              </button>
            </div>
          )}

          {/* Grid */}
          <div className="shifto-grid">
            {rest.map((r, i) => (
              <div key={`${r.external_id}-${i}`} className="shifto-card">
                <div className="shifto-card-img">
                  {r.cover_url
                    ? <img src={r.cover_url} alt={r.title} loading="lazy" />
                    : <div className="shifto-card-fallback">{PLACEHOLDER_ICON[r.category]}</div>
                  }
                  <span className="shifto-card-badge" style={{ background: CATEGORY_COLOR[r.category] }}>
                    {BADGE_LABEL(r)}
                  </span>
                </div>
                <p className="shifto-card-title">{r.title}</p>
                {r.release_date && <p className="shifto-card-date">{r.release_date}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}