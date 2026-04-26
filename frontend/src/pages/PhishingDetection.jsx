import React, { useState, useEffect } from 'react'

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

      // Save to history
      const newItem = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        url,
        isPhishing: data.prediction === 'Phishing',
        result: data
      }
      const existing = JSON.parse(localStorage.getItem('phishingHistory') || '[]')
      const updated = [newItem, ...existing.filter(i => i.url !== url)].slice(0, 30)
      localStorage.setItem('phishingHistory', JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('phishing-history-updated'))
    } catch (err) {
      setError(err.message || 'Network error. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleLoadHistory = (e) => {
      const item = e.detail
      setUrl(item.url)
      setResult(item.result)
      setError('')
    }
    window.addEventListener('load-phishing-result', handleLoadHistory)
    return () => window.removeEventListener('load-phishing-result', handleLoadHistory)
  }, [])

  const isPhishing = result?.prediction === 'Phishing'

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>Phishing Website Detection</h2>
          <p style={{ marginTop: 6, marginBottom: 0 }}>Analyze URLs using our Random Forest ML model to structurally detect malicious intent.</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('dashboard')} style={{ background: 'var(--surface)' }}>← Back</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', width: '100%', alignItems: 'start' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ width: '100%', textAlign: 'left' }}>
          <h3 style={{ marginBottom: 20 }}>Enter Website URL</h3>
          <div className="form-group">
            <label className="form-label">URL to Scan</label>
            <input
              id="phishing-url"
              className="form-input"
              type="url"
              placeholder="https://example.com/login"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDetect()}
              disabled={loading}
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
          <button className="btn btn-primary full-width" onClick={handleDetect} disabled={loading}>
            {loading ? <><span className="spinner" /> Analyzing…</> : 'Check URL'}
          </button>
        </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Idle State */}
          {!result && !loading && (
            <div className="card" style={{ minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px dashed var(--border)', boxShadow: 'none' }}>
              <p className="text-muted text-sm" style={{ textAlign: 'center' }}>Enter a URL to begin Deep Learning analysis.</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="card" style={{ width: '100%', textAlign: 'left' }}>
              <div className="loading-state">
                <div className="spinner" />
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Processing…</div>
                  <div className="text-muted text-sm">Running URL through CNN-LSTM backend</div>
                </div>
              </div>
            </div>
          )}

          {/* Result State */}
          {result && (
             <div className="result-card card" style={{ position: 'relative', overflow: 'hidden', margin: 0, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
             {/* Vercel-like Top Gradient Glow */}
             <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: isPhishing ? 'var(--danger)' : 'var(--success)', opacity: 0.8 }} />
             
             {/* Prediction badge & Huge Score */}
             <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
               <div>
                 <p className="text-secondary text-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, color: 'var(--text-secondary)' }}>Prediction Result</p>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                   <span className={`result-badge ${isPhishing ? 'fake' : 'real'}`} style={{ fontSize: '1.05rem', padding: '6px 14px' }}>
                     {isPhishing ? '⚠ Phishing' : '✓ Safe URL'}
                   </span>
                 </div>
               </div>
               <div style={{ textAlign: 'right' }}>
                 <p className="text-secondary text-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2, color: 'var(--text-secondary)' }}>AI Confidence</p>
                 <div style={{ fontSize: '2.5rem', fontWeight: 700, color: isPhishing ? 'var(--danger)' : 'var(--success)', lineHeight: 1, letterSpacing: '-0.02em', textShadow: `0 0 24px ${isPhishing ? 'var(--danger)' : 'var(--success)'}33` }}>
                   {result.confidence}%
                 </div>
               </div>
             </div>

             {/* Confidence bar */}
             <div className="confidence-bar-wrap" style={{ height: 6 }}>
               <div className={`confidence-bar ${isPhishing ? 'fake' : 'real'}`} style={{ width: `${result.confidence}%` }} />
             </div>

             <div className="result-divider" style={{ margin: '32px 0 20px' }} />

            <div className="result-field mb-16">
              <span className="field-label">Analyzed Domain</span>
              <span className="field-value" style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{result.domain}</span>
            </div>

            {result.flags?.length > 0 && (
              <>
                <p className="section-heading">Phishing Indicators Found</p>
                <ul className="reasons-list mt-8">
                  {result.flags.map((flag, i) => (
                    <li key={i} style={{ color: isPhishing ? 'var(--danger)' : 'var(--success)' }}>{flag}</li>
                  ))}
                </ul>
              </>
            )}

            <div className="result-divider" />
            <p className="text-muted text-sm">
              {isPhishing
                ? 'Do NOT visit this URL. The Deep Learning model detected severe malicious attributes common in phishing.'
                : 'This URL mathematically aligns with safe topological standards. Always verify before entering credentials.'}
            </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
