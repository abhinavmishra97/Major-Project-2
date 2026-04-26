import React, { useState, useEffect } from 'react'

export default function HistorySidebar({ 
  storageKey = 'fakeProfileHistory', 
  eventName = 'history-updated',
  emptyText = 'No items scanned yet.',
  type = 'profile'
}) {
  const [history, setHistory] = useState([])
  const [collapsed, setCollapsed] = useState(false)

  const loadHistory = () => {
    try {
      const hist = JSON.parse(localStorage.getItem(storageKey) || '[]')
      setHistory(hist)
    } catch {
      setHistory([])
    }
  }

  useEffect(() => {
    loadHistory()
    window.addEventListener(eventName, loadHistory)
    return () => window.removeEventListener(eventName, loadHistory)
  }, [storageKey, eventName])

  const clearHistory = () => {
    localStorage.removeItem(storageKey)
    setHistory([])
  }

  return (
    <aside className={`sidebar right-sidebar history-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header" style={{ justifyContent: collapsed ? 'center' : 'space-between', padding: collapsed ? '0 0 16px' : '0 16px 16px' }}>
        {collapsed ? (
           <button className="sidebar-collapse-btn" onClick={() => setCollapsed(false)} title="Expand History">
             ←
           </button>
        ) : (
          <>
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="sidebar-collapse-btn" onClick={() => setCollapsed(true)} title="Collapse History" style={{ width: 20, height: 20, fontSize: '0.7rem' }}>→</button>
              History
            </span>
            {history.length > 0 && (
              <button onClick={clearHistory} className="btn-ghost text-xs" style={{ cursor: 'pointer', border: 'none', background: 'none' }}>Clear</button>
            )}
          </>
        )}
      </div>

      <div className="sidebar-nav" style={{ overflowY: 'auto' }}>
        {history.length === 0 ? (
          !collapsed && <p className="text-muted text-xs" style={{ textAlign: 'center', padding: '24px 12px' }}>{emptyText}</p>
        ) : (
          history.map((item, index) => (
            <div key={index} 
              onClick={() => {
                if (type === 'profile' && item.profileData && item.resultData) {
                  window.dispatchEvent(new CustomEvent('load-history-result', { detail: item }))
                } else if (type === 'phishing' && item.result) {
                  window.dispatchEvent(new CustomEvent('load-phishing-result', { detail: item }))
                }
              }}
              style={{
              background: 'var(--surface-alt)',
              borderRadius: 'var(--radius-sm)',
              padding: collapsed ? '8px' : '12px',
              marginBottom: '8px',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              cursor: item.profileData ? 'pointer' : 'default',
            }}>
              {!collapsed ? (
                <>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                    {item.url}
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`chip mt-8 ${item.isFake || item.isPhishing ? 'fake' : 'real'}`} style={{ margin: 0, padding: '2px 6px', fontSize: '0.65rem' }}>
                      {type === 'profile' ? (item.isFake ? 'Fake' : 'Real') : (item.isPhishing ? 'Phishing' : 'Safe')}
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: (item.isFake || item.isPhishing) ? 'var(--danger)' : 'var(--success)' }} title={item.url} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  )
}
