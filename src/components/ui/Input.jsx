import React from 'react'
import './Input.css'

const Input = ({ label, placeholder, type = 'text', value, onChange, icon, variant = 'default' }) => {
  return (
    <div className={`input-container input-${variant}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input 
          type={type} 
          placeholder={placeholder} 
          value={value} 
          onChange={onChange}
          className="input-field"
        />
      </div>
    </div>
  )
}

export default Input
