import { apiRequest } from './api'

export const AGENCY_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'SUSPENDED', label: 'Suspendue' },
]

export const EMPTY_ADDRESS = {
  province: '',
  ville: '',
  commune: '',
  quartier: '',
  avenue: '',
  numero: '',
  repere: '',
}

const joinParts = (parts) => parts.filter(Boolean).join(', ')

export const formatAddressLabel = (address) => {
  if (!address) return 'Adresse non renseignee'

  const primary = joinParts([address.ville, address.commune, address.quartier])
  const secondary = joinParts([address.avenue, address.numero, address.province])
  const repere = address.repere?.trim()

  return [primary, secondary, repere].filter(Boolean).join(' - ') || 'Adresse non renseignee'
}

export async function listAgencies() {
  const data = await apiRequest('/agences')
  return data.agencies ?? []
}

export async function getAgencyById(idAgence) {
  const data = await apiRequest(`/agences/${idAgence}`)
  return data.agency
}

export async function createAgency(payload) {
  const data = await apiRequest('/agences', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return data
}

export async function updateAgency(idAgence, payload) {
  const data = await apiRequest(`/agences/${idAgence}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

  return data
}

export async function listAddresses() {
  const data = await apiRequest('/adresses')
  return data.addresses ?? []
}