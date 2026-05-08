import React, { useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AuthContext, AuthProvider } from './context/AuthContext.jsx'
import Login from './components/Auth/Login'
import EmployeeDashboard from './components/Dashboard/EmployeeDashboard'
import AdminDashboard from './components/Dashboard/AdminDashboard'
import Navigation from './components/Common/Navigation'

const AppContent = () => {
  const { isAuthenticated, user } = useContext(AuthContext)
  const { t } = useTranslation()

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <>
      <Navigation />
      <div className="container p-4">
        <Routes>
          <Route
            path="/"
            element={user?.role === 'admin' ? <AdminDashboard /> : <EmployeeDashboard />}
          />
          <Route path="/dashboard" element={<EmployeeDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
