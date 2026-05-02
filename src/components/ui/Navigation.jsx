import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import './Navigation.css'
import {
  IconBell,
  IconClose,
  IconDashboard,
  IconLogout,
  IconMenu,
  IconTimeline,
  IconTruck,
  IconUser,
} from './Icons'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Tableau de bord', icon: <IconDashboard size={20} /> },
  { to: '/dashboard/expedients', label: 'Expéditions', icon: <IconTruck size={20} /> },
  { to: '/dashboard/trajet', label: 'Suivi trajet', icon: <IconTimeline size={20} /> },
  { to: '/dashboard/profil', label: 'Profil', icon: <IconUser size={20} /> },
]

const NavigationLinks = ({ variant = 'desktop', onNavigate }) => (
  <nav className={`${variant}-nav-links`} aria-label="Navigation principale">
    {NAV_ITEMS.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.to === '/dashboard'}
        className={({ isActive }) => `${variant}-nav-link ${isActive ? 'active' : ''}`}
        onClick={onNavigate}
      >
        <span className={`${variant}-nav-icon`}>{item.icon}</span>
        <span>{item.label}</span>
      </NavLink>
    ))}
  </nav>
)

const LogoutButton = ({ variant = 'desktop', onLogout }) => (
  <button className={`${variant}-logout-link`} type="button" onClick={onLogout}>
    <span className={`${variant}-nav-icon`}><IconLogout size={20} /></span>
    <span>Deconnexion</span>
  </button>
)

const DesktopSidebar = ({ onLogout }) => (
  <aside className="desktop-sidebar">
    <NavLink to="/dashboard" className="sidebar-brand" aria-label="Congo Transit">
      <img src="/favicon.png" alt="" className="sidebar-logo" />
      <span className="sidebar-brand-text">CONGO TRANSIT</span>
    </NavLink>
    <NavigationLinks />
    <LogoutButton onLogout={onLogout} />
  </aside>
)

export const TopBar = () => {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const openMenu = () => setIsMenuOpen(true)
  const closeMenu = () => setIsMenuOpen(false)
  const handleLogout = () => {
    localStorage.removeItem('congotransit.token')
    localStorage.removeItem('congotransit.user')
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    if (!isMenuOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu()
    }

    document.body.classList.add('menu-open')
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.classList.remove('menu-open')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  return (
    <>
      <DesktopSidebar onLogout={handleLogout} />

      <header className="top-bar">
        <NavLink to="/dashboard" className="mobile-brand" aria-label="Congo Transit">
          <img src="/favicon.png" alt="Congo Transit" className="logo-img" />
          <span className="logo-text">CONGO TRANSIT</span>
        </NavLink>

        <div className="top-actions" aria-label="Actions utilisateur">
          <button className="top-icon-btn notification-btn" type="button" aria-label="Notifications">
            <IconBell size={20} />
            <span className="notification-dot" aria-hidden="true" />
          </button>

          <NavLink to="/dashboard/profil" className="profile-action" aria-label="Profil utilisateur">
            <IconUser size={20} />
          </NavLink>

          <button className="logout-btn" type="button" aria-label="Déconnexion" onClick={handleLogout}>
            <IconLogout size={19} />
          </button>
        </div>

        <button
          className="menu-btn"
          onClick={openMenu}
          aria-label="Ouvrir le menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
        >
          <IconMenu size={28} />
        </button>
      </header>

      <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={closeMenu} />

      <div
        id="mobile-navigation"
        className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}
        aria-hidden={!isMenuOpen}
      >
        <div className="menu-header">
          <div className="logo-container">
            <img src="/favicon.png" alt="" className="logo-img" />
            <span className="logo-text">CONGO TRANSIT</span>
          </div>
          <button className="close-btn" onClick={closeMenu} aria-label="Fermer le menu">
            <IconClose size={24} />
          </button>
        </div>

        <NavigationLinks variant="mobile" onNavigate={closeMenu} />
        <LogoutButton variant="mobile" onLogout={handleLogout} />
      </div>
    </>
  )
}
