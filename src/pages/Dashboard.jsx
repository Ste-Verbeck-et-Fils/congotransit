import React from 'react'
import { IconBox, IconTruck, IconPin, IconPlus } from '../components/ui/Icons'
import '../styles/Dashboard.css'

/* ── Données ───────────────────────────────────────────────── */
const KPIS = [
  { icon: <IconBox size={20} color="var(--color-primary)" />,  label: 'Total colis',   value: '1 284', trend: '+18%', up: true  },
  { icon: <IconTruck size={20} color="#f59e0b" />,             label: 'En transit',    value: '342',   trend: '+5%',  up: true  },
  { icon: <IconPin size={20} color="#2b6623" />,               label: 'Livrés',        value: '891',   trend: '+22%', up: true  },
]

const FLOW_DATA = [
  { label: 'Enregistrement', value: 284, percent: 72, color: 'var(--color-primary)' },
  { label: 'Transit actif', value: 342, percent: 58, color: '#f59e0b' },
  { label: 'Livraison', value: 891, percent: 86, color: '#2b6623' },
]

const todayLabel = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date())

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
const Dashboard = () => (
  <div className="dash fade-in">
    <div className="dash-header">
      <div>
        <h1 className="dash-title">Tableau de bord</h1>
        <p className="dash-sub">Vue rapide de l'activite colis et transit</p>
      </div>
      <div className="dash-header-actions">
        <span className="dash-date">{todayLabel}</span>
        <button className="dash-action" type="button">
          <IconPlus size={17} />
          <span>Nouveau colis</span>
        </button>
      </div>
    </div>

    {/* KPIs */}
    <div className="kpi-row">
      {KPIS.map((k) => (
        <div className="kpi" key={k.label}>
          <div className="kpi-icon">{k.icon}</div>
          <div>
            <p className="kpi-val">{k.value}</p>
            <p className="kpi-lbl">{k.label}</p>
          </div>
          <span className={`kpi-badge ${k.up ? 'up' : 'down'}`}>{k.trend}</span>
        </div>
      ))}
    </div>

    <div className="dash-grid">
      <div className="card-panel">
        <p className="panel-title">Flux operationnel des colis</p>
        <TransitFlow data={FLOW_DATA} />
      </div>
    </div>
  </div>
)

export default Dashboard
