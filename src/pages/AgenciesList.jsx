import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { IconMoreVertical, IconOffice, IconPlus, IconSearch, IconDownload, IconPrinter } from '../components/ui/Icons'
import { deleteAgency, formatAddressLabel, listAgencies } from '../lib/agencesApi'
import * as XLSX from 'xlsx'
import '../styles/Agences.css'

/* Ce composant affiche la liste des agences avec recherche et acces aux actions admin. */
const AgenciesList = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [agencies, setAgencies] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [openActionId, setOpenActionId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || '')

  useEffect(() => {
    let cancelled = false

    const loadAgencies = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const data = await listAgencies()
        if (!cancelled) setAgencies(data)
      } catch (error) {
        if (!cancelled) setErrorMessage(`Chargement impossible : ${error.message}`)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadAgencies()

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

  const normalizedSearch = searchTerm.trim().toLowerCase()

  const handleDelete = async (idAgence) => {
    const isConfirmed = window.confirm('Confirmer la suppression de cette agence ?')
    if (!isConfirmed) return

    try {
      await deleteAgency(idAgence)
      setOpenActionId('')
      setAgencies((previous) => previous.filter((item) => item.id_agence !== idAgence))
    } catch (error) {
      setErrorMessage(error.message || 'Suppression impossible.')
    }
  }

  const filteredAgencies = useMemo(() => {
    if (!normalizedSearch) return agencies

    return agencies.filter((agency) => {
      const haystack = [
        agency.nom_agence,
        agency.code_agence,
        agency.telephone,
        agency.status,
        formatAddressLabel(agency.adresse),
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [agencies, normalizedSearch])

  const exportToExcel = () => {
    const rows = filteredAgencies.map(item => ({
      'Nom Agence': item.nom_agence || '-',
      'Code': item.code_agence || '-',
      'Téléphone': item.telephone || '-',
      'Statut': item.status || '-',
      'Adresse': formatAddressLabel(item.adresse)
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Agences')
    XLSX.writeFile(workbook, 'etats_sortie_agences.xlsx')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <section className="agencies-page fade-in" aria-label="Liste des agences">
      <header className="agencies-header">
        <div>
          <h1>Liste des agences</h1>
          <p>Consultez les agences actives et accedez rapidement aux formulaires de gestion.</p>
        </div>

        <Button
          className="agencies-add-btn"
          type="button"
          variant="primary"
          icon={<IconPlus size={18} />}
          onClick={() => navigate('/dashboard/agences/nouvelle')}
        >
          Ajouter agence
        </Button>
      </header>

      <div className="agencies-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <Input
            label="Rechercher une agence"
            placeholder="Nom, code, telephone, statut, adresse..."
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value)
              if (successMessage) setSuccessMessage('')
            }}
            icon={<IconSearch size={18} />}
            variant="search"
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }} className="no-print">
          <Button
            type="button"
            variant="secondary"
            icon={<IconDownload size={18} />}
            onClick={exportToExcel}
            title="Exporter Excel"
          >
            Excel
          </Button>
          <Button
            type="button"
            variant="secondary"
            icon={<IconPrinter size={18} />}
            onClick={handlePrint}
            title="Imprimer PDF"
          >
            PDF
          </Button>
        </div>
      </div>

      {errorMessage && (
        <p className="agencies-alert agencies-alert-error" role="alert">{errorMessage}</p>
      )}

      {successMessage && !errorMessage && (
        <p className="agencies-alert agencies-alert-success" role="status">{successMessage}</p>
      )}

      <article className="agencies-table-card">
        <div className="agencies-table-head" aria-hidden="true">
          <span>Agence</span>
          <span>Code</span>
          <span>Telephone</span>
          <span>Statut</span>
          <span>Adresse</span>
          <span>Action</span>
        </div>

        <div className="agencies-table-body">
          {isLoading && (
            <article className="agencies-empty-state" aria-live="polite">
              <IconOffice size={24} color="var(--color-primary)" />
              <h3>Chargement des agences...</h3>
            </article>
          )}

          {!isLoading && filteredAgencies.map((agency) => (
            <article className="agencies-row" key={agency.id_agence}>
              <span className="agencies-main-cell">
                <strong>{agency.nom_agence}</strong>
              </span>
              <span>{agency.code_agence}</span>
              <span>{agency.telephone || 'Non renseigne'}</span>
              <span>
                <em className={`agencies-status-chip status-${agency.status.toLowerCase()}`}>{agency.status}</em>
              </span>
              <span>{formatAddressLabel(agency.adresse)}</span>
              <span className="agencies-actions-menu-shell">
                <div className="agencies-actions-menu">
                  <button
                    type="button"
                    className="agencies-actions-trigger"
                    aria-label="Ouvrir les actions"
                    aria-expanded={openActionId === agency.id_agence}
                    onClick={() => setOpenActionId((current) => (current === agency.id_agence ? '' : agency.id_agence))}
                  >
                    <IconMoreVertical size={18} />
                  </button>
                  {openActionId === agency.id_agence && (
                    <div className="agencies-actions-dropdown" role="menu">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpenActionId('')
                          navigate(`/dashboard/agences/${agency.id_agence}`, { state: { agency } })
                        }}
                      >
                        Voir
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpenActionId('')
                          navigate(`/dashboard/agences/${agency.id_agence}/modifier`, { state: { agency } })
                        }}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="danger"
                        onClick={() => handleDelete(agency.id_agence)}
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
                  onClick={() => navigate(`/dashboard/agences/${agency.id_agence}`, { state: { agency } })}
                >
                  Détails
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/agences/${agency.id_agence}/modifier`, { state: { agency } })}
                >
                  Modifier
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => handleDelete(agency.id_agence)}
                >
                  Supprimer
                </button>
              </div>
            </article>
          ))}

          {!isLoading && filteredAgencies.length === 0 && (
            <article className="agencies-empty-state" aria-live="polite">
              <IconOffice size={24} color="var(--color-primary)" />
              <h3>Aucune agence trouvee</h3>
              <p>Essayez un autre mot-cle ou creez une nouvelle agence.</p>
            </article>
          )}
        </div>
      </article>
    </section>
  )
}

export default AgenciesList