/* Ce composant affiche la liste des expeditions du client connecte. */
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconBox, IconMoreVertical } from '../components/ui/Icons'
import { listClientExpeditions } from '../lib/expeditionsApi'
import '../styles/MyExpeditions.css'

const STATUS_LABELS = {
  EXPEDIE: 'Expedie',
  EN_TRANSIT: 'En transit',
  LIVRE: 'Livre',
  ANNULE: 'Annule',
  NON_RECUPERE: 'Non recupere',
  PERDU: 'Perdu',
}

const getStatusLabel = (status) => STATUS_LABELS[String(status ?? '').trim().toUpperCase()] ?? (status || 'Inconnu')

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('fr-FR')
}

const MyExpeditions = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [expeditions, setExpeditions] = useState([])
  const [openActionCode, setOpenActionCode] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadMyExpeditions = async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')
        const data = await listClientExpeditions()
        if (!isMounted) return
        setExpeditions(data)
      } catch (error) {
        if (!isMounted) return
        setErrorMessage(error.message || 'Impossible de charger vos expeditions.')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadMyExpeditions()
    return () => {
      isMounted = false
    }
  }, [])

  const sortedExpeditions = useMemo(
    () => [...expeditions].sort((a, b) => new Date(b.date_expedition) - new Date(a.date_expedition)),
    [expeditions],
  )

  return (
    <section className="my-expeditions-page fade-in" aria-label="Mes expeditions">
      <header className="my-expeditions-header">
        <div>
          <h1>Mes expeditions</h1>
          <p>Retrouvez toutes vos expeditions reliees a votre numero de telephone.</p>
        </div>
      </header>

      {errorMessage && (
        <p className="my-expeditions-alert my-expeditions-alert-error" role="alert">{errorMessage}</p>
      )}

      <article className="my-expeditions-table-card">
        <div className="my-expeditions-table-head" aria-hidden="true">
          <span>Code suivi</span>
          <span>Status</span>
          <span>Date</span>
          <span>Agence depart</span>
          <span>Agence destination</span>
          <span>Action</span>
        </div>

        <div className="my-expeditions-table-body">
          {isLoading && (
            <article className="my-expeditions-empty-state" aria-live="polite">
              <IconBox size={24} color="var(--color-primary)" />
              <h3>Chargement de vos expeditions...</h3>
            </article>
          )}

          {!isLoading && sortedExpeditions.map((item) => (
            <article className="my-expeditions-row" key={item.code_suivi}>
              <span className="my-expeditions-main-cell">
                <strong>{item.code_suivi}</strong>
              </span>
              <span>
                <em className={`my-expeditions-status-chip status-${String(item.status).toLowerCase()}`}>
                  {getStatusLabel(item.status)}
                </em>
              </span>
              <span>{formatDate(item.date_expedition)}</span>
              <span>{item.agence_depart_nom || '-'}</span>
              <span>{item.agence_destination_nom || '-'}</span>
              <span className="my-expeditions-actions-menu-shell">
                <div className="my-expeditions-actions-menu">
                  <button
                    type="button"
                    className="my-expeditions-actions-trigger"
                    aria-label="Ouvrir les actions"
                    aria-expanded={openActionCode === item.code_suivi}
                    onClick={() => setOpenActionCode((current) => (current === item.code_suivi ? '' : item.code_suivi))}
                  >
                    <IconMoreVertical size={18} />
                  </button>
                  {openActionCode === item.code_suivi && (
                    <div className="my-expeditions-actions-dropdown" role="menu">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpenActionCode('')
                          navigate(`/dashboard/expedients/${item.code_suivi}`)
                        }}
                      >
                        Details
                      </button>
                    </div>
                  )}
                </div>
              </span>
            </article>
          ))}

          {!isLoading && sortedExpeditions.length === 0 && (
            <article className="my-expeditions-empty-state" aria-live="polite">
              <IconBox size={24} color="var(--color-primary)" />
              <h3>Aucune expedition trouvee</h3>
              <p>Vos expeditions apparaitront ici des qu'elles seront enregistrees.</p>
            </article>
          )}
        </div>
      </article>
    </section>
  )
}

export default MyExpeditions
