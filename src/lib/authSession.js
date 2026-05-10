const AUTH_STORAGE_KEY = 'congotransit.auth'

const normalizeRole = (role) => {
  if (role === 'ADMIN' || role === 'AGENT' || role === 'CLIENT') return role
  return 'CLIENT'
}

const parseJSON = (rawValue) => {
  if (!rawValue) return null

  try {
    return JSON.parse(rawValue)
  } catch {
    return null
  }
}

export const readAuthSession = () => {
  if (typeof window === 'undefined' || !window.localStorage) return null

  const currentSession = parseJSON(localStorage.getItem(AUTH_STORAGE_KEY))
  if (currentSession?.jwtToken) {
    return {
      jwtToken: currentSession.jwtToken,
      id_utilisateur: currentSession.id_utilisateur ?? null,
      role_systeme: normalizeRole(currentSession.role_systeme),
      ref_agence: currentSession.ref_agence ?? null,
      telephone: currentSession.telephone ?? '',
      nom_affichage: currentSession.nom_affichage ?? '',
    }
  }

  const legacyToken = localStorage.getItem('congotransit.token')
  const legacyUser = parseJSON(localStorage.getItem('congotransit.user'))

  if (!legacyToken) return null

  return {
    jwtToken: legacyToken,
    id_utilisateur: legacyUser?.id_utilisateur ?? legacyUser?.id ?? null,
    role_systeme: normalizeRole(legacyUser?.role_systeme ?? legacyUser?.role),
    ref_agence: legacyUser?.ref_agence ?? null,
    telephone: legacyUser?.telephone ?? '',
    nom_affichage: legacyUser?.nom_affichage ?? legacyUser?.noms ?? '',
  }
}

export const saveAuthSession = ({ token, user }) => {
  if (typeof window === 'undefined' || !window.localStorage) return

  const session = {
    jwtToken: token,
    id_utilisateur: user?.id_utilisateur ?? user?.id ?? null,
    role_systeme: normalizeRole(user?.role_systeme ?? user?.role),
    ref_agence: user?.ref_agence ?? null,
    telephone: user?.telephone ?? '',
    nom_affichage: user?.nom_affichage ?? user?.noms ?? '',
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
  localStorage.removeItem('congotransit.token')
  localStorage.removeItem('congotransit.user')
}

export const getAccessToken = () => readAuthSession()?.jwtToken ?? ''

export const getCurrentRole = () => readAuthSession()?.role_systeme ?? 'CLIENT'

export const isAuthenticated = () => Boolean(getAccessToken())

export const clearAuthSession = () => {
  if (typeof window === 'undefined' || !window.localStorage) return

  localStorage.removeItem(AUTH_STORAGE_KEY)
  localStorage.removeItem('congotransit.token')
  localStorage.removeItem('congotransit.user')
}

export const getPostLoginRoute = (roleSysteme) => {
  if (roleSysteme === 'AGENT') return '/dashboard/expedients'
  if (roleSysteme === 'CLIENT') return '/dashboard/profil'
  return '/dashboard'
}
