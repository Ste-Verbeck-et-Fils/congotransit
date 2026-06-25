import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { IconSearch, IconBox, IconTimeline, IconMoreVertical, IconDownload, IconPrinter } from '../components/ui/Icons'
import { listPayments, deletePayment, updatePayment } from '../lib/expeditionsApi'
import * as XLSX from 'xlsx'
import '../styles/Expedients.css'

const PaymentsList = () => {
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [payments, setPayments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  // State for actions dropdown and edit modal
  const [openActionId, setOpenActionId] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState(null)
  const [editForm, setEditForm] = useState({
    montant: 0,
    devise: 'USD',
    status: 'PAYE',
    referenceTransaction: '',
  })
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)
  const [editError, setEditError] = useState('')

  const normalizedSearch = searchTerm.trim().toLowerCase()

  const statusOptions = useMemo(
    () => [
      { value: '', label: 'Tous les status' },
      { value: 'PAYE', label: 'Payé' },
      { value: 'EN_ATTENTE', label: 'En attente' },
      { value: 'ANNULE', label: 'Annulé' },
      { value: 'ECHEC', label: 'Échec' },
    ],
    [],
  )

  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')
        const paymentsData = await listPayments()
        if (!cancelled) {
          setPayments(paymentsData)
        }
      } catch (error) {
        if (!cancelled) setErrorMessage(error.message || 'Impossible de charger les paiements.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [])

  // Close dropdown on click outside or Escape
  useEffect(() => {
    const handleDocumentClick = (event) => {
      const target = event.target
      if (target instanceof Element && !target.closest('.expeditions-actions-menu')) {
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

  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      // Filtre status
      if (filterStatus && item.status !== filterStatus) return false

      // Recherche par code, référence, agent
      if (!normalizedSearch) return true

      const dateLabel = new Date(item.updatedAt || item.createdAt).toLocaleDateString('fr-FR')
      const haystack = [
        item.id,
        item.refExpedition,
        item.codeSuivi,
        item.referenceTransaction,
        item.agentNom,
        item.status,
        dateLabel,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [payments, filterStatus, normalizedSearch])

  const getStatusLabel = (status) => {
    const statusMap = {
      PAYE: 'Payé',
      EN_ATTENTE: 'En attente',
      ANNULE: 'Annulé',
      ECHEC: 'Échec',
    }
    return statusMap[status] || status
  }

  const getStatusColorClass = (status) => {
    const map = {
      PAYE: 'status-livre', // green
      EN_ATTENTE: 'status-en-transit', // blue/orange
      ANNULE: 'status-annule', // red
      ECHEC: 'status-perdu', // dark red
    }
    return map[status] || 'status-default'
  }

  const handleDelete = async (paymentId, event) => {
    event.stopPropagation()
    const isConfirmed = window.confirm('Confirmer la suppression de ce paiement ? L\'expédition correspondante redeviendra non payée.')
    if (!isConfirmed) return

    try {
      await deletePayment(paymentId)
      setPayments((prev) => prev.filter((item) => item.id !== paymentId))
      setOpenActionId('')
    } catch (error) {
      setErrorMessage(error.message || 'Impossible de supprimer ce paiement.')
    }
  }

  const exportToExcel = () => {
    const rows = filteredPayments.map(item => ({
      'Référence': item.referenceTransaction || '-',
      'Expédition': item.codeSuivi || item.refExpedition || '-',
      'Montant': `${Number(item.montant || 0).toFixed(2)} ${item.devise}`,
      'Mode': item.modePaiement || '-',
      'Statut': getStatusLabel(item.status),
      'Date': new Date(item.updatedAt || item.createdAt).toLocaleDateString('fr-FR'),
      'Agent': item.agentNom || '-'
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Paiements')
    XLSX.writeFile(workbook, 'etats_sortie_paiements.xlsx')
  }

  const handlePrint = () => {
    window.print()
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    if (editForm.montant === undefined || editForm.montant === null || Number(editForm.montant) < 0) {
      setEditError('Le montant doit être supérieur ou égal à 0.')
      return
    }

    setIsSubmittingEdit(true)
    setEditError('')

    try {
      const updated = await updatePayment(editingPayment.id, {
        montant: Number(editForm.montant),
        devise: editForm.devise,
        status: editForm.status,
        reference_transaction: editForm.referenceTransaction,
      })

      setPayments((prev) =>
        prev.map((item) => {
          if (item.id === editingPayment.id) {
            return {
              ...item,
              montant: updated.paiement.montant,
              devise: updated.paiement.devise,
              status: updated.paiement.status,
              referenceTransaction: updated.paiement.referenceTransaction,
              updatedAt: updated.paiement.updatedAt || new Date().toISOString(),
            }
          }
          return item
        }),
      )

      setIsEditModalOpen(false)
      setOpenActionId('')
    } catch (error) {
      setEditError(error.message || 'Impossible de mettre à jour le paiement.')
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  return (
    <section className="expeditions-list-page fade-in" aria-label="Liste des paiements">
      <header className="expeditions-list-header">
        <div className="expeditions-header-title">
          <h1>Liste des paiements CASH</h1>
          <p>Consultez l'historique des encaissements et gérez les reçus de caisse.</p>
        </div>

        <div className="expeditions-header-controls">
          <div className="expeditions-header-search">
            <Input
              placeholder="Rechercher une transaction, un code..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
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
      </header>

      <div className="expeditions-toolbar">
        <Select
          label="Statut du paiement"
          value={filterStatus}
          onChange={(event) => setFilterStatus(event.target.value)}
          options={statusOptions}
        />
      </div>

      {errorMessage && <p className="expedients-error" role="alert">{errorMessage}</p>}

      <article className="expeditions-table-card">
        <div
          className="expeditions-table-head"
          aria-hidden="true"
          style={{ gridTemplateColumns: '1.2fr 1.2fr 1fr 1fr 1fr 1fr 1fr 0.8fr' }}
        >
          <span>Référence</span>
          <span>Expédition</span>
          <span>Montant</span>
          <span>Mode</span>
          <span>Statut</span>
          <span>Date</span>
          <span>Agent</span>
          <span>Actions</span>
        </div>

        <div className="expeditions-table-body">
          {isLoading && (
            <article className="expeditions-empty-state" aria-live="polite">
              <IconBox size={24} color="var(--color-primary)" />
              <h3>Chargement des paiements...</h3>
            </article>
          )}

          {!isLoading && filteredPayments.length === 0 && (
            <article className="expeditions-empty-state" aria-live="polite">
              <IconTimeline size={24} color="var(--color-text-muted)" />
              <h3>Aucun paiement trouvé</h3>
              <p>Essayez de modifier vos critères de recherche.</p>
            </article>
          )}

          {!isLoading && filteredPayments.map((item) => (
            <article
              className="expeditions-row"
              key={item.id}
              style={{ gridTemplateColumns: '1.2fr 1.2fr 1fr 1fr 1fr 1fr 1fr 0.8fr' }}
            >
              <span className="expeditions-main-cell">
                <strong className="code-badge" style={{ fontFamily: 'monospace' }}>
                  {item.referenceTransaction || 'N/A'}
                </strong>
              </span>
              <span>
                <strong className="code-badge" style={{ color: 'var(--color-primary)' }}>
                  {item.codeSuivi || 'N/A'}
                </strong>
              </span>
              <span className="cell-text" style={{ fontWeight: '700', color: 'var(--color-primary)' }}>
                {Number(item.montant || 0).toFixed(2)} {item.devise}
              </span>
              <span className="cell-text" style={{ fontSize: '0.85rem' }}>{item.modePaiement}</span>
              <span>
                <em className={`expeditions-status-chip ${getStatusColorClass(item.status)}`}>
                  {getStatusLabel(item.status)}
                </em>
              </span>
              <span className="cell-date">
                {new Date(item.updatedAt || item.createdAt).toLocaleDateString('fr-FR')}
              </span>
              <span className="cell-text" style={{ fontSize: '0.85rem' }}>{item.agentNom || '-'}</span>

              <span className="expeditions-actions-menu-shell" onClick={(event) => event.stopPropagation()}>
                <div className="expeditions-actions-menu">
                  <button
                    type="button"
                    className="expeditions-actions-trigger"
                    aria-label="Ouvrir les actions"
                    aria-expanded={openActionId === item.id}
                    onClick={(event) => {
                      event.stopPropagation()
                      setOpenActionId((current) => (current === item.id ? '' : item.id))
                    }}
                  >
                    <IconMoreVertical size={18} />
                  </button>
                  {openActionId === item.id && (
                    <div className="expeditions-actions-dropdown" role="menu" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpenActionId('')
                          navigate(`/dashboard/expedients/${item.codeSuivi || item.refExpedition}`)
                        }}
                      >
                        Détails
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setEditingPayment(item)
                          setEditForm({
                            montant: item.montant || 0,
                            devise: item.devise || 'USD',
                            status: item.status || 'PAYE',
                            referenceTransaction: item.referenceTransaction || '',
                          })
                          setEditError('')
                          setIsEditModalOpen(true)
                          setOpenActionId('')
                        }}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="danger"
                        onClick={(event) => handleDelete(item.id, event)}
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </span>
            </article>
          ))}
        </div>
      </article>

      {/* Edit Payment Modal */}
      {isEditModalOpen && editingPayment && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="modal-content"
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <header>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary)', margin: 0 }}>
                Modifier le paiement
              </h2>
            </header>

            {editError && <p className="expedients-error" role="alert">{editError}</p>}

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                type="number"
                step="0.01"
                label="Montant"
                value={editForm.montant}
                onChange={(e) => setEditForm((prev) => ({ ...prev, montant: e.target.value }))}
                disabled={isSubmittingEdit}
              />

              <Select
                label="Devise"
                value={editForm.devise}
                onChange={(e) => setEditForm((prev) => ({ ...prev, devise: e.target.value }))}
                options={[
                  { value: 'USD', label: 'USD (Dollar américain)' },
                  { value: 'CDF', label: 'CDF (Franc congolais)' },
                ]}
                disabled={isSubmittingEdit}
              />

              <Select
                label="Statut du paiement"
                value={editForm.status}
                onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                options={[
                  { value: 'PAYE', label: 'Payé' },
                  { value: 'EN_ATTENTE', label: 'En attente' },
                  { value: 'ANNULE', label: 'Annulé' },
                  { value: 'ECHEC', label: 'Échec' },
                ]}
                disabled={isSubmittingEdit}
              />

              <Input
                label="Référence Transaction"
                value={editForm.referenceTransaction}
                onChange={(e) => setEditForm((prev) => ({ ...prev, referenceTransaction: e.target.value }))}
                disabled={isSubmittingEdit}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSubmittingEdit}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmittingEdit}>
                  {isSubmittingEdit ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default PaymentsList
