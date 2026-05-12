import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { IconMoreVertical, IconPlus, IconSearch, IconUser } from '../components/ui/Icons'
import { listAgencies } from '../lib/agencesApi'
import { USER_ROLE_OPTIONS, deleteUser, listUsers } from '../lib/usersApi'
import '../styles/Agences.css'

const ALL_ROLES_OPTION = { value: '', label: 'Tous les roles' }
const ALL_AGENCIES_OPTION = { value: '', label: 'Toutes les agences' }

/* Ce composant affiche la liste des utilisateurs avec filtres par role et agence. */
const UsersList = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [users, setUsers] = useState([])
  const [agencies, setAgencies] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterAgence, setFilterAgence] = useState('')
  const [openActionId, setOpenActionId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || '')

  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const [usersData, agenciesData] = await Promise.all([
          listUsers(),
          listAgencies(),
        ])

        if (cancelled) return

        setUsers(usersData)
        setAgencies(agenciesData)
      } catch (error) {
        if (!cancelled) setErrorMessage(`Chargement impossible : ${error.message}`)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!location.state?.successMessage) return
    window.history.replaceState({}, document.title)
  }, [location.state])

  useEffect(() => {
    const handleDocumentClick = (event) => {
      const target = event.target
      if (target instanceof Element && !target.closest('.agencies-actions-menu')) {
        setOpenActionId('')
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpenActionId('')
    }

    document.addEventListener('mousedown', handleDocumentClick)
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const roleSelectOptions = useMemo(
    () => [ALL_ROLES_OPTION, ...USER_ROLE_OPTIONS],
    [],
  )

  const agencySelectOptions = useMemo(
    () => [
      ALL_AGENCIES_OPTION,
      ...agencies.map((agency) => ({
        value: agency.id_agence,
        label: `${agency.nom_agence} (${agency.code_agence})`,
      })),
    ],
    [agencies],
  )

  const normalizedSearch = searchTerm.trim().toLowerCase()

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (filterRole && user.role_systeme !== filterRole) return false

      if (filterAgence && user.ref_agence !== filterAgence) return false

      if (!normalizedSearch) return true

      const agencyName = agencies.find((a) => a.id_agence === user.ref_agence)?.nom_agence ?? ''
      const haystack = [
        user.nom_affichage,
        user.telephone,
        user.role_systeme,
        user.status,
        agencyName,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [users, filterRole, filterAgence, normalizedSearch, agencies])

  const getAgencyName = (refAgence) => {
    if (!refAgence) return 'Non rattache'
    const agency = agencies.find((a) => a.id_agence === refAgence)
    return agency ? `${agency.nom_agence} (${agency.code_agence})` : 'Agence inconnue'
  }

  const handleDelete = async (idUser) => {
    const isConfirmed = window.confirm('Confirmer la suppression de cet utilisateur ?')
    if (!isConfirmed) return

    try {
      await deleteUser(idUser)
      setOpenActionId('')
      setUsers((previous) => previous.filter((item) => item.id_utilisateur !== idUser))
    } catch (error) {
      setErrorMessage(error.message || 'Suppression impossible.')
    }
  }

  return (
    <section className="agencies-page fade-in" aria-label="Liste des utilisateurs">
      <header className="agencies-header">
        <div>
          <h1>Gestion des utilisateurs</h1>
          <p>Consultez et administrez les comptes utilisateurs du systeme.</p>
        </div>

        <Button
          className="agencies-add-btn"
          type="button"
          variant="primary"
          icon={<IconPlus size={18} />}
          onClick={() => navigate('/dashboard/utilisateurs/nouveau')}
        >
          Ajouter utilisateur
        </Button>
      </header>

      <div className="agencies-toolbar users-toolbar">
        <Input
          label="Rechercher un utilisateur"
          placeholder="Nom, telephone, role, agence..."
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value)
            if (successMessage) setSuccessMessage('')
          }}
          icon={<IconSearch size={18} />}
          variant="search"
        />

        <Select
          label="Filtrer par role"
          value={filterRole}
          onChange={(event) => setFilterRole(event.target.value)}
          options={roleSelectOptions}
          icon={<IconUser size={16} />}
        />

        <Select
          label="Filtrer par agence"
          value={filterAgence}
          onChange={(event) => setFilterAgence(event.target.value)}
          options={agencySelectOptions}
          icon={<IconUser size={16} />}
        />
      </div>

      {errorMessage && (
        <p className="agencies-alert agencies-alert-error" role="alert">{errorMessage}</p>
      )}

      {successMessage && !errorMessage && (
        <p className="agencies-alert agencies-alert-success" role="status">{successMessage}</p>
      )}

      <article className="agencies-table-card">
        <div className="agencies-table-head users-table-head" aria-hidden="true">
          <span>Utilisateur</span>
          <span>Telephone</span>
          <span>Role</span>
          <span>Agence</span>
          <span>Statut</span>
          <span>Action</span>
        </div>

        <div className="agencies-table-body">
          {isLoading && (
            <article className="agencies-empty-state" aria-live="polite">
              <IconUser size={24} color="var(--color-primary)" />
              <h3>Chargement des utilisateurs...</h3>
            </article>
          )}

          {!isLoading && filteredUsers.map((user) => (
            <article className="agencies-row users-row" key={user.id_utilisateur}>
              <span className="agencies-main-cell">
                <strong>{user.nom_affichage}</strong>
              </span>
              <span>{user.telephone || 'Non renseigne'}</span>
              <span>
                <em className={`agencies-status-chip role-chip-${user.role_systeme.toLowerCase()}`}>
                  {user.role_systeme}
                </em>
              </span>
              <span>{getAgencyName(user.ref_agence)}</span>
              <span>
                <em className={`agencies-status-chip status-${user.status.toLowerCase()}`}>
                  {user.status}
                </em>
              </span>
              <span className="agencies-actions-menu-shell">
                <div className="agencies-actions-menu">
                  <button
                    type="button"
                    className="agencies-actions-trigger"
                    aria-label="Ouvrir les actions"
                    aria-expanded={openActionId === user.id_utilisateur}
                    onClick={() =>
                      setOpenActionId((current) =>
                        current === user.id_utilisateur ? '' : user.id_utilisateur,
                      )
                    }
                  >
                    <IconMoreVertical size={18} />
                  </button>
                  {openActionId === user.id_utilisateur && (
                    <div className="agencies-actions-dropdown" role="menu">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpenActionId('')
                          navigate(`/dashboard/utilisateurs/${user.id_utilisateur}/modifier`)
                        }}
                      >
                        Détails
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpenActionId('')
                          navigate(`/dashboard/utilisateurs/${user.id_utilisateur}/modifier`)
                        }}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="danger"
                        onClick={() => handleDelete(user.id_utilisateur)}
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </span>
            </article>
          ))}

          {!isLoading && filteredUsers.length === 0 && (
            <article className="agencies-empty-state" aria-live="polite">
              <IconUser size={24} color="var(--color-primary)" />
              <h3>Aucun utilisateur trouve</h3>
              <p>Essayez un autre mot-cle ou modifiez les filtres.</p>
            </article>
          )}
        </div>
      </article>
    </section>
  )
}

export default UsersList
