import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { IconMoreVertical, IconPlus, IconSearch, IconUser } from '../components/ui/Icons'
import { formatAddressLabel } from '../lib/addressUtils'
import { PERSON_TYPE_OPTIONS, deletePerson, listPersons } from '../lib/personnesApi'
import '../styles/Agences.css'

const typeLabelMap = Object.fromEntries(PERSON_TYPE_OPTIONS.map((o) => [o.value, o.label]))

/* Ce composant affiche la liste des personnes avec une recherche unique par nom ou telephone. */
const PersonsList = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [persons, setPersons] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [openActionId, setOpenActionId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || '')

  useEffect(() => {
    let cancelled = false

    const loadPersons = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const data = await listPersons()
        if (!cancelled) setPersons(data)
      } catch (error) {
        if (!cancelled) setErrorMessage(`Chargement impossible : ${error.message}`)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadPersons()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!location.state?.successMessage) return
    window.history.replaceState({}, document.title)
  }, [location.state])

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (event.target instanceof Element && !event.target.closest('.agencies-actions-menu')) {
        setOpenActionId('')
      }
    }
    const handleEscape = (event) => { if (event.key === 'Escape') setOpenActionId('') }

    document.addEventListener('mousedown', handleDocumentClick)
    window.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const filteredPersons = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    const normalizedPhoneQuery = searchQuery.trim().replace(/\s+/g, '')

    if (!normalizedQuery && !normalizedPhoneQuery) return persons

    return persons.filter((p) => {
      const fullName = (p.nom_complet || '').toLowerCase()
      const phone = (p.telephone ?? '').replace(/\s+/g, '')

      return fullName.includes(normalizedQuery) || phone.includes(normalizedPhoneQuery)
    })
  }, [persons, searchQuery])

  const getFullName = (p) => p.nom_complet || 'Sans nom'

  const handleDelete = async (idPersonne) => {
    const isConfirmed = window.confirm('Confirmer la suppression de cette personne ?')
    if (!isConfirmed) return

    try {
      await deletePerson(idPersonne)
      setOpenActionId('')
      setPersons((previous) => previous.filter((item) => item.id_personne !== idPersonne))
    } catch (error) {
      setErrorMessage(error.message || 'Suppression impossible.')
    }
  }

  return (
    <section className="agencies-page fade-in" aria-label="Liste des personnes">
      <header className="agencies-header">
        <div>
          <h1>Gestion des personnes</h1>
          <p>Consultez et administrez les expediteurs et destinataires enregistres.</p>
        </div>

        <Button
          className="agencies-add-btn"
          type="button"
          variant="primary"
          icon={<IconPlus size={18} />}
          onClick={() => navigate('/dashboard/personnes/nouvelle')}
        >
          Ajouter personne
        </Button>
      </header>

      <div className="agencies-toolbar persons-toolbar">
        <Input
          label="Rechercher (nom ou telephone)"
          placeholder="Ex: Mutombo ou +243..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); if (successMessage) setSuccessMessage('') }}
          icon={<IconSearch size={18} />}
          variant="search"
        />
      </div>

      {errorMessage && (
        <p className="agencies-alert agencies-alert-error" role="alert">{errorMessage}</p>
      )}
      {successMessage && !errorMessage && (
        <p className="agencies-alert agencies-alert-success" role="status">{successMessage}</p>
      )}

      <article className="agencies-table-card">
        <div className="agencies-table-head persons-table-head" aria-hidden="true">
          <span>Personne</span>
          <span>Telephone</span>
          <span>Type</span>
          <span>Adresse</span>
          <span>Action</span>
        </div>

        <div className="agencies-table-body">
          {isLoading && (
            <article className="agencies-empty-state" aria-live="polite">
              <IconUser size={24} color="var(--color-primary)" />
              <h3>Chargement des personnes...</h3>
            </article>
          )}

          {!isLoading && filteredPersons.map((person) => (
            <article className="agencies-row persons-row" key={person.id_personne}>
              <span className="agencies-main-cell">
                <strong>{getFullName(person)}</strong>
              </span>
              <span>{person.telephone || 'Non renseigne'}</span>
              <span>
                <em className={`agencies-status-chip type-chip-${(person.type_personne ?? '').toLowerCase()}`}>
                  {typeLabelMap[person.type_personne] ?? person.type_personne ?? '—'}
                </em>
              </span>
              <span>{formatAddressLabel(person.adresse)}</span>
              <span className="agencies-actions-menu-shell">
                <div className="agencies-actions-menu">
                  <button
                    type="button"
                    className="agencies-actions-trigger"
                    aria-label="Ouvrir les actions"
                    aria-expanded={openActionId === person.id_personne}
                    onClick={() =>
                      setOpenActionId((current) =>
                        current === person.id_personne ? '' : person.id_personne,
                      )
                    }
                  >
                    <IconMoreVertical size={18} />
                  </button>
                  {openActionId === person.id_personne && (
                    <div className="agencies-actions-dropdown" role="menu">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpenActionId('')
                          navigate(`/dashboard/personnes/${person.id_personne}/modifier`)
                        }}
                      >
                        Détails
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpenActionId('')
                          navigate(`/dashboard/personnes/${person.id_personne}/modifier`)
                        }}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="danger"
                        onClick={() => handleDelete(person.id_personne)}
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </span>

              <div className="agencies-actions-expanded">
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/personnes/${person.id_personne}/modifier`)}
                >
                  Détails
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/personnes/${person.id_personne}/modifier`)}
                >
                  Modifier
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => handleDelete(person.id_personne)}
                >
                  Supprimer
                </button>
              </div>
            </article>
          ))}

          {!isLoading && filteredPersons.length === 0 && (
            <article className="agencies-empty-state" aria-live="polite">
              <IconUser size={24} color="var(--color-primary)" />
              <h3>Aucune personne trouvee</h3>
              <p>Essayez un autre nom ou numero de telephone.</p>
            </article>
          )}
        </div>
      </article>
    </section>
  )
}

export default PersonsList
