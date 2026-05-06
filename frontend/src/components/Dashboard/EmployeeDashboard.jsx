import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import CheckIn from '../Attendance/CheckIn'
import WorkLogger from '../WorkManagement/WorkLogger'
import AIMentor from '../AI/AIMentor'
import '../styles/dashboard.css'

const EmployeeDashboard = () => {
  const [todayStatus, setTodayStatus] = useState(null)
  const [workItems, setWorkItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('attendance')
  const { t } = useTranslation()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statusRes, workRes] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/work/my-work')
      ])
      setTodayStatus(statusRes.data.today)
      setWorkItems(workRes.data.work_items)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">{t('loading')}</div>
  }

  return (
    <div className="dashboard">
      <h1>{t('dashboard')}</h1>

      <div className="dashboard-tabs">
        <button
          className={activeTab === 'attendance' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('attendance')}
        >
          {t('attendance')}
        </button>
        <button
          className={activeTab === 'work' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('work')}
        >
          {t('work')}
        </button>
        <button
          className={activeTab === 'ai' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('ai')}
        >
          {t('ai_mentor')}
        </button>
      </div>

      {activeTab === 'attendance' && (
        <div className="tab-content">
          <div className="card">
            <h2>{t('today_status')}</h2>
            {todayStatus ? (
              <div>
                <p>Check In: {new Date(todayStatus.check_in_time).toLocaleTimeString()}</p>
                {todayStatus.check_out_time && (
                  <p>Check Out: {new Date(todayStatus.check_out_time).toLocaleTimeString()}</p>
                )}
                <p>Duration: {todayStatus.duration_minutes} minutes</p>
              </div>
            ) : (
              <p>{t('no_check_in')}</p>
            )}
          </div>
          <CheckIn onCheckIn={fetchData} />
        </div>
      )}

      {activeTab === 'work' && (
        <div className="tab-content">
          <WorkLogger onWorkAdded={fetchData} />
          <div className="card mt-4">
            <h2>{t('work_history')}</h2>
            {workItems.length > 0 ? (
              <div className="work-list">
                {workItems.map((item) => (
                  <div key={item.id} className="work-item card">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <small>⏱️ {item.time_spent_minutes}min | {item.status}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p>{t('no_work_items')}</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'ai' && <AIMentor />}
    </div>
  )
}

export default EmployeeDashboard
