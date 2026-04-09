import React from 'react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { InfoCard, StatsCard } from '../components/ui/Card'
import { IconSearch } from '../components/ui/Icons'

const HomePage = () => {
  const stats = { label: 'TOTAL ENVOI', value: '1,284', trend: 18, icon: '📦' }
  const recentShipment = [
    { label: 'Référence', value: 'LQ-382-K9' },
    { label: 'Date', value: '02 Avril 2026' },
    { label: 'Destination', value: 'Goma' }
  ]

  return (
    <div className="home-page fade-in">
      <header className="page-header" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1 style={{ color: 'var(--color-primary)', fontWeight: 800 }}>Tableau de Bord</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Bienvenue sur votre gestionnaire congotransit.</p>
      </header>

      <section className="grid-auto-fit">
        <div className="flex flex-col gap-lg">
          <StatsCard {...stats} />
          <Button variant="primary">Nouveau Colis</Button>
        </div>

        <div className="flex flex-col gap-lg">
          <Input 
            label="RECHERCHE DE COLIS" 
            placeholder="Saisir le numéro..." 
            icon={<IconSearch size={18} />} 
          />
          <InfoCard title="Dernier envoi" details={recentShipment} />
        </div>

        <div className="flex flex-col gap-lg">
          {/* Action cards or more stats could go here */}
          <InfoCard 
            title="Notifications" 
            details={[
              { label: 'Colis LQ-382', value: 'Arrivé à Goma' },
              { label: 'Alerte', value: 'Paiement en attente' }
            ]} 
          />
        </div>
      </section>
    </div>
  )
}

export default HomePage
