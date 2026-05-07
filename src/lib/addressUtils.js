export const createEmptyAddress = () => ({
  province: '',
  ville: '',
  commune: '',
  quartier: '',
  avenue: '',
  numero: '',
  repere: '',
})

export const trimAddress = (address = {}) => ({
  province: String(address.province ?? '').trim(),
  ville: String(address.ville ?? '').trim(),
  commune: String(address.commune ?? '').trim(),
  quartier: String(address.quartier ?? '').trim(),
  avenue: String(address.avenue ?? '').trim(),
  numero: String(address.numero ?? '').trim(),
  repere: String(address.repere ?? '').trim(),
})

export const hasAddressContent = (address = {}) =>
  Object.values(trimAddress(address)).some(Boolean)

const joinParts = (parts) => parts.filter(Boolean).join(', ')

export const formatAddressLabel = (address) => {
  if (!address) return 'Adresse non renseignee'

  const primary = joinParts([address.ville, address.commune, address.quartier])
  const secondary = joinParts([address.avenue, address.numero, address.province])
  const repere = String(address.repere ?? '').trim()

  return [primary, secondary, repere].filter(Boolean).join(' - ') || 'Adresse non renseignee'
}

export const validateAddress = (address, { required = true } = {}) => {
  const cleanedAddress = trimAddress(address)
  const errors = {}

  if (required && !hasAddressContent(cleanedAddress)) {
    errors.form = 'Veuillez renseigner au moins une information d adresse.'
  }

  if (hasAddressContent(cleanedAddress) && !cleanedAddress.ville) {
    errors.ville = 'La ville est obligatoire pour une nouvelle adresse.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    cleanedAddress,
  }
}
