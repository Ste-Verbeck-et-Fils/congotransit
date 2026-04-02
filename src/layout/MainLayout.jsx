import React from 'react'
import { Outlet } from 'react-router-dom'
import { TopBar, BottomBar } from '../components/ui/Navigation'
import './MainLayout.css'

const MainLayout = () => {
  return (
    <div className="layout-container">
      <TopBar />
      <main className="layout-content">
        <Outlet />
      </main>
      <BottomBar />
    </div>
  )
}

export default MainLayout
