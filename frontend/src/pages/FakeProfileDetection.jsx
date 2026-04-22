import React, { useState } from 'react'

const STEPS = { INPUT: 'input', LOADING: 'loading', MANUAL: 'manual', RESULT: 'result' }

function ResultCard({ result, profile }) {
  const isFake = result.prediction === 'Fake Account'
  const badgeClass = isFake ? 'fake' : 'real'
  const color = isFake ? 'var(--danger)' : 'var(--success)'

  return (
    <div className="result-card card" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Vercel-like Top Gradient Glow */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color, opacity: 0.8 }} />
      
      {/* Prediction badge & Huge Score */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <p className="text-secondary text-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, color: 'var(--text-secondary)' }}>Prediction Result</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className={`result-badge ${badgeClass}`} style={{ fontSize: '1.1rem', padding: '8px 16px' }}>
              {isFake ? '⚠ ' : '✓ '}{result.prediction}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p className="text-secondary text-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, color: 'var(--text-secondary)' }}>AI Confidence</p>
          <div style={{ fontSize: '2.8rem', fontWeight: 700, color, lineHeight: 1, letterSpacing: '-0.02em', textShadow: `0 0 24px ${color}33` }}>
            {result.confidence}%
          </div>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="confidence-bar-wrap" style={{ height: 6 }}>
        <div className={`confidence-bar ${badgeClass}`} style={{ width: `${result.confidence}%` }} />
      </div>

      <div className="result-divider" style={{ margin: '32px 0 24px' }} />

      {/* Profile summary */}
      <p className="section-heading">Data Analyzed</p>
      <div className="result-grid" style={{ gap: 24 }}>
        <div className="result-field">
          <span className="field-label" style={{ color: 'var(--text-primary)' }}>Username</span>
          <span className="field-value" style={{ fontSize: '1.1rem' }}>@{profile.username || '—'}</span>
        </div>
        <div className="result-field">
          <span className="field-label">Followers / Following</span>
          <span className="field-value" style={{ fontSize: '1.1rem' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{profile.followers?.toLocaleString() ?? '—'}</strong> / {profile.following?.toLocaleString() ?? '—'}
          </span>
        </div>
        <div className="result-field">
          <span className="field-label">Profile Picture</span>
          <span className="field-value" style={{ fontSize: '1.1rem' }}>{profile.hasProfilePic ? 'Present' : 'Missing'}</span>
        </div>
        <div className="result-field">
          <span className="field-label">Posts</span>
          <span className="field-value" style={{ fontSize: '1.1rem' }}>{profile.postsCount !== null && profile.postsCount !== undefined ? profile.postsCount : '—'}</span>
        </div>
        <div className="result-field" style={{ gridColumn: '1 / -1', background: 'var(--surface-alt)', padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <span className="field-label" style={{ marginBottom: 6 }}>Profile Bio</span>
          <span className="field-value" style={{ fontStyle: profile.bio ? 'normal' : 'italic', color: profile.bio ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
            {profile.bio || 'User has not written a bio.'}
          </span>
        </div>
      </div>

      {/* Reasoning */}
      {result.reasons && result.reasons.length > 0 && (
        <>
          <div className="result-divider" style={{ margin: '32px 0 20px' }} />
          <p className="section-heading">AI Reasoning</p>
          <ul className="reasons-list">
            {result.reasons.map((r, i) => (
              <li key={i} style={{ fontSize: '0.95rem', color: 'var(--text-primary)', borderBottom: i < result.reasons.length - 1 ? '1px solid var(--surface-alt)' : 'none', paddingBottom: i < result.reasons.length - 1 ? 10 : 0 }}>
                {r}
              </li>
            ))}
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

  React.useEffect(() => {
    const handleLoadHistory = (e) => {
      const { profileData, resultData } = e.detail;
      setProfile(profileData);
      setResult(resultData);
      setStep(STEPS.RESULT);
      setUrl(profileData.username || profileData.url || '');
    };
    window.addEventListener('load-history-result', handleLoadHistory);
    return () => window.removeEventListener('load-history-result', handleLoadHistory);
  }, []);

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

      try {
        const historyItem = {
          url: profileData.username || profileData.url || 'Unknown Profile',
          isFake: data.prediction && data.prediction.includes('Fake'),
          timestamp: Date.now(),
          profileData: profileData,
          resultData: data
        }
        const hist = JSON.parse(localStorage.getItem('fakeProfileHistory') || '[]')
        localStorage.setItem('fakeProfileHistory', JSON.stringify([historyItem, ...hist].slice(0, 30)))
        window.dispatchEvent(new Event('history-updated'))
      } catch (e) {
        console.error('History save error', e)
      }
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
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>Fake Profile Detection</h2>
          <p style={{ marginTop: 6, marginBottom: 0 }}>Analyze an Instagram profile URL to detect signs of a fake or bot account.</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('dashboard')} style={{ background: 'var(--surface)' }}>← Back</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', width: '100%', alignItems: 'start' }}>
        
        {/* ── LEFT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ width: '100%', textAlign: 'left' }}>
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
                disabled={step === STEPS.LOADING}
              />
            </div>
            {step === STEPS.INPUT && error && <p className="text-danger text-sm mb-16">{error}</p>}
            <button className="btn btn-primary full-width" onClick={handleAnalyze} disabled={step === STEPS.LOADING}>
              {step === STEPS.LOADING ? 'Processing…' : 'Analyze Profile'}
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Idle State */}
          {step === STEPS.INPUT && !result && (
            <div className="card" style={{ minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px dashed var(--border)', boxShadow: 'none' }}>
              <p className="text-muted text-sm" style={{ textAlign: 'center' }}>Enter an Instagram profile URL to begin ML analysis.</p>
            </div>
          )}

          {/* Loading */}
          {step === STEPS.LOADING && (
            <div className="card" style={{ width: '100%', textAlign: 'left' }}>
              <div className="loading-state">
                <div className="spinner" />
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Processing…</div>
                  <div className="text-muted text-sm">Fetching profile data &amp; running analysis</div>
                </div>
              </div>
            </div>
          )}

          {/* Manual Input Fallback */}
          {step === STEPS.MANUAL && (
            <div style={{ width: '100%', textAlign: 'left' }}>
              {needsApiKey && (
                <div className="card mb-16" style={{ borderLeft: '3px solid var(--accent)' }}>
                  <p style={{ fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>
                    Enable Auto-Scraping (free, 2 minutes)
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
                    ].map((stepStr, i) => (
                      <li key={i} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {stepStr}
                      </li>
                    ))}
                  </ol>
                  <p className="text-xs text-muted">No credit card required. Works for all public Instagram profiles.</p>
                </div>
              )}

              <div className="card mb-16" style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
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
                        {v === 'yes' ? 'Yes — has a profile photo' : 'No — default avatar'}
                      </button>
                    ))}
                  </div>
                </div>

                {step === STEPS.MANUAL && error && <p className="text-danger text-sm mb-16">Error: {error}</p>}

                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-primary" onClick={handleManualSubmit}>
                    Run ML Analysis →
                  </button>
                  <button className="btn btn-ghost" onClick={reset}>← Try Another URL</button>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {step === STEPS.RESULT && result && (
            <div style={{ width: '100%', textAlign: 'left' }}>
              <ResultCard result={result} profile={profile} />
              <button className="btn btn-ghost mt-16 full-width" onClick={reset}>← Analyze Another Profile</button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
