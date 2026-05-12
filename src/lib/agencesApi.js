import { apiRequest } from './api'
import { createEmptyAddress } from './addressUtils'

export { formatAddressLabel } from './addressUtils'

export const AGENCY_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'SUSPENDED', label: 'Suspendue' },
]

export const EMPTY_ADDRESS = createEmptyAddress()

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

export async function deleteAgency(idAgence) {
  return apiRequest(`/agences/${idAgence}`, { method: 'DELETE' })
}