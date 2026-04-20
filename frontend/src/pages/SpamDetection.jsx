import React, { useState } from 'react'

export default function SpamDetection({ navigate }) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const examples = [
    { label: 'Spam Sample', text: 'Congratulations! You have been selected to win a free prize. Click here to claim now. Limited time offer. Act now!' },
    { label: 'Normal Message', text: 'Hey, are we still meeting tomorrow for the project review at 3pm?' },
  ]

  const handleDetect = async () => {
    if (!message.trim()) return setError('Please enter a message to analyze')
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/detect-spam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
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

  const isSpam = result?.prediction === 'Spam'

  return (
    <>
      <div className="page-header">
        <button className="back-link" onClick={() => navigate('dashboard')}>← Back to Dashboard</button>
        <h2>📧 Spam Message Detection</h2>
        <p style={{ marginTop: 6 }}>Paste any text message or email to detect spam signals.</p>
      </div>

      <div style={{ maxWidth: 640 }}>
        <div className="card">
          <div className="form-group">
            <label className="form-label">Message Text</label>
            <textarea
              className="form-textarea"
              placeholder="Paste or type a message here…"
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={{ minHeight: 130 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <span className="text-muted text-xs" style={{ alignSelf: 'center' }}>Try an example:</span>
            {examples.map(ex => (
              <button key={ex.label} className="btn btn-ghost btn-sm" onClick={() => setMessage(ex.text)}>
                {ex.label}
              </button>
            ))}
          </div>

          {error && <p className="text-danger text-sm mb-16">{error}</p>}

          <button className="btn btn-primary" onClick={handleDetect} disabled={loading}>
            {loading ? <><span className="spinner" /> Analyzing…</> : '🔍 Detect Spam'}
          </button>
        </div>

        {result && (
          <div className="result-card card mt-16">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <span className={`result-badge ${isSpam ? 'spam' : 'notspam'}`}>
                {isSpam ? '🚨 Spam Detected' : '✅ Not Spam'}
              </span>
              <span className="text-muted text-sm">Confidence: <strong style={{ color: isSpam ? 'var(--danger)' : 'var(--success)' }}>{result.confidence.toFixed(0)}%</strong></span>
            </div>

            <div className="result-confidence mt-8">
              <div className="confidence-bar-wrap">
                <div className={`confidence-bar ${isSpam ? 'spam' : 'notspam'}`} style={{ width: `${result.confidence}%` }} />
              </div>
            </div>

            {result.matchedKeywords?.length > 0 && (
              <>
                <div className="result-divider" />
                <p className="section-heading">Matched Spam Keywords</p>
                <div style={{ marginTop: 6 }}>
                  {result.matchedKeywords.map(kw => (
                    <span key={kw} className="chip">{kw}</span>
                  ))}
                </div>
              </>
            )}

            <div className="result-divider" />
            <p className="text-muted text-sm">
              {isSpam
                ? 'This message contains patterns commonly found in spam or phishing messages. Do not click any links.'
                : 'This message appears to be a legitimate communication. No obvious spam signals detected.'}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
