import React from 'react'
import { NavLink } from 'react-router-dom'
import './PublicFooter.css'

const footerLinks = ['Suivi colis', 'Alertes livraison', 'Trajets', 'Support']

const PublicFooter = () => {
  return (
    <footer className="public-footer" id="contact">
      <div className="public-footer-inner">
        <div>
          <NavLink to="/" className="footer-brand" aria-label="Congo Transit">
            <img src="/favicon.png" alt="" className="footer-logo" />
            <span>CongoTransit</span>
          </NavLink>
          <p>Suivi de colis, livraisons et preuves de passage en temps reel.</p>
        </div>

        <div className="footer-links" aria-label="Liens rapides">
          {footerLinks.map((link) => (
            <a key={link} href="#suivi">
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter
