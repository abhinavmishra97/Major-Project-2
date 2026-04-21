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
      <div className="sidebar-header">
        <button className="sidebar-collapse-btn" onClick={() => setCollapsed(!collapsed)} title="Toggle Sidebar">
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
            {!collapsed && <span className="sidebar-label" style={{ paddingLeft: 8 }}>{item.label}</span>}
            {collapsed && <span className="sidebar-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>{item.label.substring(0, 3).toUpperCase()}</span>}
          </button>
        ))}
      </nav>
    </aside>
  )
}
