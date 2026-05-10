import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { IconMoreVertical, IconPlus, IconSearch } from '../components/ui/Icons'
import { deleteExpeditionByCodeSuivi, listExpeditions } from '../lib/expeditionsApi'
import '../styles/Expedients.css'

/* Ce composant affiche la liste principale des expeditions avec acces au detail. */
const ExpeditionsList = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [expeditions, setExpeditions] = useState([])
  const [openActionNumero, setOpenActionNumero] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const normalizedSearch = searchTerm.trim().toLowerCase()

  useEffect(() => {
    let cancelled = false

    const loadExpeditions = async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')
        const data = await listExpeditions()
        if (!cancelled) setExpeditions(data)
      } catch (error) {
        if (!cancelled) setErrorMessage(error.message || 'Impossible de charger les expeditions.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadExpeditions()

    return () => {
      cancelled = true
    }
  }, [])

  const filteredExpeditions = useMemo(() => {
    if (!normalizedSearch) return expeditions

    return expeditions.filter((item) => {
      const dateLabel = new Date(item.date_expedition).toLocaleDateString('fr-FR')
      const haystack = [
        item.code_suivi,
        item.expediteur_nom_complet,
        item.destinataire_nom_complet,
        item.status,
        dateLabel,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [expeditions, normalizedSearch])

  const handleDelete = async (codeSuivi) => {
    const isConfirmed = window.confirm('Confirmer la suppression de cette expedition ?')
    if (!isConfirmed) return

    try {
      await deleteExpeditionByCodeSuivi(codeSuivi)
      setOpenActionNumero('')
      setExpeditions((previous) => previous.filter((item) => item.code_suivi !== codeSuivi))
    } catch (error) {
      setErrorMessage(error.message || 'Suppression impossible.')
    }
  }

  useEffect(() => {
    const handleDocumentClick = (event) => {
      const target = event.target
      if (target instanceof Element && !target.closest('.expeditions-actions-menu')) {
        setOpenActionNumero('')
      }
    }
    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpenActionNumero('')
    }
    document.addEventListener('mousedown', handleDocumentClick)
    window.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <section className="expeditions-list-page fade-in" aria-label="Liste des expeditions">
      <header className="expeditions-list-header">
        <div>
          <h1>Liste des expeditions</h1>
          <p>Retrouvez chaque envoi et accedez rapidement a son detail.</p>
        </div>

        <Button
          className="expeditions-add-btn"
          type="button"
          variant="primary"
          icon={<IconPlus size={18} />}
          onClick={() => navigate('/dashboard/expedients/nouveau')}
        >
          Ajouter expedition
        </Button>
      </header>

      <div className="expeditions-search-row">
        <Input
          label="Rechercher une expedition"
          placeholder="Numero, expediteur, destinataire, statut, date..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          icon={<IconSearch size={18} />}
          variant="search"
        />
      </div>

      {errorMessage && <p className="expedients-error" role="alert">{errorMessage}</p>}

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
          {isLoading && (
            <article className="expeditions-empty-state" aria-live="polite">
              <h3>Chargement des expeditions...</h3>
            </article>
          )}

          {!isLoading && filteredExpeditions.map((item) => (
            <article className="expeditions-row" key={item.code_suivi}>
              <span className="expeditions-main-cell">
                <strong>{item.code_suivi}</strong>
                <small>{item.total_colis || 0} colis</small>
              </span>
              <span>{item.expediteur_nom_complet || '-'}</span>
              <span>{item.destinataire_nom_complet || '-'}</span>
              <span>{new Date(item.date_expedition).toLocaleDateString('fr-FR')}</span>
              <span>
                <em className="expeditions-status-chip">{item.status}</em>
              </span>
              <span className="expeditions-inline-actions">
                <button
                  type="button"
                  className="expeditions-inline-btn"
                  onClick={() => navigate(`/dashboard/expedients/${item.code_suivi}`)}
                >
                  Detail
                </button>
                <button
                  type="button"
                  className="expeditions-inline-btn"
                  onClick={() => navigate(`/dashboard/expedients/${item.code_suivi}/modifier`)}
                >
                  Modifier
                </button>
                <button
                  type="button"
                  className="expeditions-inline-btn danger"
                  onClick={() => handleDelete(item.code_suivi)}
                >
                  Supprimer
                </button>
              </span>
              <span className="expeditions-actions-menu-desktop">
                <div className="expeditions-actions-menu">
                  <button
                    type="button"
                    className="expeditions-actions-trigger"
                    aria-label="Ouvrir les actions"
                    aria-expanded={openActionNumero === item.code_suivi}
                    onClick={() => setOpenActionNumero((p) => (p === item.code_suivi ? '' : item.code_suivi))}
                  >
                    <IconMoreVertical size={18} />
                  </button>
                  {openActionNumero === item.code_suivi && (
                    <div className="expeditions-actions-dropdown" role="menu">
                      <button type="button" role="menuitem" onClick={() => { setOpenActionNumero(''); navigate(`/dashboard/expedients/${item.code_suivi}`) }}>Details</button>
                      <button type="button" role="menuitem" onClick={() => { setOpenActionNumero(''); navigate(`/dashboard/expedients/${item.code_suivi}/modifier`) }}>Modifier</button>
                      <button type="button" role="menuitem" className="danger" onClick={() => handleDelete(item.code_suivi)}>Supprimer</button>
                    </div>
                  )}
                </div>
              </span>
            </article>
          ))}

          {!isLoading && filteredExpeditions.length === 0 && (
            <article className="expeditions-empty-state" aria-live="polite">
              <h3>Aucune expedition trouvee</h3>
              <p>Essayez un autre mot-cle pour afficher vos expeditions.</p>
            </article>
          )}
        </div>
      </article>
    </section>
  )
}

export default ExpeditionsList
