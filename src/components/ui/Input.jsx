import React, { useId } from 'react'
import './Input.css'

const Input = ({
  id,
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  icon,
  rightElement,
  variant = 'default',
  ...inputProps
}) => {
  const generatedId = useId()
  const inputId = id || generatedId

  return (
    <div className={`input-container input-${variant}`}>
      {label && <label className="input-label" htmlFor={inputId}>{label}</label>}
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input 
          id={inputId}
          type={type} 
          placeholder={placeholder} 
          value={value} 
          onChange={onChange}
          className="input-field"
          {...inputProps}
        />
        {rightElement}
      </div>
    </div>
  )
}

export default Input
