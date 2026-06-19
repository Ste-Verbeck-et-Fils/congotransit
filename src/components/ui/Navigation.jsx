import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { clearAuthSession, getPostLoginRoute, readAuthSession } from '../../lib/authSession'
import './Navigation.css'
import {
  IconClose,
  IconDashboard,
  IconLogout,
  IconMenu,
  IconOffice,
  IconTimeline,
  IconTruck,
  IconUser,
} from './Icons'

const getNavItems = (roleSysteme) => [
  ...(roleSysteme === 'ADMIN'
    ? [
      { to: '/dashboard', label: 'Tableau de bord', icon: <IconDashboard size={20} /> },
      { to: '/dashboard/expedients', label: 'Expeditions', icon: <IconTruck size={20} /> },
      { to: '/dashboard/agences', label: 'Agences', icon: <IconOffice size={20} /> },
      { to: '/dashboard/personnes', label: 'Personnes', icon: <IconUser size={20} /> },
      { to: '/dashboard/utilisateurs', label: 'Utilisateurs', icon: <IconUser size={20} /> },
      { to: '/dashboard/trajet', label: 'Suivi trajet', icon: <IconTimeline size={20} /> },
      { to: '/dashboard/profil', label: 'Profil', icon: <IconUser size={20} /> },
    ]
    : roleSysteme === 'AGENT'
      ? [
        { to: '/dashboard', label: 'Tableau de bord', icon: <IconDashboard size={20} /> },
        { to: '/dashboard/expedients', label: 'Expeditions', icon: <IconTruck size={20} /> },
        { to: '/dashboard/trajet', label: 'Suivi trajet', icon: <IconTimeline size={20} /> },
        { to: '/dashboard/profil', label: 'Profil', icon: <IconUser size={20} /> },
      ]
      : [
        { to: '/dashboard/mes-expeditions', label: 'Mes expeditions', icon: <IconTruck size={20} /> },
        { to: '/dashboard/suivi', label: 'Suivi', icon: <IconTimeline size={20} /> },
        { to: '/dashboard/profil', label: 'Profil', icon: <IconUser size={20} /> },
      ]
  )
]

const NavigationLinks = ({ items, variant = 'desktop', onNavigate }) => (
  <nav className={`${variant}-nav-links`} aria-label="Navigation principale">
    {items.map((item) => (
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

const DesktopSidebar = ({ items, onLogout, homePath }) => (
  <aside className="desktop-sidebar">
    <NavLink to={homePath} className="sidebar-brand" aria-label="Congo Transit">
      <img src="/favicon.png" alt="" className="sidebar-logo" />
      <span className="sidebar-brand-text">CONGO TRANSIT</span>
    </NavLink>
    <NavigationLinks items={items} />
    <LogoutButton onLogout={onLogout} />
  </aside>
)

/* Ce composant affiche la navigation privee et gere la deconnexion. */
export const TopBar = () => {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const roleSysteme = readAuthSession()?.role_systeme
  const navItems = getNavItems(roleSysteme)
  const homePath = getPostLoginRoute(roleSysteme)

  const openMenu = () => setIsMenuOpen(true)
  const closeMenu = () => setIsMenuOpen(false)
  const handleLogout = () => {
    clearAuthSession()
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
      <DesktopSidebar items={navItems} onLogout={handleLogout} homePath={homePath} />

      <header className="top-bar">
        <NavLink to={homePath} className="mobile-brand" aria-label="Congo Transit">
          <img src="/favicon.png" alt="Congo Transit" className="logo-img" />
          <span className="logo-text">CONGO TRANSIT</span>
        </NavLink>

        <div className="top-actions" aria-label="Actions utilisateur">
          <NavLink to="/dashboard/profil" className="profile-action" aria-label="Profil utilisateur">
            <IconUser size={20} />
          </NavLink>
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

        <NavigationLinks items={navItems} variant="mobile" onNavigate={closeMenu} />
        <LogoutButton variant="mobile" onLogout={handleLogout} />
      </div>
    </>
  )
}
