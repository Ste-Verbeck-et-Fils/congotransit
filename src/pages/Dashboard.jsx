import React from 'react'
import { IconBox, IconTruck, IconPin, IconPlus } from '../components/ui/Icons'
import '../styles/Dashboard.css'

/* ── Données ───────────────────────────────────────────────── */
const KPIS = [
  { icon: <IconBox size={20} color="var(--color-primary)" />,  label: 'Total colis',   value: '1 284', trend: '+18%', up: true  },
  { icon: <IconTruck size={20} color="#f59e0b" />,             label: 'En transit',    value: '342',   trend: '+5%',  up: true  },
  { icon: <IconPin size={20} color="#2b6623" />,               label: 'Livrés',        value: '891',   trend: '+22%', up: true  },
]

const BAR_DATA = [
  { label: 'Lun', value: 42 },
  { label: 'Mar', value: 68 },
  { label: 'Mer', value: 55 },
  { label: 'Jeu', value: 81 },
  { label: 'Ven', value: 74 },
  { label: 'Sam', value: 33 },
  { label: 'Dim', value: 20 },
]

const todayLabel = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date())

/* ── Graphique à barres SVG ─────────────────────────────────── */
const BarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.value))
  const H = 120
  const BAR_W = 28
  const GAP = 16
  const W = data.length * (BAR_W + GAP) - GAP

  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} width="100%" style={{ overflow: 'visible' }}>
      {data.map((d, i) => {
        const barH = (d.value / max) * H
        const x = i * (BAR_W + GAP)
        const y = H - barH
        return (
          <g key={i}>
            {/* Barre fond */}
            <rect x={x} y={0} width={BAR_W} height={H} rx={6} fill="#f2f4f3" />
            {/* Barre valeur */}
            <rect x={x} y={y} width={BAR_W} height={barH} rx={6} fill="var(--color-primary)" opacity={0.85}>
              <animate attributeName="height" from="0" to={barH} dur="0.6s" fill="freeze" />
              <animate attributeName="y" from={H} to={y} dur="0.6s" fill="freeze" />
            </rect>
            {/* Label jour */}
            <text x={x + BAR_W / 2} y={H + 16} textAnchor="middle" fontSize="10" fill="#9ca3af" fontFamily="Inter,sans-serif">
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

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

    {/* Graphique */}
    <div className="dash-grid">

      {/* Graphique à barres */}
      <div className="card-panel">
        <p className="panel-title">Colis enregistrés cette semaine</p>
        <div className="chart-wrap">
          <BarChart data={BAR_DATA} />
        </div>
      </div>

    </div>
  </div>
)

export default Dashboard
