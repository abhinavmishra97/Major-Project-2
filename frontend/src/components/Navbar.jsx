import React from 'react'

export default function Navbar({ theme, toggleTheme, onHome }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <button
          onClick={onHome}
          className="navbar-brand"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <span className="brand-icon">🛡️</span>
          <span>CyberShield AI</span>
        </button>
        <div className="navbar-right">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>
    </nav>
  )
}
