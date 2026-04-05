import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '../layout/MainLayout.jsx'
import HomePage from '../pages/HomePage.jsx'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        {/* Placeholder routes for others */}
        <Route path="expedients" element={<div>Expédients Page</div>} />
        <Route path="trajet" element={<div>Trajet Page</div>} />
        <Route path="profil" element={<div>Profil Page</div>} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default AppRoutes
