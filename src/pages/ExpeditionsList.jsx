import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { IconMoreVertical, IconPlus, IconSearch } from '../components/ui/Icons'
import { deleteExpeditionByNumero, listExpeditions } from '../lib/expeditionsStore'
import '../styles/Expedients.css'

/* Ce composant affiche la liste principale des expeditions avec acces au detail. */
const ExpeditionsList = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [openActionNumero, setOpenActionNumero] = useState('')
  const expeditions = useMemo(() => listExpeditions(), [refreshKey])
  const normalizedSearch = searchTerm.trim().toLowerCase()

  const filteredExpeditions = useMemo(() => {
    if (!normalizedSearch) return expeditions

    return expeditions.filter((item) => {
      const dateLabel = new Date(item.dateExpedition).toLocaleDateString('fr-FR')
      const haystack = [
        item.numero,
        item.expediteurNom,
        item.destinataireNom,
        item.statut,
        dateLabel,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [expeditions, normalizedSearch])

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

  const handleToggleActions = (numero) => {
    setOpenActionNumero((previous) => (previous === numero ? '' : numero))
  }

  const handleDelete = (numero) => {
    const isConfirmed = window.confirm('Confirmer la suppression de cette expedition ?')
    if (!isConfirmed) return

    const isDeleted = deleteExpeditionByNumero(numero)
    if (isDeleted) {
      setOpenActionNumero('')
      setRefreshKey((previous) => previous + 1)
    }
  }

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
          {filteredExpeditions.map((item) => (
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
                <div className="expeditions-actions-menu">
                  <button
                    type="button"
                    className="expeditions-actions-trigger"
                    aria-label="Ouvrir les actions"
                    aria-expanded={openActionNumero === item.numero}
                    onClick={() => handleToggleActions(item.numero)}
                  >
                    <IconMoreVertical size={18} />
                  </button>

                  {openActionNumero === item.numero && (
                    <div className="expeditions-actions-dropdown" role="menu" aria-label="Actions expedition">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpenActionNumero('')
                          navigate(`/dashboard/expedients/${item.numero}`)
                        }}
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpenActionNumero('')
                          navigate(`/dashboard/expedients/${item.numero}/modifier`)
                        }}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="danger"
                        onClick={() => handleDelete(item.numero)}
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </span>
            </article>
          ))}

          {filteredExpeditions.length === 0 && (
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
