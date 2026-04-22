import React, { useState } from 'react'

export default function Sidebar({ page, navigate }) {
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'fake-profile', label: 'Fake Profiles' },
    { id: 'ai-content', label: 'AI Detection' },
    { id: 'phishing', label: 'Phishing Links' },
    { id: 'password', label: 'Passwords' },
  ]

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header" style={{ justifyContent: collapsed ? 'center' : 'space-between', alignItems: 'center' }}>
        {!collapsed && <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tools</span>}
        <button className="sidebar-collapse-btn" onClick={() => setCollapsed(!collapsed)} title="Toggle Sidebar" style={{ width: 24, height: 24, padding: 0, fontSize: '0.8rem' }}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${page === item.id ? 'active' : ''}`}
            onClick={() => navigate(item.id)}
            title={collapsed ? item.label : ''}
          >
            {!collapsed && <span className="sidebar-label">{item.label}</span>}
            {collapsed && <span className="sidebar-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>{item.label.substring(0, 3).toUpperCase()}</span>}
          </button>
        ))}
      </nav>
    </aside>
  )
}
