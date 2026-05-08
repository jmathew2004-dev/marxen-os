import React, { useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext, AuthProvider } from './context/AuthContext.jsx'
import Login from './components/Auth/Login'
import EmployeeDashboard from './components/Dashboard/EmployeeDashboard'
import AdminDashboard from './components/Dashboard/AdminDashboard'
import Navigation from './components/Common/Navigation'

const AppContent = () => {
  const { isAuthenticated, user } = useContext(AuthContext)
  const isAdminUser = ['owner', 'admin'].includes(user?.role)

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
            element={isAdminUser ? <AdminDashboard /> : <EmployeeDashboard />}
          />
          <Route path="/dashboard" element={<EmployeeDashboard />} />
          <Route path="/admin" element={isAdminUser ? <AdminDashboard /> : <Navigate to="/" />} />
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
