import React, { useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { AuthContext } from '../../context/AuthContext'
import '../styles/auth.css'

const Login = () => {
  const [accountType, setAccountType] = useState('worker')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({ first_name: '', last_name: '', company_name: '' })

  const { t } = useTranslation()
  const { dispatch } = useContext(AuthContext)

  const isWorker = accountType === 'worker'

  const changeAccountType = (type) => {
    setAccountType(type)
    setIsRegister(false)
    setError('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = isWorker ? '/auth/worker/login' : '/auth/admin/login'
      const response = await api.post(endpoint, { email, password })
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response.data
      })
    } catch (err) {
      setError(err.response?.data?.error || t('error'))
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = isWorker ? '/auth/worker/register' : '/auth/owner/register'
      const response = await api.post(endpoint, {
        email,
        password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        company_name: formData.company_name
      })
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response.data
      })
    } catch (err) {
      setError(err.response?.data?.error || t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <h1>{t('app_title')}</h1>
        <div className="auth-mode-switch" role="tablist" aria-label="Account type">
          <button
            type="button"
            className={isWorker ? 'mode active' : 'mode'}
            onClick={() => changeAccountType('worker')}
          >
            {t('worker_login')}
          </button>
          <button
            type="button"
            className={!isWorker ? 'mode active' : 'mode'}
            onClick={() => changeAccountType('admin')}
          >
            {t('admin_owner_login')}
          </button>
        </div>
        <p className="auth-note">
          {isWorker ? t('worker_auth_note') : t('admin_auth_note')}
        </p>
        {error && <div className="error mt-2">{error}</div>}

        {!isRegister ? (
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder={t('email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder={t('password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="primary" disabled={loading}>
              {loading ? t('loading') : t('login')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder={t('first_name')}
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
            <input
              type="text"
              placeholder={t('last_name')}
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
            <input
              type="email"
              placeholder={t('email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder={t('password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {!isWorker && (
              <input
                type="text"
                placeholder={t('company_name')}
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                required
              />
            )}
            <button type="submit" className="primary" disabled={loading}>
              {loading ? t('loading') : t('register')}
            </button>
          </form>
        )}

        <button
          className="secondary mt-2"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? t('back_to_login') : (isWorker ? t('worker_register') : t('owner_register'))}
        </button>
      </div>
    </div>
  )
}

export default Login
