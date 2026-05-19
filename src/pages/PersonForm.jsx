import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import StaticInput from '../components/ui/StaticInput'
import AddressFormSection from '../components/forms/AddressFormSection'
import { createEmptyAddress, formatAddressLabel, trimAddress, validateAddress } from '../lib/addressUtils'
import { listAddresses } from '../lib/agencesApi'
import { createPerson, getPersonById, updatePerson } from '../lib/personnesApi'
import '../styles/Agences.css'

const phoneRegex = /^\+?[0-9]{8,15}$/

const splitFullName = (fullName = '') => {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return { nom: '', postnom: '', prenom: '' }
  if (parts.length === 1) return { nom: parts[0], postnom: '', prenom: '' }
  if (parts.length === 2) return { nom: parts[0], postnom: '', prenom: parts[1] }

  return {
    nom: parts[0],
    postnom: parts.slice(1, -1).join(' '),
    prenom: parts[parts.length - 1],
  }
}

const pickFirstAddressFromPerson = (personne = {}) => {
  const possibleSources = [
    personne?.adresse,
    personne?.address,
    personne?.adressePersonne,
    personne?.adresse_personne,
    personne?.addressPerson,
    personne?.addresses,
    personne?.adresses,
    personne?.personne?.adresse,
    personne?.personne?.address,
    personne?.personne?.addresses,
    personne?.person?.adresse,
    personne?.person?.address,
    personne?.person?.addresses,
  ]

  for (const source of possibleSources) {
    if (Array.isArray(source) && source.length > 0) {
      const firstAddress = source[0]
      if (firstAddress && typeof firstAddress === 'object') return firstAddress
      continue
    }

    if (source && typeof source === 'object') {
      return source
    }
  }

  const flatAddress = {
    province: personne?.province ?? personne?.addr_province ?? '',
    ville: personne?.ville ?? personne?.city ?? '',
    commune: personne?.commune ?? '',
    quartier: personne?.quartier ?? '',
    avenue: personne?.avenue ?? '',
    numero: personne?.numero ?? personne?.number ?? '',
    repere: personne?.repere ?? personne?.landmark ?? '',
  }

  if (Object.values(flatAddress).some((value) => String(value).trim() !== '')) {
    return flatAddress
  }

  return null
}

const pickAddressRefFromPerson = (personne = {}) => {
  const candidates = [
    personne?.ref_adresse,
    personne?.refAdresse,
    personne?.adresse_id,
    personne?.address_id,
    personne?.id_adresse,
    personne?.personne?.ref_adresse,
    personne?.personne?.refAdresse,
    personne?.person?.ref_adresse,
    personne?.person?.refAdresse,
  ]

  const value = candidates.find((candidate) => candidate !== null && candidate !== undefined && String(candidate).trim() !== '')
  return value ? String(value).trim() : ''
}

