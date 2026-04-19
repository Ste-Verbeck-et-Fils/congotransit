import React from 'react'
import { Outlet } from 'react-router-dom'
import { TopBar } from '../components/ui/Navigation.jsx'
import './MainLayout.css'

const MainLayout = () => {
  return (
    <div className="layout-container">
      <TopBar />
      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
