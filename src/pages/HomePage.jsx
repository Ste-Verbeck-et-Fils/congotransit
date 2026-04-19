import React from 'react'
import { IconBox, IconTruck, IconPin } from '../components/ui/Icons'
import './HomePage.css'

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

const SHIPMENTS = [
  { ref: 'LQ-382-K9', route: 'Kinshasa → Goma',       status: 'transit',    date: '19 Avr' },
  { ref: 'LQ-301-B2', route: 'Lubumbashi → Kinshasa',  status: 'livré',      date: '18 Avr' },
  { ref: 'LQ-298-X1', route: 'Matadi → Mbuji-Mayi',    status: 'en attente', date: '17 Avr' },
  { ref: 'LQ-274-C5', route: 'Kisangani → Bukavu',     status: 'anomalie',   date: '16 Avr' },
  { ref: 'LQ-265-A7', route: 'Goma → Beni',            status: 'livré',      date: '15 Avr' },
]

const STATUS = {
  'transit':    { label: 'En transit',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  'livré':      { label: 'Livré',       color: '#16a34a', bg: 'rgba(22,163,74,0.1)'   },
  'en attente': { label: 'En attente',  color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
  'anomalie':   { label: 'Anomalie',    color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
}

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
const HomePage = () => (
  <div className="dash fade-in">

    {/* KPIs */}
    <div className="kpi-row">
      {KPIS.map((k, i) => (
        <div className="kpi" key={i}>
          <div className="kpi-icon">{k.icon}</div>
          <div>
            <p className="kpi-val">{k.value}</p>
            <p className="kpi-lbl">{k.label}</p>
          </div>
          <span className={`kpi-badge ${k.up ? 'up' : 'down'}`}>{k.trend}</span>
        </div>
      ))}
    </div>

    {/* Graphique + Liste */}
    <div className="dash-grid">

      {/* Graphique à barres */}
      <div className="card-panel">
        <p className="panel-title">Colis enregistrés cette semaine</p>
        <div className="chart-wrap">
          <BarChart data={BAR_DATA} />
        </div>
      </div>

      {/* Derniers colis */}
      <div className="card-panel">
        <p className="panel-title">Derniers colis</p>
        <ul className="ship-list">
          {SHIPMENTS.map((s, i) => {
            const st = STATUS[s.status]
            return (
              <li className="ship-row" key={i}>
                <div className="ship-dot" style={{ background: st.color }} />
                <div className="ship-info">
                  <span className="ship-ref">{s.ref}</span>
                  <span className="ship-route">{s.route}</span>
                </div>
                <div className="ship-right">
                  <span className="ship-badge" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                  <span className="ship-date">{s.date}</span>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

    </div>
  </div>
)

export default HomePage
