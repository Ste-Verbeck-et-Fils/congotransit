import React from 'react'
import PublicFooter from '../components/layout/PublicFooter'
import PublicHeader from '../components/layout/PublicHeader'
import { IconArrowRight, IconBox, IconPin, IconTimeline, IconTruck } from '../components/ui/Icons'
import heroImage from '../assets/images/nature.jpg'
import deliveryImage from '../assets/images/images.jpeg'
import '../styles/Home.css'

const trackingSteps = [
  { label: 'Colis scanne', value: '09:20' },
  { label: 'En route vers Lubumbashi', value: '12:45' },
  { label: 'Livraison estimee', value: "Aujourd'hui" },
]

const solutions = [
  {
    icon: <IconBox size={22} />,
    title: 'Suivi instantane',
    text: 'Chaque colis garde son statut, son historique et sa position recente au meme endroit.',
  },
  {
    icon: <IconTruck size={22} />,
    title: 'Livraisons pilotees',
    text: 'Les equipes terrain visualisent les priorites, les retards et les preuves de passage.',
  },
  {
    icon: <IconTimeline size={22} />,
    title: 'Alertes temps reel',
    text: 'Les clients recoivent les changements importants sans appeler le service support.',
  },
]

const deliveryStats = [
  { value: '1 284', label: 'colis suivis' },
  { value: '342', label: 'en transit' },
  { value: '98%', label: 'statuts a jour' },
]

const Home = () => {
  return (
    <div className="home-page">
      <PublicHeader />

      <main>
        <section className="home-hero" id="suivi" style={{ '--home-hero-image': `url(${heroImage})` }}>
          <div className="home-hero-copy">
            <p className="home-kicker">CongoTransit live tracking</p>
            <h1>Suivez vos colis et leurs livraisons en temps reel.</h1>
            <p>
              Une interface claire pour connaitre la position, le statut et la prochaine etape de chaque expedition.
            </p>

            <form className="tracking-card" aria-label="Recherche de colis">
              <label htmlFor="tracking-code">Numero de suivi</label>
              <div className="tracking-input-row">
                <input id="tracking-code" type="text" placeholder="CT-2408-9572" />
                <button type="submit">
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
              <span className="map-pin origin"><IconPin size={17} /></span>
              <span className="map-pin destination"><IconPin size={17} /></span>
            </div>
            <div className="tracking-steps">
              {trackingSteps.map((step, index) => (
                <div className="tracking-step" key={step.label}>
                  <span className="step-dot" aria-hidden="true" />
                  <div>
                    <p>{step.label}</p>
                    <strong>{step.value}</strong>
                  </div>
                  {index < trackingSteps.length - 1 && <span className="step-line" aria-hidden="true" />}
                </div>
              ))}
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
          <div className="solutions-copy">
            <p className="home-kicker">Operations de livraison</p>
            <h2>Tout le parcours colis, sans zone floue.</h2>
            <p>
              CongoTransit relie le bureau, les chauffeurs et les clients autour d'une meme information fiable.
            </p>
          </div>

          <div className="solution-grid">
            {solutions.map((solution) => (
              <article className="solution-card" key={solution.title}>
                <div className="solution-icon">{solution.icon}</div>
                <h3>{solution.title}</h3>
                <p>{solution.text}</p>
                <a href="#livraison">
                  <IconArrowRight size={16} />
                  <span>En savoir plus</span>
                </a>
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
            Statuts, horodatage, trajet et reception sont synchronises pour reduire les appels de relance et anticiper les retards.
          </p>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

export default Home
