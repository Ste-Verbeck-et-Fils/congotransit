import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { IconArrowRight, IconClose, IconMenu } from '../ui/Icons'
import './PublicHeader.css'

const PUBLIC_NAV_ITEMS = [
  { href: '#suivi', label: 'Suivi' },
  { href: '#solutions', label: 'Solutions' },
  { href: '#livraison', label: 'Livraison' },
  { href: '#contact', label: 'Contact' },
]

const PublicHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  useEffect(() => {
    if (!isMenuOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu()
    }

    document.body.classList.add('public-menu-open')
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.classList.remove('public-menu-open')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  return (
    <header className="public-header">
      <NavLink to="/" className="public-brand" aria-label="Congo Transit">
        <img src="/favicon.png" alt="" className="public-brand-logo" />
        <span>CongoTransit</span>
      </NavLink>

      <nav className="public-nav" aria-label="Navigation accueil">
        {PUBLIC_NAV_ITEMS.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <NavLink to="/login" className="public-login-link">
        <IconArrowRight size={17} />
        <span>Connectez-vous</span>
      </NavLink>

      <button
        className="public-menu-button"
        type="button"
        onClick={() => setIsMenuOpen(true)}
        aria-label="Ouvrir le menu"
        aria-expanded={isMenuOpen}
        aria-controls="public-mobile-nav"
      >
        <IconMenu size={25} />
      </button>

      <div className={`public-menu-backdrop ${isMenuOpen ? 'open' : ''}`} onClick={closeMenu} />

      <div id="public-mobile-nav" className={`public-mobile-panel ${isMenuOpen ? 'open' : ''}`} aria-hidden={!isMenuOpen}>
        <div className="public-mobile-head">
          <div className="public-brand public-brand-static">
            <img src="/favicon.png" alt="" className="public-brand-logo" />
            <span>CongoTransit</span>
          </div>
          <button className="public-menu-button" type="button" onClick={closeMenu} aria-label="Fermer le menu">
            <IconClose size={22} />
          </button>
        </div>

        <nav className="public-mobile-nav" aria-label="Navigation mobile accueil">
          {PUBLIC_NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} onClick={closeMenu}>
              {item.label}
            </a>
          ))}
        </nav>

        <NavLink to="/login" className="public-mobile-login" onClick={closeMenu}>
          <IconArrowRight size={17} />
          <span>Connectez-vous</span>
        </NavLink>
      </div>
    </header>
  )
}

export default PublicHeader
