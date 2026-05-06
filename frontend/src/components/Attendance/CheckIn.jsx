import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import VoiceCheckIn from '../Voice/VoiceInput'

const CheckIn = ({ onCheckIn }) => {
  const [checkInType, setCheckInType] = useState('standard')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { t } = useTranslation()

  const handleStandardCheckIn = async () => {
    setLoading(true)
    try {
      await api.post('/attendance/check-in')
      setMessage('✅ ' + t('check_in') + ' ' + t('success'))
      setTimeout(() => {
        onCheckIn()
        setMessage('')
      }, 1000)
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.error || t('error')))
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setLoading(true)
    try {
      await api.post('/attendance/check-out')
      setMessage('✅ ' + t('check_out') + ' ' + t('success'))
      setTimeout(() => {
        onCheckIn()
        setMessage('')
      }, 1000)
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.error || t('error')))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card mt-4">
      <h2>{t('attendance')}</h2>
      {message && <div className="message">{message}</div>}

      <div className="flex gap-2 mt-2">
        <button
          className={checkInType === 'standard' ? 'primary' : 'secondary'}
          onClick={() => setCheckInType('standard')}
        >
          {t('check_in')}
        </button>
        <button
          className={checkInType === 'voice' ? 'primary' : 'secondary'}
          onClick={() => setCheckInType('voice')}
        >
          {t('voice_check_in')}
        </button>
      </div>

      {checkInType === 'standard' && (
        <div className="mt-4">
          <button className="primary" onClick={handleStandardCheckIn} disabled={loading}>
            {loading ? t('loading') : t('check_in')}
          </button>
          <button className="secondary mt-2" onClick={handleCheckOut} disabled={loading}>
            {t('check_out')}
          </button>
        </div>
      )}

      {checkInType === 'voice' && <VoiceCheckIn onCheckIn={onCheckIn} />}
    </div>
  )
}

export default CheckIn
