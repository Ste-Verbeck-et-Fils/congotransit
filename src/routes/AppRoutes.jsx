import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '../layout/MainLayout.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import Home from '../pages/Home.jsx'
import Login from '../pages/Login.jsx'
import Contact from '../pages/Contact.jsx'

const PlaceholderPage = ({ title, description }) => (
  <section className="placeholder-page fade-in">
    <div>
      <p className="placeholder-kicker">Module</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
    <button type="button">Ajouter</button>
  </section>
)

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route
          path="expedients"
          element={<PlaceholderPage title="Expeditions" description="Gerez les colis, expediteurs et destinataires depuis un espace dedie." />}
        />
        <Route
          path="trajet"
          element={<PlaceholderPage title="Suivi trajet" description="Consultez les mouvements, etapes et anomalies de transit." />}
        />
        <Route
          path="profil"
          element={<PlaceholderPage title="Profil" description="Mettez a jour les informations du compte et les preferences de securite." />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default AppRoutes
