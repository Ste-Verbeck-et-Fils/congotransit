import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import AddressFormSection from '../components/forms/AddressFormSection'
import { createEmptyAddress, trimAddress, validateAddress } from '../lib/addressUtils'
import { listAddresses } from '../lib/agencesApi'
import { PERSON_STATUS_OPTIONS, createPerson, getPersonById, updatePerson } from '../lib/personnesApi'
import '../styles/Agences.css'

const phoneRegex = /^\+?[0-9]{8,15}$/

/* Ce composant gere la creation et la modification d une personne avec adresse reutilisable. */
const PersonForm = () => {
  const navigate = useNavigate()
  const { personId } = useParams()
  const isEditMode = Boolean(personId)

  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [nomComplet, setNomComplet] = useState('')
  const [telephone, setTelephone] = useState('')
  const [status, setStatus] = useState('ACTIVE')

  const [addressOptions, setAddressOptions] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [useNewAddress, setUseNewAddress] = useState(false)
  const [addressForm, setAddressForm] = useState(createEmptyAddress())
  const [addressErrors, setAddressErrors] = useState({})

  const clearMessages = () => {
    if (errorMessage) setErrorMessage('')
    if (successMessage) setSuccessMessage('')
  }

  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      setIsLoading(isEditMode)
      setErrorMessage('')

      try {
        const [addresses, person] = await Promise.all([
          listAddresses(),
          isEditMode ? getPersonById(personId) : Promise.resolve(null),
        ])

        if (cancelled) return

        setAddressOptions(addresses)

        if (person) {
          setNomComplet(person.nom_complet ?? '')
          setTelephone(person.telephone ?? '')
          setStatus(person.status ?? 'ACTIVE')
          setSelectedAddressId(person.ref_adresse ?? '')
          setAddressForm(person.adresse ? trimAddress(person.adresse) : createEmptyAddress())
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
  }, [isEditMode, personId])

  const handleAddressFieldChange = (field, value) => {
    clearMessages()
    if (Object.keys(addressErrors).length > 0) setAddressErrors({})
    setAddressForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const cleanNomComplet = nomComplet.trim()
    const cleanTelephone = telephone.replace(/\s+/g, '')

    if (!cleanNomComplet || !cleanTelephone) {
      setSuccessMessage('')
      setErrorMessage('Le nom complet et le telephone sont obligatoires.')
      return
    }

    if (!phoneRegex.test(cleanTelephone)) {
      setSuccessMessage('')
      setErrorMessage('Veuillez saisir un numero de telephone valide.')
      return
    }

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
      nom_complet: cleanNomComplet,
      telephone: cleanTelephone,
      status,
      ref_adresse: useNewAddress ? null : selectedAddressId || null,
      adresse: useNewAddress ? cleanedAddress : null,
    }

    setIsSubmitting(true)
    clearMessages()

    try {
      const response = isEditMode
        ? await updatePerson(personId, payload)
        : await createPerson(payload)

      setSuccessMessage(response.message)
      setErrorMessage('')
      setAddressErrors({})
    } catch (error) {
      setSuccessMessage('')
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="agencies-form-page fade-in" aria-label={isEditMode ? 'Modification personne' : 'Nouvelle personne'}>
      <header className="agencies-header">
        <div>
          <h1>{isEditMode ? 'Modification personne' : 'Nouvelle personne'}</h1>
          <p>
            {isEditMode
              ? 'Mettez a jour les informations de la personne et son adresse.'
              : 'Enregistrez une personne et associez une adresse existante ou nouvelle.'}
          </p>
        </div>

        <Button variant="outline" type="button" icon={null} onClick={() => navigate('/dashboard')}>
          Retour
        </Button>
      </header>

      <form className="agencies-form-stack" onSubmit={handleSubmit}>
        <article className="card agencies-card">
          <h2>Informations personne</h2>
          <div className="agencies-divider" aria-hidden="true" />

          <div className="agencies-grid-two">
            <Input
              label="Nom complet"
              placeholder="Ex: Jean Mutombo"
              value={nomComplet}
              onChange={(event) => {
                setNomComplet(event.target.value)
                clearMessages()
              }}
            />
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
          </div>

          <Select
            label="Status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              clearMessages()
            }}
            options={PERSON_STATUS_OPTIONS}
          />
        </article>

        <AddressFormSection
          title="Adresse personne"
          description="Selectionnez une adresse existante ou saisissez une nouvelle adresse pour cette personne."
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
            <h3>Chargement du formulaire...</h3>
          </article>
        )}

        {errorMessage && <p className="agencies-alert agencies-alert-error" role="alert">{errorMessage}</p>}
        {successMessage && !errorMessage && <p className="agencies-alert agencies-alert-success" role="status">{successMessage}</p>}

        <Button className="btn-full agencies-submit-btn" type="submit" icon={null} disabled={isSubmitting || isLoading}>
          {isSubmitting ? 'Enregistrement...' : isEditMode ? 'Enregistrer les modifications' : 'Creer la personne'}
        </Button>
      </form>
    </section>
  )
}

export default PersonForm
