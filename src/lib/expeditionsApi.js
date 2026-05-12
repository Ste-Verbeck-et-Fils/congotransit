import { apiRequest } from './api'

export async function listExpeditions() {
  const data = await apiRequest('/expeditions')
  return data.expeditions ?? []
}

export async function listClientExpeditions() {
  const data = await apiRequest('/clients/mes-expeditions')
  return data.expeditions ?? []
}

export async function getDashboardOverview() {
  const data = await apiRequest('/dashboard/overview')
  return data
}

export async function createExpedition(payload) {
  const data = await apiRequest('/expeditions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return data
}

export async function getExpeditionByCodeSuivi(codeSuivi) {
  const data = await apiRequest(`/expeditions/${encodeURIComponent(codeSuivi)}`)
  return data
}

export async function getPublicTrackingByCodeSuivi(codeSuivi) {
  const data = await apiRequest(`/public/tracking/${encodeURIComponent(codeSuivi)}`)
  return data
}

export async function updateExpeditionByCodeSuivi(codeSuivi, payload) {
  const data = await apiRequest(`/expeditions/${encodeURIComponent(codeSuivi)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

  return data
}

export async function deleteExpeditionByCodeSuivi(codeSuivi) {
  const data = await apiRequest(`/expeditions/${encodeURIComponent(codeSuivi)}`, {
    method: 'DELETE',
  })

  return data
}

export async function getExpeditionSuiviByCodeSuivi(codeSuivi) {
  const data = await apiRequest(`/expeditions/${encodeURIComponent(codeSuivi)}/suivi`)
  return data.suivi ?? []
}

export async function getExpeditionConfirmationByCodeSuivi(codeSuivi) {
  const data = await apiRequest(`/expeditions/${encodeURIComponent(codeSuivi)}/confirmation`)
  return data.confirmation ?? null
}

export async function createExpeditionConfirmationByCodeSuivi(codeSuivi, payload) {
  const data = await apiRequest(`/expeditions/${encodeURIComponent(codeSuivi)}/confirmation`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return data
}

export async function createExpeditionSuiviByCodeSuivi(codeSuivi, payload) {
  const data = await apiRequest(`/expeditions/${encodeURIComponent(codeSuivi)}/suivi`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return data
}
