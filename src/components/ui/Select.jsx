import React, { useId } from 'react'
import './Select.css'
import { IconPlus } from './Icons'

const Select = ({ id, label, options, value, onChange, icon, withAdd = false, onAdd }) => {
  const generatedId = useId()
  const selectId = id || generatedId

  return (
    <div className="select-container">
      {label && <label className="select-label" htmlFor={selectId}>{label}</label>}
      <div className="select-row">
        <div className="select-wrapper">
          {icon && <span className="select-icon">{icon}</span>}
          <select id={selectId} value={value} onChange={onChange} className="select-field">
            {options.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
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
