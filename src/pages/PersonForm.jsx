import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import AddressFormSection from '../components/forms/AddressFormSection'
import { createEmptyAddress, trimAddress, validateAddress } from '../lib/addressUtils'
import { listAddresses } from '../lib/agencesApi'
import { PERSON_TYPE_OPTIONS, createPerson, getPersonById, updatePerson } from '../lib/personnesApi'
import '../styles/Agences.css'

const phoneRegex = /^\+?[0-9]{8,15}$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* Ce composant gere la creation et la modification d une personne (expediteur ou destinataire). */
const PersonForm = () => {
  const navigate = useNavigate()
  const { personId } = useParams()
  const isEditMode = Boolean(personId)

  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [nom, setNom] = useState('')
  const [postnom, setPostnom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [typePersonne, setTypePersonne] = useState('EXPEDITEUR')

  const [addressOptions, setAddressOptions] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [useNewAddress, setUseNewAddress] = useState(!isEditMode)
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
          setNom(person.nom ?? '')
          setPostnom(person.postnom ?? '')
          setPrenom(person.prenom ?? '')
          setTelephone(person.telephone ?? '')
          setEmail(person.email ?? '')
          setTypePersonne(person.type_personne ?? 'EXPEDITEUR')
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

    const cleanNom = nom.trim()
    const cleanTelephone = telephone.replace(/\s+/g, '')
    const cleanEmail = email.trim()

    if (!cleanNom || !cleanTelephone) {
      setErrorMessage('Le nom et le telephone sont obligatoires.')
      return
    }

    if (!phoneRegex.test(cleanTelephone)) {
      setErrorMessage('Veuillez saisir un numero de telephone valide.')
      return
    }

    if (cleanEmail && !emailRegex.test(cleanEmail)) {
      setErrorMessage('Veuillez saisir une adresse email valide.')
      return
    }

    let cleanedAddress = trimAddress(addressForm)
    if (useNewAddress) {
      const validation = validateAddress(cleanedAddress)
      if (!validation.isValid) {
        setAddressErrors(validation.errors)
        setErrorMessage('Veuillez corriger les informations d adresse.')
        return
      }
      cleanedAddress = validation.cleanedAddress
    }

    const payload = {
      nom: cleanNom,
      postnom: postnom.trim(),
      prenom: prenom.trim(),
      telephone: cleanTelephone,
      email: cleanEmail || null,
      type_personne: typePersonne,
      ref_adresse: useNewAddress ? null : selectedAddressId || null,
      adresse: useNewAddress ? cleanedAddress : null,
    }

    setIsSubmitting(true)
    clearMessages()

    try {
      const response = isEditMode
        ? await updatePerson(personId, payload)
        : await createPerson(payload)

      setSuccessMessage(response.message ?? (isEditMode ? 'Modifications enregistrees.' : 'Personne creee.'))
      setErrorMessage('')
      setAddressErrors({})

      if (!isEditMode) {
        setTimeout(
          () => navigate('/dashboard/personnes', { state: { successMessage: response.message ?? 'Personne creee.' } }),
          800,
        )
      }
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="agencies-form-page fade-in" aria-label={isEditMode ? 'Modification personne' : 'Nouvelle personne'}>
      <header className="agencies-header">
        <div>
          <h1>{isEditMode ? 'Modifier la personne' : 'Nouvelle personne'}</h1>
          <p>
            {isEditMode
              ? 'Mettez a jour les informations de la personne.'
              : 'Enregistrez un expediteur ou destinataire et associez-lui une adresse.'}
          </p>
        </div>

        <Button variant="outline" type="button" icon={null} onClick={() => navigate('/dashboard/personnes')}>
          Retour
        </Button>
      </header>

      <form className="agencies-form-stack" onSubmit={handleSubmit}>
        <article className="card agencies-card">
          <h2>Identite</h2>
          <div className="agencies-divider" aria-hidden="true" />

          <div className="agencies-grid-two">
            <Input
              label="Nom *"
              placeholder="Ex: Mutombo"
              value={nom}
              onChange={(e) => { setNom(e.target.value); clearMessages() }}
            />
            <Input
              label="Postnom"
              placeholder="Ex: Kabila"
              value={postnom}
              onChange={(e) => { setPostnom(e.target.value); clearMessages() }}
            />
            <Input
              label="Prenom"
              placeholder="Ex: Jean"
              value={prenom}
              onChange={(e) => { setPrenom(e.target.value); clearMessages() }}
            />
            <Input
              label="Telephone *"
              type="tel"
              placeholder="+243 990 000 000"
              value={telephone}
              onChange={(e) => { setTelephone(e.target.value); clearMessages() }}
            />
            <Input
              label="Email"
              type="email"
              placeholder="jean@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearMessages() }}
            />
            <Select
              label="Type de personne"
              value={typePersonne}
              onChange={(e) => { setTypePersonne(e.target.value); clearMessages() }}
              options={PERSON_TYPE_OPTIONS}
            />
          </div>
        </article>

        <AddressFormSection
          title="Adresse"
          description="Selectionnez une adresse existante ou saisissez-en une nouvelle."
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
