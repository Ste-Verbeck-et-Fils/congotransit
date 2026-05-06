/* Ce composant affiche le formulaire de creation d'un colis lie a une expedition. */
import React, { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import { IconBox } from '../components/ui/Icons'
import { listExpeditions } from '../lib/expeditionsStore'
import { createColis } from '../lib/colisStore'
import '../styles/CreateColis.css'

const CATEGORIES = [
  { value: '', label: 'Choisir une categorie...' },
  { value: 'Documents', label: 'Documents' },
  { value: 'Electronique', label: 'Electronique' },
  { value: 'Vetements', label: 'Vetements' },
  { value: 'Alimentaire', label: 'Alimentaire' },
  { value: 'Fragile', label: 'Fragile' },
  { value: 'Autre', label: 'Autre' },
]

const CreateColis = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const prefilledRef = location.state?.refExpedition || ''

  const expeditionOptions = useMemo(() => {
    const all = listExpeditions()
    return [
      { value: '', label: 'Choisir une expedition...' },
      ...all.map((e) => ({ value: e.numero, label: `${e.numero} — ${e.expediteurNom} → ${e.destinataireNom}` })),
    ]
  }, [])

  const [refExpedition, setRefExpedition] = useState(prefilledRef)
  const [description, setDescription] = useState('')
  const [categorie, setCategorie] = useState('')
  const [poids, setPoids] = useState('')
  const [observations, setObservations] = useState('')
  const [errors, setErrors] = useState({})
  const [successCode, setSuccessCode] = useState('')
  const [continueAdding, setContinueAdding] = useState(false)

  const selectedExpedition = useMemo(
    () => listExpeditions().find((e) => e.numero === refExpedition) || null,
    [refExpedition],
  )

  const validate = () => {
    const next = {}
    if (!refExpedition) next.refExpedition = "Veuillez selectionner une expedition."
    if (!description.trim()) next.description = "La description est obligatoire."
    if (!categorie) next.categorie = "Veuillez choisir une categorie."
    if (!poids || isNaN(Number(poids)) || Number(poids) <= 0)
      next.poids = "Le poids doit etre un nombre superieur a 0."
    return next
  }

  const resetForm = () => {
    setRefExpedition('')
    setDescription('')
    setCategorie('')
    setPoids('')
    setObservations('')
    setErrors({})
    setSuccessCode('')
  }

  const handleSubmit = (shouldContinue) => {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const created = createColis({
      ref_expedition: refExpedition,
      description: description.trim(),
      categorie,
      poids,
      observations: observations.trim(),
    })

    setSuccessCode(created.code_colis)

    if (shouldContinue) {
      setContinueAdding(true)
      setTimeout(() => {
        resetForm()
        setContinueAdding(false)
      }, 1800)
    } else {
      setTimeout(() => navigate('/dashboard/expedients'), 1800)
    }
  }

  return (
    <section className="create-colis-page fade-in" aria-label="Creation d'un colis">
      <header className="create-colis-header">
        <div>
          <h1>Creer un colis</h1>
          <p>Associez un colis physique a une expedition enregistree.</p>
        </div>
        <Button
          variant="outline"
          type="button"
          icon={null}
          onClick={() => navigate('/dashboard/expedients')}
        >
          Annuler
        </Button>
      </header>

      {successCode && (
        <div className="create-colis-success" role="alert">
          <IconBox size={18} color="var(--color-primary)" />
          <span>Colis <strong>{successCode}</strong> enregistre avec succes !</span>
        </div>
      )}

      <div className="create-colis-body">
        {/* ── Formulaire ── */}
        <div className="create-colis-form">
          <article className="create-colis-card">
            <h2>Informations du colis</h2>
            <div className="colis-divider" />

            {/* Expedition + Categorie sur la meme ligne */}
            <div className="colis-grid-two">
              <div>
                <Select
                  label="Expedition *"
                  value={refExpedition}
                  onChange={(e) => { setRefExpedition(e.target.value); setErrors((prev) => ({ ...prev, refExpedition: '' })) }}
                  options={expeditionOptions}
                  required
                />
                {errors.refExpedition && <p className="colis-field-error">{errors.refExpedition}</p>}
              </div>
              <div>
                <Select
                  label="Categorie *"
                  value={categorie}
                  onChange={(e) => { setCategorie(e.target.value); setErrors((prev) => ({ ...prev, categorie: '' })) }}
                  options={CATEGORIES}
                  required
                />
                {errors.categorie && <p className="colis-field-error">{errors.categorie}</p>}
              </div>
            </div>

            {/* Description + Poids sur la meme ligne */}
            <div className="colis-grid-two">
              <div>
                <Input
                  label="Description *"
                  placeholder="Ex : Carton contenant des vetements"
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); setErrors((prev) => ({ ...prev, description: '' })) }}
                  required
                />
                {errors.description && <p className="colis-field-error">{errors.description}</p>}
              </div>
              <div className="colis-poids-row">
                <div className="colis-poids-field">
                  <Input
                    label="Poids *"
                    type="number"
                    placeholder="Ex : 2.5"
                    value={poids}
                    onChange={(e) => { setPoids(e.target.value); setErrors((prev) => ({ ...prev, poids: '' })) }}
                    required
                  />
                  {errors.poids && <p className="colis-field-error">{errors.poids}</p>}
                </div>
                <span className="colis-poids-unit">kg</span>
              </div>
            </div>

            <Input
              label="Observations"
              placeholder="Ex : Colis fragile, a manipuler avec soin"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />
          </article>

          <div className="create-colis-actions">
            <Button
              variant="primary"
              type="button"
              icon={null}
              onClick={() => handleSubmit(false)}
            >
              Enregistrer
            </Button>
            <Button
              variant="secondary"
              type="button"
              icon={null}
              onClick={() => handleSubmit(true)}
            >
              Enregistrer et ajouter un autre
            </Button>
            <Button
              variant="outline"
              type="button"
              icon={null}
              onClick={() => navigate('/dashboard/expedients')}
            >
              Annuler
            </Button>
          </div>
        </div>

       
      </div>
    </section>
  )
}

export default CreateColis
