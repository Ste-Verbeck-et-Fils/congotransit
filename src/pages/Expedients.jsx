import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { IconBox, IconPlus } from '../components/ui/Icons'
import { createExpedition } from '../lib/expeditionsStore'
import '../styles/Expedients.css'

const buildOption = (value, label) => ({ value, label })

const defaultExpediteurs = [
  buildOption('', 'Choisir un expediteur...'),
  buildOption('societes-kivu', 'Societes Kivu SARL'),
  buildOption('mbiza-business', 'Mbiza Business'),
]

const defaultDestinataires = [
  buildOption('', 'Choisir un destinataire...'),
  buildOption('aru-central', 'Aru Central Market'),
  buildOption('beni-distribution', 'Beni Distribution'),
]

const defaultAgences = [
  buildOption('', 'Choisir une agence...'),
  buildOption('goma', 'Goma'),
  buildOption('aru', 'Aru'),
  buildOption('beni', 'Beni'),
  buildOption('bukavu', 'Bukavu'),
]

const defaultColis = {
  id: 1,
  type: 'Electronique',
  poids: 12.5,
  valeur: 450,
}

const createColis = (id) => ({
  id,
  type: `Colis standard ${id}`,
  poids: Number((4.5 + id * 1.15).toFixed(1)),
  valeur: 70 + id * 35,
})

/* Ce composant affiche un formulaire d'expedition interactif en frontend uniquement. */
const Expedients = () => {
  const navigate = useNavigate()
  const [expediteurOptions] = useState(defaultExpediteurs)
  const [destinataireOptions, setDestinataireOptions] = useState(defaultDestinataires)
  const [agenceOptions, setAgenceOptions] = useState(defaultAgences)

  const [expediteur, setExpediteur] = useState('')
  const [destinataire, setDestinataire] = useState('')
  const [agenceDepart, setAgenceDepart] = useState('goma')
  const [agenceArrivee, setAgenceArrivee] = useState('aru')
  const [dateExpedition, setDateExpedition] = useState('2026-05-02')
  const [observations, setObservations] = useState('')
  const [colis, setColis] = useState([defaultColis])
  const [errorMessage, setErrorMessage] = useState('')

  const total = useMemo(
    () => colis.reduce((sum, item) => sum + Number(item.valeur || 0), 0).toFixed(2),
    [colis],
  )

  const addNamedOption = (setOptions, prefix) => {
    setOptions((previous) => {
      const nextIndex = previous.length
      const value = `${prefix}-${nextIndex}`
      const label = `${prefix.replace('-', ' ')} ${nextIndex}`
      return [...previous, buildOption(value, label)]
    })
  }

  const handleAddColis = () => {
    setColis((previous) => [...previous, createColis(previous.length + 1)])
  }

  const getOptionLabel = (options, value) => options.find((item) => item.value === value)?.label || ''

  const handleSubmit = () => {
    if (!expediteur || !destinataire || !agenceDepart || !agenceArrivee || !dateExpedition) {
      setErrorMessage('Veuillez completer les informations obligatoires avant la creation.')
      return
    }

    const created = createExpedition({
      expediteurNom: getOptionLabel(expediteurOptions, expediteur),
      destinataireNom: getOptionLabel(destinataireOptions, destinataire),
      agenceDepartNom: getOptionLabel(agenceOptions, agenceDepart),
      agenceArriveeNom: getOptionLabel(agenceOptions, agenceArrivee),
      dateExpedition,
      observations,
      colis,
    })

    setErrorMessage('')
    navigate(`/dashboard/expedients/${created.numero}`)
  }

  return (
    <section className="expedients-page fade-in" aria-label="Creation d'expedition">
      <header className="expedients-header">
        <div>
          <h1>Creation d'expedition</h1>
          <p>Enregistrez un nouvel envoi dans le grand livre logistique.</p>
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

      <div className="expedients-stack">
        <article className="card expedients-card">
          <h2>Parties Prenantes</h2>
          <div className="expedients-divider" aria-hidden="true" />
          <Select
            label="Selection expediteur"
            value={expediteur}
            onChange={(event) => setExpediteur(event.target.value)}
            options={expediteurOptions}
          />
          <Select
            label="Selection destinataire"
            value={destinataire}
            onChange={(event) => setDestinataire(event.target.value)}
            options={destinataireOptions}
            withAdd
            onAdd={() => addNamedOption(setDestinataireOptions, 'Destinataire')}
          />
        </article>

        <article className="card expedients-card">
          <h2>Itineraire & Date</h2>
          <div className="expedients-divider" aria-hidden="true" />
          <div className="expedients-grid-two">
            <Select
              label="Agence de depart"
              value={agenceDepart}
              onChange={(event) => setAgenceDepart(event.target.value)}
              options={agenceOptions}
              withAdd
              onAdd={() => addNamedOption(setAgenceOptions, 'Agence')}
            />
            <Select
              label="Agence d'arrivee"
              value={agenceArrivee}
              onChange={(event) => setAgenceArrivee(event.target.value)}
              options={agenceOptions}
              withAdd
              onAdd={() => addNamedOption(setAgenceOptions, 'Agence')}
            />
          </div>
          <Input
            label="Date d'expedition"
            type="date"
            value={dateExpedition}
            onChange={(event) => setDateExpedition(event.target.value)}
          />
        </article>

        <article className="card expedients-card">
          <h2>Details des Colis</h2>
          <p className="expedients-note">Ajoutez les articles composant cette expedition.</p>
          <Button
            className="btn-full expedients-add-colis"
            variant="secondary"
            icon={<IconPlus size={18} />}
            onClick={handleAddColis}
          >
            Ajouter un colis
          </Button>

          <div className="expedients-colis-list" aria-live="polite">
            {colis.map((item) => (
              <article className="expedients-colis-card" key={item.id}>
                <div className="expedients-colis-icon" aria-hidden="true">
                  <IconBox size={20} color="var(--color-primary)" />
                </div>
                <h3>Colis #{item.id}: {item.type}</h3>
                <div className="expedients-colis-meta">
                  <span>Poids:</span>
                  <strong>{item.poids} kg</strong>
                </div>
                <div className="expedients-colis-meta">
                  <span>Valeur:</span>
                  <strong>{item.valeur} USD</strong>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="card expedients-card">
          <label className="expedients-total-label" htmlFor="montant-total">Montant total (USD)</label>
          <div id="montant-total" className="expedients-total-value">
            <span>{total}</span>
            <strong>$</strong>
          </div>
          <p className="expedients-total-help">Taxes et frais de manutention inclus.</p>

          <Input
            label="Observations"
            placeholder="Notes particulieres sur la livraison, fragilite, etc..."
            value={observations}
            onChange={(event) => setObservations(event.target.value)}
          />
        </article>
      </div>

      {errorMessage && <p className="expedients-error">{errorMessage}</p>}

      <Button
        className="btn-full expedients-submit"
        variant="primary"
        type="button"
        icon={null}
        onClick={handleSubmit}
      >
        Creer l'expedition
      </Button>
    </section>
  )
}

export default Expedients
