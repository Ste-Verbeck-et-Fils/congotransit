/* Fonctions d acces a l API pour la gestion du profil de l utilisateur connecte. */
import { apiRequest } from './api'

export async function getMyProfile() {
  const data = await apiRequest('/profil')
  return data.user
}

export async function getMyPerson() {
  const data = await apiRequest('/profil/personne')
  return data.person ?? null
}

export async function updateMyProfile(payload) {
  return apiRequest('/profil', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function changeMyPassword(payload) {
  return apiRequest('/profil/mot-de-passe', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
