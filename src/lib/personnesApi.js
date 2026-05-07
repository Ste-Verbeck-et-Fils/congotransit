import { apiRequest } from './api'

export const PERSON_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Actif' },
  { value: 'INACTIVE', label: 'Inactif' },
  { value: 'SUSPENDED', label: 'Suspendu' },
]

export async function listPersons() {
  const data = await apiRequest('/personnes')
  return data.persons ?? []
}

export async function getPersonById(idPersonne) {
  const data = await apiRequest(`/personnes/${idPersonne}`)
  return data.person
}

export async function createPerson(payload) {
  return apiRequest('/personnes', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updatePerson(idPersonne, payload) {
  return apiRequest(`/personnes/${idPersonne}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
