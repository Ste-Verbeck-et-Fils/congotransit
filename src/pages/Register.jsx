import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  IconArrowRight,
  IconBox,
  IconEye,
  IconEyeOff,
  IconPhone,
  IconUser,
} from '../components/ui/Icons'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { apiRequest } from '../lib/api'
import deliveryImage from '../assets/images/livraison.avif'
import '../styles/Login.css'

const Register = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [noms, setNoms] = useState('')
  const [telephone, setTelephone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const clearMessage = () => {
    if (message) setMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const cleanNoms = noms.trim()
    const cleanTelephone = telephone.replace(/\s+/g, '')

    if (!cleanNoms || !cleanTelephone || !password || !confirmPassword) {
      setMessage('Veuillez renseigner toutes les informations du compte.')
      return
    }

    if (!/^\+?[0-9]{8,15}$/.test(cleanTelephone)) {
      setMessage('Veuillez saisir un numero de telephone valide.')
      return
    }

    if (password.length < 6) {
      setMessage('Le mot de passe doit contenir au moins 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas.')
      return
    }

    setIsSubmitting(true)

    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          noms: cleanNoms,
          telephone: cleanTelephone,
          password,
        }),
      })

      setMessage('')
      navigate('/login', {
        state: {
          successMessage: 'Compte cree avec succes. Connectez-vous.',
        },
      })
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell register-shell" aria-label="Inscription Congo Transit">
        <div className="login-brand-panel" style={{ '--login-brand-image': `url(${deliveryImage})` }}>
          <div className="login-brand-block">
            <IconBox size={42} color="var(--color-primary)" />
            <p className="login-brand-name">CONGO TRANSIT</p>
            <p className="login-brand-copy">
              Creez un acces securise pour gerer les colis, trajets et profils internes.
            </p>
          </div>
        </div>

        <div className="login-form-panel register-form-panel">
          <div className="login-mobile-brand" aria-hidden="true">
            <IconBox size={32} color="var(--color-primary)" />
            <p>CONGO TRANSIT</p>
          </div>

          <form className="login-form register-form" onSubmit={handleSubmit}>
            <div className="auth-title-row">
              <h1>Inscription</h1>
              <p>Nouveau compte employe</p>
            </div>

            <Input
              id="register-noms"
              name="noms"
              label="Noms"
              type="text"
              placeholder="ex: Jean Mutombo"
              autoComplete="name"
              variant="login"
              icon={<IconUser size={16} />}
              value={noms}
              onChange={(event) => {
                setNoms(event.target.value)
                clearMessage()
              }}
              aria-invalid={Boolean(message)}
              aria-describedby={message ? 'register-message' : undefined}
            />

            <Input
              id="register-telephone"
              name="telephone"
              label="Telephone"
              type="tel"
              placeholder="ex: +243 990 000 000"
              autoComplete="tel"
              variant="login"
              icon={<IconPhone size={16} />}
              value={telephone}
              onChange={(event) => {
                setTelephone(event.target.value)
                clearMessage()
              }}
              aria-invalid={Boolean(message)}
              aria-describedby={message ? 'register-message' : undefined}
            />

            <Input
              id="register-password"
              name="password"
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              variant="login"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                clearMessage()
              }}
              aria-invalid={Boolean(message)}
              aria-describedby={message ? 'register-message' : undefined}
              rightElement={(
                <button
                  type="button"
                  className="login-password-toggle"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                </button>
              )}
            />

            <Input
              id="register-confirm-password"
              name="confirmPassword"
              label="Confirmation"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              variant="login"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value)
                clearMessage()
              }}
              aria-invalid={Boolean(message)}
              aria-describedby={message ? 'register-message' : undefined}
              rightElement={(
                <button
                  type="button"
                  className="login-password-toggle"
                  aria-label={showConfirmPassword ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                >
                  {showConfirmPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                </button>
              )}
            />

            {message && (
              <p className="login-message" id="register-message" role="alert">
                {message}
              </p>
            )}

            <Button className="btn-full" type="submit" icon={<IconArrowRight size={16} />} iconPosition="right" disabled={isSubmitting}>
              {isSubmitting ? 'Creation...' : 'Creer le compte'}
            </Button>

            <p className="auth-switch">
              Deja inscrit ?
              <Link to="/login"> Se connecter</Link>
            </p>

            <Link to="/" className="auth-home-link">Retour a l'accueil</Link>
          </form>

          <p className="login-footnote">
            Les comptes crees sont actives avec le statut actif et une date de creation automatique.
          </p>
        </div>
      </section>
    </main>
  )
}

export default Register
