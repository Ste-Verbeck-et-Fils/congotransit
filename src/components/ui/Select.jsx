import React from 'react'
import './Select.css'
import { IconPlus } from './Icons'

const Select = ({ label, options, value, onChange, icon, withAdd = false, onAdd }) => {
  return (
    <div className="select-container">
      {label && <label className="select-label">{label}</label>}
      <div className="select-row">
        <div className="select-wrapper">
          {icon && <span className="select-icon">{icon}</span>}
          <select value={value} onChange={onChange} className="select-field">
            {options.map((option, index) => (
              <option key={index} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        {withAdd && (
          <button className="select-add-btn" onClick={onAdd} type="button">
            <IconPlus size={20} />
          </button>
        )}
      </div>
    </div>
  )
}

export default Select
