/* Page profil : permet a l utilisateur connecte de modifier ses informations, son mot de passe
   et de consulter la fiche personne liee a son numero de telephone. */
import React, { useEffect, useState } from 'react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { IconLock, IconPhone, IconUser } from '../components/ui/Icons'
import { changeMyPassword, getMyPerson, getMyProfile, updateMyProfile } from '../lib/profileApi'
import { readAuthSession, saveAuthSession } from '../lib/authSession'
import '../styles/Profile.css'

const phoneRegex = /^\+?[0-9]{8,15}$/

const ROLE_LABELS = {
  ADMIN: 'Administrateur',
  AGENT: 'Agent',
  CLIENT: 'Client',
}

const TYPE_PERSONNE_LABELS = {
  EXPEDITEUR: 'Expéditeur',
  DESTINATAIRE: 'Destinataire',
  LES_DEUX: 'Expéditeur & Destinataire',
}

const Profile = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [linkedPerson, setLinkedPerson] = useState(undefined) // undefined = pas encore chargé, null = aucune fiche

  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [nomAffichage, setNomAffichage] = useState('')
  const [telephone, setTelephone] = useState('')
  const [roleSysteme, setRoleSysteme] = useState('')
  const [createdAt, setCreatedAt] = useState('')

  const [ancienMotDePasse, setAncienMotDePasse] = useState('')
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('')
  const [confirmMotDePasse, setConfirmMotDePasse] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadProfile = async () => {
      setIsLoading(true)
      try {
        const [user, person] = await Promise.all([getMyProfile(), getMyPerson()])
        if (cancelled) return
        setNomAffichage(user.nom_affichage ?? '')
        setTelephone(user.telephone ?? '')
        setRoleSysteme(user.role_systeme ?? '')
        setCreatedAt(user.created_at ?? '')
        setLinkedPerson(person)
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
      await updateMyProfile({ nom_affichage: cleanNom, telephone: cleanTel })

      // Mise a jour de la session locale avec le nouveau nom/telephone
      const session = readAuthSession()
      if (session) {
        saveAuthSession({
          token: session.jwtToken,
          user: {
            ...session,
            nom_affichage: cleanNom,
            telephone: cleanTel,
          },
        })
      }

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

  if (isLoading) {
    return (
      <section className="profile-page fade-in" aria-label="Profil">
        <p className="profile-loading">Chargement du profil...</p>
      </section>
    )
  }

  return (
    <section className="profile-page fade-in" aria-label="Mon profil">
      <header className="profile-header">
        <div>
          <h1>Mon profil</h1>
          <p>Consultez et mettez a jour les informations de votre compte.</p>
        </div>
      </header>

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
            />
            <Input
              label="Telephone"
              type="tel"
              placeholder="+243 990 000 000"
              value={telephone}
              onChange={(e) => { setTelephone(e.target.value); clearMessages() }}
              icon={<IconPhone size={16} />}
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
            />
            <Input
              label="Confirmer le mot de passe"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={confirmMotDePasse}
              onChange={(e) => { setConfirmMotDePasse(e.target.value); clearMessages() }}
              icon={<IconLock size={16} />}
            />
          </div>
        </article>

        <div className="profile-form-actions">
          <Button type="submit" icon={null} isLoading={isSubmitting} disabled={isSubmitting}>
            Enregistrer les modifications
          </Button>
        </div>
      </form>

      {/* Section fiche personne liee */}
      {linkedPerson !== undefined && (
        <article className="card profile-card">
          <div className="profile-person-header">
            <h2>Fiche personne liee</h2>
          </div>
          <div className="profile-divider" aria-hidden="true" />

          {linkedPerson === null ? (
            <p className="profile-person-empty">
              Aucune fiche personne n est associee a votre numero de telephone.
            </p>
          ) : (
            <dl className="profile-person-grid">
              <div className="profile-person-field">
                <dt>Nom</dt>
                <dd>{linkedPerson.nom || '—'}</dd>
              </div>
              <div className="profile-person-field">
                <dt>Postnom</dt>
                <dd>{linkedPerson.postnom || '—'}</dd>
              </div>
              <div className="profile-person-field">
                <dt>Prenom</dt>
                <dd>{linkedPerson.prenom || '—'}</dd>
              </div>
              <div className="profile-person-field">
                <dt>Telephone</dt>
                <dd>{linkedPerson.telephone || '—'}</dd>
              </div>
              <div className="profile-person-field">
                <dt>Email</dt>
                <dd>{linkedPerson.email || '—'}</dd>
              </div>
              <div className="profile-person-field">
                <dt>Type</dt>
                <dd>{TYPE_PERSONNE_LABELS[linkedPerson.type_personne] ?? linkedPerson.type_personne}</dd>
              </div>
              {linkedPerson.adresse && (
                <div className="profile-person-field profile-person-field--full">
                  <dt>Adresse</dt>
                  <dd>
                    {[
                      linkedPerson.adresse.avenue && `Av. ${linkedPerson.adresse.avenue}`,
                      linkedPerson.adresse.numero && `N° ${linkedPerson.adresse.numero}`,
                      linkedPerson.adresse.quartier,
                      linkedPerson.adresse.commune,
                      linkedPerson.adresse.ville,
                      linkedPerson.adresse.province,
                    ].filter(Boolean).join(', ') || '—'}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </article>
      )}
    </section>
  )
}

export default Profile
