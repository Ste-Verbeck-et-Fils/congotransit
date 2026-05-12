/* Ce composant gere la liste dynamique des colis avec ajout, suppression et validation. */
import React, { useMemo, useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { IconBox, IconPlus } from '../ui/Icons'
import { DEFAULT_COLIS_CATEGORIES, emptyColisDraft, validateColisDraft } from '../../lib/colisUtils'
import './ColisManagerSection.css'

const getNextColisId = (colisList) => (colisList.at(-1)?.id || 0) + 1

const ColisManagerSection = ({
  colis = [],
  onChange,
  fieldError = '',
  categories = DEFAULT_COLIS_CATEGORIES,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [draft, setDraft] = useState(() => emptyColisDraft())
  const [errors, setErrors] = useState({})

  const hasColis = useMemo(() => Array.isArray(colis) && colis.length > 0, [colis])

  const openModal = () => {
    setDraft(emptyColisDraft())
    setErrors({})
    setIsModalOpen(true)
  }

  const handleDraftChange = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const handleAddColis = () => {
    const result = validateColisDraft(draft)

    if (!result.isValid) {
      setErrors(result.errors)
      return
    }

    const nextColis = [
      ...colis,
      {
        id: getNextColisId(colis),
        description: result.normalized.description,
        categorie: result.normalized.categorie,
        poids: result.normalized.poids,
        observations: result.normalized.observations,
      },
    ]

    onChange(nextColis)
    setIsModalOpen(false)
  }

  const handleRemoveColis = (id) => {
    onChange(colis.filter((item) => item.id !== id))
  }

  return (
    <>
      <article className="card expedients-card">
        <h2>Colis de l&apos;expedition</h2>
        <p className="colis-manager-note">
          Cliquez sur &quot;Ajouter un colis&quot; pour saisir les details dans une fenetre, puis validez pour l&apos;ajouter a la liste.
        </p>

        <Button
          className="colis-manager-add-btn"
          variant="secondary"
          icon={<IconPlus size={18} />}
          onClick={openModal}
        >
          Ajouter un colis
        </Button>

        {fieldError && <p className="expedients-field-error">{fieldError}</p>}

        {!hasColis ? (
          <p className="colis-manager-empty">Aucun colis ajoute. Utilisez le bouton ci-dessus pour commencer.</p>
        ) : (
          <ul className="colis-manager-list" aria-live="polite">
            {colis.map((item, index) => (
              <li className="colis-manager-item" key={item.id}>
                <div className="colis-manager-item-icon" aria-hidden="true">
                  <IconBox size={16} color="var(--color-primary)" />
                </div>
                <div className="colis-manager-item-info">
                  <strong>Colis {index + 1} - {item.categorie}</strong>
                  <span>{item.description}</span>
                </div>
                <button
                  type="button"
                  className="colis-manager-remove-btn"
                  onClick={() => handleRemoveColis(item.id)}
                  aria-label={`Supprimer colis ${index + 1}`}
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </article>

      {isModalOpen && (
        <div
          className="colis-manager-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Ajouter un colis"
        >
          <div className="colis-manager-modal">
            <div className="colis-manager-modal-header">
              <h3>Nouveau colis</h3>
              <button
                type="button"
                className="colis-manager-modal-close"
                onClick={() => setIsModalOpen(false)}
                aria-label="Fermer la fenetre"
              >
                &times;
              </button>
            </div>

            <div className="colis-manager-modal-body">
              <div className="expedients-grid-two">
                <div>
                  <Input
                    label="Description *"
                    value={draft.description}
                    onChange={(event) => handleDraftChange('description', event.target.value)}
                    placeholder="Ex: Carton d'effets personnels"
                  />
                  {errors.description && <p className="expedients-field-error">{errors.description}</p>}
                </div>

                <div>
                  <Select
                    label="Categorie *"
                    value={draft.categorie}
                    onChange={(event) => handleDraftChange('categorie', event.target.value)}
                    options={categories}
                  />
                  {errors.categorie && <p className="expedients-field-error">{errors.categorie}</p>}
                </div>

                <div>
                  <Input
                    label="Poids (kg) *"
                    type="number"
                    step="0.01"
                    min="0"
                    value={draft.poids}
                    onChange={(event) => handleDraftChange('poids', event.target.value)}
                    placeholder="Ex: 4.5"
                  />
                  {errors.poids && <p className="expedients-field-error">{errors.poids}</p>}
                </div>

                <Input
                  label="Observations"
                  value={draft.observations}
                  onChange={(event) => handleDraftChange('observations', event.target.value)}
                  placeholder="Fragile, sensible a l'humidite..."
                />
              </div>
            </div>

            <div className="colis-manager-modal-footer">
              <Button variant="outline" type="button" icon={null} onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button variant="primary" type="button" icon={null} onClick={handleAddColis}>
                Ajouter le colis
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ColisManagerSection
