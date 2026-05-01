import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconArrowRight, IconBox, IconEye, IconEyeOff, IconPhone } from '../components/ui/Icons'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import deliveryImage from '../assets/images/livraison.avif'
import '../styles/Login.css'

const getRegisteredUser = () => {
  const storedUser = sessionStorage.getItem('congotransit.pendingUser')

  if (!storedUser) return null

  try {
    return JSON.parse(storedUser)
  } catch {
    return null
  }
}

const Login = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [telephone, setTelephone] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const cleanTelephone = telephone.replace(/\s+/g, '')

    if (!cleanTelephone || !password) {
      setMessage('Veuillez renseigner le telephone et le mot de passe.')
      return
    }

    const registeredUser = getRegisteredUser()
    const matchesRegisteredUser = (
      registeredUser?.telephone === cleanTelephone
      && registeredUser?.password === password
      && registeredUser?.status === 'actif'
    )
    const matchesAdminDemo = cleanTelephone === 'admin' && password === 'admin'

    if (!matchesRegisteredUser && !matchesAdminDemo) {
      setMessage("Identifiants incorrects. Verifiez vos informations puis reessayez.")
      return
    }

    setMessage('')
    navigate('/dashboard')
  }

  const clearMessage = () => {
    if (message) setMessage('')
  }

  return (
    <main className="login-page">
      <section className="login-shell" aria-label="Connexion Congo Transit">
        <div className="login-brand-panel" style={{ '--login-brand-image': `url(${deliveryImage})` }}>
          <div className="login-brand-block">
            <IconBox size={42} color="var(--color-primary)" />
            <p className="login-brand-name">CONGO TRANSIT</p>
            <p className="login-brand-copy">
              Espace securise de suivi et de gestion des colis en transit.
            </p>
          </div>
        </div>

        <div className="login-form-panel">
          <div className="login-mobile-brand" aria-hidden="true">
            <IconBox size={32} color="var(--color-primary)" />
            <p>CONGO TRANSIT</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <h1>Connexion</h1>

            <Input
              id="login-telephone"
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
              aria-describedby={message ? 'login-message' : undefined}
            />

            <Input
              id="login-password"
              name="password"
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              variant="login"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                clearMessage()
              }}
              aria-invalid={Boolean(message)}
              aria-describedby={message ? 'login-message' : undefined}
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

            {message && (
              <p className="login-message" id="login-message" role="alert">
                {message}
              </p>
            )}

            <Button className="btn-full" type="submit" icon={<IconArrowRight size={16} />} iconPosition="right">
              Se connecter
            </Button>

            <p className="auth-switch">
              Pas encore de compte ?
              <Link to="/register"> Creer un compte</Link>
            </p>
          </form>

          <p className="login-footnote">
            Acces restreint aux employes autorises de congo transit.
            Toutes les activites sont enregistrees.
          </p>
        </div>
      </section>
    </main>
  )
}

export default Login
