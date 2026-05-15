/* Ce composant affiche et traite le formulaire final de creation d'expedition. */
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import ColisManagerSection from '../components/forms/ColisManagerSection'
import { listAgencies } from '../lib/agencesApi'
import { createExpedition, getExpeditionByCodeSuivi, updateExpeditionByCodeSuivi } from '../lib/expeditionsApi'
import { buildColisApiPayload } from '../lib/colisUtils'
import { createPerson, listPersons } from '../lib/personnesApi'
import { listUsers } from '../lib/usersApi'
import { readAuthSession } from '../lib/authSession'
import '../styles/Expedients.css'

const formatPersonName = (person) =>
  [person.nom, person.postnom, person.prenom].filter(Boolean).join(' ').trim()

const toPersonOption = (person) => {
  const fullName = formatPersonName(person) || person.telephone || 'Personne sans nom'
  const label = person.telephone ? `${fullName} (${person.telephone})` : fullName
  return { value: person.id_personne, label, type: person.type_personne }
}

const toAgencyOption = (agency) => ({
  value: agency.id,
  label: agency.code ? `${agency.nom} (${agency.code})` : agency.nom,
})

const toAgentOption = (user) => ({
  value: user.id_utilisateur,
  label: user.nom_affichage,
})

const buildPersonOptions = (persons, type) => {
  const allowed =
    type === 'EXPEDITEUR'
      ? new Set(['EXPEDITEUR', 'LES_DEUX'])
      : new Set(['DESTINATAIRE', 'LES_DEUX'])

  return [
    { value: '', label: type === 'EXPEDITEUR' ? 'Choisir un expediteur...' : 'Choisir un destinataire...' },
    ...persons.filter((p) => allowed.has(p.type_personne)).map(toPersonOption),
  ]
}

const phoneRegex = /^\+?[0-9]{8,15}$/

const PERSON_TYPE_LABELS = {
  EXPEDITEUR: 'Expediteur',
  DESTINATAIRE: 'Destinataire',
  LES_DEUX: 'Expediteur et destinataire',
}

