import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { IconBox, IconArrowRight, IconTimeline, IconUser, IconPin, IconBell, IconMessage } from '../components/ui/Icons'
import {
  createExpeditionSuiviByCodeSuivi,
  createExpeditionConfirmationByCodeSuivi,
  getExpeditionByCodeSuivi,
  getExpeditionSuiviByCodeSuivi,
  getExpeditionConfirmationByCodeSuivi,
} from '../lib/expeditionsApi'
import { readAuthSession } from '../lib/authSession'
import '../styles/ExpeditionDetail.css'

// TODO: Mettre DEMO_MODE = false quand les données réelles sont disponibles
const DEMO_MODE = false
const DEMO_DATA = {
  expedition: {
    code_suivi: 'EXP-2026-AB12CD',
    status: 'EN_TRANSIT',
    expediteur_nom_complet: 'Jean-Pierre Mukendi',
    destinataire_nom_complet: 'Marie Kalala Mbuyi',
    agent_nom_affichage: 'Paul Kasongo',
    agence_depart_nom: 'Agence Kinshasa Centre',
    agence_destination_nom: 'Agence Lubumbashi Nord',
    date_expedition: '2026-05-08T10:00:00Z',
    created_at: '2026-05-08T09:45:00Z',
    updated_at: '2026-05-09T14:30:00Z',
    observations: 'Colis fragile — manipuler avec précaution. Livraison attendue sous 3 jours.',
    colis: [
      { id_colis: '1', categorie: 'Électronique', description: 'Ordinateur portable HP EliteBook', poids: 2.5, observations: 'Emballage renforcé' },
      { id_colis: '2', categorie: 'Vêtements', description: 'Carton de vêtements enfants', poids: 8.0, observations: null },
      { id_colis: '3', categorie: 'Alimentation', description: 'Produits alimentaires secs', poids: 15.3, observations: "Ne pas exposer à l'humidité" },
    ],
  },
  suivi: [
    { id_suivi: '1', status: 'EN_TRANSIT', localisation_texte: 'Dépôt de Kasumbalesa', commentaire: 'Colis en transit vers Lubumbashi', date_maj: '2026-05-09T14:30:00Z', agent_nom: 'Paul Kasongo' },
    { id_suivi: '2', status: 'EXPEDIE', localisation_texte: 'Agence Kinshasa Centre', commentaire: 'Expédition prise en charge', date_maj: '2026-05-08T10:00:00Z', agent_nom: 'Paul Kasongo' },
  ],
  confirmation: null,
}

const SUIVI_STATUS_OPTIONS = [
  { value: 'EXPEDIE', label: 'Expedie' },
  { value: 'EN_TRANSIT', label: 'En transit' },
  { value: 'LIVRE', label: 'Livre' },
  { value: 'ANNULE', label: 'Annule' },
  { value: 'NON_RECUPERE', label: 'Non recupere' },
  { value: 'PERDU', label: 'Perdu' },
]

