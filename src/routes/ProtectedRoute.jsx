import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { getCurrentRole, getPostLoginRoute, isAuthenticated } from '../lib/authSession'

/* Ce composant bloque l'acces aux routes privees sans session valide. */
const ProtectedRoute = ({ allowedRoles = null }) => {
  const authenticated = isAuthenticated()
  const currentRole = getCurrentRole()

  if (!authenticated) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    return <Navigate to={getPostLoginRoute(currentRole)} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
