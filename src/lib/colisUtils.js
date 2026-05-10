export const DEFAULT_COLIS_CATEGORIES = [
  { value: '', label: 'Choisir une categorie...' },
  { value: 'Documents', label: 'Documents' },
  { value: 'Electronique', label: 'Electronique' },
  { value: 'Vetements', label: 'Vetements' },
  { value: 'Alimentaire', label: 'Alimentaire' },
  { value: 'Fragile', label: 'Fragile' },
  { value: 'Autre', label: 'Autre' },
]

export const emptyColisDraft = () => ({
  description: '',
  categorie: '',
  poids: '',
  observations: '',
})

export function validateColisDraft(rawDraft = {}) {
  const draft = {
    description: String(rawDraft.description ?? '').trim(),
    categorie: String(rawDraft.categorie ?? '').trim(),
    poids: String(rawDraft.poids ?? '').trim(),
    observations: String(rawDraft.observations ?? '').trim(),
  }

  const errors = {}
  const poidsNumber = Number(draft.poids)

  if (!draft.description) errors.description = 'Description obligatoire.'
  if (!draft.categorie) errors.categorie = 'Categorie obligatoire.'
  if (!draft.poids || Number.isNaN(poidsNumber) || poidsNumber <= 0) {
    errors.poids = 'Poids invalide (> 0).'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalized: {
      ...draft,
      poids: draft.poids,
    },
  }
}

export function buildColisApiPayload(colisList = []) {
  return colisList.map((item) => ({
    description: String(item.description ?? '').trim(),
    categorie: String(item.categorie ?? '').trim(),
    poids: Number(item.poids),
    observations: String(item.observations ?? '').trim(),
  }))
}
