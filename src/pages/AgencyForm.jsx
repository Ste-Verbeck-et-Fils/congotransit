import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { IconOffice, IconPin, IconPlus } from '../components/ui/Icons'
import {
  AGENCY_STATUS_OPTIONS,
  EMPTY_ADDRESS,
  createAgency,
  formatAddressLabel,
  getAgencyById,
  listAddresses,
  updateAgency,
} from '../lib/agencesApi'
import '../styles/Agences.css'

const ADDRESS_SELECT_OPTIONS = [
  { value: '', label: 'Aucune adresse associee' },
  { value: '__new__', label: 'Creer une nouvelle adresse' },
]

const trimObjectValues = (value) => Object.fromEntries(
  Object.entries(value).map(([key, currentValue]) => [key, String(currentValue ?? '').trim()]),
)

const hasAddressContent = (address) => Object.values(address).some(Boolean)

/* Ce composant gere la creation et la modification d une agence avec adresse existante ou nouvelle. */
const AgencyForm = () => {
  const navigate = useNavigate()
  const { agencyId } = useParams()
  const isEditMode = Boolean(agencyId)

  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [addressOptions, setAddressOptions] = useState([])

  const [nomAgence, setNomAgence] = useState('')
  const [codeAgence, setCodeAgence] = useState('')
  const [telephone, setTelephone] = useState('')
  const [status, setStatus] = useState('ACTIVE')
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [useNewAddress, setUseNewAddress] = useState(false)
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS)

  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      setIsLoading(isEditMode)
      setErrorMessage('')

      try {
        const [addresses, agency] = await Promise.all([
          listAddresses(),
          isEditMode ? getAgencyById(agencyId) : Promise.resolve(null),
        ])

        if (cancelled) return

        setAddressOptions(addresses)

        if (agency) {
          setNomAgence(agency.nom_agence ?? '')
          setCodeAgence(agency.code_agence ?? '')
          setTelephone(agency.telephone ?? '')
          setStatus(agency.status ?? 'ACTIVE')
          setSelectedAddressId(agency.ref_adresse ?? '')
          setAddressForm(agency.adresse ? trimObjectValues(agency.adresse) : EMPTY_ADDRESS)
          setUseNewAddress(false)
        }
      } catch (error) {
        if (!cancelled) setErrorMessage(`Chargement impossible : ${error.message}`)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [agencyId, isEditMode])

  const selectOptions = useMemo(
    () => [
      ...ADDRESS_SELECT_OPTIONS,
      ...addressOptions.map((address) => ({
        value: address.id_adresse,
        label: formatAddressLabel(address),
      })),
    ],
    [addressOptions],
  )

  const selectedAddress = useMemo(
    () => addressOptions.find((address) => address.id_adresse === selectedAddressId) ?? null,
    [addressOptions, selectedAddressId],
  )

  const clearMessages = () => {
    if (errorMessage) setErrorMessage('')
    if (successMessage) setSuccessMessage('')
  }

  const handleAddressSelect = (event) => {
    const nextValue = event.target.value
    clearMessages()

    if (nextValue === '__new__') {
      setUseNewAddress(true)
      setSelectedAddressId('')
      return
    }

    setUseNewAddress(false)
    setSelectedAddressId(nextValue)
  }

  const handleAddressFieldChange = (field) => (event) => {
    clearMessages()
    setAddressForm((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmedAddress = trimObjectValues(addressForm)
    const payload = {
      nom_agence: nomAgence.trim(),
      code_agence: codeAgence.trim().toUpperCase(),
      telephone: telephone.trim(),
      status,
      ref_adresse: useNewAddress ? null : selectedAddressId || null,
      adresse: useNewAddress && hasAddressContent(trimmedAddress) ? trimmedAddress : null,
    }

    if (!payload.nom_agence || !payload.code_agence) {
      setSuccessMessage('')
      setErrorMessage('Le nom de l agence et le code agence sont obligatoires.')
      return
    }

    setIsSubmitting(true)
    clearMessages()

    try {
      const response = isEditMode
        ? await updateAgency(agencyId, payload)
        : await createAgency(payload)

      setSuccessMessage(response.message)
      navigate('/dashboard/agences', {
        replace: true,
        state: { successMessage: response.message },
      })
    } catch (error) {
      setSuccessMessage('')
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="agencies-form-page fade-in" aria-label={isEditMode ? 'Modification agence' : 'Creation agence'}>
      <header className="agencies-header">
        <div>
          <h1>{isEditMode ? 'Modification agence' : 'Nouvelle agence'}</h1>
          <p>
            {isEditMode
              ? 'Mettez a jour les informations de l agence et son rattachement d adresse.'
              : 'Enregistrez une agence et associez une adresse existante ou une nouvelle adresse.'}
          </p>
        </div>

        <Button variant="outline" type="button" icon={null} onClick={() => navigate('/dashboard/agences')}>
          Retour a la liste
        </Button>
      </header>

      <form className="agencies-form-stack" onSubmit={handleSubmit}>
        <article className="card agencies-card">
          <h2>Informations generales</h2>
          <div className="agencies-divider" aria-hidden="true" />
          <div className="agencies-grid-two">
            <Input
              label="Nom agence"
              placeholder="Agence Goma Centre"
              value={nomAgence}
              onChange={(event) => {
                setNomAgence(event.target.value)
                clearMessages()
              }}
            />
            <Input
              label="Code agence"
              placeholder="GOM-CENTRE"
              value={codeAgence}
              onChange={(event) => {
                setCodeAgence(event.target.value.toUpperCase())
                clearMessages()
              }}
            />
          </div>
          <div className="agencies-grid-two">
            <Input
              label="Telephone"
              type="tel"
              placeholder="+243 990 000 000"
              value={telephone}
              onChange={(event) => {
                setTelephone(event.target.value)
                clearMessages()
              }}
            />
            <Select
              label="Status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value)
                clearMessages()
              }}
              options={AGENCY_STATUS_OPTIONS}
            />
          </div>
        </article>

        <article className="card agencies-card">
          <div className="agencies-section-title-row">
            <div>
              <h2>Adresse associee</h2>
              <p>Selectionnez une adresse existante ou creez-en une nouvelle pour cette agence.</p>
            </div>
            <button
              type="button"
              className="agencies-inline-toggle"
              onClick={() => {
                clearMessages()
                setUseNewAddress((current) => !current)
                if (!useNewAddress) setSelectedAddressId('')
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
            <div className="agencies-address-grid">
              <Input label="Province" value={addressForm.province} onChange={handleAddressFieldChange('province')} />
              <Input label="Ville" value={addressForm.ville} onChange={handleAddressFieldChange('ville')} />
              <Input label="Commune" value={addressForm.commune} onChange={handleAddressFieldChange('commune')} />
              <Input label="Quartier" value={addressForm.quartier} onChange={handleAddressFieldChange('quartier')} />
              <Input label="Avenue" value={addressForm.avenue} onChange={handleAddressFieldChange('avenue')} />
              <Input label="Numero" value={addressForm.numero} onChange={handleAddressFieldChange('numero')} />
              <div className="agencies-address-grid-full">
                <Input label="Repere" value={addressForm.repere} onChange={handleAddressFieldChange('repere')} />
              </div>
            </div>
          )}
        </article>

        {isLoading && (
          <article className="agencies-empty-state agencies-loading-state" aria-live="polite">
            <IconOffice size={24} color="var(--color-primary)" />
            <h3>Chargement du formulaire...</h3>
          </article>
        )}

        {errorMessage && <p className="agencies-alert agencies-alert-error" role="alert">{errorMessage}</p>}
        {successMessage && !errorMessage && <p className="agencies-alert agencies-alert-success" role="status">{successMessage}</p>}

        <Button className="btn-full agencies-submit-btn" type="submit" icon={null} disabled={isSubmitting || isLoading}>
          {isSubmitting ? 'Enregistrement...' : isEditMode ? 'Enregistrer les modifications' : 'Creer l agence'}
        </Button>
      </form>
    </section>
  )
}

export default AgencyForm