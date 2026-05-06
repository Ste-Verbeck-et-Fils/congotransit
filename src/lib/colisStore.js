/* Store localStorage pour la gestion des colis frontend */

const STORAGE_KEY = 'congotransit.colis'

const canUseStorage = () => typeof window !== 'undefined' && !!window.localStorage

const readColis = () => {
  if (!canUseStorage()) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeColis = (items) => {
  if (!canUseStorage()) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

const generateCodeColis = (items) => {
  const next = items.length + 1
  return `COL-${String(next).padStart(4, '0')}`
}

export const listColis = () => readColis()

export const getColisByCode = (code) =>
  readColis().find((item) => item.code_colis === code) || null

export const createColis = (payload) => {
  const items = readColis()
  const newColis = {
    id_colis: Date.now(),
    code_colis: generateCodeColis(items),
    ref_expedition: payload.ref_expedition,
    description: payload.description,
    categorie: payload.categorie,
    poids: Number(payload.poids),
    observations: payload.observations || '',
    createdAt: new Date().toISOString(),
  }
  writeColis([...items, newColis])
  return newColis
}

export const deleteColisByCode = (code) => {
  const items = readColis()
  const filtered = items.filter((item) => item.code_colis !== code)
  if (filtered.length === items.length) return false
  writeColis(filtered)
  return true
}
