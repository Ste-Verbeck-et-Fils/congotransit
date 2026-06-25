import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { IconSearch, IconBox, IconTimeline } from '../components/ui/Icons'
import { listPayments } from '../lib/expeditionsApi'
import '../styles/Expedients.css'

const PaymentsList = () => {
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [payments, setPayments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

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
          style={{ gridTemplateColumns: '1.2fr 1.2fr 1fr 1fr 1fr 1fr 1fr' }}
        >
          <span>Référence</span>
          <span>Expédition</span>
          <span>Montant</span>
          <span>Mode</span>
          <span>Statut</span>
          <span>Date</span>
          <span>Agent</span>
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
              style={{ gridTemplateColumns: '1.2fr 1.2fr 1fr 1fr 1fr 1fr 1fr', cursor: 'pointer' }}
              onClick={() => navigate(`/dashboard/expedients/${item.codeSuivi || item.refExpedition}`)}
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
            </article>
          ))}
        </div>
      </article>
    </section>
  )
}

export default PaymentsList
