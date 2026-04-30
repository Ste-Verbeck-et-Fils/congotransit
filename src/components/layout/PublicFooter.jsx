import React from "react";
import { NavLink } from "react-router-dom";
import "./PublicFooter.css";

const PublicFooter = () => {
  return (
    <footer className="public-footer" id="contact">
      <div className="public-footer-inner">
        <div className="footer-top">
          <div className="footer-brand-col">
            <NavLink to="/" className="footer-brand" aria-label="Congo Transit">
              <img src="/favicon.png" alt="" className="footer-logo" />
              <span>CongoTransit</span>
            </NavLink>
            <p className="footer-desc">
              Suivi de colis, livraisons et preuves de passage en temps réel. La
              référence logistique depuis Goma vers toute la RDC.
            </p>
            <div className="footer-socials">
              <a href="#facebook" aria-label="Facebook">
                Fb
              </a>
              <a href="#twitter" aria-label="Twitter">
                Tw
              </a>
              <a href="#linkedin" aria-label="LinkedIn">
                In
              </a>
            </div>
          </div>

          <div className="footer-links-col">
            <h3>Nos Services</h3>
            <a href="#suivi">Suivi colis</a>
            <a href="#livraison">Preuves de livraison</a>
            <a href="#solutions">Offres mutualisées</a>
            <a href="#api">Intégration API</a>
          </div>

          <div className="footer-links-col">
            <h3>L'Entreprise</h3>
            <a href="#about">À propos</a>
            <a href="#carrieres">Carrières</a>
            <a href="#blog">Blog & Actualités</a>
            <a href="#contact">Contactez-nous</a>
          </div>

          <div className="footer-contact-col">
            <h3>Bureau Principal</h3>
            <address>
              Quartier Les Volcans
              <br />
              Goma, Nord-Kivu
              <br />
              République Démocratique du Congo
            </address>
            <a href="mailto:contact@congotransit.com" className="footer-email">
              contact@congotransit.com
            </a>
            <p className="footer-phone">+243 990 000 000</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} CongoTransit. Tous droits
            réservés.
          </p>
          <div className="footer-legal-links">
            <a href="#privacy">Politique de confidentialité</a>
            <a href="#terms">Conditions d'utilisation</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
