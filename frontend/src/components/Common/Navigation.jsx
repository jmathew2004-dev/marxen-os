import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthContext } from '../../context/AuthContext'
import LanguageSwitcher from './LanguageSwitcher'
import NotificationCenter from './NotificationCenter'
import '../styles/navigation.css'

const Navigation = () => {
  const { user, dispatch } = useContext(AuthContext)
  const { t } = useTranslation()
  const isAdminUser = ['owner', 'admin'].includes(user?.role)

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <h2 className="brand-lockup">
            <span className="brand-mark">M</span>
            <span>{t('app_title')}</span>
          </h2>
          <div className="nav-links">
            <a href="/">{t('home')}</a>
            <a href="/dashboard">{t('dashboard')}</a>
            {isAdminUser && <a href="/admin">{t('admin')}</a>}
          </div>
        </div>
        <div className="nav-right">
          <NotificationCenter />
          <LanguageSwitcher />
          <span className="user-chip">{user?.first_name || user?.email}</span>
          <button onClick={handleLogout} className="secondary">
            {t('logout')}
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
