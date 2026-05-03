import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import { IconEye, IconPlus } from '../components/ui/Icons'
import { listExpeditions } from '../lib/expeditionsStore'
import '../styles/Expedients.css'

/* Ce composant affiche la liste principale des expeditions avec acces au detail. */
const ExpeditionsList = () => {
  const navigate = useNavigate()
  const expeditions = listExpeditions()

  return (
    <section className="expeditions-list-page fade-in" aria-label="Liste des expeditions">
      <header className="expeditions-list-header">
        <div>
          <h1>Liste des expeditions</h1>
          <p>Retrouvez chaque envoi et accedez rapidement a son detail.</p>
        </div>

        <Button
          type="button"
          variant="primary"
          icon={<IconPlus size={18} />}
          onClick={() => navigate('/dashboard/expedients/nouveau')}
        >
          Ajouter expedition
        </Button>
      </header>

      <article className="expeditions-table-card">
        <div className="expeditions-table-head" aria-hidden="true">
          <span>Expedition</span>
          <span>Expediteur</span>
          <span>Destination</span>
          <span>Date</span>
          <span>Statut</span>
          <span>Action</span>
        </div>

        <div className="expeditions-table-body">
          {expeditions.map((item) => (
            <article className="expeditions-row" key={item.numero}>
              <span className="expeditions-main-cell">
                <strong>{item.numero}</strong>
                <small>{item.colis.length} colis</small>
              </span>
              <span>{item.expediteurNom}</span>
              <span>{item.destinataireNom}</span>
              <span>{new Date(item.dateExpedition).toLocaleDateString('fr-FR')}</span>
              <span>
                <em className="expeditions-status-chip">{item.statut}</em>
              </span>
              <span>
                <Button
                  type="button"
                  variant="outline"
                  icon={<IconEye size={17} />}
                  onClick={() => navigate(`/dashboard/expedients/${item.numero}`)}
                >
                  Details
                </Button>
              </span>
            </article>
          ))}
        </div>
      </article>
    </section>
  )
}

export default ExpeditionsList
