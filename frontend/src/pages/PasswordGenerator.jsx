import React, { useState, useCallback } from 'react'

function generatePassword({ length, upper, lower, numbers, symbols }) {
  const sets = []
  if (upper)   sets.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
  if (lower)   sets.push('abcdefghijklmnopqrstuvwxyz')
  if (numbers) sets.push('0123456789')
  if (symbols) sets.push('!@#$%^&*()_+-=[]{}|;:,.<>?')

  if (sets.length === 0) return ''

  const all = sets.join('')
  const crypto = window.crypto || window.msCrypto
  const arr = new Uint32Array(length)
  crypto.getRandomValues(arr)

  // Ensure at least one char from each selected set
  const parts = sets.map(set => {
    const idx = crypto.getRandomValues(new Uint32Array(1))[0] % set.length
    return set[idx]
  })

  const rest = Array.from(arr)
    .slice(parts.length)
    .map(n => all[n % all.length])

  const combined = [...parts, ...rest]
  // Fisher-Yates shuffle
  for (let i = combined.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [combined[i], combined[j]] = [combined[j], combined[i]]
  }

  return combined.join('')
}

function getStrength(pwd) {
  if (!pwd) return { label: '', color: '', pct: 0 }
  let score = 0
  if (pwd.length >= 12) score++
  if (pwd.length >= 16) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[a-z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++

  if (score <= 2) return { label: 'Weak', color: 'var(--danger)', pct: 25 }
  if (score <= 3) return { label: 'Fair', color: 'var(--warning)', pct: 50 }
  if (score <= 4) return { label: 'Good', color: 'var(--accent)', pct: 75 }
  return { label: 'Strong', color: 'var(--success)', pct: 100 }
}

export default function PasswordGenerator({ navigate }) {
  const [opts, setOpts] = useState({ length: 16, upper: true, lower: true, numbers: true, symbols: false })
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = useCallback(() => {
    setPassword(generatePassword(opts))
    setCopied(false)
  }, [opts])

  const copyToClipboard = () => {
    if (!password) return
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const strength = getStrength(password)

  const toggle = (key) => setOpts(o => ({ ...o, [key]: !o[key] }))

  return (
    <>
      <div className="page-header">
        <button className="back-link" onClick={() => navigate('dashboard')}>← Back to Dashboard</button>
        <h2>Password Generator</h2>
        <p style={{ marginTop: 6 }}>Generate cryptographically secure passwords using your browser's built-in crypto API.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', width: '100%', alignItems: 'start' }}>
        <div className="card">
          {/* Length slider */}
          <div className="form-group">
            <label className="form-label">
              Length: <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{opts.length}</span>
            </label>
            <input
              type="range"
              min={8}
              max={64}
              value={opts.length}
              onChange={e => setOpts(o => ({ ...o, length: Number(e.target.value) }))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-xs text-muted">8</span>
              <span className="text-xs text-muted">64</span>
            </div>
          </div>

          {/* Character options */}
          <div className="form-group">
            <label className="form-label">Character Sets</label>
            <div className="checkbox-group">
              {[
                { key: 'upper',   label: 'Uppercase (A-Z)' },
                { key: 'lower',   label: 'Lowercase (a-z)' },
                { key: 'numbers', label: 'Numbers (0-9)' },
                { key: 'symbols', label: 'Symbols (!@#$…)' },
              ].map(({ key, label }) => (
                <label key={key} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={opts[key]}
                    onChange={() => toggle(key)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <button className="btn btn-primary full-width" onClick={generate}>
            Generate Password
          </button>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Password display */}
          {password && (
            <div className="card result-card" style={{ borderColor: strength.color || 'var(--border)' }}>
              <div className="password-display">
                <span style={{ flex: 1, wordBreak: 'break-all' }}>{password}</span>
                <button className="copy-btn" onClick={copyToClipboard} title="Copy">
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              {/* Strength meter */}
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className="text-xs text-muted">Strength</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: strength.color }}>{strength.label}</span>
                </div>
                <div className="confidence-bar-wrap">
                  <div
                    style={{
                      height: '100%',
                      width: `${strength.pct}%`,
                      background: strength.color,
                      borderRadius: 99,
                      transition: 'width 0.5s ease, background 0.5s ease',
                    }}
                  />
                </div>
              </div>

              {copied && (
                <p className="text-success text-sm mt-8">Copied to clipboard!</p>
              )}
            </div>
          )}

          <div className="card">
            <p className="section-heading">Security Tips</p>
            <ul className="reasons-list mt-8">
              <li>Use a unique password for every account — never reuse passwords</li>
              <li>Store passwords in a reputable password manager (e.g., Bitwarden, 1Password)</li>
              <li>Enable two-factor authentication (2FA) wherever possible</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
