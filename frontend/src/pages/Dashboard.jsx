import React from 'react'

export default function Dashboard({ navigate }) {
  const features = [
    {
      id: 'fake-profile',
      icon: '👤',
      title: 'Fake Profile Detection',
      desc: 'Analyze Instagram profiles using follower ratios, bio analysis, and behavioral signals to detect fake or bot accounts.',
      badge: 'ML Powered',
    },
    {
      id: 'spam',
      icon: '📧',
      title: 'Spam Message Detection',
      desc: 'Classify text messages as spam or legitimate using keyword analysis and pattern matching trained on real-world data.',
      badge: 'NLP',
    },
    {
      id: 'phishing',
      icon: '🔗',
      title: 'Phishing Website Detection',
      desc: 'Evaluate URLs for phishing indicators like suspicious domains, IP-based links, brand impersonation, and redirect tricks.',
      badge: 'URL Analysis',
    },
    {
      id: 'password',
      icon: '🔐',
      title: 'Password Generator',
      desc: 'Generate cryptographically secure passwords with full control over length, symbols, numbers, and character sets.',
      badge: 'Security Tool',
    },
  ]

  return (
    <>
      {/* Hero */}
      <div className="hero">
        <div className="hero-badge">
          <span>⚡</span> AI-Powered Cybersecurity Toolkit
        </div>
        <h1>Detect. Protect. Secure.</h1>
        <p className="hero-subtitle">
          A suite of intelligent tools for identifying online threats — fake social profiles,
          phishing URLs, spam messages, and weak credentials — all in one place.
        </p>
      </div>

      {/* Feature grid */}
      <p className="section-heading">Available Tools</p>
      <div className="feature-grid">
        {features.map(f => (
          <div key={f.id} className="feature-card" onClick={() => navigate(f.id)}>
            <div className="card-icon">{f.icon}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span className="card-title">{f.title}</span>
                <span className="chip">{f.badge}</span>
              </div>
              <p className="card-desc">{f.desc}</p>
            </div>
            <button className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}>
              Open Tool →
            </button>
          </div>
        ))}
      </div>

      {/* Info strip */}
      <div className="card mt-24" style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        {[
          { label: 'Tools Available', value: '4' },
          { label: 'Models', value: 'Heuristic + Rule-based' },
          { label: 'API Endpoints', value: '4 REST' },
          { label: 'Status', value: '🟢 Live' },
        ].map(stat => (
          <div key={stat.label} style={{ flex: 1, minWidth: 120 }}>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>{stat.value}</div>
          </div>
        ))}
      </div>
    </>
  )
}
