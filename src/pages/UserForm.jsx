import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { IconOffice, IconPhone, IconUser } from '../components/ui/Icons'
import { listAgencies } from '../lib/agencesApi'
import { USER_ROLE_OPTIONS, USER_STATUS_OPTIONS, createUser, getUserById, updateUser } from '../lib/usersApi'
import '../styles/Agences.css'

const phoneRegex = /^\+?[0-9]{8,15}$/

const DEFAULT_AGENCY_OPTION = { value: '', label: 'Aucune agence rattachee' }

/* Ce composant gere la creation et la modification d un utilisateur avec selection conditionnelle d agence selon le role. */
const UserForm = () => {
  const navigate = useNavigate()
  const { userId } = useParams()
  const isEditMode = Boolean(userId)

  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [nomAffichage, setNomAffichage] = useState('')
  const [telephone, setTelephone] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [roleSysteme, setRoleSysteme] = useState('CLIENT')
  const [refAgence, setRefAgence] = useState('')
  const [status, setStatus] = useState('ACTIVE')

  const [agencyOptions, setAgencyOptions] = useState([DEFAULT_AGENCY_OPTION])

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
        const [agencies, user] = await Promise.all([
          listAgencies(),
          isEditMode ? getUserById(userId) : Promise.resolve(null),
        ])

        if (cancelled) return

        setAgencyOptions([
          DEFAULT_AGENCY_OPTION,
          ...agencies.map((agency) => ({
            value: agency.id_agence,
            label: `${agency.nom_agence} (${agency.code_agence})`,
          })),
        ])

        if (user) {
          setNomAffichage(user.nom_affichage ?? '')
          setTelephone(user.telephone ?? '')
          setRoleSysteme(user.role_systeme ?? 'CLIENT')
          setRefAgence(user.ref_agence ?? '')
          setStatus(user.status ?? 'ACTIVE')
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
  }, [isEditMode, userId])

  const handleRoleChange = (event) => {
    const nextRole = event.target.value
    setRoleSysteme(nextRole)
    if (nextRole !== 'AGENT') setRefAgence('')
    clearMessages()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const cleanNom = nomAffichage.trim()
    const cleanTel = telephone.replace(/\s+/g, '')
    const cleanAgence = refAgence.trim()

    if (!cleanNom || !cleanTel) {
      setErrorMessage('Le nom d affichage et le telephone sont obligatoires.')
      return
    }

    if (!phoneRegex.test(cleanTel)) {
      setErrorMessage('Veuillez saisir un numero de telephone valide.')
      return
    }

    if (!isEditMode && motDePasse.length < 6) {
      setErrorMessage('Le mot de passe doit contenir au moins 6 caracteres.')
      return
    }

    if (roleSysteme === 'AGENT' && !cleanAgence) {
      setErrorMessage('Veuillez selectionner une agence pour un compte agent.')
      return
    }

    const payload = {
      nom_affichage: cleanNom,
      noms: cleanNom,
      telephone: cleanTel,
      role_systeme: roleSysteme,
      role: roleSysteme,
      status,
      ref_agence: roleSysteme === 'AGENT' ? cleanAgence : null,
    }

    if (!isEditMode) {
      payload.mot_de_passe = motDePasse
      payload.password = motDePasse
    }

    setIsSubmitting(true)
    clearMessages()

    try {
      const response = isEditMode
        ? await updateUser(userId, payload)
        : await createUser(payload)

      setSuccessMessage(response.message ?? (isEditMode ? 'Modifications enregistrees.' : 'Utilisateur cree.'))
      setErrorMessage('')

      if (!isEditMode) {
        setTimeout(() => navigate('/dashboard/utilisateurs', { state: { successMessage: response.message ?? 'Utilisateur cree.' } }), 800)
      }
    } catch (error) {
      setSuccessMessage('')
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="agencies-form-page fade-in" aria-label={isEditMode ? 'Modification utilisateur' : 'Nouvel utilisateur'}>
      <header className="agencies-header">
        <div>
          <h1>{isEditMode ? 'Modifier l utilisateur' : 'Nouvel utilisateur'}</h1>
          <p>
            {isEditMode
              ? 'Mettez a jour les informations et le role du compte utilisateur.'
              : 'Creez un nouveau compte avec son role et ses permissions.'}
          </p>
        </div>

        <Button variant="outline" type="button" icon={null} onClick={() => navigate('/dashboard/utilisateurs')}>
          Retour
        </Button>
      </header>

      <form className="agencies-form-stack" onSubmit={handleSubmit}>
        <article className="card agencies-card">
          <h2>Informations du compte</h2>
          <div className="agencies-divider" aria-hidden="true" />

          <div className="agencies-grid-two">
            <Input
              label="Nom d affichage"
              placeholder="Ex: Jean Mutombo"
              value={nomAffichage}
              onChange={(event) => { setNomAffichage(event.target.value); clearMessages() }}
              icon={<IconUser size={16} />}
            />
            <Input
              label="Telephone"
              type="tel"
              placeholder="+243 990 000 000"
              value={telephone}
              onChange={(event) => { setTelephone(event.target.value); clearMessages() }}
              icon={<IconPhone size={16} />}
            />
          </div>

          {!isEditMode && (
            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={motDePasse}
              onChange={(event) => { setMotDePasse(event.target.value); clearMessages() }}
            />
          )}

          <div className="agencies-grid-two">
            <Select
              label="Role systeme"
              value={roleSysteme}
              onChange={handleRoleChange}
              options={USER_ROLE_OPTIONS}
              icon={<IconUser size={16} />}
            />
            <Select
              label="Statut"
              value={status}
              onChange={(event) => { setStatus(event.target.value); clearMessages() }}
              options={USER_STATUS_OPTIONS}
            />
          </div>
        </article>

        {roleSysteme === 'AGENT' && (
          <article className="card agencies-card">
            <h2>Agence rattachee</h2>
            <div className="agencies-divider" aria-hidden="true" />
            <p className="agencies-card-hint">Un agent doit etre rattache a une agence active.</p>

            <Select
              label="Agence"
              value={refAgence}
              onChange={(event) => { setRefAgence(event.target.value); clearMessages() }}
              options={agencyOptions}
              icon={<IconOffice size={16} />}
            />
          </article>
        )}

        {isLoading && (
          <article className="agencies-empty-state agencies-loading-state" aria-live="polite">
            <h3>Chargement du formulaire...</h3>
          </article>
        )}

        {errorMessage && (
          <p className="agencies-alert agencies-alert-error" role="alert">{errorMessage}</p>
        )}
        {successMessage && !errorMessage && (
          <p className="agencies-alert agencies-alert-success" role="status">{successMessage}</p>
        )}

        <Button
          className="btn-full agencies-submit-btn"
          type="submit"
          icon={null}
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting
            ? 'Enregistrement...'
            : isEditMode
              ? 'Enregistrer les modifications'
              : 'Creer l utilisateur'}
        </Button>
      </form>
    </section>
  )
}

export default UserForm
