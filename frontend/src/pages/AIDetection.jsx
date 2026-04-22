import React, { useState } from 'react'

const STEPS = { INPUT: 'input', LOADING: 'loading', RESULT: 'result' }

export default function AIDetection({ navigate }) {
  const [mode, setMode] = useState('text') // 'text' | 'image'
  const [step, setStep] = useState(STEPS.INPUT)
  const [textInput, setTextInput] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleAnalyzeText = async () => {
    if (!textInput.trim()) return setError('Please enter some text to analyze.')
    if (textInput.trim().split(/\s+/).length < 20) return setError('Please enter at least 20 words for an accurate analysis.')
    
    setError('')
    setStep(STEPS.LOADING)
    
    // TODO: Wire to real backend once we decide on the ML model
    setTimeout(() => {
      setResult({
        prediction: Math.random() > 0.5 ? 'AI Generated' : 'Human Written',
        confidence: Math.floor(Math.random() * 40) + 60,
        type: 'text'
      })
      setStep(STEPS.RESULT)
    }, 2000)
  }

  const handleAnalyzeImage = async () => {
    if (!selectedFile) return setError('Please select an image file to analyze.')
    
    setError('')
    setStep(STEPS.LOADING)

    // TODO: Wire to real backend/API
    setTimeout(() => {
      setResult({
        prediction: Math.random() > 0.5 ? 'Deepfake Artifacts Found' : 'Authentic Image',
        confidence: Math.floor(Math.random() * 30) + 70,
        type: 'image'
      })
      setStep(STEPS.RESULT)
    }, 2500)
  }

  const reset = () => {
    setStep(STEPS.INPUT)
    setResult(null)
    setError('')
  }

  const handleModeSwitch = (m) => {
    setMode(m)
    reset()
  }

  const isWarning = result?.prediction.includes('AI') || result?.prediction.includes('Deepfake')
  const badgeClass = isWarning ? 'fake' : 'real'
  const color = isWarning ? 'var(--danger)' : 'var(--success)'

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>AI Content Detection</h2>
          <p style={{ marginTop: 6, marginBottom: 0 }}>Scan text for linguistic anomalies and evaluate images for generative deepfake artifacts.</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('dashboard')} style={{ background: 'var(--surface)' }}>← Back</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
        <button 
          className={`btn ${mode === 'text' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => handleModeSwitch('text')}
        >
          Text Analysis
        </button>
        <button 
          className={`btn ${mode === 'image' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => handleModeSwitch('image')}
        >
          Image &amp; Deepfake Analysis
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', width: '100%', alignItems: 'start' }}>
        
        {/* ── LEFT COLUMN: Inputs ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {mode === 'text' && (
            <div className="card" style={{ width: '100%', textAlign: 'left' }}>
              <h3 style={{ marginBottom: 20 }}>Paste Text Content</h3>
              <div className="form-group">
                <textarea
                  className="form-textarea"
                  placeholder="Paste an email, essay, tweet, or article here to check for burstiness and perplexity artifacts common in ChatGPT/Claude outputs..."
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  disabled={step === STEPS.LOADING}
                  style={{ minHeight: 200 }}
                />
              </div>
              {step === STEPS.INPUT && error && <p className="text-danger text-sm mb-16">{error}</p>}
              <button 
                className="btn btn-primary full-width" 
                onClick={handleAnalyzeText} 
                disabled={step === STEPS.LOADING}
              >
                {step === STEPS.LOADING ? 'Analyzing Linguistic Patterns...' : 'Analyze Text'}
              </button>
            </div>
          )}

          {mode === 'image' && (
            <div className="card" style={{ width: '100%', textAlign: 'left' }}>
              <h3 style={{ marginBottom: 20 }}>Upload Image File</h3>
              <div 
                className="form-group" 
                style={{ 
                  border: '2px dashed var(--border)', 
                  borderRadius: 'var(--radius)', 
                  padding: 40,
                  textAlign: 'center',
                  background: 'var(--surface-alt)',
                  transition: 'all var(--transition)',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('image-upload').click()}
              >
                <input 
                  type="file" 
                  id="image-upload" 
                  accept="image/png, image/jpeg, image/webp" 
                  style={{ display: 'none' }}
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0])
                    }
                  }}
                  disabled={step === STEPS.LOADING}
                />
                {!selectedFile ? (
                  <>
                    <p style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>Click to select an image</p>
                    <p className="text-sm text-muted">Supports JPG, PNG, WEBP max 10MB</p>
                  </>
                ) : (
                  <>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{selectedFile.name}</p>
                    <p className="text-xs text-muted">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </>
                )}
              </div>
              
              {step === STEPS.INPUT && error && <p className="text-danger text-sm mb-16">{error}</p>}
              <button 
                className="btn btn-primary full-width mt-16" 
                onClick={handleAnalyzeImage} 
                disabled={step === STEPS.LOADING || !selectedFile}
              >
                {step === STEPS.LOADING ? 'Scanning Pixel Artifacts...' : 'Scan Image'}
              </button>
            </div>
          )}

        </div>

        {/* ── RIGHT COLUMN: Outputs ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Idle State */}
          {step === STEPS.INPUT && !result && (
            <div className="card" style={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px dashed var(--border)', boxShadow: 'none' }}>
              <p className="text-muted text-sm" style={{ textAlign: 'center' }}>
                {mode === 'text' ? 'Paste text on the left to determine if it was AI generated.' : 'Upload an image on the left to check for generative artifacts.'}
              </p>
            </div>
          )}

          {/* Loading */}
          {step === STEPS.LOADING && (
            <div className="card" style={{ width: '100%', textAlign: 'left', minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="loading-state" style={{ flexDirection: 'column', padding: 0 }}>
                <div className="spinner" style={{ width: 32, height: 32, marginBottom: 16 }} />
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.2rem' }}>Running Vector Analysis</div>
                <div className="text-muted text-sm">Evaluating neural network logic bounds &amp; metrics...</div>
              </div>
            </div>
          )}

          {/* Result Card */}
          {step === STEPS.RESULT && result && (
             <div className="result-card card" style={{ position: 'relative', overflow: 'hidden', margin: 0, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
             {/* Vercel-like Top Gradient Glow */}
             <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color, opacity: 0.8 }} />
             
             {/* Prediction badge & Huge Score */}
             <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
               <div>
                 <p className="text-secondary text-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, color: 'var(--text-secondary)' }}>Prediction Result</p>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                   <span className={`result-badge ${badgeClass}`} style={{ fontSize: '1.05rem', padding: '6px 14px' }}>
                     {isWarning ? '⚠ ' : '✓ '}{result.prediction}
                   </span>
                 </div>
               </div>
               <div style={{ textAlign: 'right' }}>
                 <p className="text-secondary text-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2, color: 'var(--text-secondary)' }}>AI Confidence</p>
                 <div style={{ fontSize: '2.5rem', fontWeight: 700, color, lineHeight: 1, letterSpacing: '-0.02em', textShadow: `0 0 24px ${color}33` }}>
                   {result.confidence}%
                 </div>
               </div>
             </div>
       
             {/* Confidence bar */}
             <div className="confidence-bar-wrap" style={{ height: 6 }}>
               <div className={`confidence-bar ${badgeClass}`} style={{ width: `${result.confidence}%` }} />
             </div>
       
             <div className="result-divider" style={{ margin: '32px 0 20px' }} />
       
             <p className="text-sm text-secondary" style={{ lineHeight: 1.6 }}>
                {mode === 'text' 
                  ? (isWarning ? 'This text exhibits low perplexity (highly predictable word choices) and uniform burstiness, which are hallmark signals of Large Language Models.' : 'This text possesses dynamic variance in sentence structure, burstiness, and vocabulary, firmly indicating human authorship.')
                  : (isWarning ? 'Error Level Analysis reveals inconsistent metadata and abnormal pixel clustering often left behind by generative image models like DALL-E or Midjourney.' : 'No synthetic injection artifacts or AI noise-smoothing gradients were detected across the visual spectrum.')}
             </p>

             <button className="btn btn-ghost full-width mt-24" onClick={reset}>
                ← Start New Scan
             </button>
           </div>
          )}

        </div>
      </div>
    </>
  )
}
