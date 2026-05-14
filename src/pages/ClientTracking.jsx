/* Cette page permet le suivi d'une expedition pour un client connecté. */
import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { IconArrowRight, IconBell, IconBox, IconPin, IconTimeline, IconTruck, IconUser } from '../components/ui/Icons'
import { getPublicTrackingByCodeSuivi } from '../lib/expeditionsApi'
import deliveryImage from "../assets/images/images.jpeg";
import '../styles/PublicTracking.css'
import '../styles/Dashboard.css'

const STATUS_LABELS = {
  EXPEDIE: 'Expedie',
  EN_TRANSIT: 'En transit',
  LIVRE: 'Livre',
  ANNULE: 'Annule',
  NON_RECUPERE: 'Non recupere',
  PERDU: 'Perdu',
}

const normalizeStatus = (status) => String(status ?? '').trim().toUpperCase()
const getStatusLabel = (status) => STATUS_LABELS[normalizeStatus(status)] ?? status ?? 'Inconnu'

const formatDate = (value) => {
  if (!value) return 'Date inconnue'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date inconnue'
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatWeight = (value) => {
  const num = Number(value)
  if (!Number.isFinite(num)) return '0.00 kg'
  return `${num.toFixed(2)} kg`
}

const ClientTracking = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCode = (searchParams.get('code') ?? '').trim()

  const [code, setCode] = useState(initialCode)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [result, setResult] = useState(null)

  const expedition = result?.expedition ?? null
  const suivi = result?.suivi ?? []

  const totalPoids = useMemo(() => {
    if (!expedition?.colis?.length) return '0.00'
    const sum = expedition.colis.reduce((acc, item) => acc + Number(item.poids || 0), 0)
    return sum.toFixed(2)
  }, [expedition])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const normalized = code.trim().toUpperCase()
    setErrorMessage('')
    setResult(null)

    if (!normalized) {
      setErrorMessage('Veuillez entrer un code de suivi.')
      return
    }

    try {
      setIsLoading(true)
      const data = await getPublicTrackingByCodeSuivi(normalized)
      setResult(data)
      setSearchParams({ code: normalized })
    } catch (error) {
      setErrorMessage(error.message || 'Impossible de recuperer ce suivi pour le moment.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!initialCode) return
    const run = async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')
        const data = await getPublicTrackingByCodeSuivi(initialCode.toUpperCase())
        setResult(data)
      } catch (error) {
        setErrorMessage(error.message || 'Impossible de recuperer ce suivi pour le moment.')
      } finally {
        setIsLoading(false)
      }
    }
    run()
  }, [initialCode])

  return (
    <div className="dash-client-tracking fade-in">
      <header className="dash-header">
        <div>
          <h1 className="dash-title">Suivi d'expédition</h1>
          <p className="dash-sub">Localisez vos colis en temps réel via le code de bordereau</p>
        </div>
      </header>

      <section className="public-tracking-hero" style={{ padding: '1.5rem', textAlign: 'left', background: 'var(--color-white)', borderRadius: 'var(--radius-lg)', border: '1px solid #eef1ef', marginBottom: '1.5rem' }}>
        <form className="public-tracking-form" onSubmit={handleSubmit} style={{ margin: '0' }}>
          <label htmlFor="public-tracking-code" style={{ marginBottom: '0.75rem', display: 'block', fontSize: '0.9rem', color: 'var(--color-text-dark)' }}>Code de suivi (ex: CT-XXXX-XXXX)</label>
          <div className="public-tracking-input-row">
            <input
              id="public-tracking-code"
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Entrez votre code ici..."
              autoComplete="off"
              style={{ minHeight: '50px' }}
            />
            <button type="submit" className="btn-primary" disabled={isLoading} style={{ minHeight: '50px' }}>
              <IconArrowRight size={18} />
              <span>{isLoading ? 'Recherche en cours...' : 'Lancer le suivi'}</span>
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="public-tracking-alert public-tracking-alert-error" role="alert" style={{ marginTop: '1.25rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <IconBell size={18} />
             <span>{errorMessage}</span>
          </div>
        )}
        
        {result && !errorMessage && (
          <div className="public-tracking-alert" style={{ marginTop: '1.25rem', padding: '1rem', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <IconBox size={18} />
             <span>Expédition trouvée ! Voici les détails de votre colis.</span>
          </div>
        )}
      </section>

      {expedition && (
        <div className="public-tracking-results" style={{ padding: '0', marginTop: '1rem' }}>
           <article className="public-tracking-card">
              <div className="public-tracking-card-head">
                <div>
                  <p className="public-tracking-card-kicker">Expedition active</p>
                  <h2>{expedition.code_suivi}</h2>
                </div>
                <em className={`public-status-chip status-${normalizeStatus(result?.status_actuel).toLowerCase()}`}>
                  {getStatusLabel(result?.status_actuel)}
                </em>
              </div>

              {/* Mini Map Visual integration */}
              <div className="status-mini-visual" style={{ height: '180px', margin: '1rem 0', opacity: 1, filter: 'none' }}>
                <img src={deliveryImage} alt="" style={{ opacity: 0.6 }} />
                <div className="status-mini-route" style={{ height: '3px', top: '55%' }} />
                <div className="status-mini-pin origin" style={{ width: '30px', height: '30px' }}><IconPin size={16} /></div>
                <div className="status-mini-pin destination" style={{ width: '30px', height: '30px' }}><IconPin size={16} /></div>
              </div>

              <div className="public-tracking-grid">
                <div>
                  <span className="public-label">Expediteur</span>
                  <strong>{expedition.expediteur_nom_complet || '-'}</strong>
                </div>
                <div>
                  <span className="public-label">Destinataire</span>
                  <strong>{expedition.destinataire_nom_complet || '-'}</strong>
                </div>
                <div>
                  <span className="public-label">Agence depart</span>
                  <strong>{expedition.agence_depart_nom || '-'}</strong>
                </div>
                <div>
                  <span className="public-label">Agence destination</span>
                  <strong>{expedition.agence_destination_nom || '-'}</strong>
                </div>
                <div>
                  <span className="public-label">Date expedition</span>
                  <strong>{formatDate(expedition.date_expedition)}</strong>
                </div>
                <div>
                  <span className="public-label">Dernière MAJ</span>
                  <strong>{formatDate(expedition.updated_at)}</strong>
                </div>
                {expedition.agent_nom && (
                  <div className="agent-highlight-cell" style={{ gridColumn: 'span 2', background: '#f0fdf4', padding: '0.85rem', borderRadius: '12px', border: '1px solid #dcfce7', display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <div style={{ background: 'var(--color-primary)', color: 'white', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
                      <IconUser size={18} />
                    </div>
                    <div>
                      <span className="public-label" style={{ margin: 0, color: '#166534' }}>Agent en charge</span>
                      <strong style={{ fontSize: '1rem', color: 'var(--color-text-dark)' }}>
                        {expedition.agent_nom} {expedition.agent_agence_nom && <span style={{ fontWeight: 'normal', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>({expedition.agent_agence_nom})</span>}
                      </strong>
                      {expedition.agent_telephone && (
                        <div style={{ marginTop: '0.1rem' }}>
                          <a href={`tel:${expedition.agent_telephone}`} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            {expedition.agent_telephone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </article>

            <div className="dash-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <article className="public-tracking-card" style={{ margin: 0 }}>
                  <div className="public-section-title">
                    <IconTimeline size={18} />
                    <h3>Historique</h3>
                  </div>
                  {suivi.length === 0 ? (
                    <p className="public-empty">Aucun mouvement enregistré.</p>
                  ) : (
                    <ul className="public-timeline">
                      {suivi.slice(0, 3).map((item) => (
                        <li key={item.id_suivi} className="public-timeline-item">
                          <div className="public-timeline-top">
                            <em className={`public-status-chip status-${normalizeStatus(item.status).toLowerCase()}`}>
                              {getStatusLabel(item.status)}
                            </em>
                            <span style={{ fontSize: '0.75rem' }}>{formatDate(item.date_maj)}</span>
                          </div>
                          <p className="public-timeline-location">
                            <IconPin size={14} />
                            <span>{item.localisation_texte}</span>
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>

                <article className="public-tracking-card" style={{ margin: 0 }}>
                  <div className="public-section-title">
                    <IconBox size={18} />
                    <h3>Colis ({expedition.colis?.length || 0})</h3>
                  </div>
                  <p className="public-colis-total">Total: <strong>{totalPoids} kg</strong></p>
                  <ul className="public-colis-list">
                    {expedition.colis.map((item, index) => (
                      <li className="public-colis-item" key={item.id_colis || index}>
                        <div>
                          <strong>{item.categorie}</strong>
                          <p style={{ fontSize: '0.75rem' }}>{item.description || '-'}</p>
                        </div>
                        <span style={{ fontWeight: 700 }}>{formatWeight(item.poids)}</span>
                      </li>
                    ))}
                  </ul>
                </article>
            </div>
        </div>
      )}

      {!expedition && !errorMessage && !isLoading && (
        <section className="dash-empty-tracking" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
          <IconTruck size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p>Entrez votre numéro de bordereau pour visualiser le trajet de vos marchandises.</p>
        </section>
      )}
    </div>
  )
}

export default ClientTracking
