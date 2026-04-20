import React, { useState, useEffect } from 'react'
import Dashboard from './pages/Dashboard'
import FakeProfileDetection from './pages/FakeProfileDetection'
import SpamDetection from './pages/SpamDetection'
import PhishingDetection from './pages/PhishingDetection'
import PasswordGenerator from './pages/PasswordGenerator'
import Navbar from './components/Navbar'

const PAGES = {
  dashboard: Dashboard,
  'fake-profile': FakeProfileDetection,
  spam: SpamDetection,
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
    <>
      <Navbar theme={theme} toggleTheme={toggleTheme} onHome={() => navigate('dashboard')} />
      <main>
        <div className="container page-enter" key={page}>
          <PageComponent navigate={navigate} />
        </div>
      </main>
      <footer className="footer">
        CyberShield AI &mdash; Built for security research &amp; demonstration
      </footer>
    </>
  )
}
