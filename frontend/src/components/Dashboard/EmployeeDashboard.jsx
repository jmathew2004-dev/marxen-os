import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import CheckIn from '../Attendance/CheckIn'
import WorkLogger from '../WorkManagement/WorkLogger'
import AIMentor from '../AI/AIMentor'
import LiveClock from '../Common/LiveClock'
import '../styles/dashboard.css'

const EmployeeDashboard = () => {
  const [todayStatus, setTodayStatus] = useState(null)
  const [attendanceSummary, setAttendanceSummary] = useState(null)
  const [workItems, setWorkItems] = useState([])
  const [reports, setReports] = useState({ week: null, month: null })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('attendance')
  const { t } = useTranslation()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statusRes, summaryRes, workRes, weekReport, monthReport] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/attendance/summary'),
        api.get('/work/my-work'),
        api.get('/attendance/report?period=week'),
        api.get('/attendance/report?period=month')
      ])
      setTodayStatus(statusRes.data.today)
      setAttendanceSummary(summaryRes.data.summary)
      setWorkItems(workRes.data.work_items)
      setReports({
        week: weekReport.data.report,
        month: monthReport.data.report
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">{t('loading')}</div>
  }

  const downloadReport = async (period) => {
    const response = await api.get(`/attendance/report?period=${period}&format=csv`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `marxen-${period}-report.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">My Zone</p>
          <h1>{t('dashboard')}</h1>
          <p>Keep your Pulse clean, your Flow visible, and your AI Buddy close when the day feels heavy.</p>
        </div>
        <div className="hero-side">
          <LiveClock />
          <div
            className={`attendance-ring ${attendanceSummary?.status || 'attention'}`}
            style={{ '--value': `${Math.min(attendanceSummary?.attendance_percentage || 0, 100)}%` }}
          >
            <span>{attendanceSummary?.attendance_percentage || 0}%</span>
            <small>Attendance</small>
          </div>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <span>{t('attendance_percentage')}</span>
          <strong>{attendanceSummary?.attendance_percentage || 0}%</strong>
          <small>{attendanceSummary?.present_days || 0} of {attendanceSummary?.expected_days || 0} working days</small>
        </div>
        <div className="metric-card">
          <span>{t('attendance_benchmark')}</span>
          <strong>{attendanceSummary?.threshold || 75}%</strong>
          <small>{attendanceSummary?.status === 'attention' ? t('below_average') : t('on_track')}</small>
        </div>
        <div className="metric-card">
          <span>Current Work</span>
          <strong className="metric-text">{attendanceSummary?.current_work_title || 'None'}</strong>
          <small>{attendanceSummary?.current_work_status || 'No active task'}</small>
        </div>
        <div className="metric-card">
          <span>Today</span>
          <strong>{todayStatus ? 'Present' : 'Pending'}</strong>
          <small>{todayStatus?.check_in_time ? new Date(todayStatus.check_in_time).toLocaleTimeString() : 'No clock-in yet'}</small>
        </div>
      </div>

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
          className={activeTab === 'reports' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('reports')}
        >
          Receipts
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
          <div className="workspace-grid">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Live Status</p>
                  <h2>{t('today_status')}</h2>
                </div>
                <span className={todayStatus ? 'status-pill success' : 'status-pill warning'}>
                  {todayStatus ? 'Present' : 'Not clocked in'}
                </span>
              </div>
              {todayStatus ? (
                <div className="timeline-list">
                  <div>
                    <span>Check In</span>
                    <strong>{new Date(todayStatus.check_in_time).toLocaleTimeString()}</strong>
                  </div>
                  <div>
                    <span>Check Out</span>
                    <strong>{todayStatus.check_out_time ? new Date(todayStatus.check_out_time).toLocaleTimeString() : 'Active'}</strong>
                  </div>
                  <div>
                    <span>Duration</span>
                    <strong>{todayStatus.duration_minutes || 0} minutes</strong>
                  </div>
                </div>
              ) : (
                <p>{t('no_check_in')}</p>
              )}
            </section>
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Month To Date</p>
                  <h2>{t('attendance_percentage')}</h2>
                </div>
                <span className={`status-pill ${attendanceSummary?.status === 'attention' ? 'warning' : 'success'}`}>
                  {attendanceSummary?.status === 'attention' ? t('below_average') : t('on_track')}
                </span>
              </div>
              <div className="progress-row">
                <div className="progress-track">
                  <span style={{ width: `${Math.min(attendanceSummary?.attendance_percentage || 0, 100)}%` }} />
                </div>
                <strong>{attendanceSummary?.attendance_percentage || 0}%</strong>
              </div>
              <p className="muted">Keep the Pulse above {attendanceSummary?.threshold || 75}% to stay in the safe zone.</p>
            </section>
          </div>
          <CheckIn onCheckIn={fetchData} />
        </div>
      )}

      {activeTab === 'work' && (
        <div className="tab-content">
          <WorkLogger onWorkAdded={fetchData} />
          <div className="panel mt-4">
            <h2>{t('work_history')}</h2>
            {workItems.length > 0 ? (
              <div className="work-list">
                {workItems.map((item) => (
                  <div key={item.id} className="work-item">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <small>{item.time_spent_minutes}min | {item.status}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p>{t('no_work_items')}</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="report-grid">
          {['week', 'month'].map((period) => {
            const report = reports[period]
            return (
              <section className="panel" key={period}>
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">{period === 'week' ? 'Weekly' : 'Monthly'} Receipt</p>
                    <h2>{period === 'week' ? 'This Week' : 'This Month'}</h2>
                  </div>
                  <button type="button" className="secondary" onClick={() => downloadReport(period)}>
                    Download CSV
                  </button>
                </div>
                <div className="metric-grid compact">
                  <div className="metric-card">
                    <span>Attendance</span>
                    <strong>{report?.attendance_summary?.attendance_percentage || 0}%</strong>
                    <small>Month-to-date benchmark</small>
                  </div>
                  <div className="metric-card">
                    <span>Work Items</span>
                    <strong>{report?.metrics?.work_items || 0}</strong>
                    <small>{report?.metrics?.completed_items || 0} completed</small>
                  </div>
                  <div className="metric-card">
                    <span>Work Minutes</span>
                    <strong>{report?.metrics?.work_minutes || 0}</strong>
                    <small>Logged effort</small>
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      )}

      {activeTab === 'ai' && <AIMentor />}
    </div>
  )
}

export default EmployeeDashboard
