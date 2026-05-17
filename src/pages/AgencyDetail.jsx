// Page de détail d'une agence en lecture seule
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAgencyById, AGENCY_STATUS_OPTIONS } from '../lib/agencesApi'
import Button from '../components/ui/Button'
import StaticInput from '../components/ui/StaticInput'
import { IconOffice } from '../components/ui/Icons'
import '../styles/Agences.css'

export default function AgencyDetail() {
  const { agencyId } = useParams()
  const navigate = useNavigate()
  const [agency, setAgency] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAgency = async () => {
      if (!agencyId) {
        setError('ID agence non trouvé')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        const data = await getAgencyById(agencyId)
        if (data) {
          setAgency(data)
        } else {
          setError('Agence non trouvée')
        }
      } catch (err) {
        console.error('Erreur lors du chargement de l\'agence:', err)
        setError('Erreur lors du chargement de l\'agence')
      } finally {
        setLoading(false)
      }
    }

    fetchAgency()
  }, [agencyId])

  if (loading) {
    return (
      <section className="agencies-form-page fade-in" aria-label="Détail agence">
        <article className="agencies-empty-state agencies-loading-state" aria-live="polite">
          <IconOffice size={24} color="var(--color-primary)" />
          <h3>Chargement du détail...</h3>
        </article>
      </section>
    )
  }

  if (error || !agency) {
    return (
      <section className="agencies-form-page fade-in" aria-label="Détail agence">
        <p className="agencies-alert agencies-alert-error" role="alert">{error || 'Agence non trouvée'}</p>
        <Button variant="outline" type="button" onClick={() => navigate('/dashboard/agences')}>
          Retour a la liste
        </Button>
      </section>
    )
  }

  return (
    <section className="agencies-form-page fade-in" aria-label="Détail agence">
      <header className="agencies-header">
        <div>
          <h1>{agency.nom_agence}</h1>
          <p>Consultez les informations de cette agence.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', minWidth: 0 }}>
          <Button className="agencies-header-btn" variant="outline" type="button" icon={null} onClick={() => navigate('/dashboard/agences')}>
            Retour à la liste
          </Button>
          <Button className="agencies-header-btn" variant="primary" type="button" icon={null} onClick={() => navigate(`/dashboard/agences/${agencyId}/modifier`)}>
            Modifier
          </Button>
        </div>
      </header>

      <div className="agencies-form-stack">
        <article className="card agencies-card">
          <h2>Informations generales</h2>
          <div className="agencies-divider" aria-hidden="true" />
          <div className="agencies-grid-two">
            <StaticInput
              label="Nom agence"
              value={agency.nom_agence}
            />
            <StaticInput
              label="Code agence"
              value={agency.code_agence}
            />
          </div>
          <div className="agencies-grid-two">
            <StaticInput
              label="Telephone"
              value={agency.telephone}
            />
            <StaticInput
              label="Status"
              value={AGENCY_STATUS_OPTIONS.find(opt => opt.value === agency.status)?.label || agency.status}
            />
          </div>
        </article>

        <article className="card agencies-card">
          <h2>Adresse associee</h2>
          <div className="agencies-divider" aria-hidden="true" />
          {agency.adresse ? (
            <>
              <div className="agencies-grid-two">
                <StaticInput
                  label="Adresse"
                  value={agency.adresse.rue}
                />
                <StaticInput
                  label="Numero"
                  value={agency.adresse.numero}
                />
              </div>
              <div className="agencies-grid-two">
                <StaticInput
                  label="Localite"
                  value={agency.adresse.localite}
                />
                <StaticInput
                  label="Province"
                  value={agency.adresse.province}
                />
              </div>
              <div className="agencies-grid-two">
                <StaticInput
                  label="Commune"
                  value={agency.adresse.commune}
                />
                <StaticInput
                  label="Quartier"
                  value={agency.adresse.quartier}
                />
              </div>
            </>
          ) : (
            <p>Aucune adresse associée</p>
          )}
        </article>

        {agency.created_at && (
          <article className="card agencies-card">
            <h2>Informations supplementaires</h2>
            <div className="agencies-divider" aria-hidden="true" />
            <div className="agencies-grid-two">
              <StaticInput
                label="Créée le"
                value={new Date(agency.created_at).toLocaleDateString('fr-FR')}
              />
              {agency.updated_at && (
                <StaticInput
                  label="Modifiée le"
                  value={new Date(agency.updated_at).toLocaleDateString('fr-FR')}
                />
              )}
            </div>
          </article>
        )}
      </div>
    </section>
  )
}