/* Ce composant affiche les informations lisibles et completes d'une expedition avec detail complet. */
const ExpeditionDetail = () => {
  const navigate = useNavigate()
  const { expeditionNumero } = useParams()
  const [expedition, setExpedition] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [suivi, setSuivi] = useState([])
  const [confirmation, setConfirmation] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isSubmittingSuivi, setIsSubmittingSuivi] = useState(false)
  const [suiviSubmitError, setSuiviSubmitError] = useState('')
  const [suiviSubmitSuccess, setSuiviSubmitSuccess] = useState('')
  const [isSubmittingConfirmation, setIsSubmittingConfirmation] = useState(false)
  const [confirmationSubmitError, setConfirmationSubmitError] = useState('')
  const [confirmationSubmitSuccess, setConfirmationSubmitSuccess] = useState('')
  const [suiviForm, setSuiviForm] = useState({
    status: 'EN_TRANSIT',
    localisation_texte: '',
    commentaire: '',
  })
  const [confirmationForm, setConfirmationForm] = useState({
    nom_recepteur: '',
    telephone_recepteur: '',
    commentaire: '',
    colis_recu_en_bon_etat: true,
  })

  const session = readAuthSession()
  const isAdmin = session?.role_systeme === 'ADMIN'
  const isAssignedAgent = session?.role_systeme === 'AGENT' && expedition?.ref_agent && String(session?.id_utilisateur) === String(expedition?.ref_agent)
  const canEditSuivi = DEMO_MODE || isAdmin || isAssignedAgent

  const refreshExpeditionDetail = async (codeSuivi, { showGlobalLoading = false } = {}) => {
    if (showGlobalLoading) {
      setIsLoading(true)
      setErrorMessage('')
    }

    const data = await getExpeditionByCodeSuivi(codeSuivi)
    setExpedition(data.expedition)

    const [suiviData, confirmationData] = await Promise.all([
      getExpeditionSuiviByCodeSuivi(codeSuivi),
      getExpeditionConfirmationByCodeSuivi(codeSuivi),
    ])

    setSuivi(suiviData)
    setConfirmation(confirmationData)

    if (showGlobalLoading) {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    // Mode démo : charger données fictives sans appel API
    if (DEMO_MODE) {
      setExpedition(DEMO_DATA.expedition)
      setSuivi(DEMO_DATA.suivi)
      setConfirmation(DEMO_DATA.confirmation)
      setIsLoading(false)
      return
    }

    const loadDetail = async () => {
      try {
        await refreshExpeditionDetail(expeditionNumero, { showGlobalLoading: true })
      } catch (error) {
        if (!cancelled) setErrorMessage(error.message || 'Chargement impossible.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    if (expeditionNumero) {
      loadDetail()
    } else {
      setErrorMessage('Code expedition invalide.')
      setIsLoading(false)
    }

    return () => {
      cancelled = true
    }
  }, [expeditionNumero])

  const totalPoids = useMemo(() => {
    if (!expedition?.colis) return '0.00'
    return expedition.colis.reduce((sum, item) => sum + Number(item.poids || 0), 0).toFixed(2)
  }, [expedition])

  const getStatusColor = (status) => {
    const statusColors = {
      EXPEDIE: 'status-expedie',
      EN_TRANSIT: 'status-en-transit',
      LIVRE: 'status-livre',
      ANNULE: 'status-annule',
      NON_RECUPERE: 'status-non-recupere',
      PERDU: 'status-perdu',
    }
    return statusColors[status] || 'status-default'
  }

  const getStatusLabel = (status) => {
    const statusMap = {
      EXPEDIE: 'Expédié',
      EN_TRANSIT: 'En transit',
      LIVRE: 'Livré',
      ANNULE: 'Annulé',
      NON_RECUPERE: 'Non récupéré',
      PERDU: 'Perdu',
    }
    return statusMap[status] || status
  }

  const isDelivered = expedition?.status === 'LIVRE'
  const canShowConfirmationForm = isDelivered && !confirmation

  useEffect(() => {
    if (expedition?.status) {
      setSuiviForm((prev) => ({ ...prev, status: expedition.status }))
    }
  }, [expedition?.status])

  const handleSuiviFormChange = (field, value) => {
    setSuiviSubmitError('')
    setSuiviSubmitSuccess('')
    setSuiviForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleConfirmationFormChange = (field, value) => {
    setConfirmationSubmitError('')
    setConfirmationSubmitSuccess('')
    setConfirmationForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmitSuivi = async (event) => {
    event.preventDefault()

    if (!canEditSuivi) {
      setSuiviSubmitError('Vous n\'avez pas les droits pour mettre a jour ce suivi.')
      return
    }

    if (!suiviForm.status) {
      setSuiviSubmitError('Veuillez choisir un statut de suivi.')
      return
    }

    if (!suiviForm.localisation_texte.trim()) {
      setSuiviSubmitError('La localisation est obligatoire.')
      return
    }

    setIsSubmittingSuivi(true)
    setSuiviSubmitError('')
    setSuiviSubmitSuccess('')

    try {
      if (DEMO_MODE) {
        const newSuivi = {
          id_suivi: `demo-${Date.now()}`,
          status: suiviForm.status,
          localisation_texte: suiviForm.localisation_texte.trim(),
          commentaire: suiviForm.commentaire.trim() || null,
          date_maj: new Date().toISOString(),
          agent_nom: session?.nom_affichage || 'Agent',
        }

        setSuivi((prev) => [newSuivi, ...prev])
        setExpedition((prev) => ({ ...prev, status: suiviForm.status, updated_at: new Date().toISOString() }))
      } else {
        await createExpeditionSuiviByCodeSuivi(expedition.code_suivi, {
          status: suiviForm.status,
          localisation_texte: suiviForm.localisation_texte.trim(),
          commentaire: suiviForm.commentaire.trim(),
        })

        await refreshExpeditionDetail(expedition.code_suivi)
      }

      setSuiviSubmitSuccess('Suivi ajoute avec succes.')
      setSuiviForm((prev) => ({
        ...prev,
        localisation_texte: '',
        commentaire: '',
      }))
    } catch (error) {
      setSuiviSubmitError(error.message || 'Impossible d\'ajouter ce suivi.')
    } finally {
      setIsSubmittingSuivi(false)
    }
  }

  const handleSubmitConfirmation = async (event) => {
    event.preventDefault()

    if (!expedition?.code_suivi) {
      setConfirmationSubmitError('Code expedition invalide.')
      return
    }

    if (!isDelivered) {
      setConfirmationSubmitError('La confirmation est possible uniquement pour une expedition livree.')
      return
    }

    if (confirmation) {
      setConfirmationSubmitError('Cette expedition a deja une confirmation de reception.')
      return
    }

    if (!confirmationForm.nom_recepteur.trim()) {
      setConfirmationSubmitError('Le nom du recepteur est obligatoire.')
      return
    }

    setIsSubmittingConfirmation(true)
    setConfirmationSubmitError('')
    setConfirmationSubmitSuccess('')

    try {
      const payload = {
        nom_recepteur: confirmationForm.nom_recepteur.trim(),
        telephone_recepteur: confirmationForm.telephone_recepteur.trim(),
        commentaire: confirmationForm.commentaire.trim(),
        colis_recu_en_bon_etat: Boolean(confirmationForm.colis_recu_en_bon_etat),
        mode_confirmation: 'CLIENT',
      }

      if (DEMO_MODE) {
        setConfirmation({
          id_confirmation: `demo-${Date.now()}`,
          ref_expedition: expedition.id_expedition,
          nom_recepteur: payload.nom_recepteur,
          telephone_recepteur: payload.telephone_recepteur || null,
          commentaire: payload.commentaire || null,
          colis_recu_en_bon_etat: payload.colis_recu_en_bon_etat,
          date_reception: new Date().toISOString(),
          ref_confirme_par: session?.id_utilisateur || null,
          mode_confirmation: payload.mode_confirmation,
          agent_nom: session?.nom_affichage || null,
          created_at: new Date().toISOString(),
        })
      } else {
        await createExpeditionConfirmationByCodeSuivi(expedition.code_suivi, payload)
        await refreshExpeditionDetail(expedition.code_suivi)
      }

      setConfirmationSubmitSuccess('Confirmation de reception enregistree avec succes.')
      setConfirmationForm({
        nom_recepteur: '',
        telephone_recepteur: '',
        commentaire: '',
        colis_recu_en_bon_etat: true,
      })
    } catch (error) {
      setConfirmationSubmitError(error.message || 'Impossible d\'enregistrer la confirmation.')
    } finally {
      setIsSubmittingConfirmation(false)
    }
  }

  if (isLoading) {
    return (
      <section className="expedition-detail-page fade-in" aria-label="Chargement detail expedition">
        <article className="expedition-detail-card">
          <h1>Détail de l'expédition</h1>
          <p>Chargement des données...</p>
        </article>
      </section>
    )
  }

  if (errorMessage || !expedition) {
    return (
      <section className="expedition-detail-page fade-in" aria-label="Detail expedition introuvable">
        <article className="expedition-detail-card">
          <h1>Expédition introuvable</h1>
          <p>{errorMessage || "Cette expédition n'existe pas ou a été supprimée."}</p>
          <Link to="/dashboard/expedients" className="expedition-link-inline">Retour à la liste</Link>
        </article>
      </section>
    )
  }

  return (
    <section className="expedition-detail-page fade-in" aria-label="Detail expedition">
      <header className="expedition-detail-header">
        <div className="expedition-detail-header-left">
          <div>
            <h1>Détail de l'expédition</h1>
            <p className="expedition-detail-subtitle">{expedition.code_suivi}</p>
          </div>
          <div className={`expedition-detail-status ${getStatusColor(expedition.status)}`}>
            <span className="status-icon">●</span>
            <span className="status-text">{getStatusLabel(expedition.status)}</span>
          </div>
        </div>
        <div className="expedition-detail-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/dashboard/expedients')}
          >
            Retour
          </Button>
          <div className="expedition-actions-dropdown">
            <button
              type="button"
              className="expedition-actions-trigger"
              onClick={() => setDropdownOpen(prev => !prev)}
              aria-label="Plus d'actions"
            >
              <span>&#8226;&#8226;&#8226;</span>
            </button>
            {dropdownOpen && (
              <>
                <div className="expedition-actions-overlay" onClick={() => setDropdownOpen(false)} />
                <div className="expedition-actions-menu">
                  <button
                    type="button"
                    className="expedition-actions-item"
                    onClick={() => { setDropdownOpen(false); }}
                  >
                    Détails
                  </button>
                  <button
                    type="button"
                    className="expedition-actions-item"
                    onClick={() => { setDropdownOpen(false); navigate(`/dashboard/expedients/${expedition.code_suivi}/modifier`) }}
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    className="expedition-actions-item expedition-actions-item--danger"
                    onClick={() => { setDropdownOpen(false); alert('Supprimer : à implémenter') }}
                  >
                    Supprimer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Parties prenantes */}
      <article className="expedition-detail-card">
        <div className="card-header">
          <IconUser size={20} />
          <h2>Parties prenantes</h2>
        </div>
        <div className="expedition-detail-grid">
          <div className="detail-field">
            <span className="field-label">Expéditeur</span>
            <strong className="field-value">{expedition.expediteur_nom_complet || '-'}</strong>
          </div>
          <div className="detail-field">
            <span className="field-label">Destinataire</span>
            <strong className="field-value">{expedition.destinataire_nom_complet || '-'}</strong>
          </div>
          {expedition.agent_nom_affichage && (
            <div className="detail-field">
              <span className="field-label">Agent affecté</span>
              <strong className="field-value">{expedition.agent_nom_affichage}</strong>
            </div>
          )}
        </div>
      </article>

      {/* Agences et trajet */}
      <article className="expedition-detail-card">
        <div className="card-header">
          <IconPin size={20} />
          <h2>Trajet et agences</h2>
        </div>
        <div className="expedition-route">
          <div className="route-stop">
            <div className="route-label">De</div>
            <div className="route-content">
              <strong>{expedition.agence_depart_nom || '-'}</strong>
            </div>
          </div>
          <div className="route-arrow">
            <IconArrowRight size={20} />
          </div>
          <div className="route-stop">
            <div className="route-label">À</div>
            <div className="route-content">
              <strong>{expedition.agence_destination_nom || '-'}</strong>
            </div>
          </div>
        </div>
      </article>

      {/* Dates et informations */}
      <article className="expedition-detail-card">
        <div className="card-header">
          <IconTimeline size={20} />
          <h2>Informations temporelles</h2>
        </div>
        <div className="expedition-detail-grid">
          <div className="detail-field">
            <span className="field-label">Date d'expédition</span>
            <strong className="field-value">{new Date(expedition.date_expedition).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
          </div>
          <div className="detail-field">
            <span className="field-label">Créée le</span>
            <strong className="field-value">{new Date(expedition.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
          </div>
          <div className="detail-field">
            <span className="field-label">Dernière mise à jour</span>
            <strong className="field-value">{new Date(expedition.updated_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
          </div>
        </div>
      </article>

      {/* Colis */}
      <article className="expedition-detail-card">
        <div className="card-header">
          <IconBox size={20} />
          <h2>Colis ({expedition.colis?.length || 0})</h2>
        </div>
        <div className="expedition-colis-summary">
          <div className="summary-stat">
            <span className="summary-label">Nombre de colis</span>
            <span className="summary-value">{expedition.colis?.length || 0}</span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">Poids total</span>
            <span className="summary-value">{totalPoids} kg</span>
          </div>
        </div>
        <div className="expedition-colis-list">
          {expedition.colis && expedition.colis.length > 0 ? (
            expedition.colis.map((item, index) => (
              <article key={item.id_colis || `${item.code_colis}-${index}`} className="expedition-colis-row">
                <div className="colis-icon">
                  <IconBox size={18} color="var(--color-primary)" />
                </div>
                <div className="colis-info">
                  <h3>Colis {index + 1}: {item.categorie}</h3>
                  <p className="colis-description">{item.description}</p>
                  {item.observations && <p className="colis-notes">{item.observations}</p>}
                </div>
                <div className="colis-meta">
                  <span className="meta-badge">{Number(item.poids || 0).toFixed(2)} kg</span>
                </div>
              </article>
            ))
          ) : (
            <p className="expedition-empty">Aucun colis enregistré pour cette expédition.</p>
          )}
        </div>
      </article>

      {/* Observations */}
      {expedition.observations && (
        <article className="expedition-detail-card">
          <div className="card-header">
            <IconMessage size={20} />
            <h2>Observations</h2>
          </div>
          <p className="expedition-detail-note">{expedition.observations}</p>
        </article>
      )}

      {/* Confirmation de réception */}
      {confirmation && (
        <article className="expedition-detail-card">
          <div className="card-header">
            <IconBell size={20} />
            <h2>Confirmation de réception</h2>
          </div>
          <div className="expedition-detail-grid">
            <div className="detail-field">
              <span className="field-label">Récepteur</span>
              <strong className="field-value">{confirmation.nom_recepteur || '-'}</strong>
            </div>
            <div className="detail-field">
              <span className="field-label">Téléphone récepteur</span>
              <strong className="field-value">{confirmation.telephone_recepteur || '-'}</strong>
            </div>
            <div className="detail-field">
              <span className="field-label">Date de réception</span>
              <strong className="field-value">{new Date(confirmation.date_reception).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
            </div>
            <div className="detail-field">
              <span className="field-label">Mode de confirmation</span>
              <strong className="field-value">{confirmation.mode_confirmation || '-'}</strong>
            </div>
            <div className="detail-field">
              <span className="field-label">Colis en bon état</span>
              <strong className="field-value">{confirmation.colis_recu_en_bon_etat ? '✓ Oui' : '✗ Non'}</strong>
            </div>
            {confirmation.agent_nom && (
              <div className="detail-field">
                <span className="field-label">Confirmé par</span>
                <strong className="field-value">{confirmation.agent_nom}</strong>
              </div>
            )}
          </div>
          {confirmation.commentaire && (
            <p className="expedition-detail-note">{confirmation.commentaire}</p>
          )}
        </article>
      )}

      {confirmationSubmitSuccess && (
        <p className="expedition-suivi-feedback expedition-suivi-feedback-success expedition-confirmation-feedback">
          {confirmationSubmitSuccess}
        </p>
      )}

      {/* Formulaire de confirmation de reception */}
      {canShowConfirmationForm && (
        <article className="expedition-detail-card">
          <div className="card-header">
            <IconBell size={20} />
            <h2>Confirmer la reception</h2>
          </div>

          <form className="expedition-suivi-form" onSubmit={handleSubmitConfirmation}>
            <Input
              label="Nom du recepteur"
              placeholder="Ex: Marie Kalala"
              value={confirmationForm.nom_recepteur}
              onChange={(event) => handleConfirmationFormChange('nom_recepteur', event.target.value)}
              disabled={isSubmittingConfirmation}
            />

            <Input
              label="Telephone du recepteur"
              placeholder="Ex: +243 900 000 000"
              value={confirmationForm.telephone_recepteur}
              onChange={(event) => handleConfirmationFormChange('telephone_recepteur', event.target.value)}
              disabled={isSubmittingConfirmation}
            />

            <label className="expedition-suivi-textarea-label" htmlFor="confirmation-commentaire">Commentaire</label>
            <textarea
              id="confirmation-commentaire"
              className="expedition-suivi-textarea"
              placeholder="Informations complementaires sur la reception"
              value={confirmationForm.commentaire}
              onChange={(event) => handleConfirmationFormChange('commentaire', event.target.value)}
              disabled={isSubmittingConfirmation}
              rows={4}
            />

            <label className="expedition-confirmation-checkbox" htmlFor="colis-bon-etat">
              <input
                id="colis-bon-etat"
                type="checkbox"
                checked={Boolean(confirmationForm.colis_recu_en_bon_etat)}
                onChange={(event) => handleConfirmationFormChange('colis_recu_en_bon_etat', event.target.checked)}
                disabled={isSubmittingConfirmation}
              />
              <span>Colis recu en bon etat</span>
            </label>

            {confirmationSubmitError && <p className="expedition-suivi-feedback expedition-suivi-feedback-error">{confirmationSubmitError}</p>}
            {confirmationSubmitSuccess && <p className="expedition-suivi-feedback expedition-suivi-feedback-success">{confirmationSubmitSuccess}</p>}

            <div className="expedition-suivi-form-actions">
              <Button type="submit" variant="primary" disabled={isSubmittingConfirmation}>
                {isSubmittingConfirmation ? 'Enregistrement...' : 'Confirmer la reception'}
              </Button>
            </div>
          </form>
        </article>
      )}

      {!isDelivered && !confirmation && (
        <article className="expedition-detail-card">
          <div className="card-header">
            <IconBell size={20} />
            <h2>Confirmation de reception</h2>
          </div>
          <p className="expedition-empty expedition-confirmation-pending-note">
            La confirmation de reception sera disponible une fois l'expedition marquee comme livree.
          </p>
        </article>
      )}

      {/* Formulaire de mise a jour du suivi */}
      <article className="expedition-detail-card">
        <div className="card-header">
          <IconTimeline size={20} />
          <h2>Ajouter une mise a jour de suivi</h2>
        </div>

        {!canEditSuivi && (
          <p className="expedition-empty expedition-suivi-permission-note">
            Seul l'agent affecte a cette expedition ou un administrateur peut ajouter un suivi.
          </p>
        )}

        <form className="expedition-suivi-form" onSubmit={handleSubmitSuivi}>
          <Select
            label="Statut"
            value={suiviForm.status}
            onChange={(event) => handleSuiviFormChange('status', event.target.value)}
            options={SUIVI_STATUS_OPTIONS}
            disabled={!canEditSuivi || isSubmittingSuivi}
          />

          <Input
            label="Localisation"
            placeholder="Ex: Depot de Goma"
            value={suiviForm.localisation_texte}
            onChange={(event) => handleSuiviFormChange('localisation_texte', event.target.value)}
            disabled={!canEditSuivi || isSubmittingSuivi}
          />

          <label className="expedition-suivi-textarea-label" htmlFor="suivi-commentaire">Commentaire</label>
          <textarea
            id="suivi-commentaire"
            className="expedition-suivi-textarea"
            placeholder="Informations complementaires sur le suivi"
            value={suiviForm.commentaire}
            onChange={(event) => handleSuiviFormChange('commentaire', event.target.value)}
            disabled={!canEditSuivi || isSubmittingSuivi}
            rows={4}
          />

          {suiviSubmitError && <p className="expedition-suivi-feedback expedition-suivi-feedback-error">{suiviSubmitError}</p>}
          {suiviSubmitSuccess && <p className="expedition-suivi-feedback expedition-suivi-feedback-success">{suiviSubmitSuccess}</p>}

          <div className="expedition-suivi-form-actions">
            <Button type="submit" variant="primary" disabled={!canEditSuivi || isSubmittingSuivi}>
              {isSubmittingSuivi ? 'Enregistrement...' : 'Ajouter le suivi'}
            </Button>
          </div>
        </form>
      </article>

      {/* Historique de suivi */}
      <article className="expedition-detail-card">
        <div className="card-header">
          <IconTimeline size={20} />
          <h2>Historique de suivi</h2>
        </div>
        {suivi && suivi.length > 0 ? (
          <div className="expedition-suivi-list">
            {suivi.map((item, index) => (
              <div key={item.id_suivi || index} className="suivi-item">
                <div className="suivi-header">
                  <span className={`suivi-status ${getStatusColor(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </span>
                  <span className="suivi-date">{new Date(item.date_maj).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                {item.localisation_texte && (
                  <p className="suivi-localisation">
                    <img src="/map-location.svg" alt="" className="suivi-localisation-icon" />
                    {item.localisation_texte}
                  </p>
                )}
                {item.commentaire && (
                  <p className="suivi-commentaire">{item.commentaire}</p>
                )}
                {item.agent_nom && (
                  <p className="suivi-agent">Par : {item.agent_nom}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="expedition-empty">Aucun historique de suivi pour cette expedition.</p>
        )}
      </article>
    </section>
  )
}

export default ExpeditionDetail
