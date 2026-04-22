import React, { useState, useEffect } from 'react'
import Dashboard from './pages/Dashboard'
import FakeProfileDetection from './pages/FakeProfileDetection'
import AIDetection from './pages/AIDetection'
import PhishingDetection from './pages/PhishingDetection'
import PasswordGenerator from './pages/PasswordGenerator'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import HistorySidebar from './components/HistorySidebar'

const PAGES = {
  dashboard: Dashboard,
  'fake-profile': FakeProfileDetection,
  'ai-content': AIDetection,
  phishing: PhishingDetection,
  password: PasswordGenerator,
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const navigate = (p) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const PageComponent = PAGES[page] || Dashboard

  return (
    <div className="app-root">
      <Navbar theme={theme} toggleTheme={toggleTheme} onHome={() => navigate('dashboard')} />
      <div className="layout-wrapper">
        {page !== 'dashboard' && <Sidebar page={page} navigate={navigate} />}
        <div className="layout-content">
          <main>
            <div className="container page-enter" key={page}>
              <PageComponent navigate={navigate} />
            </div>
          </main>
          <footer className="footer">
            CyberShield • Built for security research &amp; demonstration
          </footer>
        </div>
        {page === 'fake-profile' && <HistorySidebar />}
      </div>
    </div>
  )
}
