const STORAGE_KEY = 'congotransit.expeditions'

const defaultExpeditions = [
  {
    numero: 'EXP-2026-001',
    expediteurNom: 'Societes Kivu SARL',
    destinataireNom: 'Aru Central Market',
    agenceDepartNom: 'Goma',
    agenceArriveeNom: 'Aru',
    dateExpedition: '2026-05-02',
    statut: 'En preparation',
    colis: [{ type: 'Electronique', poids: 12.5, valeur: 450 }],
    montantTotal: 450,
    observations: 'Manipulation delicate requise.',
  },
  {
    numero: 'EXP-2026-002',
    expediteurNom: 'Mbiza Business',
    destinataireNom: 'Beni Distribution',
    agenceDepartNom: 'Bukavu',
    agenceArriveeNom: 'Beni',
    dateExpedition: '2026-05-03',
    statut: 'Planifiee',
    colis: [
      { type: 'Textile', poids: 8.2, valeur: 190 },
      { type: 'Pieces auto', poids: 18.4, valeur: 320 },
    ],
    montantTotal: 510,
    observations: 'Livraison prioritaire.',
  },
]

const canUseStorage = () => typeof window !== 'undefined' && !!window.localStorage

const parseStoredExpeditions = (rawValue) => {
  if (!rawValue) return defaultExpeditions

  try {
    const parsed = JSON.parse(rawValue)
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultExpeditions
    return parsed
  } catch {
    return defaultExpeditions
  }
}

const readExpeditions = () => {
  if (!canUseStorage()) return defaultExpeditions

  const items = parseStoredExpeditions(localStorage.getItem(STORAGE_KEY))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  return items
}

const writeExpeditions = (items) => {
  if (!canUseStorage()) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

const buildNextNumber = (items) => {
  const year = new Date().getFullYear()
  const prefix = `EXP-${year}-`
  const maxCounter = items
    .map((item) => item.numero)
    .filter((numero) => typeof numero === 'string' && numero.startsWith(prefix))
    .map((numero) => Number(numero.split('-').at(-1) || '0'))
    .reduce((max, value) => (Number.isNaN(value) ? max : Math.max(max, value)), 0)

  return `${prefix}${String(maxCounter + 1).padStart(3, '0')}`
}

export const listExpeditions = () => {
  const items = readExpeditions()
  return [...items].sort((a, b) => new Date(b.dateExpedition) - new Date(a.dateExpedition))
}

export const getExpeditionByNumero = (numero) => {
  const items = readExpeditions()
  return items.find((item) => item.numero === numero) || null
}

export const createExpedition = (payload) => {
  const items = readExpeditions()
  const numero = buildNextNumber(items)
  const montantTotal = payload.colis.reduce((sum, item) => sum + Number(item.valeur || 0), 0)

  const created = {
    numero,
    statut: 'En preparation',
    ...payload,
    montantTotal,
  }

  writeExpeditions([...items, created])
  return created
}
