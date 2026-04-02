import React from 'react'
import './App.css'
import Input from './components/ui/Input.jsx'
import { IconSearch } from './components/ui/Icons.jsx'

function App() {
  return (
    <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Input 
        label="RECHERCHE" 
        placeholder="Entrez un numéro de suivi..." 
        icon={<IconSearch size={18} />} 
        variant="search"
      />
    </div>
  )
}

export default App
