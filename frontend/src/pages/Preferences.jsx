import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPreferences, addPreference, deletePreference, updateNotifications, getSettings } from '../services/preferences'
import { isAuthenticated } from '../services/auth'

const OPTIONS = {
  game: ['Ação', 'RPG', 'Aventura', 'Estratégia', 'Esportes', 'Terror', 'Indie'],
  movie: ['Ação', 'Comédia', 'Drama', 'Terror', 'Ficção Científica', 'Suspense', 'Animação'],
  album: ['Pop', 'Rock', 'Hip-Hop', 'Eletrônica', 'Jazz', 'Clássico', 'R&B', 'Funk', 'Soul', 'Country', 'Reggae', 'Metal', 'Indie', 'Folk']
}

const CATEGORY_LABELS = {
  game: '🎮 Jogos',
  movie: '🎬 Filmes',
  album: '🎵 Músicas'
}

export default function Preferences() {
  const navigate = useNavigate()
  const [preferences, setPreferences] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) { navigate('/login'); return }
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      // busca preferências e configurações em paralelo
      const [data, settings] = await Promise.all([
        getPreferences(),
        getSettings()
      ])
      setPreferences(data)
      // carrega o valor real salvo no banco
      setEmailNotifications(settings.email_notifications)
    } finally {
      setLoading(false)
    }
  }

  const isSelected = (category, value) =>
    preferences.some(p => p.category === category && p.value.toLowerCase() === value.toLowerCase())

  const handleToggle = async (category, value) => {
    setSaving(true)
    try {
      if (isSelected(category, value)) {
        const pref = preferences.find(
          p => p.category === category && p.value.toLowerCase() === value.toLowerCase()
        )
        await deletePreference(pref.id)
        setPreferences(prev => prev.filter(p => p.id !== pref.id))
      } else {
        await addPreference(category, value)
        await fetchPreferences()
      }
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationToggle = async () => {
    const newValue = !emailNotifications
    // atualiza o estado local imediatamente para feedback visual
    setEmailNotifications(newValue)
    try {
      // persiste no banco
      await updateNotifications(newValue)
    } catch {
      // reverte se der erro na requisição
      setEmailNotifications(!newValue)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080810 !important; }

        .pref-root {
          min-height: 100vh;
          background: #080810;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
        }

        .pref-nav {
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

        .pref-back {
          background: transparent;
          border: none;
          color: #4f46e5;
          font-size: 14px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          padding: 4px 0;
        }

        .pref-nav-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px;
          letter-spacing: 3px;
          color: #fff;
        }

        .pref-body {
          padding: 20px 16px 80px;
          max-width: 600px;
          margin: 0 auto;
        }

        .pref-desc {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .pref-section {
          margin-bottom: 28px;
        }

        .pref-section-title {
          font-size: 15px;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          margin-bottom: 12px;
        }

        .pref-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .pref-chip {
          padding: 7px 16px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.5);
          font-size: 13px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }

        .pref-chip:hover {
          border-color: rgba(79,70,229,0.5);
          color: rgba(255,255,255,0.8);
        }

        .pref-chip-active {
          background: #4f46e5;
          border-color: #4f46e5;
          color: #fff;
          font-weight: 500;
        }

        .pref-chip:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .pref-notification {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          margin-bottom: 28px;
          cursor: pointer;
        }

        .pref-notification-text p {
          font-size: 14px;
          font-weight: 500;
          color: #fff;
          margin-bottom: 2px;
        }

        .pref-notification-text span {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
        }

        .pref-toggle {
          width: 44px;
          height: 24px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          position: relative;
          transition: background 0.2s;
          flex-shrink: 0;
        }

        .pref-toggle-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          position: absolute;
          top: 3px;
          transition: left 0.2s;
        }

        .pref-cta {
          width: 100%;
          background: #4f46e5;
          border: none;
          border-radius: 12px;
          padding: 14px;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 8px;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.3px;
        }

        .pref-loading {
          text-align: center;
          color: rgba(255,255,255,0.4);
          font-size: 13px;
          padding: 2rem 0;
        }

        @media (min-width: 768px) {
          .pref-nav { padding: 0 24px; height: 60px; }
          .pref-body { padding: 28px 24px 80px; }
          .pref-desc { font-size: 14px; }
          .pref-chip { font-size: 13px; }
        }
      `}</style>

      <div className="pref-root">
        <nav className="pref-nav">
          <button className="pref-back" onClick={() => navigate('/feed')}>← Feed</button>
          <span className="pref-nav-title">Preferências</span>
          <div style={{ width: '60px' }} />
        </nav>

        <div className="pref-body">
          <p className="pref-desc">
            Selecione o que você gosta para personalizar seu feed de lançamentos.
          </p>

          {loading && <p className="pref-loading">Carregando...</p>}

          {/* toggle de notificações por email */}
          <div className="pref-notification" onClick={handleNotificationToggle}>
            <div className="pref-notification-text">
              <p>🔔 Notificações por email</p>
              <span>Receba novidades todo dia às 8h</span>
            </div>
            <button
              className="pref-toggle"
              style={{ background: emailNotifications ? '#4f46e5' : 'rgba(255,255,255,0.1)' }}
            >
              <div
                className="pref-toggle-thumb"
                style={{ left: emailNotifications ? '23px' : '3px' }}
              />
            </button>
          </div>

          {Object.entries(OPTIONS).map(([category, options]) => (
            <div key={category} className="pref-section">
              <h2 className="pref-section-title">{CATEGORY_LABELS[category]}</h2>
              <div className="pref-chips">
                {options.map(option => (
                  <button
                    key={option}
                    className={`pref-chip${isSelected(category, option) ? ' pref-chip-active' : ''}`}
                    onClick={() => handleToggle(category, option)}
                    disabled={saving}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button className="pref-cta" onClick={() => navigate('/feed')}>
            Ver meu feed →
          </button>
        </div>
      </div>
    </>
  )
}