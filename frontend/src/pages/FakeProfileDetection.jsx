import React, { useState } from 'react'

const STEPS = { INPUT: 'input', LOADING: 'loading', MANUAL: 'manual', RESULT: 'result' }

function ResultCard({ result, profile }) {
  const isFake = result.prediction === 'Fake Account'
  const badgeClass = isFake ? 'fake' : 'real'

  return (
    <div className="result-card card">
      {/* Prediction badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <span className={`result-badge ${badgeClass}`}>
          {isFake ? '⚠️' : '✅'} {result.prediction}
        </span>
        <span className="text-muted text-sm">Confidence: <strong style={{ color: isFake ? 'var(--danger)' : 'var(--success)' }}>{result.confidence}%</strong></span>
      </div>

      {/* Confidence bar */}
      <div className="result-confidence mt-8">
        <div className="confidence-bar-wrap">
          <div
            className={`confidence-bar ${badgeClass}`}
            style={{ width: `${result.confidence}%` }}
          />
        </div>
      </div>

      <div className="result-divider" />

      {/* Profile summary */}
      <p className="section-heading">Profile Summary</p>
      <div className="result-grid">
        <div className="result-field">
          <span className="field-label">Username</span>
          <span className="field-value">@{profile.username || '—'}</span>
        </div>
        <div className="result-field">
          <span className="field-label">Followers</span>
          <span className="field-value">{profile.followers?.toLocaleString() ?? '—'}</span>
        </div>
        <div className="result-field">
          <span className="field-label">Following</span>
          <span className="field-value">{profile.following?.toLocaleString() ?? '—'}</span>
        </div>
        <div className="result-field">
          <span className="field-label">Profile Picture</span>
          <span className="field-value">{profile.hasProfilePic ? '✅ Yes' : '❌ No'}</span>
        </div>
        <div className="result-field" style={{ gridColumn: '1 / -1' }}>
          <span className="field-label">Bio</span>
          <span className="field-value" style={{ fontStyle: profile.bio ? 'normal' : 'italic', opacity: profile.bio ? 1 : 0.5 }}>
            {profile.bio || 'No bio'}
          </span>
        </div>
      </div>

      {/* Reasoning */}
      {result.reasons && result.reasons.length > 0 && (
        <>
          <div className="result-divider" />
          <p className="section-heading">Why this prediction?</p>
          <ul className="reasons-list">
            {result.reasons.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </>
      )}
    </div>
  )
}

export default function FakeProfileDetection({ navigate }) {
  const [step, setStep] = useState(STEPS.INPUT)
  const [url, setUrl] = useState('')
  const [profile, setProfile] = useState({})
  const [manualData, setManualData] = useState({ followers: '', following: '', bio: '', hasProfilePic: null })
  const [fallbackMsg, setFallbackMsg] = useState('')
  const [needsApiKey, setNeedsApiKey] = useState(false)
  const [scrapeSource, setScrapeSource] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // ── Step 1: Analyze URL ──────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!url.trim()) return setError('Please enter an Instagram profile URL')
    setError('')
    setStep(STEPS.LOADING)

    try {
      const res = await fetch('/analyze-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to fetch profile')

      // Store profile (partial or complete)
      setProfile(data.profile)
      setScrapeSource(data.source || null)

      if (data.scraped) {
        // Full data — skip manual entry, predict immediately
        await runPrediction(data.profile)
      } else {
        // Partial / failed scrape — show manual form
        setManualData({ followers: '', following: '', bio: '', hasProfilePic: null })
        setFallbackMsg(data.message || "We couldn't fetch all details. Please fill in the missing fields.")
        setNeedsApiKey(!!data.needsApiKey)
        setStep(STEPS.MANUAL)
      }
    } catch (err) {
      setError(err.message || 'Network error. Is the backend running?')
      setStep(STEPS.INPUT)
    }
  }

  // ── Step 2: Run ML prediction ────────────────────────────────────────
  const runPrediction = async (profileData) => {
    setStep(STEPS.LOADING)
    try {
      const res = await fetch('/predict-fake-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setProfile(profileData)
      setResult(data)
      setStep(STEPS.RESULT)
    } catch (err) {
      setError(err.message || 'Prediction failed')
      setStep(STEPS.MANUAL)
    }
  }

  const handleManualSubmit = async () => {
    const payload = {
      username: profile.username,
      followers: Number(manualData.followers),
      following: Number(manualData.following),
      bio: manualData.bio,
      hasProfilePic: manualData.hasProfilePic === 'yes',
    }
    if (!manualData.followers || !manualData.following) {
      return setError('Followers and Following are required')
    }
    setError('')
    await runPrediction(payload)
  }

  const reset = () => {
    setStep(STEPS.INPUT)
    setUrl('')
    setProfile({})
    setResult(null)
    setError('')
    setFallbackMsg('')
    setNeedsApiKey(false)
    setScrapeSource(null)
  }

  return (
    <>
      <div className="page-header">
        <button className="back-link" onClick={() => navigate('dashboard')}>← Back to Dashboard</button>
        <h2>👤 Fake Profile Detection</h2>
        <p style={{ marginTop: 6 }}>Analyze an Instagram profile URL to detect signs of a fake or bot account.</p>
      </div>

      {/* ── INPUT STEP ── */}
      {step === STEPS.INPUT && (
        <div className="card" style={{ maxWidth: 600 }}>
          <h3 style={{ marginBottom: 20 }}>Enter Instagram Profile URL</h3>
          <div className="form-group">
            <label className="form-label">Profile URL</label>
            <input
              id="instagram-url"
              className="form-input"
              type="url"
              placeholder="https://www.instagram.com/username"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
            />
          </div>
          {error && <p className="text-danger text-sm mb-16">{error}</p>}
          <button className="btn btn-primary" onClick={handleAnalyze}>
            🔍 Analyze Profile
          </button>
          <p className="text-muted text-xs mt-16">
            Try: <code style={{ color: 'var(--accent)' }}>https://instagram.com/realuser</code> or <code style={{ color: 'var(--accent)' }}>https://instagram.com/fakebot99</code>
          </p>
        </div>
      )}

      {/* ── LOADING STEP ── */}
      {step === STEPS.LOADING && (
        <div className="card" style={{ maxWidth: 600 }}>
          <div className="loading-state">
            <div className="spinner" />
            <div>
              <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Processing…</div>
              <div className="text-muted text-sm">Fetching profile data &amp; running analysis</div>
            </div>
          </div>
        </div>
      )}

      {/* ── MANUAL FALLBACK STEP ── */}
      {step === STEPS.MANUAL && (
        <div style={{ maxWidth: 660 }}>

          {/* ── API Key setup card (shown when no key is configured) ── */}
          {needsApiKey && (
            <div className="card mb-16" style={{ borderLeft: '3px solid var(--accent)' }}>
              <p style={{ fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>
                🔑 Enable Auto-Scraping (free, 2 minutes)
              </p>
              <p className="text-sm text-muted" style={{ marginBottom: 14 }}>
                Add a free RapidAPI key to automatically fetch Instagram data — no manual entry needed.
              </p>
              <ol style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {[
                  <span>Go to <a href="https://rapidapi.com/social-api1-instagram/api/instagram-scraper-api2" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>rapidapi.com → Instagram Scraper API2 ↗</a></span>,
                  'Click "Subscribe to Test" → Select the FREE plan (100 req/month)',
                  'Copy your API key from the dashboard',
                  <span>Open <code style={{ color: 'var(--accent)', fontSize: '0.85em' }}>.env</code> file in the project root &amp; paste:<br/><code style={{ color: 'var(--accent)', fontSize: '0.82em', background: 'var(--bg)', padding: '3px 8px', borderRadius: 4, display: 'inline-block', marginTop: 4 }}>RAPIDAPI_KEY=your_key_here</code></span>,
                  'Restart the backend server (Ctrl+C then node server.js)',
                ].map((step, i) => (
                  <li key={i} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {step}
                  </li>
                ))}
              </ol>
              <p className="text-xs text-muted">No credit card required. Works for all public Instagram profiles.</p>
            </div>
          )}

          {/* Explanation / open profile card */}
          <div className="card mb-16" style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.4rem' }}>ℹ️</span>
              <div>
                <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 6 }}>
                  {needsApiKey ? 'For now — enter the details manually' : 'Auto-fetch unavailable for this profile'}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: 10 }}>
                  Open the profile, look up followers / following / bio, and paste them below.
                </p>
                <a
                  href={`https://www.instagram.com/${profile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex' }}
                >
                  Open @{profile.username} on Instagram ↗
                </a>
              </div>
            </div>
          </div>

          {/* Form card */}
          <div className="card">
            <h3 style={{ marginBottom: 6 }}>Enter profile details for @{profile.username}</h3>
            <p className="text-muted text-sm" style={{ marginBottom: 20 }}>
              You'll find followers, following, and bio on the profile page.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Followers</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  placeholder="e.g. 1500"
                  value={manualData.followers}
                  onChange={e => setManualData(d => ({ ...d, followers: e.target.value }))}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Following</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  placeholder="e.g. 400"
                  value={manualData.following}
                  onChange={e => setManualData(d => ({ ...d, following: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group mt-16">
              <label className="form-label">Bio (copy from profile)</label>
              <input
                className="form-input"
                type="text"
                placeholder="Paste bio text here, or leave blank if empty"
                value={manualData.bio}
                onChange={e => setManualData(d => ({ ...d, bio: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Has a Profile Picture?</label>
              <div className="toggle-group">
                {['yes', 'no'].map(v => (
                  <button
                    key={v}
                    className={`toggle-btn ${manualData.hasProfilePic === v ? 'active' : ''}`}
                    onClick={() => setManualData(d => ({ ...d, hasProfilePic: v }))}
                  >
                    {v === 'yes' ? '✅ Yes — has a profile photo' : '❌ No — default avatar'}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-danger text-sm mb-16">⚠️ {error}</p>}

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" onClick={handleManualSubmit}>
                🤖 Run ML Analysis →
              </button>
              <button className="btn btn-ghost" onClick={reset}>← Try Another URL</button>
            </div>
          </div>
        </div>
      )}

      {/* ── RESULT STEP ── */}
      {step === STEPS.RESULT && result && (
        <div style={{ maxWidth: 600 }}>
          {scrapeSource && scrapeSource !== 'mock' && (
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="chip">✅ Live Data</span>
              <span className="text-xs text-muted">Auto-fetched via {scrapeSource === 'rapidapi' ? 'RapidAPI' : 'Instagram API'}</span>
            </div>
          )}
          <ResultCard result={result} profile={profile} />
          <button className="btn btn-ghost mt-16" onClick={reset}>← Analyze Another Profile</button>
        </div>
      )}
    </>
  )
}
