import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
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
  { to: '/', label: 'Tableau de bord', icon: <IconDashboard size={20} /> },
  { to: '/expedients', label: 'Expéditions', icon: <IconTruck size={20} /> },
  { to: '/trajet', label: 'Suivi trajet', icon: <IconTimeline size={20} /> },
  { to: '/profil', label: 'Profil', icon: <IconUser size={20} /> },
]

const NavigationLinks = ({ variant = 'desktop', onNavigate }) => (
  <nav className={`${variant}-nav-links`} aria-label="Navigation principale">
    {NAV_ITEMS.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.to === '/'}
        className={({ isActive }) => `${variant}-nav-link ${isActive ? 'active' : ''}`}
        onClick={onNavigate}
      >
        <span className={`${variant}-nav-icon`}>{item.icon}</span>
        <span>{item.label}</span>
      </NavLink>
    ))}
  </nav>
)

const DesktopSidebar = () => (
  <aside className="desktop-sidebar">
    <NavLink to="/" className="sidebar-brand" aria-label="Congo Transit">
      <img src="/favicon.png" alt="" className="sidebar-logo" />
      <span className="sidebar-brand-text">CONGO TRANSIT</span>
    </NavLink>
    <NavigationLinks />
  </aside>
)

export const TopBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const openMenu = () => setIsMenuOpen(true)
  const closeMenu = () => setIsMenuOpen(false)

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

  const userName = 'Admin CongoTransit'

  return (
    <>
      <DesktopSidebar />

      <header className="top-bar">
        <button
          className="menu-btn"
          onClick={openMenu}
          aria-label="Ouvrir le menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
        >
          <IconMenu size={28} />
        </button>

        <NavLink to="/" className="mobile-brand" aria-label="Congo Transit">
          <img src="/favicon.png" alt="Congo Transit" className="logo-img" />
          <span className="logo-text">CONGO TRANSIT</span>
        </NavLink>

        <div className="top-actions" aria-label="Actions utilisateur">
          <button className="top-icon-btn notification-btn" type="button" aria-label="Notifications">
            <IconBell size={20} />
            <span className="notification-dot" aria-hidden="true" />
          </button>

          <NavLink to="/profil" className="profile-action" aria-label="Profil utilisateur">
            <span className="profile-action-avatar" aria-hidden="true">A</span>
            <span className="profile-name">{userName}</span>
          </NavLink>

          <button className="logout-btn" type="button" aria-label="Déconnexion">
            <IconLogout size={19} />
            <span>Déconnexion</span>
          </button>
        </div>
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
      </div>
    </>
  )
}
