/* Ce composant affiche le tableau de bord avec des statistiques reelles de l'API. */
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconBox, IconTruck, IconPin, IconPlus } from '../components/ui/Icons'
import { getCurrentRole } from '../lib/authSession'
import { getDashboardOverview } from '../lib/expeditionsApi'
import '../styles/Dashboard.css'

const STATUS_LABELS = {
  EXPEDIE: 'Expedie',
  EN_TRANSIT: 'En transit',
  LIVRE: 'Livre',
  ANNULE: 'Annule',
  NON_RECUPERE: 'Non recupere',
  PERDU: 'Perdu',
}

const getStatusLabel = (status) => STATUS_LABELS[String(status ?? '').toUpperCase()] ?? status ?? 'Inconnu'

const TransitFlow = ({ data }) => (
  <div className="flow-chart" aria-label="Progression des colis">
    {data.map((item) => (
      <div className="flow-item" key={item.label}>
        <div className="flow-meta">
          <span className="flow-label">{item.label}</span>
          <strong className="flow-value">{item.value}</strong>
        </div>
        <div className="flow-track" aria-hidden="true">
          <span
            className="flow-fill"
            style={{
              '--flow-color': item.color,
              '--flow-width': `${item.percent}%`,
            }}
          />
        </div>
      </div>
    ))}
  </div>
)

/* ── Dashboard ──────────────────────────────────────────────── */
const Dashboard = () => {
  const navigate = useNavigate()
  const role = getCurrentRole()
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [overview, setOverview] = useState(null)

  useEffect(() => {
    let active = true

    const loadOverview = async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')
        const data = await getDashboardOverview()
        if (!active) return
        setOverview(data)
      } catch (error) {
        if (!active) return
        setErrorMessage(error.message || 'Impossible de charger les statistiques du dashboard.')
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadOverview()
    return () => {
      active = false
    }
  }, [])

  const flowData = useMemo(() => {
    const byStatus = overview?.by_status ?? {}
    const percentages = overview?.status_percentages ?? {}
    return [
      {
        label: 'Expedie',
        value: byStatus.EXPEDIE ?? 0,
        percent: percentages.EXPEDIE ?? 0,
        color: 'var(--color-primary)',
      },
      {
        label: 'Transit actif',
        value: byStatus.EN_TRANSIT ?? 0,
        percent: percentages.EN_TRANSIT ?? 0,
        color: '#f59e0b',
      },
      {
        label: 'Livraison',
        value: byStatus.LIVRE ?? 0,
        percent: percentages.LIVRE ?? 0,
        color: '#2b6623',
      },
    ]
  }, [overview])

  const kpis = useMemo(
    () => [
      {
        icon: <IconBox size={20} color="var(--color-primary)" />,
        label: 'Total colis',
        value: overview?.total_colis ?? 0,
        trend: `${overview?.status_percentages?.EXPEDIE ?? 0}% expedie`,
      },
      {
        icon: <IconTruck size={20} color="#f59e0b" />,
        label: 'En transit',
        value: overview?.by_status?.EN_TRANSIT ?? 0,
        trend: `${overview?.status_percentages?.EN_TRANSIT ?? 0}%`,
      },
      {
        icon: <IconPin size={20} color="#2b6623" />,
        label: 'Livres',
        value: overview?.by_status?.LIVRE ?? 0,
        trend: `${overview?.status_percentages?.LIVRE ?? 0}%`,
      },
    ],
    [overview],
  )

  const recentExpeditions = overview?.recent_expeditions ?? []

  return (
  <div className="dash fade-in">
    <div className="dash-header">
      <div>
        <h1 className="dash-title">Tableau de bord</h1>
        <p className="dash-sub">Vue reelle de l'activite colis et transit ({overview?.scope || role})</p>
      </div>
      {(role === 'ADMIN' || role === 'AGENT') && (
      <div className="dash-header-actions">
        <button className="dash-action" type="button" onClick={() => navigate('/dashboard/expedients/nouveau')}>
          <IconPlus size={17} />
          <span>Ajouter une expedition</span>
        </button>
      </div>
      )}
    </div>

    {isLoading && <p className="dash-feedback">Chargement des statistiques...</p>}
    {!isLoading && errorMessage && <p className="dash-feedback dash-feedback-error" role="alert">{errorMessage}</p>}

    {/* KPIs */}
    {!isLoading && !errorMessage && (
    <>
    <div className="kpi-row">
      {kpis.map((k) => (
        <div className="kpi" key={k.label}>
          <div className="kpi-icon">{k.icon}</div>
          <div>
            <p className="kpi-val">{k.value}</p>
            <p className="kpi-lbl">{k.label}</p>
          </div>
          <span className="kpi-badge up">{k.trend}</span>
        </div>
      ))}
    </div>

    <div className="dash-grid">
      <div className="card-panel">
        <p className="panel-title">Flux operationnel des colis</p>
        <TransitFlow data={flowData} />
      </div>

      <div className="card-panel">
        <p className="panel-title">Dernieres expeditions</p>
        {recentExpeditions.length === 0 ? (
          <p className="dash-empty">Aucune expedition recente.</p>
        ) : (
          <div className="dash-recent-list">
            {recentExpeditions.map((item) => (
              <button
                key={item.code_suivi}
                type="button"
                className="dash-recent-item"
                onClick={() => navigate(`/dashboard/expedients/${item.code_suivi}`)}
              >
                <span><strong>{item.code_suivi}</strong></span>
                <span>{getStatusLabel(item.status)}</span>
                <span>{new Date(item.date_expedition).toLocaleDateString('fr-FR')}</span>
                <span>{item.agence_depart_nom || '-'}</span>
                <span>{item.agence_destination_nom || '-'}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
    )}
  </div>
  )
}

export default Dashboard
