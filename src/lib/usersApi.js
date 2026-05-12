import { apiRequest } from './api'

export const USER_ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Administrateur' },
  { value: 'AGENT', label: 'Agent' },
  { value: 'CLIENT', label: 'Client' },
]

export const USER_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Actif' },
  { value: 'INACTIVE', label: 'Inactif' },
  { value: 'SUSPENDED', label: 'Suspendu' },
]

const toQueryString = (filters = {}) => {
  const params = new URLSearchParams()

  if (filters.role_systeme) params.set('role_systeme', filters.role_systeme)
  if (filters.ref_agence) params.set('ref_agence', filters.ref_agence)

  const query = params.toString()
  return query ? `?${query}` : ''
}

export async function listUsers(filters = {}) {
  const data = await apiRequest(`/utilisateurs${toQueryString(filters)}`)
  return data.users ?? []
}

export async function getUserById(idUser) {
  const data = await apiRequest(`/utilisateurs/${idUser}`)
  return data.user
}

export async function createUser(payload) {
  return apiRequest('/utilisateurs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateUser(idUser, payload) {
  return apiRequest(`/utilisateurs/${idUser}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteUser(idUser) {
  return apiRequest(`/utilisateurs/${idUser}`, { method: 'DELETE' })
}