/* Ce composant gere la creation et la modification d une personne (expediteur ou destinataire). */
const PersonForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { personId } = useParams()
  const isDetailMode = Boolean(personId) && !location.pathname.endsWith('/modifier')
  const isEditMode = Boolean(personId)

  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [nom, setNom] = useState('')
  const [postnom, setPostnom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [telephone, setTelephone] = useState('')
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
      setIsLoading(Boolean(personId))
      setErrorMessage('')

      try {
        let addresses = []

        if (!personId && !isDetailMode) {
          addresses = await listAddresses()
          if (!cancelled) setAddressOptions(addresses)
          return
        }

        if (personId || !isDetailMode) {
          addresses = await listAddresses()
          if (!cancelled) setAddressOptions(addresses)
        }

        // Chercher d'abord si les données viennent du state de navigation
        let person = location.state?.person

        console.log('[PersonForm] État reçu via navigation:', person)

        // Si pas de données du state, essayer l'API
        if (!person && personId) {
          console.log(`[PersonForm] Chargement personne ID: ${personId}`)
          person = await getPersonById(personId)
          console.log('[PersonForm] Personne chargée via API:', person)
        } else if (person) {
          console.log('[PersonForm] Personne obtenue du state de navigation')
        }

        if (cancelled) return

        if (person) {
          const personne = person
          console.log(personne)

          const parsedFullName = splitFullName(person.nom_complet ?? person.nomComplet)
          const addressRef = pickAddressRefFromPerson(personne)
          const addressFromRef = addressRef
            ? addresses.find((item) => String(item.id_adresse ?? item.id ?? '').trim() === addressRef)
            : null
          const resolvedAddress = pickFirstAddressFromPerson(personne) ?? addressFromRef

          console.log('[PersonForm] Adresse recue:', resolvedAddress)
          console.log('[PersonForm] ref_adresse:', addressRef)

          setNom(person.nom ?? parsedFullName.nom)
          setPostnom(person.postnom ?? parsedFullName.postnom)
          setPrenom(person.prenom ?? parsedFullName.prenom)
          setTelephone(person.telephone ?? '')
          setTypePersonne(person.type_personne ?? 'EXPEDITEUR')
          setSelectedAddressId(addressRef)

          const addressToSet = resolvedAddress ? trimAddress(resolvedAddress) : createEmptyAddress()
          console.log('[PersonForm] addressToSet:', addressToSet)
          setAddressForm(addressToSet)
          setUseNewAddress(false)
        } else if (!cancelled) {
          console.warn('[PersonForm] Personne non trouvée pour ID:', personId)
          setErrorMessage('Personne introuvable.')
        }
      } catch (error) {
        console.error('[PersonForm] Erreur de chargement:', error)
        if (!cancelled) setErrorMessage(`Chargement impossible : ${error.message}`)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [personId, isDetailMode, location.state])

  const handleAddressFieldChange = (field, value) => {
    clearMessages()
    if (Object.keys(addressErrors).length > 0) setAddressErrors({})
    setAddressForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const cleanNom = nom.trim()
    const cleanPostnom = postnom.trim()
    const cleanPrenom = prenom.trim()
    const cleanTelephone = telephone.replace(/\s+/g, '')

    if (cleanNom.length < 2) {
      setErrorMessage('Le nom est obligatoire et doit contenir au moins 2 caracteres.')
      return
    }

    if (cleanPrenom.length < 2) {
      setErrorMessage('Le prenom est obligatoire et doit contenir au moins 2 caracteres.')
      return
    }

    if (!cleanTelephone) {
      setErrorMessage('Le telephone est obligatoire.')
      return
    }

    if (!phoneRegex.test(cleanTelephone)) {
      setErrorMessage('Veuillez saisir un numero de telephone valide.')
      return
    }

    const cleanNomComplet = [cleanNom, cleanPostnom, cleanPrenom].filter(Boolean).join(' ')

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
      nom_complet: cleanNomComplet,
      nom: cleanNom,
      postnom: cleanPostnom || null,
      prenom: cleanPrenom,
      telephone: cleanTelephone,
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
    <section
      className="agencies-form-page full-width-header-page fade-in"
      aria-label={isDetailMode ? 'Détails personne' : isEditMode ? 'Modification personne' : 'Nouvelle personne'}
    >
      <header className="agencies-header user-form-header">
        <div className="user-form-header-main">
          <h1>{isDetailMode ? 'Détails de la personne' : isEditMode ? 'Modifier la personne' : 'Nouvelle personne'}</h1>
          <p>
            {isDetailMode
              ? 'Consultez les informations de la personne en lecture seule.'
              : isEditMode
              ? 'Mettez a jour les informations de la personne.'
              : 'Enregistrez un expediteur ou destinataire et associez-lui une adresse.'}
          </p>
        </div>

        <div className="header-actions">
          <Button className="user-form-header-action-btn" variant="outline" type="button" icon={null} onClick={() => navigate('/dashboard/personnes')}>
            Retour
          </Button>
          {isDetailMode && (
            <Button
              className="user-form-header-action-btn"
              variant="primary"
              type="button"
              icon={null}
              onClick={() => navigate(`/dashboard/personnes/${personId}/modifier`)}
            >
              Modifier
            </Button>
          )}
        </div>
      </header>

      <form className="agencies-form-stack" onSubmit={handleSubmit}>
        <article className="card agencies-card">
          <h2>Identite</h2>
          <div className="agencies-divider" aria-hidden="true" />

          <div className="agencies-grid-two">
            {isDetailMode ? (
              <>
                <StaticInput label="Nom" value={nom} />
                <StaticInput label="Postnom" value={postnom} />
                <StaticInput label="Prenom" value={prenom} />
                <StaticInput label="Telephone" value={telephone} />
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </article>

        {isDetailMode ? (
          <article className="card agencies-card">
            <h2>Adresse</h2>
            <div className="agencies-divider" aria-hidden="true" />
            <StaticInput label="Adresse" value={formatAddressLabel(addressForm)} />
          </article>
        ) : (
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
        )}

        {isLoading && (
          <article className="agencies-empty-state agencies-loading-state" aria-live="polite">
            <h3>Chargement du formulaire...</h3>
          </article>
        )}

        {errorMessage && <p className="agencies-alert agencies-alert-error" role="alert">{errorMessage}</p>}
        {successMessage && !errorMessage && <p className="agencies-alert agencies-alert-success" role="status">{successMessage}</p>}

        {!isDetailMode && (
          <Button className="btn-full agencies-submit-btn" type="submit" icon={null} disabled={isSubmitting || isLoading}>
            {isSubmitting ? 'Enregistrement...' : isEditMode ? 'Enregistrer les modifications' : 'Creer la personne'}
          </Button>
        )}
      </form>
    </section>
  )
}

export default PersonForm
