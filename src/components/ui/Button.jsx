import React from 'react'
import './Button.css'
import { IconBox, IconPencil, IconExport } from './Icons'

const Button = ({ children, variant = 'primary', onClick, className = '', type = 'button' }) => {
  return (
    <button 
      className={`btn btn-${variant} ${className}`} 
      onClick={onClick} 
      type={type}
    >
      {variant === 'primary' && <span className="btn-icon"><IconBox size={18} /></span>}
      {variant === 'secondary' && <span className="btn-icon"><IconPencil size={18} /></span>}
      {variant === 'outline' && <span className="btn-icon"><IconExport size={18} /></span>}
      <span className="btn-text">{children}</span>
    </button>
  )
}

export default Button
