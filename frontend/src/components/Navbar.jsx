import React from 'react'

export default function Navbar({ theme, toggleTheme, onHome }) {
  const isDark = theme === 'dark'

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <button
          onClick={onHome}
          className="navbar-brand"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <span className="brand-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, background: 'var(--text-primary)', color: 'var(--bg)', borderRadius: '50%', fontSize: '0.8rem', fontWeight: 'bold' }}>C</span>
          <span>CyberShield</span>
        </button>
        <div className="navbar-right">
          <button 
            className="theme-toggle" 
            onClick={toggleTheme} 
            aria-label="Toggle theme"
            style={{ 
              position: 'relative', 
              width: 52, 
              height: 28, 
              borderRadius: 30, 
              background: 'var(--surface-alt)', 
              border: '1px solid var(--border)', 
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingInline: 6
            }}
          >
            {/* Sun Icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, color: isDark ? 'var(--text-secondary)' : 'var(--bg)', zIndex: isDark ? 0 : 2, transition: 'color 0.2s', position: 'relative' }}>
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>

            {/* Moon Icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, color: isDark ? 'var(--bg)' : 'var(--text-secondary)', zIndex: isDark ? 2 : 0, transition: 'color 0.2s', position: 'relative' }}>
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>

            {/* Sliding Knob */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 2,
              transform: `translate(${isDark ? '24px' : '0px'}, -50%)`,
              width: 22,
              height: 22,
              background: 'var(--text-primary)',
              borderRadius: '50%',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              zIndex: 1
            }} />
          </button>
        </div>
      </div>
    </nav>
  )
}
