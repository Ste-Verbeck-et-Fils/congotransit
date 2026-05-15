import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { IconMoreVertical, IconPlus, IconSearch, IconBox } from '../components/ui/Icons'
import { deleteExpeditionByCodeSuivi, listExpeditions } from '../lib/expeditionsApi'
import { listAgencies } from '../lib/agencesApi'
import { readAuthSession } from '../lib/authSession'
import { listUsers } from '../lib/usersApi'
import '../styles/Expedients.css'

/* Ce composant affiche la liste principale des expeditions avec acces au detail, recherche et filtres. */
const ExpeditionsList = () => {
  const navigate = useNavigate()
  const role = readAuthSession()?.role_systeme || 'CLIENT'
  const isAdmin = role === 'ADMIN'
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterAgenceDepart, setFilterAgenceDepart] = useState('')
  const [filterAgenceDestination, setFilterAgenceDestination] = useState('')
  const [filterAgent, setFilterAgent] = useState('')
  const [expeditions, setExpeditions] = useState([])
  const [agencies, setAgencies] = useState([])
  const [agents, setAgents] = useState([])
  const [openActionNumero, setOpenActionNumero] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const normalizedSearch = searchTerm.trim().toLowerCase()

  // Options pour les sélecteurs
  const statusOptions = useMemo(
    () => [
      { value: '', label: 'Tous les status' },
      { value: 'EXPEDIE', label: 'Expédié' },
      { value: 'EN_TRANSIT', label: 'En transit' },
      { value: 'LIVRE', label: 'Livré' },
      { value: 'ANNULE', label: 'Annulé' },
      { value: 'NON_RECUPERE', label: 'Non récupéré' },
      { value: 'PERDU', label: 'Perdu' },
    ],
    [],
  )

  const agencesDepartOptions = useMemo(
    () => [
      { value: '', label: 'Toutes les agences de départ' },
      ...agencies.map((agency) => ({
        value: agency.id,
        label: `${agency.nom} (${agency.code})`,
      })),
    ],
    [agencies],
  )

  const agencesDestinationOptions = useMemo(
    () => [
      { value: '', label: 'Toutes les agences de destination' },
      ...agencies.map((agency) => ({
        value: agency.id,
        label: `${agency.nom} (${agency.code})`,
      })),
    ],
    [agencies],
  )

  const agentOptions = useMemo(
    () => [
      { value: '', label: 'Tous les agents' },
      ...agents.map((agent) => ({
        value: agent.id_utilisateur,
        label: agent.nom_affichage,
      })),
    ],
    [agents],
  )

  // Chargement des données
  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')
        const [expeditionsData, agenciesData, agentsData] = await Promise.all([
          listExpeditions(),
          listAgencies(),
          listUsers({ role_systeme: 'AGENT' }),
        ])
        if (!cancelled) {
          setExpeditions(expeditionsData)
          setAgencies(agenciesData)
          setAgents(agentsData)
        }
      } catch (error) {
        if (!cancelled) setErrorMessage(error.message || 'Impossible de charger les expeditions.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [])

  // Filtrage et recherche
  const filteredExpeditions = useMemo(() => {
    return expeditions.filter((item) => {
      // Filtre status
      if (filterStatus && item.status !== filterStatus) return false

      // Filtre agence départ
      if (filterAgenceDepart && item.ref_agence_depart !== filterAgenceDepart) return false

      // Filtre agence destination
      if (filterAgenceDestination && item.ref_agence_destination !== filterAgenceDestination) return false

      // Filtre agent
      if (filterAgent && item.ref_agent !== filterAgent) return false

      // Recherche par code de suivi
      if (!normalizedSearch) return true

      const dateLabel = new Date(item.date_expedition).toLocaleDateString('fr-FR')
      const haystack = [
        item.code_suivi,
        item.expediteur_nom_complet,
        item.destinataire_nom_complet,
        item.agence_depart_nom,
        item.agence_destination_nom,
        item.agent_nom_affichage,
        item.status,
        dateLabel,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [
    expeditions,
    filterStatus,
    filterAgenceDepart,
    filterAgenceDestination,
    filterAgent,
    normalizedSearch,
  ])

  // Suppression d'une expédition
  const handleDelete = async (codeSuivi) => {
    if (!isAdmin) return

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

  // Gestion des clics externes et Escape
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

  // Fonction pour obtenir le label du status avec les bonnes majuscules
  const getStatusLabel = (status) => {
    const statusMap = {
      EXPEDIE: 'Expédié',
      EN_TRANSIT: 'En transit',
      LIVRE: 'Livré',
      ANNULE: 'Annulé',
      NON_RECUPERE: 'Non récupéré',
      PERDU: 'Perdu',
    }
    return statusMap[status] || status
  }

  const isStatusTerminal = (status) => ['LIVRE', 'ANNULE', 'PERDU'].includes(String(status || '').toUpperCase())

  return (
    <section className="expeditions-list-page fade-in" aria-label="Liste des expeditions">
      <header className="expeditions-list-header">
        <div className="expeditions-header-title">
          <h1>Liste des expeditions</h1>
          <p>Retrouvez chaque envoi et accedez rapidement a son detail.</p>
        </div>

        <div className="expeditions-header-controls">
          <div className="expeditions-header-search">
            <Input
              placeholder="Rechercher un code, un nom..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              icon={<IconSearch size={18} />}
              variant="search"
            />
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
        </div>
      </header>

      <div className="expeditions-toolbar">
        <Select
          label="Statut"
          value={filterStatus}
          onChange={(event) => setFilterStatus(event.target.value)}
          options={statusOptions}
        />

        <Select
          label="Agence départ"
          value={filterAgenceDepart}
          onChange={(event) => setFilterAgenceDepart(event.target.value)}
          options={agencesDepartOptions}
        />

        <Select
          label="Agence destination"
          value={filterAgenceDestination}
          onChange={(event) => setFilterAgenceDestination(event.target.value)}
          options={agencesDestinationOptions}
        />

        {isAdmin && (
          <Select
            label="Agent"
            value={filterAgent}
            onChange={(event) => setFilterAgent(event.target.value)}
            options={agentOptions}
          />
        )}
      </div>

      {errorMessage && !errorMessage.includes("permissions") && <p className="expedients-error" role="alert">{errorMessage}</p>}

      <article className="expeditions-table-card">
        <div className={`expeditions-table-head ${!isAdmin ? 'no-agent' : ''}`} aria-hidden="true">
          <span>Code</span>
          <span>Expediteur</span>
          <span>Destinataire</span>
          <span>Départ</span>
          <span>Arrivée</span>
          {isAdmin && <span>Agent</span>}
          <span>Statut</span>
          <span>Date</span>
          <span>Actions</span>
        </div>

        <div className="expeditions-table-body">
          {isLoading && (
            <article className="expeditions-empty-state" aria-live="polite">
              <IconBox size={24} color="var(--color-primary)" />
              <h3>Chargement des expeditions...</h3>
            </article>
          )}

          {!isLoading && filteredExpeditions.map((item) => (
            <article className={`expeditions-row ${!isAdmin ? 'no-agent' : ''}`} key={item.code_suivi}>
              <span className="expeditions-main-cell">
                <strong className="code-badge">{item.code_suivi}</strong>
              </span>
              <span className="cell-text">{item.expediteur_nom_complet || '-'}</span>
              <span className="cell-text">{item.destinataire_nom_complet || '-'}</span>
              <span className="cell-text">{item.agence_depart_nom || '-'}</span>
              <span className="cell-text">{item.agence_destination_nom || '-'}</span>
              {isAdmin && <span className="cell-text">{item.agent_nom_affichage || '-'}</span>}
              <span>
                <em className={`expeditions-status-chip status-${item.status.toLowerCase()}`}>
                  {getStatusLabel(item.status)}
                </em>
              </span>
              <span className="cell-date">{new Date(item.date_expedition).toLocaleDateString('fr-FR')}</span>
              <span className="expeditions-actions-menu-shell">
                <div className="expeditions-actions-menu">
                  <button
                    type="button"
                    className="expeditions-actions-trigger"
                    aria-label="Ouvrir les actions"
                    aria-expanded={openActionNumero === item.code_suivi}
                    onClick={() =>
                      setOpenActionNumero((current) =>
                        current === item.code_suivi ? '' : item.code_suivi,
                      )
                    }
                  >
                    <IconMoreVertical size={18} />
                  </button>
                  {openActionNumero === item.code_suivi && (
                    <div className="expeditions-actions-dropdown" role="menu">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpenActionNumero('')
                          navigate(`/dashboard/expedients/${item.code_suivi}`)
                        }}
                      >
                        Detail
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpenActionNumero('')
                          navigate(`/dashboard/expedients/${item.code_suivi}/suivi`)
                        }}
                      >
                        Suivi
                      </button>
                      {item.status === 'LIVRE' && (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setOpenActionNumero('')
                            navigate(`/dashboard/expedients/${item.code_suivi}/confirmation`)
                          }}
                        >
                          Confirmation
                        </button>
                      )}
                      {!isStatusTerminal(item.status) && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpenActionNumero('')
                          navigate(`/dashboard/expedients/${item.code_suivi}/modifier`)
                        }}
                      >
                        Modifier
                      </button>
                      )}
                      {isAdmin && !isStatusTerminal(item.status) && (
                      <button
                        type="button"
                        role="menuitem"
                        className="danger"
                        onClick={() => handleDelete(item.code_suivi)}
                      >
                        Supprimer
                      </button>
                      )}
                    </div>
                  )}
                </div>
              </span>

              <div className="expeditions-inline-actions">
                <button
                  type="button"
                  className="expeditions-inline-btn"
                  onClick={() => navigate(`/dashboard/expedients/${item.code_suivi}`)}
                >
                  Détails
                </button>
                <button
                  type="button"
                  className="expeditions-inline-btn"
                  onClick={() => navigate(`/dashboard/expedients/${item.code_suivi}/suivi`)}
                >
                  Suivi
                </button>
                {!isStatusTerminal(item.status) && (
                  <button
                    type="button"
                    className="expeditions-inline-btn"
                    onClick={() => navigate(`/dashboard/expedients/${item.code_suivi}/modifier`)}
                  >
                    Modifier
                  </button>
                )}
                {isAdmin && !isStatusTerminal(item.status) && (
                  <button
                    type="button"
                    className="expeditions-inline-btn danger"
                    onClick={() => handleDelete(item.code_suivi)}
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </article>
          ))}

          {!isLoading && filteredExpeditions.length === 0 && (
            <article className="expeditions-empty-state" aria-live="polite">
              <IconBox size={24} color="var(--color-primary)" />
              <h3>Aucune expedition trouvee</h3>
              <p>Essayez un autre mot-cle ou modifiez les filtres.</p>
            </article>
          )}
        </div>
      </article>
    </section>
  )
}

export default ExpeditionsList
