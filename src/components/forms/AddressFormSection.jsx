import React, { useMemo } from 'react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { IconPin, IconPlus } from '../ui/Icons'
import { formatAddressLabel } from '../../lib/addressUtils'

const ADDRESS_SELECT_OPTIONS = [
  { value: '', label: 'Aucune adresse associee' },
  { value: '__new__', label: 'Creer une nouvelle adresse' },
]

/* Ce composant affiche un bloc adresse reutilisable avec selection ou creation. */
const AddressFormSection = ({
  title = 'Adresse associee',
  description = 'Selectionnez une adresse existante ou creez-en une nouvelle.',
  addresses = [],
  selectedAddressId = '',
  useNewAddress = false,
  addressValue,
  addressErrors = {},
  onUseNewAddressChange,
  onSelectAddressId,
  onAddressFieldChange,
}) => {
  const selectOptions = useMemo(
    () => [
      ...ADDRESS_SELECT_OPTIONS,
      ...addresses.map((address) => ({
        value: address.id_adresse,
        label: formatAddressLabel(address),
      })),
    ],
    [addresses],
  )

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id_adresse === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  )

  const handleAddressSelect = (event) => {
    const nextValue = event.target.value

    if (nextValue === '__new__') {
      onUseNewAddressChange(true)
      onSelectAddressId('')
      return
    }

    onUseNewAddressChange(false)
    onSelectAddressId(nextValue)
  }

  return (
    <article className="card agencies-card">
      <div className="agencies-section-title-row">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <button
          type="button"
          className="agencies-inline-toggle"
          onClick={() => {
            const nextUseNew = !useNewAddress
            onUseNewAddressChange(nextUseNew)
            if (nextUseNew) onSelectAddressId('')
          }}
        >
          <IconPlus size={16} />
          <span>{useNewAddress ? 'Utiliser une adresse existante' : 'Nouvelle adresse'}</span>
        </button>
      </div>

      <div className="agencies-divider" aria-hidden="true" />

      <Select
        label="Adresse existante"
        value={useNewAddress ? '__new__' : selectedAddressId}
        onChange={handleAddressSelect}
        options={selectOptions}
        icon={<IconPin size={18} />}
      />

      {!useNewAddress && selectedAddress && (
        <div className="agencies-address-preview" aria-live="polite">
          <strong>Adresse selectionnee</strong>
          <p>{formatAddressLabel(selectedAddress)}</p>
        </div>
      )}

      {useNewAddress && (
        <>
          <div className="agencies-address-grid">
            <Input label="Province" value={addressValue.province} onChange={(event) => onAddressFieldChange('province', event.target.value)} />
            <Input label="Ville" value={addressValue.ville} onChange={(event) => onAddressFieldChange('ville', event.target.value)} />
            <Input label="Commune" value={addressValue.commune} onChange={(event) => onAddressFieldChange('commune', event.target.value)} />
            <Input label="Quartier" value={addressValue.quartier} onChange={(event) => onAddressFieldChange('quartier', event.target.value)} />
            <Input label="Avenue" value={addressValue.avenue} onChange={(event) => onAddressFieldChange('avenue', event.target.value)} />
            <Input label="Numero" value={addressValue.numero} onChange={(event) => onAddressFieldChange('numero', event.target.value)} />
            <div className="agencies-address-grid-full">
              <Input label="Repere" value={addressValue.repere} onChange={(event) => onAddressFieldChange('repere', event.target.value)} />
            </div>
          </div>

          {(addressErrors.form || addressErrors.ville) && (
            <p className="agencies-alert agencies-alert-error" role="alert">
              {addressErrors.form || addressErrors.ville}
            </p>
          )}
        </>
      )}
    </article>
  )
}

export default AddressFormSection
