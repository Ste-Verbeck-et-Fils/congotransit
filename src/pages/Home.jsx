import React from "react";
import { Link } from "react-router-dom";
import PublicFooter from "../components/layout/PublicFooter";
import PublicHeader from "../components/layout/PublicHeader";
import {
  IconArrowRight,
  IconBox,
  IconPin,
  IconTimeline,
  IconTruck,
} from "../components/ui/Icons";
import heroImage from "../assets/images/nature.jpg";
import deliveryImage from "../assets/images/images.jpeg";
import "../styles/Home.css";

const trackingSteps = [
  { label: "Colis scanné à Goma", value: "09:20" },
  { label: "En route vers Sake", value: "12:45" },
  { label: "Livraison estimée", value: "Aujourd'hui" },
];

const solutions = [
  {
    icon: <IconTruck size={24} />,
    title: "Smart Kivu",
    text: "Réduisez le coût de vos expéditions au Nord-Kivu avec notre offre d'exploitation mutualisée.",
  },
  {
    icon: <IconTimeline size={24} />,
    title: "Suivi Temps Réel",
    text: "Gardez un œil sur chaque expédition avec un suivi GPS précis des flottes sur les axes routiers de la RDC.",
  },
];

const deliveryStats = [
  { value: "1 284", label: "colis suivis" },
  { value: "342", label: "en transit" },
  { value: "98%", label: "statuts à jour" },
];

const Home = () => {
  return (
    <div className="home-page">
      <PublicHeader />

      <main>
        <section
          className="home-hero"
          id="suivi"
          style={{ "--home-hero-image": `url(${heroImage})` }}
        >
          <div className="home-hero-bottom-row">
            <div className="hero-left-column">
              <div className="home-hero-intro">
                <h1>L'innovation logistique à Goma</h1>
                <p>
                  Que vous expédiiez vos marchandises vers l'Est de la RDC ou
                  recherchiez une solution de suivi, nous proposons des
                  solutions logistiques innovantes.
                </p>
                <Link to="/contact" className="btn-primary" style={{ textDecoration: 'none' }}>Contactez-nous !</Link>
              </div>

              <form className="tracking-card" aria-label="Recherche de colis">
                <label htmlFor="tracking-code">
                  Suivre une expédition active
                </label>
                <div className="tracking-input-row">
                  <input
                    id="tracking-code"
                    type="text"
                    placeholder="Ex: CT-2408-9572"
                  />
                  <button type="submit" className="btn-primary">
                    <IconArrowRight size={18} />
                    <span>Suivre</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="hero-status-panel" aria-label="Statut de livraison">
              <div className="hero-status-top">
                <span>Livraison active</span>
                <strong>CT-2408-9572</strong>
              </div>
              <div className="mini-map">
                <img src={deliveryImage} alt="" />
                <div className="map-route" aria-hidden="true" />
                <span className="map-pin origin">
                  <IconPin size={17} />
                </span>
                <span className="map-pin destination">
                  <IconPin size={17} />
                </span>
              </div>
              <div className="tracking-steps">
                {trackingSteps.map((step, index) => (
                  <div className="tracking-step" key={step.label}>
                    <span className="step-dot" aria-hidden="true" />
                    <div>
                      <p>{step.label}</p>
                      <strong>{step.value}</strong>
                    </div>
                    {index < trackingSteps.length - 1 && (
                      <span className="step-line" aria-hidden="true" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="home-stats" aria-label="Indicateurs de livraison">
          {deliveryStats.map((stat) => (
            <div className="home-stat" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </section>

        <section className="home-solutions" id="solutions">
          <div className="solutions-left">
            <h2>
              Découvrez toutes
              <br />
              nos solutions.
            </h2>
            <p>
              Que vous soyez expéditeur régulier, opérateur logistique,
              Gestionnaire de flotte ou commerçant à Goma, découvrez tous nos
              services CongoTransit.
            </p>
            <Link to="/contact" className="btn-outline" style={{ textDecoration: 'none', display: 'inline-flex' }}>Contactez-nous !</Link>
          </div>

          <div className="solution-grid">
            {solutions.map((solution) => (
              <article className="solution-card" key={solution.title}>
                <div className="solution-icon-wrapper">
                  <div className="solution-icon">{solution.icon}</div>
                </div>
                <h3>{solution.title}</h3>
                <p>{solution.text}</p>
                <Link to="/contact" className="solution-link">
                  <IconArrowRight size={16} />
                  <span>En savoir plus</span>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="delivery-band" id="livraison">
          <div>
            <p className="home-kicker">Suivi terrain</p>
            <h2>Des preuves de livraison visibles des que le colis bouge.</h2>
          </div>
          <p>
            Statuts, horodatage, trajet et reception sont synchronises pour
            reduire les appels de relance et anticiper les retards.
          </p>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Home;
