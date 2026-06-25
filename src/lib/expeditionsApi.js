import { apiRequest } from './api'

export async function listExpeditions() {
  const data = await apiRequest('/expeditions')
  return data.expeditions ?? []
}

export async function listClientExpeditions() {
  const data = await apiRequest('/expeditions/me')
  return data.expeditions ?? []
}

export async function getDashboardOverview() {
  const data = await apiRequest('/dashboard/stats')
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
  const data = await apiRequest(`/tracking/public/${encodeURIComponent(codeSuivi)}`)
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

export async function getExpeditionPayment(expeditionId) {
  const data = await apiRequest(`/paiements/expedition/${encodeURIComponent(expeditionId)}`)
  return data.paiement ?? null
}

export async function createExpeditionPayment(payload) {
  const data = await apiRequest('/paiements', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data
}

export async function listPayments() {
  const data = await apiRequest('/paiements')
  return data.payments ?? []
}
