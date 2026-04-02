import React from 'react'
import './Navigation.css'
import { IconDashboard, IconBox, IconTimeline, IconUser, IconLogo, IconMenu } from './Icons'

export const TopBar = () => {
  return (
    <header className="top-bar">
      <div className="logo-container">
        <IconLogo size={32} />
        <span className="logo-text">CONGO TRANSIT</span>
      </div>
      <button className="menu-btn"><IconMenu size={28} /></button>
    </header>
  )
}

export const BottomBar = ({ activeTab }) => {
  const tabs = [
    { id: 'dashboard', icon: <IconDashboard size={20} />, label: 'DASHBOARD' },
    { id: 'expedients', icon: <IconBox size={20} />, label: 'EXPEDIENTS' },
    { id: 'trajet', icon: <IconTimeline size={20} />, label: 'TRAJET' },
    { id: 'profil', icon: <IconUser size={20} />, label: 'PROFIL' }
  ]

  return (
    <nav className="bottom-bar">
      {tabs.map((tab) => (
        <button 
          key={tab.id} 
          className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
