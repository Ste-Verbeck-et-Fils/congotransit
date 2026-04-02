import React from 'react'
import './Card.css'
import { IconBox, IconTruck, IconPhone, IconMessage } from './Icons'

export const InfoCard = ({ title, details }) => {
  return (
    <div className="card info-card">
      <div className="card-header">
        <span className="card-icon"><IconTruck size={18} /></span>
        <h3 className="card-title">{title}</h3>
      </div>
      <div className="card-body">
        {details.map((detail, index) => (
          <div key={index} className="detail-row">
            <span className="detail-label">{detail.label}</span>
            <span className="detail-value">{detail.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export const ProfileCard = ({ name, role, avatar }) => {
  return (
    <div className="card profile-card">
      <div className="profile-wrapper">
        <div className="profile-avatar">
          {avatar ? <img src={avatar} alt={name} /> : <div className="avatar-placeholder">{name.charAt(0)}</div>}
        </div>
        <div className="profile-info">
          <h4 className="profile-name">{name}</h4>
          <p className="profile-role">{role}</p>
          <div className="profile-actions">
            <span><IconPhone size={18} color="var(--color-primary)" /></span>
            <span><IconMessage size={18} color="var(--color-primary-optimized)" /></span>
          </div>
        </div>
      </div>
    </div>
  )
}

export const StatsCard = ({ icon, label, value, trend }) => {
  return (
    <div className="card stats-card">
      <div className="stats-header">
        <div className="stats-icon">
          {icon === '📦' ? <IconBox size={18} color="var(--color-primary)" /> : icon}
        </div>
        <div className="stats-label">{label}</div>
      </div>
      <div className="stats-body">
        <span className="stats-value">{value}</span>
        {trend && <span className="stats-trend">+{trend}%</span>}
      </div>
    </div>
  )
}
