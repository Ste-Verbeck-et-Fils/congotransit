import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './Navigation.css'
import { IconMenu, IconClose } from './Icons'

export const TopBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <header className="top-bar">
        <NavLink to="/" className="logo-container" style={{ textDecoration: 'none' }}>
          <img src="/favicon.png" alt="Congo Transit" className="logo-img" />
          <span className="logo-text">CONGO TRANSIT</span>
        </NavLink>
        
        <nav className="desktop-nav">
          <NavLink to="/" className={({ isActive }) => `desktop-link ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/expedients" className={({ isActive }) => `desktop-link ${isActive ? 'active' : ''}`}>
            Expédients
          </NavLink>
          <NavLink to="/trajet" className={({ isActive }) => `desktop-link ${isActive ? 'active' : ''}`}>
            Trajet
          </NavLink>
          <NavLink to="/profil" className={({ isActive }) => `desktop-link ${isActive ? 'active' : ''}`}>
            Profil
          </NavLink>
        </nav>

        <button className="menu-btn" onClick={toggleMenu} aria-label="Open Menu">
          <IconMenu size={28} />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu} />

      {/* Mobile Side Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <div className="logo-container">
            <img src="/favicon.png" alt="Logo" className="logo-img" />
            <span className="logo-text">CONGO TRANSIT</span>
          </div>
          <button className="close-btn" onClick={toggleMenu} aria-label="Close Menu">
            <IconClose size={24} />
          </button>
        </div>

        <nav className="menu-links">
          <NavLink to="/" className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`} onClick={toggleMenu}>
            Tableau de Bord
          </NavLink>
          <NavLink to="/expedients" className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`} onClick={toggleMenu}>
            Expéditions
          </NavLink>
          <NavLink to="/trajet" className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`} onClick={toggleMenu}>
            Suivi Trajet
          </NavLink>
          <NavLink to="/profil" className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`} onClick={toggleMenu}>
            Mon Profil
          </NavLink>
        </nav>
      </div>
    </>
  )
}

