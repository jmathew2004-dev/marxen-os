import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthContext } from '../../context/AuthContext'
import LanguageSwitcher from './LanguageSwitcher'
import '../styles/navigation.css'

const Navigation = () => {
  const { user, dispatch } = useContext(AuthContext)
  const { t } = useTranslation()

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <h2>{t('app_title')}</h2>
          <div className="nav-links">
            <a href="/">{t('home')}</a>
            <a href="/dashboard">{t('dashboard')}</a>
            {user?.role === 'admin' && <a href="/admin">{t('admin')}</a>}
          </div>
        </div>
        <div className="nav-right">
          <LanguageSwitcher />
          <span>{user?.first_name || user?.email}</span>
          <button onClick={handleLogout} className="secondary">
            {t('logout')}
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
