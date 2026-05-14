/* Cette page permet le suivi public d'une expedition via un code de suivi. */
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PublicFooter from '../components/layout/PublicFooter'
import PublicHeader from '../components/layout/PublicHeader'
import { IconArrowRight, IconBell, IconBox, IconPin, IconTimeline, IconTruck, IconUser } from '../components/ui/Icons'
import { getPublicTrackingByCodeSuivi } from '../lib/expeditionsApi'
import '../styles/PublicTracking.css'

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

const PublicTracking = () => {
  const navigate = useNavigate()
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
    <div className="public-tracking-page">
      <PublicHeader />

      <main className="public-tracking-main">
        <section className="public-tracking-hero">
          <p className="public-tracking-kicker">Suivi public</p>
          <h1>Consultez l'evolution de votre expedition</h1>
          <p>
            Entrez votre code de suivi pour voir le statut actuel, l'historique des mouvements
            et les colis associes.
          </p>

          <form className="public-tracking-form" onSubmit={handleSubmit} aria-label="Formulaire de suivi public">
            <label htmlFor="public-tracking-code">Code de suivi</label>
            <div className="public-tracking-input-row">
              <input
                id="public-tracking-code"
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="Ex: EXP-2026-AB12CD"
                autoComplete="off"
              />
              <button type="submit" className="btn-primary" disabled={isLoading}>
                <IconArrowRight size={18} />
                <span>{isLoading ? 'Recherche...' : 'Suivre'}</span>
              </button>
            </div>
          </form>

          {errorMessage && (
            <p className="public-tracking-alert public-tracking-alert-error" role="alert">
              {errorMessage}
            </p>
          )}
        </section>

        {expedition && (
          <section className="public-tracking-results" aria-live="polite">
            <article className="public-tracking-card">
              <div className="public-tracking-card-head">
                <div>
                  <p className="public-tracking-card-kicker">Expedition</p>
                  <h2>{expedition.code_suivi}</h2>
                </div>
                <em className={`public-status-chip status-${normalizeStatus(result?.status_actuel).toLowerCase()}`}>
                  {getStatusLabel(result?.status_actuel)}
                </em>
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
                  <span className="public-label">Mise a jour</span>
                  <strong>{formatDate(expedition.updated_at)}</strong>
                </div>
                {expedition.agent_nom && (
                  <div className="agent-highlight-cell">
                    <div className="agent-icon-wrapper">
                      <IconUser size={18} />
                    </div>
                    <div className="agent-info-wrapper">
                      <span className="agent-label">Agent en charge</span>
                      <strong className="agent-name">
                        {expedition.agent_nom} {expedition.agent_agence_nom && <span className="agent-agency">({expedition.agent_agence_nom})</span>}
                      </strong>
                      {expedition.agent_telephone && (
                        <div className="agent-phone-row">
                          <a href={`tel:${expedition.agent_telephone}`} className="agent-phone-link">
                            {expedition.agent_telephone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </article>

            <article className="public-tracking-card">
              <div className="public-section-title">
                <IconTimeline size={18} />
                <h3>Historique de suivi</h3>
              </div>

              {suivi.length === 0 ? (
                <p className="public-empty">Aucun evenement de suivi disponible pour le moment.</p>
              ) : (
                <ul className="public-timeline">
                  {suivi.map((item) => (
                    <li key={item.id_suivi} className="public-timeline-item">
                      <div className="public-timeline-top">
                        <em className={`public-status-chip status-${normalizeStatus(item.status).toLowerCase()}`}>
                          {getStatusLabel(item.status)}
                        </em>
                        <span>{formatDate(item.date_maj)}</span>
                      </div>

                      <p className="public-timeline-location">
                        <IconPin size={16} />
                        <span>{item.localisation_texte || 'Localisation non renseignee'}</span>
                      </p>

                      {item.commentaire && <p className="public-timeline-comment">{item.commentaire}</p>}
                      {item.agent_nom && <p className="public-timeline-agent">Par: {item.agent_nom}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="public-tracking-card">
              <div className="public-section-title">
                <IconBox size={18} />
                <h3>Colis lies ({expedition.colis?.length || 0})</h3>
              </div>

              <p className="public-colis-total">
                Poids total: <strong>{totalPoids} kg</strong>
              </p>

              {!expedition.colis?.length ? (
                <p className="public-empty">Aucun colis associe a cette expedition.</p>
              ) : (
                <ul className="public-colis-list">
                  {expedition.colis.map((item, index) => (
                    <li className="public-colis-item" key={item.id_colis || `${item.code_colis}-${index}`}>
                      <div>
                        <strong>Colis {index + 1}</strong>
                        <p>{item.categorie || 'Categorie non renseignee'}</p>
                      </div>
                      <div>
                        <span>{formatWeight(item.poids)}</span>
                        <p>{item.description || '-'}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </section>
        )}

        {!expedition && !errorMessage && !isLoading && (
          <section className="public-tracking-placeholder" aria-label="Aide au suivi">
            <IconTruck size={22} />
            <p>Entrez un code de suivi pour afficher les details de votre expedition.</p>
            <button type="button" className="btn-outline" onClick={() => navigate('/contact')}>
              Besoin d'aide ?
            </button>
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}

export default PublicTracking
