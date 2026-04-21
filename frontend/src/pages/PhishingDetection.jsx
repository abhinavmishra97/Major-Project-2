import React, { useState } from 'react'

export default function PhishingDetection({ navigate }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const examples = [
    { label: 'Phishing URL', url: 'http://192.168.1.1/paypal-login/verify/account' },
    { label: 'Safe URL', url: 'https://www.wikipedia.org/wiki/Cybersecurity' },
    { label: 'Suspicious', url: 'http://amazon-update-confirm.tk/signin?secure=true' },
  ]

  const handleDetect = async () => {
    if (!url.trim()) return setError('Please enter a URL to analyze')
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/detect-phishing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
    } catch (err) {
      setError(err.message || 'Network error. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const isPhishing = result?.prediction === 'Phishing'

  return (
    <>
      <div className="page-header">
        <button className="back-link" onClick={() => navigate('dashboard')}>← Back to Dashboard</button>
        <h2>Phishing Website Detection</h2>
        <p style={{ marginTop: 6 }}>Enter any URL to check for phishing indicators and suspicious patterns.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', width: '100%', alignItems: 'start' }}>
        <div className="card">
          <div className="form-group">
            <label className="form-label">Website URL</label>
            <input
              id="phishing-url"
              className="form-input"
              type="url"
              placeholder="https://example.com/page"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDetect()}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <span className="text-muted text-xs" style={{ alignSelf: 'center' }}>Try:</span>
            {examples.map(ex => (
              <button key={ex.label} className="btn btn-ghost btn-sm" onClick={() => setUrl(ex.url)}>
                {ex.label}
              </button>
            ))}
          </div>

          {error && <p className="text-danger text-sm mb-16">{error}</p>}
          <button className="btn btn-primary" onClick={handleDetect} disabled={loading}>
            {loading ? <><span className="spinner" /> Analyzing…</> : 'Check URL'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {result && (
            <div className="result-card card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <span className={`result-badge ${isPhishing ? 'phishing' : 'safe'}`}>
                {isPhishing ? 'Phishing Detected' : 'Safe URL'}
              </span>
              <span className="text-muted text-sm">Confidence: <strong style={{ color: isPhishing ? 'var(--danger)' : 'var(--success)' }}>{result.confidence}%</strong></span>
            </div>

            <div className="result-confidence mt-8">
              <div className="confidence-bar-wrap">
                <div className={`confidence-bar ${isPhishing ? 'phishing' : 'safe'}`} style={{ width: `${result.confidence}%` }} />
              </div>
            </div>

            <div className="result-divider" />

            <div className="result-field mb-16">
              <span className="field-label">Analyzed Domain</span>
              <span className="field-value" style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{result.domain}</span>
            </div>

            {result.flags?.length > 0 && (
              <>
                <p className="section-heading">Phishing Indicators Found</p>
                <ul className="reasons-list mt-8">
                  {result.flags.map((flag, i) => (
                    <li key={i} style={{ color: 'var(--danger)' }}>{flag}</li>
                  ))}
                </ul>
              </>
            )}

            <div className="result-divider" />
            <p className="text-muted text-sm">
              {isPhishing
                ? 'Do NOT visit this URL. It shows multiple signs of a phishing or malicious website.'
                : 'This URL appears to be safe based on our analysis. Always verify before entering credentials.'}
            </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
