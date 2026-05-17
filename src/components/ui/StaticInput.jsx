// Affiche une valeur statique avec le même style qu'un Input mais en lecture seule
import React from 'react'
import './Input.css'

const StaticInput = ({ label, value, variant = 'default' }) => {
  return (
    <div className={`input-container input-${variant}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrapper" style={{ backgroundColor: 'transparent', border: 'none', padding: 0, minHeight: 'auto' }}>
        <span style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}>
          {value || '-'}
        </span>
      </div>
    </div>
  )
}

export default StaticInput
