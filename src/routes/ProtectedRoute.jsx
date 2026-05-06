import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { isAuthenticated } from '../lib/authSession'

/* Ce composant bloque l'acces aux routes privees sans session valide. */
const ProtectedRoute = () => {
  const authenticated = isAuthenticated()

  return authenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute
