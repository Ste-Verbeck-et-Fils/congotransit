import React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import { IconBox } from '../components/ui/Icons'
import { getExpeditionByNumero } from '../lib/expeditionsStore'
import '../styles/Expedients.css'

/* Ce composant affiche les informations lisibles et completes d'une expedition. */
const ExpeditionDetail = () => {
  const navigate = useNavigate()
  const { expeditionNumero } = useParams()
  const expedition = getExpeditionByNumero(expeditionNumero)

  if (!expedition) {
    return (
      <section className="expedition-detail-page fade-in" aria-label="Detail expedition introuvable">
        <article className="expedition-detail-card">
          <h1>Expedition introuvable</h1>
          <p>Cette expedition n'existe pas ou a ete supprimee.</p>
          <Link to="/dashboard/expedients" className="expedition-link-inline">Retour a la liste</Link>
        </article>
      </section>
    )
  }

  return (
    <section className="expedition-detail-page fade-in" aria-label="Detail expedition">
      <header style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h1 style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.35rem, 2.8vw, 1.9rem)', lineHeight: 1.1 }}>Detail expedition</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>{expedition.numero} - {expedition.statut}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', gap: '0.5rem', flexShrink: 0 }}>
          <button
            type="button"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 'auto', minWidth: '110px', height: '40px', padding: '0 1.2rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
            onClick={() => navigate(`/dashboard/expedients/${expedition.numero}/modifier`)}
          >
            Modifier
          </button>
          <button
            type="button"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 'auto', minWidth: '100px', height: '40px', padding: '0 1.2rem', background: 'transparent', color: 'var(--color-primary)', border: '1.5px solid var(--color-primary)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
            onClick={() => navigate('/dashboard/expedients')}
          >
            Retour
          </button>
        </div>
      </header>

      <article className="expedition-detail-card">
        <h2>Parties prenantes</h2>
        <div className="expedition-detail-grid">
          <p><span>Expediteur</span><strong>{expedition.expediteurNom}</strong></p>
          <p><span>Destinataire</span><strong>{expedition.destinataireNom}</strong></p>
          <p><span>Agence de depart</span><strong>{expedition.agenceDepartNom}</strong></p>
          <p><span>Agence d'arrivee</span><strong>{expedition.agenceArriveeNom}</strong></p>
          <p><span>Date d'expedition</span><strong>{new Date(expedition.dateExpedition).toLocaleDateString('fr-FR')}</strong></p>
          <p><span>Montant total</span><strong>{expedition.montantTotal.toFixed(2)} USD</strong></p>
        </div>
      </article>

      <article className="expedition-detail-card">
        <h2>Colis</h2>
        <div className="expedition-colis-list">
          {expedition.colis.map((item, index) => (
            <article key={`${item.type}-${index}`} className="expedition-colis-row">
              <span className="expedition-colis-icon" aria-hidden="true">
                <IconBox size={18} color="var(--color-primary)" />
              </span>
              <div>
                <h3>Colis {index + 1}: {item.type}</h3>
                <p>{item.poids} kg - {item.valeur} USD</p>
              </div>
            </article>
          ))}
        </div>
      </article>

      <article className="expedition-detail-card">
        <h2>Observations</h2>
        <p className="expedition-detail-note">{expedition.observations || 'Aucune observation specifique.'}</p>
      </article>
    </section>
  )
}

export default ExpeditionDetail
