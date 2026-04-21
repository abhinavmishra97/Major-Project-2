import React from 'react'

export default function Dashboard({ navigate }) {
  const features = [
    {
      id: 'fake-profile',
      icon: 'Profile',
      title: 'Fake Profile Detection',
      desc: 'Analyze social profiles using follower ratios, bio analysis, and behavioral signals to detect fake or bot accounts.',
      badge: 'ML Powered',
    },
    {
      id: 'ai-content',
      icon: 'AI',
      title: 'AI Content Detection',
      desc: 'Analyze content to detect AI generation. Includes Deepfake image analysis and ChatGPT text burstiness/perplexity evaluation.',
      badge: 'Neural Net',
    },
    {
      id: 'phishing',
      icon: 'URL',
      title: 'Phishing Website Detection',
      desc: 'Evaluate URLs for phishing indicators like suspicious domains, IP-based links, brand impersonation, and redirect tricks.',
      badge: 'URL Analysis',
    },
    {
      id: 'password',
      icon: 'Key',
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
          <span>AI-Powered Cybersecurity Toolkit</span>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span className="card-title" style={{ margin: 0 }}>{f.title}</span>
              <span className="chip" style={{ marginLeft: 'auto' }}>{f.badge}</span>
            </div>
            <p className="card-desc">{f.desc}</p>
            <button className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start', marginTop: 12 }}>
              Open Tool →
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
