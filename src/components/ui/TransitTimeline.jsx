import React from 'react'
import './TransitTimeline.css'

const TransitTimeline = ({ steps }) => {
  return (
    <div className="timeline-container">
      <h4 className="timeline-label">SUIVI DE TRANSIT</h4>
      <div className="timeline-list">
        {steps.map((step, index) => (
          <div key={index} className={`timeline-item ${step.status}`}>
            <div className="timeline-marker">
              <div className="marker-dot">
                {step.icon}
              </div>
              {index < steps.length - 1 && <div className="marker-line"></div>}
            </div>
            <div className="timeline-content">
              <h5 className="step-title">{step.title}</h5>
              <p className="step-subtitle">{step.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TransitTimeline
