import React from 'react'
import { Link } from 'react-router-dom'
import PublicHeader from '../components/layout/PublicHeader'
import PublicFooter from '../components/layout/PublicFooter'
import { IconArrowRight } from '../components/ui/Icons'
import '../styles/Contact.css'
import heroImage from '../assets/images/nature.jpg'

const Contact = () => {
  return (
    <div className="home-page contact-page">
      <PublicHeader />

      <main>
        <section className="contact-hero" style={{ '--home-hero-image': `url(${heroImage})` }}>
          <div className="contact-hero-content">
            <h1>Contactez-nous</h1>
            <p>Notre équipe à Goma est à votre disposition pour répondre à toutes vos questions concernant vos expéditions au Nord-Kivu et en RDC.</p>
          </div>
        </section>

        <section className="contact-content">
          <div className="contact-info">
            <h2>Nos Coordonnées</h2>
            <div className="info-block">
              <h3>Adresse</h3>
              <p>Quartier Les Volcans<br />Goma, Nord-Kivu<br />République Démocratique du Congo</p>
            </div>
            <div className="info-block">
              <h3>Email</h3>
              <a href="mailto:contact@congotransit.com">contact@congotransit.com</a>
            </div>
            <div className="info-block">
              <h3>Téléphone</h3>
              <p>+243 990 000 000</p>
            </div>
            <div className="info-block">
              <h3>Horaires</h3>
              <p>Lundi - Vendredi : 08h00 - 17h00<br />Samedi : 08h00 - 13h00</p>
            </div>
          </div>

          <div className="contact-form-container">
            <h2>Envoyez-nous un message</h2>
            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label htmlFor="name">Nom complet</label>
                <input type="text" id="name" placeholder="Votre nom" required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" placeholder="Votre adresse email" required />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Sujet</label>
                <select id="subject" required>
                  <option value="">Sélectionnez un sujet</option>
                  <option value="suivi">Suivi d'un colis</option>
                  <option value="partenariat">Devenir partenaire</option>
                  <option value="support">Support technique</option>
                  <option value="autre">Autre demande</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" rows="5" placeholder="Comment pouvons-nous vous aider ?" required></textarea>
              </div>
              <button type="submit" className="btn-primary">
                <span>Envoyer</span>
                <IconArrowRight size={18} />
              </button>
            </form>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

export default Contact