/* Formulaire principal de creation et de modification d'expedition. */
const ExpedientsForm = ({ isEditMode = false, expeditionNumero = '' }) => {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [expediteurOptions, setExpediteurOptions] = useState([{ value: '', label: 'Choisir un expediteur...' }])
  const [destinataireOptions, setDestinataireOptions] = useState([{ value: '', label: 'Choisir un destinataire...' }])
  const [agenceOptions, setAgenceOptions] = useState([{ value: '', label: 'Choisir une agence...' }])
  const [agentOptions, setAgentOptions] = useState([{ value: '', label: 'Choisir un agent...' }])
  const [personsById, setPersonsById] = useState({})
  const [agenciesById, setAgenciesById] = useState({})
  const [agentsById, setAgentsById] = useState({})

  const [refExpediteur, setRefExpediteur] = useState('')
  const [refDestinataire, setRefDestinataire] = useState('')
  const [refAgenceDepart, setRefAgenceDepart] = useState('')
  const [refAgenceDestination, setRefAgenceDestination] = useState('')
  const [refAgent, setRefAgent] = useState('')
  const [dateExpedition, setDateExpedition] = useState(new Date().toISOString().slice(0, 10))
  const [observations, setObservations] = useState('')

  const [colis, setColis] = useState([])

  const [fieldErrors, setFieldErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [quickPersonType, setQuickPersonType] = useState('')
  const [quickPersonNom, setQuickPersonNom] = useState('')
  const [quickPersonTelephone, setQuickPersonTelephone] = useState('')
  const [quickPersonErrors, setQuickPersonErrors] = useState({})
  const [quickPersonSubmitting, setQuickPersonSubmitting] = useState(false)

  const totalPoids = useMemo(
    () => colis.reduce((sum, item) => sum + Number(item.poids || 0), 0).toFixed(2),
    [colis],
  )

  useEffect(() => {
    let active = true

    const loadDependencies = async () => {
      try {
        const requests = [
          listPersons(),
          listAgencies(),
          listUsers({ role_systeme: 'AGENT' }),
        ]

        if (isEditMode && expeditionNumero) {
          requests.push(getExpeditionByCodeSuivi(expeditionNumero))
        }

        const [persons, agencies, users, expeditionResponse] = await Promise.all(requests)
        if (!active) return

        setPersonsById(Object.fromEntries(persons.map((person) => [person.id_personne, person])))
        setAgenciesById(Object.fromEntries(agencies.map((agency) => [agency.id, agency])))
        setAgentsById(Object.fromEntries(users.map((user) => [user.id_utilisateur, user])))

        setExpediteurOptions(buildPersonOptions(persons, 'EXPEDITEUR'))
        setDestinataireOptions(buildPersonOptions(persons, 'DESTINATAIRE'))
        setAgenceOptions([{ value: '', label: 'Choisir une agence...' }, ...agencies.map(toAgencyOption)])
        setAgentOptions([{ value: '', label: 'Choisir un agent...' }, ...users.map(toAgentOption)])

        if (isEditMode) {
          const expedition = expeditionResponse?.expedition

          if (expedition) {
            setRefExpediteur(expedition.ref_expediteur || '')
            setRefDestinataire(expedition.ref_destinataire || '')
            setRefAgenceDepart(expedition.ref_agence_depart || '')
            setRefAgenceDestination(expedition.ref_agence_destination || '')
            setRefAgent(expedition.ref_agent || '')
            setDateExpedition(String(expedition.date_expedition || '').slice(0, 10))
            setObservations(expedition.observations || '')
            setColis((expedition.colis || []).map((item, index) => ({
              id: index + 1,
              description: item.description || '',
              categorie: item.categorie || '',
              poids: item.poids ?? '',
              observations: item.observations || '',
            })))
          }
        } else {
          // Pre-remplir l'agent si l'utilisateur est un AGENT
          const session = readAuthSession()
          if (session?.role_systeme === 'AGENT' && session?.id_utilisateur) {
            setRefAgent(session.id_utilisateur)
          }
        }

        setApiError('')
      } catch (error) {
        if (!active) return
        setApiError(error.message || 'Impossible de charger les donnees du formulaire.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDependencies()
    return () => { active = false }
  }, [isEditMode, expeditionNumero])

  const handleColisChange = (nextColis) => {
    setColis(nextColis)
    if (fieldErrors.colis) {
      setFieldErrors((prev) => ({ ...prev, colis: '' }))
    }
  }

  const buildValidationErrors = ({
    refExpediteurValue = refExpediteur,
    refDestinataireValue = refDestinataire,
    refAgenceDepartValue = refAgenceDepart,
    refAgenceDestinationValue = refAgenceDestination,
    refAgentValue = refAgent,
    dateExpeditionValue = dateExpedition,
    colisValue = colis,
  } = {}) => {
    const nextErrors = {}

    if (!refExpediteurValue) nextErrors.refExpediteur = 'Selectionnez un expediteur.'
    if (!refDestinataireValue) nextErrors.refDestinataire = 'Selectionnez un destinataire.'
    if (!refAgenceDepartValue) nextErrors.refAgenceDepart = 'Selectionnez une agence de depart.'
    if (!refAgenceDestinationValue) nextErrors.refAgenceDestination = 'Selectionnez une agence de destination.'
    if (!refAgentValue) nextErrors.refAgent = 'Selectionnez un agent affecte.'
    if (!dateExpeditionValue) nextErrors.dateExpedition = "La date d'expedition est obligatoire."
    if (
      refAgenceDepartValue
      && refAgenceDestinationValue
      && refAgenceDepartValue === refAgenceDestinationValue
    ) {
      nextErrors.refAgenceDestination = "L'agence de destination doit etre differente."
    }
    if (!Array.isArray(colisValue) || colisValue.length === 0) {
      nextErrors.colis = 'Ajoutez au moins un colis avant la soumission.'
    }

    return nextErrors
  }

  const summaryErrors = buildValidationErrors()

  const selectedExpediteur = personsById[refExpediteur] ?? null
  const selectedDestinataire = personsById[refDestinataire] ?? null
  const selectedAgenceDepart = agenciesById[refAgenceDepart] ?? null
  const selectedAgenceDestination = agenciesById[refAgenceDestination] ?? null
  const selectedAgent = agentsById[refAgent] ?? null

  const handleChangeExpediteur = (value) => {
    setRefExpediteur(value)
    setFieldErrors((prev) => ({ ...prev, refExpediteur: value ? '' : 'Selectionnez un expediteur.' }))
  }

  const handleChangeDestinataire = (value) => {
    setRefDestinataire(value)
    setFieldErrors((prev) => ({ ...prev, refDestinataire: value ? '' : 'Selectionnez un destinataire.' }))
  }

  const handleChangeAgenceDepart = (value) => {
    setRefAgenceDepart(value)
    setFieldErrors((prev) => ({
      ...prev,
      refAgenceDepart: value ? '' : 'Selectionnez une agence de depart.',
      refAgenceDestination: value && refAgenceDestination && value === refAgenceDestination
        ? "L'agence de destination doit etre differente."
        : prev.refAgenceDestination,
    }))
  }

  const handleChangeAgenceDestination = (value) => {
    setRefAgenceDestination(value)
    setFieldErrors((prev) => ({
      ...prev,
      refAgenceDestination: !value
        ? 'Selectionnez une agence de destination.'
        : value === refAgenceDepart
          ? "L'agence de destination doit etre differente."
          : '',
    }))
  }

  const handleChangeAgent = (value) => {
    setRefAgent(value)
    setFieldErrors((prev) => ({ ...prev, refAgent: value ? '' : 'Selectionnez un agent affecte.' }))
  }

  const handleChangeDate = (value) => {
    setDateExpedition(value)
    setFieldErrors((prev) => ({ ...prev, dateExpedition: value ? '' : "La date d'expedition est obligatoire." }))
  }

  const refreshPersons = async () => {
    const persons = await listPersons()
    setExpediteurOptions(buildPersonOptions(persons, 'EXPEDITEUR'))
    setDestinataireOptions(buildPersonOptions(persons, 'DESTINATAIRE'))
    return persons
  }

  const openQuickPersonForm = (type) => {
    setQuickPersonType(type)
    setQuickPersonNom('')
    setQuickPersonTelephone('')
    setQuickPersonErrors({})
  }

  const closeQuickPersonForm = () => {
    setQuickPersonType('')
    setQuickPersonNom('')
    setQuickPersonTelephone('')
    setQuickPersonErrors({})
  }

  const handleQuickCreatePerson = async () => {
    const nom = quickPersonNom.trim()
    const telephone = quickPersonTelephone.replace(/\s+/g, '')
    const type = quickPersonType

    const nextErrors = {}
    if (!type) nextErrors.type = 'Type de personne invalide.'
    if (!nom) nextErrors.nom = 'Le nom est obligatoire.'
    if (!telephone) nextErrors.telephone = 'Le telephone est obligatoire.'
    if (telephone && !phoneRegex.test(telephone)) nextErrors.telephone = 'Numero de telephone invalide.'

    if (Object.keys(nextErrors).length > 0) {
      setQuickPersonErrors(nextErrors)
      return
    }

    try {
      setQuickPersonSubmitting(true)
      setApiError('')
      const response = await createPerson({ nom, telephone, type_personne: type })
      const allPersons = await refreshPersons()
      const created = response.person || allPersons.find((p) => p.telephone === telephone)
      if (created?.id_personne) {
        if (type === 'EXPEDITEUR') setRefExpediteur(created.id_personne)
        if (type === 'DESTINATAIRE') setRefDestinataire(created.id_personne)
      }
      closeQuickPersonForm()
    } catch (error) {
      setApiError(error.message || 'Impossible de creer la personne.')
    } finally {
      setQuickPersonSubmitting(false)
    }
  }

  const validateForm = () => {
    return buildValidationErrors()
  }

  const resetForm = () => {
    setRefExpediteur('')
    setRefDestinataire('')
    setRefAgenceDepart('')
    setRefAgenceDestination('')
    setRefAgent('')
    setDateExpedition(new Date().toISOString().slice(0, 10))
    setObservations('')
    setColis([])
    setFieldErrors({})
  }

  const handleSubmit = async () => {
    if (submitting) return

    const validation = validateForm()
    setFieldErrors(validation)
    setApiError('')
    setSuccessMessage('')
    if (Object.keys(validation).length > 0) return

    try {
      setSubmitting(true)
      const payload = {
        ref_expediteur: refExpediteur,
        ref_destinataire: refDestinataire,
        ref_agence_depart: refAgenceDepart,
        ref_agence_destination: refAgenceDestination,
        ref_agent: refAgent,
        date_expedition: `${dateExpedition}T00:00:00.000Z`,
        observations: observations.trim(),
        colis: buildColisApiPayload(colis),
      }
      const response = isEditMode
        ? await updateExpeditionByCodeSuivi(expeditionNumero, payload)
        : await createExpedition(payload)
      const codeSuivi = response?.expedition?.code_suivi

      if (isEditMode) {
        setSuccessMessage(codeSuivi ? `Expedition ${codeSuivi} modifiee avec succes.` : 'Expedition modifiee avec succes.')
      } else {
        setSuccessMessage(codeSuivi ? `Expedition ${codeSuivi} creee avec succes.` : 'Expedition creee avec succes.')
        resetForm()
      }
    } catch (error) {
      setApiError(error.message || `Une erreur est survenue lors de la ${isEditMode ? 'modification' : 'creation'} de l'expedition.`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <section className="expedients-page fade-in" aria-label={isEditMode ? 'Chargement modification expedition' : 'Chargement creation expedition'}>
        <header className="expedients-header">
          <div>
            <h1>{isEditMode ? "Modification d'expedition" : "Creation d'expedition"}</h1>
            <p>Chargement des donnees du formulaire...</p>
          </div>
        </header>
      </section>
    )
  }

  return (
    <section className="expedients-page fade-in" aria-label={isEditMode ? 'Modification expedition' : "Creation d'expedition"}>
      <header className="expedients-header">
        <div>
          <h1>{isEditMode ? "Modification d'expedition" : "Creation d'expedition"}</h1>
          <p>
            {isEditMode
              ? 'Mettez a jour les parties prenantes, le trajet, l\'agent et les colis de cette expedition.'
              : 'Creez une expedition complete avec parties prenantes, agences, agent et colis.'}
          </p>
        </div>
        <Button variant="outline" type="button" icon={null} onClick={() => navigate('/dashboard/expedients')}>
          Annuler
        </Button>
      </header>

      {successMessage && <p className="expedients-success" role="status">{successMessage}</p>}
      {apiError && <p className="expedients-error" role="alert">{apiError}</p>}

      <div className="expedients-stack">

        <article className="card expedients-card">
          <h2>1. Parties prenantes</h2>
          <p className="expedients-section-note">Selectionnez clairement l'expediteur et le destinataire, ou ajoutez-les rapidement.</p>
          <div className="expedients-divider" aria-hidden="true" />
          <div className="expedients-grid-two">
            <div>
              <Select
                label="Expediteur *"
                value={refExpediteur}
                onChange={(e) => handleChangeExpediteur(e.target.value)}
                options={expediteurOptions}
                withAdd
                onAdd={() => openQuickPersonForm('EXPEDITEUR')}
              />
              {fieldErrors.refExpediteur && <p className="expedients-field-error">{fieldErrors.refExpediteur}</p>}
              {selectedExpediteur && (
                <div className="expedients-person-preview">
                  <strong>{formatPersonName(selectedExpediteur) || 'Nom non renseigne'}</strong>
                  <span>{selectedExpediteur.telephone || 'Telephone non renseigne'}</span>
                  <em>{PERSON_TYPE_LABELS[selectedExpediteur.type_personne] || selectedExpediteur.type_personne || 'Type inconnu'}</em>
                </div>
              )}
            </div>
            <div>
              <Select
                label="Destinataire *"
                value={refDestinataire}
                onChange={(e) => handleChangeDestinataire(e.target.value)}
                options={destinataireOptions}
                withAdd
                onAdd={() => openQuickPersonForm('DESTINATAIRE')}
              />
              {fieldErrors.refDestinataire && <p className="expedients-field-error">{fieldErrors.refDestinataire}</p>}
              {selectedDestinataire && (
                <div className="expedients-person-preview">
                  <strong>{formatPersonName(selectedDestinataire) || 'Nom non renseigne'}</strong>
                  <span>{selectedDestinataire.telephone || 'Telephone non renseigne'}</span>
                  <em>{PERSON_TYPE_LABELS[selectedDestinataire.type_personne] || selectedDestinataire.type_personne || 'Type inconnu'}</em>
                </div>
              )}
            </div>
          </div>

          {quickPersonType && (
            <div className="expedients-quick-person">
              <p className="expedients-quick-person-title">
                Nouveau {quickPersonType === 'EXPEDITEUR' ? 'expediteur' : 'destinataire'}
              </p>
              <div className="expedients-grid-two">
                <div>
                  <Input
                    label="Nom complet *"
                    placeholder="Ex: Jean Mutombo"
                    value={quickPersonNom}
                    onChange={(e) => {
                      setQuickPersonNom(e.target.value)
                      setQuickPersonErrors((prev) => ({ ...prev, nom: '' }))
                    }}
                  />
                  {quickPersonErrors.nom && <p className="expedients-field-error">{quickPersonErrors.nom}</p>}
                </div>
                <div>
                  <Input
                    label="Telephone *"
                    placeholder="Ex: +243990000000"
                    value={quickPersonTelephone}
                    onChange={(e) => {
                      setQuickPersonTelephone(e.target.value)
                      setQuickPersonErrors((prev) => ({ ...prev, telephone: '' }))
                    }}
                  />
                  {quickPersonErrors.telephone && <p className="expedients-field-error">{quickPersonErrors.telephone}</p>}
                </div>
              </div>
              <div className="expedients-quick-person-actions">
                <Button variant="outline" type="button" icon={null} onClick={closeQuickPersonForm}>
                  Annuler
                </Button>
                <Button variant="primary" type="button" icon={null} onClick={handleQuickCreatePerson} disabled={quickPersonSubmitting}>
                  {quickPersonSubmitting ? 'Ajout...' : 'Ajouter la personne'}
                </Button>
              </div>
            </div>
          )}
        </article>

        <article className="card expedients-card">
          <h2>2. Affectation et trajet</h2>
          <p className="expedients-section-note">Definissez les agences de transit et l'agent responsable de l'expedition.</p>
          <div className="expedients-divider" aria-hidden="true" />
          <div className="expedients-grid-two">
            <div>
              <Select
                label="Agence de depart *"
                value={refAgenceDepart}
                onChange={(e) => handleChangeAgenceDepart(e.target.value)}
                options={agenceOptions}
              />
              {fieldErrors.refAgenceDepart && <p className="expedients-field-error">{fieldErrors.refAgenceDepart}</p>}
            </div>
            <div>
              <Select
                label="Agence de destination *"
                value={refAgenceDestination}
                onChange={(e) => handleChangeAgenceDestination(e.target.value)}
                options={agenceOptions}
              />
              {fieldErrors.refAgenceDestination && (
                <p className="expedients-field-error">{fieldErrors.refAgenceDestination}</p>
              )}
            </div>
            <div>
              <Select
                label="Agent affecte *"
                value={refAgent}
                onChange={(e) => handleChangeAgent(e.target.value)}
                options={agentOptions}
              />
              {fieldErrors.refAgent && <p className="expedients-field-error">{fieldErrors.refAgent}</p>}
            </div>
            <div>
              <Input
                label="Date d'expedition *"
                type="date"
                value={dateExpedition}
                onChange={(e) => handleChangeDate(e.target.value)}
              />
              {fieldErrors.dateExpedition && <p className="expedients-field-error">{fieldErrors.dateExpedition}</p>}
            </div>
          </div>
        </article>

        <ColisManagerSection colis={colis} onChange={handleColisChange} fieldError={fieldErrors.colis} />

        <article className="card expedients-card">
          <h2>3. Details de l'expedition</h2>
          <div className="expedients-grid-two">
            <div>
              <p className="expedients-total-label">Poids total estime</p>
              <div id="poids-total" className="expedients-total-value">
                <span>{totalPoids}</span>
                <strong>kg</strong>
              </div>
            </div>
            <Input
              label="Observations expedition"
              placeholder="Instructions supplementaires de transport"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />
          </div>
        </article>

        <article className="card expedients-card expedients-summary-card">
          <h2>4. Resume avant enregistrement</h2>
          <p className="expedients-section-note">Verifiez les informations principales avant de soumettre.</p>
          <div className="expedients-divider" aria-hidden="true" />

          <div className="expedients-summary-grid">
            <div>
              <span>Expediteur</span>
              <strong>{selectedExpediteur ? (formatPersonName(selectedExpediteur) || selectedExpediteur.telephone) : '-'}</strong>
            </div>
            <div>
              <span>Destinataire</span>
              <strong>{selectedDestinataire ? (formatPersonName(selectedDestinataire) || selectedDestinataire.telephone) : '-'}</strong>
            </div>
            <div>
              <span>Agence depart</span>
              <strong>{selectedAgenceDepart?.nom || '-'}</strong>
            </div>
            <div>
              <span>Agence destination</span>
              <strong>{selectedAgenceDestination?.nom || '-'}</strong>
            </div>
            <div>
              <span>Agent</span>
              <strong>{selectedAgent?.nom_affichage || '-'}</strong>
            </div>
            <div>
              <span>Date expedition</span>
              <strong>{dateExpedition || '-'}</strong>
            </div>
            <div>
              <span>Nombre de colis</span>
              <strong>{colis.length}</strong>
            </div>
            <div>
              <span>Poids total</span>
              <strong>{totalPoids} kg</strong>
            </div>
          </div>

          {colis.length > 0 && (
            <ul className="expedients-summary-colis" aria-label="Colis enregistres">
              {colis.map((item, index) => (
                <li key={item.id || `${item.categorie}-${index}`}>
                  <strong>Colis {index + 1}</strong>
                  <span>{item.categorie} - {Number(item.poids || 0).toFixed(2)} kg</span>
                </li>
              ))}
            </ul>
          )}

          {Object.keys(summaryErrors).length > 0 && (
            <p className="expedients-summary-warning" role="status">
              Finalisez les champs obligatoires pour continuer en toute securite.
            </p>
          )}
        </article>

      </div>

      <div className="expedients-submit-wrap">
        <Button
          className="btn-full expedients-submit"
          variant="primary"
          type="button"
          icon={null}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting
            ? isEditMode ? 'Mise a jour en cours...' : 'Creation en cours...'
            : isEditMode ? 'Enregistrer les modifications' : "Creer l'expedition"}
        </Button>
      </div>

    </section>
  )
}

/* Ce composant encapsule l'ecran de creation et de modification d'expedition. */
const Expedients = () => {
  const { expeditionNumero } = useParams()
  const isEditMode = Boolean(expeditionNumero)

  return <ExpedientsForm isEditMode={isEditMode} expeditionNumero={expeditionNumero || ''} />
}

export default Expedients
