import React, { useState, useRef } from 'react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { IconTimeline, IconArrowRight, IconPin, IconUser, IconBox } from '../components/ui/Icons'
import {
  getExpeditionByCodeSuivi,
  getExpeditionSuiviByCodeSuivi,
  createExpeditionSuiviByCodeSuivi,
} from '../lib/expeditionsApi'
import { readAuthSession } from '../lib/authSession'
import '../styles/SuiviTrajet.css'

/* Ce composant permet de rechercher une expédition par code et de consulter ou mettre à jour son suivi de trajet. */

const SUIVI_STATUS_OPTIONS = [
  { value: 'EXPEDIE', label: 'Expédié' },
  { value: 'EN_TRANSIT', label: 'En transit' },
  { value: 'LIVRE', label: 'Livré' },
  { value: 'ANNULE', label: 'Annulé' },
  { value: 'NON_RECUPERE', label: 'Non récupéré' },
  { value: 'PERDU', label: 'Perdu' },
]

function getStatusLabel(status) {
  const found = SUIVI_STATUS_OPTIONS.find((o) => o.value === status)
  return found ? found.label : (status ?? '—')
}

function getStatusClass(status) {
  const map = {
    EXPEDIE: 'status-expedie',
    EN_TRANSIT: 'status-en-transit',
    LIVRE: 'status-livre',
    ANNULE: 'status-annule',
    NON_RECUPERE: 'status-non-recupere',
    PERDU: 'status-perdu',
  }
  return map[String(status ?? '').toUpperCase()] ?? 'status-default'
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const SuiviTrajet = () => {
  const session = readAuthSession()
  const isAdmin = session?.role_systeme === 'ADMIN'
  const isAgent = session?.role_systeme === 'AGENT'

  const [searchCode, setSearchCode] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  const [expedition, setExpedition] = useState(null)
  const [suivi, setSuivi] = useState([])

  const [suiviForm, setSuiviForm] = useState({
    status: 'EN_TRANSIT',
    localisation_texte: '',
    commentaire: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')

  const resultRef = useRef(null)

  // L'agent ne peut éditer que si c'est lui l'agent assigné à cette expédition
  const canEditSuivi =
    expedition !== null &&
    (isAdmin || (isAgent && String(session?.id_utilisateur) === String(expedition.ref_agent)))

  const handleSearch = async (e) => {
    e.preventDefault()
    const code = searchCode.trim()
    if (!code) return

    setIsSearching(true)
    setSearchError('')
    setExpedition(null)
    setSuivi([])
    setSubmitError('')
    setSubmitSuccess('')

    try {
      const [expeditionData, suiviData] = await Promise.all([
        getExpeditionByCodeSuivi(code),
        getExpeditionSuiviByCodeSuivi(code),
      ])
      setExpedition(expeditionData.expedition ?? expeditionData)
      setSuivi(suiviData)
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    } catch (err) {
      setSearchError(err.message || 'Expédition introuvable pour ce code de suivi.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSuiviSubmit = async (e) => {
    e.preventDefault()
    if (!expedition) return

    setIsSubmitting(true)
    setSubmitError('')
    setSubmitSuccess('')

    try {
      await createExpeditionSuiviByCodeSuivi(expedition.code_suivi, {
        status: suiviForm.status,
        localisation_texte: suiviForm.localisation_texte.trim(),
        commentaire: suiviForm.commentaire.trim(),
      })

      // Rafraîchir l'expédition et le suivi après ajout
      const [expeditionData, suiviData] = await Promise.all([
        getExpeditionByCodeSuivi(expedition.code_suivi),
        getExpeditionSuiviByCodeSuivi(expedition.code_suivi),
      ])
      setExpedition(expeditionData.expedition ?? expeditionData)
      setSuivi(suiviData)
      setSuiviForm({ status: 'EN_TRANSIT', localisation_texte: '', commentaire: '' })
      setSubmitSuccess('Étape de suivi ajoutée avec succès.')
    } catch (err) {
      setSubmitError(err.message || "Impossible d'ajouter l'étape de suivi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="suivi-trajet-page">

      {/* En-tête */}
      <div className="suivi-trajet-header">
        <div>
          <h1>Suivi trajet</h1>
          <p>Recherchez une expédition par son code de suivi pour consulter ou mettre à jour son parcours.</p>
        </div>
      </div>

      {/* Barre de recherche */}
      <form className="suivi-trajet-search" onSubmit={handleSearch}>
        <div className="suivi-trajet-search-field">
          <Input
            label="Code de suivi"
            placeholder="Ex : EXP-2026-ABCDEF"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            required
          />
        </div>
        <div className="suivi-trajet-search-btn">
          <Button
            type="submit"
            isLoading={isSearching}
            disabled={isSearching}
            icon={null}
            className="suivi-trajet-search-button"
          >
            Rechercher
          </Button>
        </div>
      </form>

      {searchError && (
        <p className="suivi-trajet-alert suivi-trajet-alert--error">{searchError}</p>
      )}

      {/* Résultats */}
      {expedition && (
        <div className="suivi-trajet-result" ref={resultRef}>

          {/* Fiche expédition */}
          <div className="suivi-trajet-card">
            <div className="suivi-trajet-card-header">
              <div className="suivi-trajet-card-title">
                <IconBox size={17} />
                <span>Expédition</span>
                <code className="suivi-trajet-code-badge">{expedition.code_suivi}</code>
              </div>
              <span className={`suivi-trajet-status-badge ${getStatusClass(expedition.status)}`}>
                {getStatusLabel(expedition.status)}
              </span>
            </div>

            <div className="suivi-trajet-info-grid">
              <div className="suivi-trajet-info-item">
                <span className="suivi-trajet-info-label">Expéditeur</span>
                <span className="suivi-trajet-info-value">{expedition.expediteur_nom_complet || '—'}</span>
              </div>
              <div className="suivi-trajet-info-item">
                <span className="suivi-trajet-info-label">Destinataire</span>
                <span className="suivi-trajet-info-value">{expedition.destinataire_nom_complet || '—'}</span>
              </div>
              <div className="suivi-trajet-info-item">
                <span className="suivi-trajet-info-label">Agence départ</span>
                <span className="suivi-trajet-info-value">{expedition.agence_depart_nom || '—'}</span>
              </div>
              <div className="suivi-trajet-info-item">
                <span className="suivi-trajet-info-label">Agence destination</span>
                <span className="suivi-trajet-info-value">{expedition.agence_destination_nom || '—'}</span>
              </div>
              <div className="suivi-trajet-info-item">
                <span className="suivi-trajet-info-label">Agent responsable</span>
                <span className="suivi-trajet-info-value">{expedition.agent_nom_affichage || '—'}</span>
              </div>
              <div className="suivi-trajet-info-item">
                <span className="suivi-trajet-info-label">Date d'expédition</span>
                <span className="suivi-trajet-info-value">{formatDate(expedition.date_expedition)}</span>
              </div>
            </div>

            {expedition.observations && (
              <p className="suivi-trajet-observations">{expedition.observations}</p>
            )}
          </div>

          {/* Timeline du suivi */}
          <div className="suivi-trajet-card">
            <div className="suivi-trajet-section-title">
              <IconTimeline size={17} />
              <span>Historique du trajet</span>
              <span className="suivi-trajet-count">{suivi.length} étape{suivi.length !== 1 ? 's' : ''}</span>
            </div>

            {suivi.length === 0 ? (
              <p className="suivi-trajet-empty">Aucune étape enregistrée pour cette expédition.</p>
            ) : (
              <div className="suivi-trajet-timeline">
                {suivi.map((entry, index) => (
                  <div key={entry.id_suivi} className={`suivi-step ${index === 0 ? 'suivi-step--latest' : ''}`}>
                    <div className="suivi-step-track">
                      <div className={`suivi-step-dot ${getStatusClass(entry.status)}`} />
                      {index < suivi.length - 1 && <div className="suivi-step-line" />}
                    </div>
                    <div className="suivi-step-body">
                      <div className="suivi-step-top">
                        <span className={`suivi-step-status ${getStatusClass(entry.status)}`}>
                          {getStatusLabel(entry.status)}
                        </span>
                        <span className="suivi-step-date">{formatDate(entry.date_maj)}</span>
                      </div>
                      {entry.localisation_texte && (
                        <p className="suivi-step-location">
                          <IconPin size={12} />
                          {entry.localisation_texte}
                        </p>
                      )}
                      {entry.commentaire && (
                        <p className="suivi-step-comment">{entry.commentaire}</p>
                      )}
                      {entry.agent_nom && (
                        <p className="suivi-step-agent">
                          <IconUser size={12} />
                          {entry.agent_nom}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulaire d'ajout d'une étape (ADMIN ou agent assigné) */}
          {canEditSuivi && (
            <div className="suivi-trajet-card">
              <div className="suivi-trajet-section-title">
                <IconArrowRight size={17} />
                <span>Ajouter une étape</span>
              </div>

              <form className="suivi-trajet-form" onSubmit={handleSuiviSubmit}>
                <Select
                  label="Nouveau statut"
                  options={SUIVI_STATUS_OPTIONS}
                  value={suiviForm.status}
                  onChange={(e) => setSuiviForm((prev) => ({ ...prev, status: e.target.value }))}
                  required
                />
                <Input
                  label="Localisation (optionnel)"
                  placeholder="Ex : Dépôt de Kasumbalesa"
                  value={suiviForm.localisation_texte}
                  onChange={(e) =>
                    setSuiviForm((prev) => ({ ...prev, localisation_texte: e.target.value }))
                  }
                />
                <Input
                  label="Commentaire (optionnel)"
                  placeholder="Ex : Colis en attente de transit"
                  value={suiviForm.commentaire}
                  onChange={(e) =>
                    setSuiviForm((prev) => ({ ...prev, commentaire: e.target.value }))
                  }
                />

                {submitError && (
                  <p className="suivi-trajet-alert suivi-trajet-alert--error">{submitError}</p>
                )}
                {submitSuccess && (
                  <p className="suivi-trajet-alert suivi-trajet-alert--success">{submitSuccess}</p>
                )}

                <div className="suivi-trajet-form-actions">
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    icon={null}
                    className="suivi-trajet-submit-button"
                  >
                    Enregistrer l'étape
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SuiviTrajet
