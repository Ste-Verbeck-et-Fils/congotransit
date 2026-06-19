/* Page profil : permet a l utilisateur connecte de modifier ses informations, son mot de passe
   et de consulter la fiche personne liee a son numero de telephone. */
import React, { useEffect, useState } from 'react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { IconLock, IconPhone, IconUser } from '../components/ui/Icons'
import { changeMyPassword, getMyProfile, updateMyProfile } from '../lib/profileApi'
import { readAuthSession, saveAuthSession } from '../lib/authSession'
import '../styles/Profile.css'

const phoneRegex = /^\+?[0-9]{8,15}$/

const ROLE_LABELS = {
  ADMIN: 'Administrateur',
  AGENT: 'Agent',
  CLIENT: 'Client',
}

const Profile = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [nomAffichage, setNomAffichage] = useState('')
  const [telephone, setTelephone] = useState('')
  const [roleSysteme, setRoleSysteme] = useState('')
  const [nomAgence, setNomAgence] = useState('') // Ajouté
  const [createdAt, setCreatedAt] = useState('')

  const [ancienMotDePasse, setAncienMotDePasse] = useState('')
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('')
  const [confirmMotDePasse, setConfirmMotDePasse] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadProfile = async () => {
      setIsLoading(true)
      try {
        const user = await getMyProfile()
        if (cancelled) return
        setNomAffichage(user.nom_affichage ?? '')
        setTelephone(user.telephone ?? '')
        setRoleSysteme(user.role_systeme ?? '')
        setNomAgence(user.nomAgence ?? '') // Ajouté
        setCreatedAt(user.created_at ?? '')
      } catch (error) {
        if (!cancelled) setErrorMessage(`Chargement impossible : ${error.message}`)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadProfile()
    return () => { cancelled = true }
  }, [])

  const clearMessages = () => {
    if (errorMessage) setErrorMessage('')
    if (successMessage) setSuccessMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const cleanNom = nomAffichage.trim()
    const cleanTel = telephone.replace(/\s+/g, '')
    const wantsPasswordChange = Boolean(ancienMotDePasse || nouveauMotDePasse || confirmMotDePasse)

    if (!cleanNom || !cleanTel) {
      setErrorMessage('Le nom et le telephone sont obligatoires.')
      return
    }

    if (!phoneRegex.test(cleanTel)) {
      setErrorMessage('Veuillez saisir un numero de telephone valide.')
      return
    }

    if (wantsPasswordChange) {
      if (!ancienMotDePasse || !nouveauMotDePasse || !confirmMotDePasse) {
        setErrorMessage('Pour changer le mot de passe, renseignez les 3 champs de securite.')
        return
      }

      if (nouveauMotDePasse.length < 6) {
        setErrorMessage('Le nouveau mot de passe doit contenir au moins 6 caracteres.')
        return
      }

      if (nouveauMotDePasse !== confirmMotDePasse) {
        setErrorMessage('Les mots de passe ne correspondent pas.')
        return
      }
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await updateMyProfile({ nom_affichage: cleanNom, telephone: cleanTel })
      const updatedUser = response.user

      // Mise a jour de l'etat local
      setNomAffichage(updatedUser.nom_affichage)
      setTelephone(updatedUser.telephone)
      setNomAgence(updatedUser.nomAgence ?? '')

      // Mise a jour de la session locale
      saveAuthSession({
        token: readAuthSession()?.jwtToken,
        user: {
          id_utilisateur: updatedUser.id,
          role_systeme: updatedUser.role_systeme,
          ref_agence: updatedUser.refAgence,
          telephone: updatedUser.telephone,
          nom_affichage: updatedUser.nom_affichage,
        },
      })

      if (wantsPasswordChange) {
        await changeMyPassword({
          ancien_mot_de_passe: ancienMotDePasse,
          nouveau_mot_de_passe: nouveauMotDePasse,
        })
      }

      setSuccessMessage(wantsPasswordChange ? 'Profil et mot de passe mis a jour avec succes.' : 'Profil mis a jour avec succes.')

      if (wantsPasswordChange) {
        setAncienMotDePasse('')
        setNouveauMotDePasse('')
        setConfirmMotDePasse('')
      }
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="profile-page fade-in" aria-label="Mon profil">
      <header className="profile-header">
        <div>
          <h1>Mon profil</h1>
          <p>Consultez et mettez a jour les informations de votre compte.</p>
        </div>
        {!isLoading && (
          <div className="profile-meta-info">
            <span className="badge-role">{ROLE_LABELS[roleSysteme] || roleSysteme}</span>
            {nomAgence && <span className="badge-agence">{nomAgence}</span>}
            {createdAt && (
              <span className="profile-created-at">
                Membre depuis le {new Date(createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
        )}
        {isLoading && (
          <div className="profile-meta-info">
             <span className="badge-role" style={{ width: '80px', height: '20px', opacity: 0.5 }}>...</span>
          </div>
        )}
      </header>

      {isLoading && (
        <div className="profile-loading-overlay" style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>
          Récupération de vos informations...
        </div>
      )}

      {errorMessage && (
        <p className="profile-feedback profile-feedback-error" role="alert">{errorMessage}</p>
      )}
      {successMessage && !errorMessage && (
        <p className="profile-feedback profile-feedback-success" role="status">{successMessage}</p>
      )}

      <form className="profile-form" onSubmit={handleSubmit} noValidate>
        {/* Carte avatar + meta */}
       

        {/* Formulaire informations */}
        <article className="card profile-card">
          <h2>Informations personnelles</h2>
          <div className="profile-divider" aria-hidden="true" />

          <div className="profile-grid-two">
            <Input
              label="Nom d affichage"
              placeholder="Ex: Jean Mutombo"
              value={nomAffichage}
              onChange={(e) => { setNomAffichage(e.target.value); clearMessages() }}
              icon={<IconUser size={16} />}
              disabled={isLoading || isSubmitting}
            />
            <Input
              label="Telephone"
              type="tel"
              placeholder="+243 990 000 000"
              value={telephone}
              onChange={(e) => { setTelephone(e.target.value); clearMessages() }}
              icon={<IconPhone size={16} />}
              disabled={isLoading || isSubmitting}
            />
          </div>
        </article>

        {/* Formulaire mot de passe */}
        <article className="card profile-card">
          <h2>Securite du compte</h2>
          <p className="profile-card-hint">Laissez vide si vous ne souhaitez pas changer le mot de passe.</p>
          <div className="profile-divider" aria-hidden="true" />

          <Input
            label="Ancien mot de passe"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={ancienMotDePasse}
            onChange={(e) => { setAncienMotDePasse(e.target.value); clearMessages() }}
            icon={<IconLock size={16} />}
            disabled={isLoading || isSubmitting}
          />
          <div className="profile-grid-two">
            <Input
              label="Nouveau mot de passe"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={nouveauMotDePasse}
              onChange={(e) => { setNouveauMotDePasse(e.target.value); clearMessages() }}
              icon={<IconLock size={16} />}
              disabled={isLoading || isSubmitting}
            />
            <Input
              label="Confirmer le mot de passe"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={confirmMotDePasse}
              onChange={(e) => { setConfirmMotDePasse(e.target.value); clearMessages() }}
              icon={<IconLock size={16} />}
              disabled={isLoading || isSubmitting}
            />
          </div>
        </article>

        <div className="profile-form-actions">
          <Button type="submit" icon={null} isLoading={isSubmitting} disabled={isLoading || isSubmitting}>
            Enregistrer les modifications
          </Button>
        </div>
      </form>

      {/* Section fiche personne liee */}
      
    </section>
  )
}

export default Profile
