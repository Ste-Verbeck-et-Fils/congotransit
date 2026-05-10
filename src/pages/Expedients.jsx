/* Ce composant affiche et traite le formulaire final de creation d'expedition. */
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { IconPlus, IconBox } from '../components/ui/Icons'
import { listAgencies } from '../lib/agencesApi'
import { createExpedition, getExpeditionByCodeSuivi, updateExpeditionByCodeSuivi } from '../lib/expeditionsApi'
import { createPerson, listPersons } from '../lib/personnesApi'
import { listUsers } from '../lib/usersApi'
import '../styles/Expedients.css'

const COLIS_CATEGORIES = [
  { value: '', label: 'Choisir une categorie...' },
  { value: 'Documents', label: 'Documents' },
  { value: 'Electronique', label: 'Electronique' },
  { value: 'Vetements', label: 'Vetements' },
  { value: 'Alimentaire', label: 'Alimentaire' },
  { value: 'Fragile', label: 'Fragile' },
  { value: 'Autre', label: 'Autre' },
]

const formatPersonName = (person) =>
  [person.nom, person.postnom, person.prenom].filter(Boolean).join(' ').trim()

const toPersonOption = (person) => {
  const fullName = formatPersonName(person) || person.telephone || 'Personne sans nom'
  const label = person.telephone ? `${fullName} (${person.telephone})` : fullName
  return { value: person.id_personne, label, type: person.type_personne }
}

