import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import VoiceCheckIn from '../Voice/VoiceInput'

const CheckIn = ({ onCheckIn }) => {
  const [checkInType, setCheckInType] = useState('standard')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [followUp, setFollowUp] = useState({
    title: '',
    description: '',
    time_spent_minutes: '',
    status: 'completed',
    priority: 'medium'
  })
  const { t } = useTranslation()

  const handleStandardCheckIn = async () => {
    setLoading(true)
    try {
      await api.post('/attendance/check-in')
      setMessage(t('check_in') + ' ' + t('success'))
      setTimeout(() => {
        onCheckIn()
        setMessage('')
      }, 1000)
    } catch (error) {
      setMessage(error.response?.data?.error || t('error'))
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/attendance/check-out', {
        notes: followUp.description,
        follow_up: followUp.title ? followUp : null
      })
      setMessage(t('check_out') + ' ' + t('success'))
      setShowFollowUp(false)
      setFollowUp({
        title: '',
        description: '',
        time_spent_minutes: '',
        status: 'completed',
        priority: 'medium'
      })
      setTimeout(() => {
        onCheckIn()
        setMessage('')
      }, 1000)
    } catch (error) {
      setMessage(error.response?.data?.error || t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel mt-4">
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
          <button className="secondary mt-2" onClick={() => setShowFollowUp(true)} disabled={loading}>
            {t('check_out')}
          </button>
        </div>
      )}

      {checkInType === 'voice' && <VoiceCheckIn onCheckIn={onCheckIn} />}

      {showFollowUp && (
        <div className="modal-overlay">
          <form className="modal-panel" onSubmit={handleCheckOut}>
            <div className="panel-header">
              <div>
                <p className="eyebrow">Wrap Shift</p>
                <h2>Drop your Flow update</h2>
              </div>
              <button type="button" className="secondary" onClick={() => setShowFollowUp(false)}>
                Close
              </button>
            </div>
            <input
              type="text"
              placeholder="Flow title or focus area"
              value={followUp.title}
              onChange={(event) => setFollowUp({ ...followUp, title: event.target.value })}
            />
            <textarea
              placeholder="Progress, blockers, next ping"
              rows="4"
              value={followUp.description}
              onChange={(event) => setFollowUp({ ...followUp, description: event.target.value })}
            />
            <div className="form-grid">
              <input
                type="number"
                placeholder="Minutes spent"
                value={followUp.time_spent_minutes}
                onChange={(event) => setFollowUp({ ...followUp, time_spent_minutes: event.target.value })}
              />
              <select
                value={followUp.status}
                onChange={(event) => setFollowUp({ ...followUp, status: event.target.value })}
              >
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            <button type="submit" className="primary" disabled={loading}>
              {loading ? t('loading') : 'Complete wrap'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default CheckIn
