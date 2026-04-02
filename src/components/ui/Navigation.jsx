import React from 'react'
import { NavLink } from 'react-router-dom'
import './Navigation.css'
import { IconDashboard, IconBox, IconTimeline, IconUser, IconLogo, IconMenu } from './Icons'

export const TopBar = () => {
  return (
    <header className="top-bar">
      <NavLink to="/" className="logo-container" style={{ textDecoration: 'none' }}>
        <IconLogo size={32} />
        <span className="logo-text">CONGO TRANSIT</span>
      </NavLink>
      <button className="menu-btn"><IconMenu size={28} /></button>
    </header>
  )
}

export const BottomBar = () => {
  const tabs = [
    { to: '/', icon: <IconDashboard size={20} />, label: 'DASHBOARD' },
    { to: '/expedients', icon: <IconBox size={20} />, label: 'EXPEDIENTS' },
    { to: '/trajet', icon: <IconTimeline size={20} />, label: 'TRAJET' },
    { to: '/profil', icon: <IconUser size={20} />, label: 'PROFIL' }
  ]

  return (
    <nav className="bottom-bar">
      {tabs.map((tab) => (
        <NavLink 
          key={tab.to} 
          to={tab.to}
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