const toAgencyOption = (agency) => ({
  value: agency.id_agence,
  label: agency.code_agence ? `${agency.nom_agence} (${agency.code_agence})` : agency.nom_agence,
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

/* Formulaire principal de creation et de modification d'expedition. */
const ExpedientsForm = ({ isEditMode = false, expeditionNumero = '' }) => {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [expediteurOptions, setExpediteurOptions] = useState([{ value: '', label: 'Choisir un expediteur...' }])
  const [destinataireOptions, setDestinataireOptions] = useState([{ value: '', label: 'Choisir un destinataire...' }])
  const [agenceOptions, setAgenceOptions] = useState([{ value: '', label: 'Choisir une agence...' }])
  const [agentOptions, setAgentOptions] = useState([{ value: '', label: 'Choisir un agent...' }])

  const [refExpediteur, setRefExpediteur] = useState('')
  const [refDestinataire, setRefDestinataire] = useState('')
  const [refAgenceDepart, setRefAgenceDepart] = useState('')
  const [refAgenceDestination, setRefAgenceDestination] = useState('')
  const [refAgent, setRefAgent] = useState('')
  const [dateExpedition, setDateExpedition] = useState(new Date().toISOString().slice(0, 10))
  const [observations, setObservations] = useState('')

  const [colis, setColis] = useState([])
  const [isColisModalOpen, setIsColisModalOpen] = useState(false)
  const [modalColisData, setModalColisData] = useState({ description: '', categorie: '', poids: '', observations: '' })
  const [modalErrors, setModalErrors] = useState({})

  const [fieldErrors, setFieldErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

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

  const handleOpenColisModal = () => {
    setModalColisData({ description: '', categorie: '', poids: '', observations: '' })
    setModalErrors({})
    setIsColisModalOpen(true)
  }

  const handleModalFieldChange = (key, value) => {
    setModalColisData((prev) => ({ ...prev, [key]: value }))
    setModalErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const handleSaveColisFromModal = () => {
    const errors = {}
    if (!modalColisData.description.trim()) errors.description = 'Description obligatoire.'
    if (!modalColisData.categorie) errors.categorie = 'Categorie obligatoire.'
    if (!modalColisData.poids || Number(modalColisData.poids) <= 0) errors.poids = 'Poids invalide (> 0).'

    if (Object.keys(errors).length > 0) {
      setModalErrors(errors)
      return
    }

    setColis((prev) => [
      ...prev,
      {
        id: (prev.at(-1)?.id || 0) + 1,
        description: modalColisData.description.trim(),
        categorie: modalColisData.categorie,
        poids: modalColisData.poids,
        observations: modalColisData.observations.trim(),
      },
    ])
    setFieldErrors((prev) => ({ ...prev, colis: '' }))
    setIsColisModalOpen(false)
  }

  const handleRemoveColis = (id) => {
    setColis((prev) => prev.filter((item) => item.id !== id))
  }

  const refreshPersons = async () => {
    const persons = await listPersons()
    setExpediteurOptions(buildPersonOptions(persons, 'EXPEDITEUR'))
    setDestinataireOptions(buildPersonOptions(persons, 'DESTINATAIRE'))
    return persons
  }

  const handleQuickCreatePerson = async (type) => {
    const nom = window.prompt(type === 'EXPEDITEUR' ? "Nom de l'expediteur:" : 'Nom du destinataire:')
    if (!nom) return
    const telephone = window.prompt('Telephone (format numerique):')
    if (!telephone) return

    try {
      setApiError('')
      const response = await createPerson({ nom, telephone, type_personne: type })
      const allPersons = await refreshPersons()
      const created = response.person || allPersons.find((p) => p.telephone === telephone)
      if (created?.id_personne) {
        if (type === 'EXPEDITEUR') setRefExpediteur(created.id_personne)
        if (type === 'DESTINATAIRE') setRefDestinataire(created.id_personne)
      }
    } catch (error) {
      setApiError(error.message || 'Impossible de creer la personne.')
    }
  }

  const validateForm = () => {
    const nextErrors = {}
    if (!refExpediteur) nextErrors.refExpediteur = 'Selectionnez un expediteur.'
    if (!refDestinataire) nextErrors.refDestinataire = 'Selectionnez un destinataire.'
    if (!refAgenceDepart) nextErrors.refAgenceDepart = 'Selectionnez une agence de depart.'
    if (!refAgenceDestination) nextErrors.refAgenceDestination = 'Selectionnez une agence de destination.'
    if (!refAgent) nextErrors.refAgent = 'Selectionnez un agent affecte.'
    if (!dateExpedition) nextErrors.dateExpedition = "La date d'expedition est obligatoire."
    if (refAgenceDepart && refAgenceDestination && refAgenceDepart === refAgenceDestination) {
      nextErrors.refAgenceDestination = "L'agence de destination doit etre differente."
    }
    if (!Array.isArray(colis) || colis.length === 0) {
      nextErrors.colis = 'Ajoutez au moins un colis avant la soumission.'
    }
    return nextErrors
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
        colis: colis.map((item) => ({
          description: item.description.trim(),
          categorie: item.categorie,
          poids: Number(item.poids),
          observations: item.observations.trim(),
        })),
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
            <h1>{isEditMode ? 'Modification d&apos;expedition' : 'Creation d&apos;expedition'}</h1>
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
          <h1>{isEditMode ? 'Modification d&apos;expedition' : 'Creation d&apos;expedition'}</h1>
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
          <h2>Parties prenantes</h2>
          <div className="expedients-divider" aria-hidden="true" />
          <div className="expedients-grid-two">
            <div>
              <Select
                label="Expediteur *"
                value={refExpediteur}
                onChange={(e) => setRefExpediteur(e.target.value)}
                options={expediteurOptions}
                withAdd
                onAdd={() => handleQuickCreatePerson('EXPEDITEUR')}
              />
              {fieldErrors.refExpediteur && <p className="expedients-field-error">{fieldErrors.refExpediteur}</p>}
            </div>
            <div>
              <Select
                label="Destinataire *"
                value={refDestinataire}
                onChange={(e) => setRefDestinataire(e.target.value)}
                options={destinataireOptions}
                withAdd
                onAdd={() => handleQuickCreatePerson('DESTINATAIRE')}
              />
              {fieldErrors.refDestinataire && <p className="expedients-field-error">{fieldErrors.refDestinataire}</p>}
            </div>
          </div>
        </article>

        <article className="card expedients-card">
          <h2>Affectation et trajet</h2>
          <div className="expedients-divider" aria-hidden="true" />
          <div className="expedients-grid-two">
            <div>
              <Select
                label="Agence de depart *"
                value={refAgenceDepart}
                onChange={(e) => setRefAgenceDepart(e.target.value)}
                options={agenceOptions}
              />
              {fieldErrors.refAgenceDepart && <p className="expedients-field-error">{fieldErrors.refAgenceDepart}</p>}
            </div>
            <div>
              <Select
                label="Agence de destination *"
                value={refAgenceDestination}
                onChange={(e) => setRefAgenceDestination(e.target.value)}
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
                onChange={(e) => setRefAgent(e.target.value)}
                options={agentOptions}
              />
              {fieldErrors.refAgent && <p className="expedients-field-error">{fieldErrors.refAgent}</p>}
            </div>
            <div>
              <Input
                label="Date d'expedition *"
                type="date"
                value={dateExpedition}
                onChange={(e) => setDateExpedition(e.target.value)}
              />
              {fieldErrors.dateExpedition && <p className="expedients-field-error">{fieldErrors.dateExpedition}</p>}
            </div>
          </div>
        </article>

        <article className="card expedients-card">
          <h2>Colis de l&apos;expedition</h2>
          <p className="expedients-note">
            Cliquez sur &quot;Ajouter un colis&quot; pour saisir les details dans une fenetre, puis validez pour l&apos;ajouter a la liste.
          </p>
          <Button
            className="expedients-add-colis"
            variant="secondary"
            icon={<IconPlus size={18} />}
            onClick={handleOpenColisModal}
          >
            Ajouter un colis
          </Button>

          {fieldErrors.colis && <p className="expedients-field-error">{fieldErrors.colis}</p>}

          {colis.length === 0 ? (
            <p className="expedients-colis-empty">Aucun colis ajoute. Utilisez le bouton ci-dessus pour commencer.</p>
          ) : (
            <ul className="expedients-colis-todo" aria-live="polite">
              {colis.map((item, index) => (
                <li className="expedients-colis-todo-item" key={item.id}>
                  <div className="expedients-colis-todo-icon" aria-hidden="true">
                    <IconBox size={16} color="var(--color-primary)" />
                  </div>
                  <div className="expedients-colis-todo-info">
                    <strong>Colis {index + 1} &mdash; {item.categorie}</strong>
                    <span>{item.description}</span>
                    <span className="expedients-colis-todo-meta">
                      {Number(item.poids).toFixed(2)} kg
                      {item.observations ? ' \u00b7 ' + item.observations : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="expedients-remove-btn"
                    onClick={() => handleRemoveColis(item.id)}
                    aria-label={'Supprimer colis ' + (index + 1)}
                  >
                    Supprimer
                  </button>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="card expedients-card">
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

      </div>

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

      {isColisModalOpen && (
        <div
          className="expedients-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Ajouter un colis"
        >
          <div className="expedients-modal">
            <div className="expedients-modal-header">
              <h3>Nouveau colis</h3>
              <button
                type="button"
                className="expedients-modal-close"
                onClick={() => setIsColisModalOpen(false)}
                aria-label="Fermer la fenetre"
              >
                &times;
              </button>
            </div>
            <div className="expedients-modal-body">
              <div className="expedients-grid-two">
                <div>
                  <Input
                    label="Description *"
                    value={modalColisData.description}
                    onChange={(e) => handleModalFieldChange('description', e.target.value)}
                    placeholder="Ex: Carton d'effets personnels"
                  />
                  {modalErrors.description && (
                    <p className="expedients-field-error">{modalErrors.description}</p>
                  )}
                </div>
                <div>
                  <Select
                    label="Categorie *"
                    value={modalColisData.categorie}
                    onChange={(e) => handleModalFieldChange('categorie', e.target.value)}
                    options={COLIS_CATEGORIES}
                  />
                  {modalErrors.categorie && (
                    <p className="expedients-field-error">{modalErrors.categorie}</p>
                  )}
                </div>
                <div>
                  <Input
                    label="Poids (kg) *"
                    type="number"
                    step="0.01"
                    min="0"
                    value={modalColisData.poids}
                    onChange={(e) => handleModalFieldChange('poids', e.target.value)}
                    placeholder="Ex: 4.5"
                  />
                  {modalErrors.poids && (
                    <p className="expedients-field-error">{modalErrors.poids}</p>
                  )}
                </div>
                <Input
                  label="Observations"
                  value={modalColisData.observations}
                  onChange={(e) => handleModalFieldChange('observations', e.target.value)}
                  placeholder="Fragile, sensible a l'humidite..."
                />
              </div>
            </div>
            <div className="expedients-modal-footer">
              <Button variant="outline" type="button" icon={null} onClick={() => setIsColisModalOpen(false)}>
                Annuler
              </Button>
              <Button variant="primary" type="button" icon={null} onClick={handleSaveColisFromModal}>
                Ajouter le colis
              </Button>
            </div>
          </div>
        </div>
      )}
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
