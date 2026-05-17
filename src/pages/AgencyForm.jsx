import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { IconOffice } from '../components/ui/Icons'
import AddressFormSection from '../components/forms/AddressFormSection'
import {
  AGENCY_STATUS_OPTIONS,
  createAgency,
  getAgencyById,
  listAddresses,
  updateAgency,
} from '../lib/agencesApi'
import { createEmptyAddress, trimAddress, validateAddress } from '../lib/addressUtils'
import '../styles/Agences.css'

/* Ce composant gere la creation et la modification d une agence avec adresse existante ou nouvelle. */
const AgencyForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
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
  const [useNewAddress, setUseNewAddress] = useState(!isEditMode)
  const [addressForm, setAddressForm] = useState(createEmptyAddress())
  const [addressErrors, setAddressErrors] = useState({})

  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      setIsLoading(isEditMode)
      setErrorMessage('')

      try {
        // Chercher d'abord dans le state de navigation
        let agency = location.state?.agency
        console.log('[AgencyForm] État reçu via navigation:', agency)
        
        const [addresses] = await Promise.all([
          listAddresses(),
        ])

        if (cancelled) return

        setAddressOptions(addresses)

        // Si pas de données du state et en mode édition, essayer l'API
        if (!agency && isEditMode) {
          console.log(`[AgencyForm] Chargement agence ID: ${agencyId}`)
          agency = await getAgencyById(agencyId)
          console.log('[AgencyForm] Agence chargée via API:', agency)
        } else if (agency) {
          console.log('[AgencyForm] Agence obtenue du state de navigation')
        }

        if (agency) {
          setNomAgence(agency.nom_agence ?? '')
          setCodeAgence(agency.code_agence ?? '')
          setTelephone(agency.telephone ?? '')
          setStatus(agency.status ?? 'ACTIVE')
          setSelectedAddressId(agency.ref_adresse ?? '')
          setAddressForm(agency.adresse ? trimAddress(agency.adresse) : createEmptyAddress())
          setUseNewAddress(false)
        } else if (isEditMode) {
          setErrorMessage('Agence introuvable.')
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
  }, [agencyId, isEditMode, location.state])

  const clearMessages = () => {
    if (errorMessage) setErrorMessage('')
    if (successMessage) setSuccessMessage('')
  }

  const handleAddressFieldChange = (field, value) => {
    clearMessages()
    if (Object.keys(addressErrors).length > 0) setAddressErrors({})
    setAddressForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    let cleanedAddress = trimAddress(addressForm)
    if (useNewAddress) {
      const validation = validateAddress(cleanedAddress)
      if (!validation.isValid) {
        setAddressErrors(validation.errors)
        setSuccessMessage('')
        setErrorMessage('Veuillez corriger les informations d adresse.')
        return
      }

      cleanedAddress = validation.cleanedAddress
    }

    const payload = {
      nom_agence: nomAgence.trim(),
      code_agence: codeAgence.trim().toUpperCase(),
      telephone: telephone.trim(),
      status,
      ref_adresse: useNewAddress ? null : selectedAddressId || null,
      adresse: useNewAddress ? cleanedAddress : null,
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
    <section className="agencies-form-page full-width-header-page fade-in" aria-label={isEditMode ? 'Modification agence' : 'Creation agence'}>
      <header className="agencies-header user-form-header">
        <div className="user-form-header-main">
          <h1>{isEditMode ? 'Modification agence' : 'Nouvelle agence'}</h1>
          <p>
            {isEditMode
              ? 'Mettez a jour les informations de l agence et son rattachement d adresse.'
              : 'Enregistrez une agence et associez une adresse existante ou une nouvelle adresse.'}
          </p>
        </div>

        <div className="user-form-header-actions">
          <Button className="user-form-header-action-btn" variant="outline" type="button" icon={null} onClick={() => navigate('/dashboard/agences')}>
            Retour a la liste
          </Button>
        </div>
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

        <AddressFormSection
          title="Adresse associee"
          description="Selectionnez une adresse existante ou creez-en une nouvelle pour cette agence."
          addresses={addressOptions}
          selectedAddressId={selectedAddressId}
          useNewAddress={useNewAddress}
          addressValue={addressForm}
          addressErrors={addressErrors}
          onUseNewAddressChange={(nextValue) => {
            clearMessages()
            if (Object.keys(addressErrors).length > 0) setAddressErrors({})
            setUseNewAddress(nextValue)
          }}
          onSelectAddressId={(nextValue) => {
            clearMessages()
            setSelectedAddressId(nextValue)
          }}
          onAddressFieldChange={handleAddressFieldChange}
        />

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