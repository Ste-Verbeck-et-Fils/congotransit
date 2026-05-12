import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '../layout/MainLayout.jsx'
import AgenciesList from '../pages/AgenciesList.jsx'
import AgencyForm from '../pages/AgencyForm.jsx'
import PersonForm from '../pages/PersonForm.jsx'
import PersonsList from '../pages/PersonsList.jsx'
import UsersList from '../pages/UsersList.jsx'
import UserForm from '../pages/UserForm.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import Home from '../pages/Home.jsx'
import Login from '../pages/Login.jsx'
import Register from '../pages/Register.jsx'
import Contact from '../pages/Contact.jsx'
import PublicTracking from '../pages/PublicTracking.jsx'
import Expedients from '../pages/Expedients.jsx'
import ExpeditionsList from '../pages/ExpeditionsList.jsx'
import ExpeditionDetail from '../pages/ExpeditionDetail.jsx'
import MyExpeditions from '../pages/MyExpeditions.jsx'
import CreateColis from '../pages/CreateColis.jsx'
import Profile from '../pages/Profile.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'

const PlaceholderPage = ({ title, description }) => (
  <section className="placeholder-page fade-in">
    <div>
      <p className="placeholder-kicker">Module</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
    <button type="button">Ajouter</button>
  </section>
)

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/suivi" element={<PublicTracking />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Route de test pour preview ExpeditionDetail avec données démo - À supprimer après tests */}
      <Route path="/test/expedition/:expeditionNumero" element={<ExpeditionDetail />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<MainLayout />}>
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route index element={<Dashboard />} />
            <Route path="agences" element={<AgenciesList />} />
            <Route path="agences/nouvelle" element={<AgencyForm />} />
            <Route path="agences/:agencyId/modifier" element={<AgencyForm />} />
            <Route path="personnes" element={<PersonsList />} />
            <Route path="personnes/nouvelle" element={<PersonForm />} />
            <Route path="personnes/:personId/modifier" element={<PersonForm />} />
            <Route path="utilisateurs" element={<UsersList />} />
            <Route path="utilisateurs/nouveau" element={<UserForm />} />
            <Route path="utilisateurs/:userId/modifier" element={<UserForm />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'AGENT']} />}>
            <Route
              path="expedients"
              element={<ExpeditionsList />}
            />
            <Route
              path="expedients/nouveau"
              element={<Expedients />}
            />
            <Route
              path="expedients/:expeditionNumero/modifier"
              element={<Expedients />}
            />
            <Route
              path="colis/nouveau"
              element={<CreateColis />}
            />
            <Route
              path="trajet"
              element={<PlaceholderPage title="Suivi trajet" description="Consultez les mouvements, etapes et anomalies de transit." />}
            />
          </Route>
          <Route
            path="expedients/:expeditionNumero"
            element={<ExpeditionDetail />}
          />
          <Route
            path="expedients/:expeditionNumero/suivi"
            element={<ExpeditionDetail viewMode="suivi" />}
          />
          <Route
            path="expedients/:expeditionNumero/confirmation"
            element={<ExpeditionDetail viewMode="confirmation" />}
          />
          <Route element={<ProtectedRoute allowedRoles={['CLIENT']} />}>
            <Route
              path="mes-expeditions"
              element={<MyExpeditions />}
            />
          </Route>
          <Route
            path="profil"
            element={<Profile />}
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default AppRoutes
