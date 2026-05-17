import React from 'react'
import './Button.css'
import { IconBox, IconPencil, IconExport, IconArrowLeft, IconCheck, IconTrash } from './Icons'

const DEFAULT_ICONS = {
  primary: <IconBox size={18} />,
  secondary: <IconPencil size={18} />,
  outline: <IconExport size={18} />,
}

const CUSTOM_ICONS = {
  retour: <IconArrowLeft size={18} />,
  confirmer: <IconCheck size={18} />,
  supprimer: <IconTrash size={18} />,
}

const Button = ({
  children,
  variant = 'primary',
  onClick,
  className = '',
  type = 'button',
  icon,
  iconPosition = 'left',
  customIcon,
  ...props
}) => {
  const buttonIcon = customIcon ? CUSTOM_ICONS[customIcon] : icon === undefined ? DEFAULT_ICONS[variant] : icon

  return (
    <button 
      className={`btn btn-${variant} ${className}`} 
      onClick={onClick} 
      type={type}
      {...props}
    >
      {buttonIcon && iconPosition === 'left' && <span className="btn-icon">{buttonIcon}</span>}
      <span className="btn-text">{children}</span>
      {buttonIcon && iconPosition === 'right' && <span className="btn-icon">{buttonIcon}</span>}
    </button>
  )
}

export default Button
