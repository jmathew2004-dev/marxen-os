import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import LiveClock from '../Common/LiveClock'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [companyData, setCompanyData] = useState({ name: '', description: '', logo_url: '' })
  const [teamMembers, setTeamMembers] = useState([])
  const [teamSummary, setTeamSummary] = useState({ metrics: {}, team: [], threshold: 75 })
  const [newMember, setNewMember] = useState({ email: '', first_name: '', last_name: '', role: 'employee' })
  const [whitelist, setWhitelist] = useState([])
  const [newWhitelist, setNewWhitelist] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'employee',
    department: '',
    designation: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { t } = useTranslation()

  useEffect(() => {
    fetchOverview()
  }, [])

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchOverview()
    }
    if (activeTab === 'team') {
      fetchTeamMembers()
    }
    if (activeTab === 'whitelist') {
      fetchWhitelist()
    }
  }, [activeTab])

  const fetchOverview = async () => {
    try {
      const res = await api.get('/attendance/team-summary')
      setTeamSummary(res.data)
    } catch (error) {
      console.error('Error fetching attendance summary:', error)
    }
  }

  const fetchTeamMembers = async () => {
    try {
      const res = await api.get('/admin/users')
      setTeamMembers(res.data.team_members)
    } catch (error) {
      console.error('Error fetching team:', error)
    }
  }

  const fetchWhitelist = async () => {
    try {
      const res = await api.get('/admin/whitelist')
      setWhitelist(res.data.whitelist)
    } catch (error) {
      console.error('Error fetching whitelist:', error)
    }
  }

  const handleCompanySetup = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/admin/company/setup', companyData)
      setMessage('Company setup successful')
      setTimeout(() => setMessage(''), 2000)
    } catch (error) {
      setMessage(error.response?.data?.error || t('error'))
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/admin/users', newMember)
      setMessage('Team member added')
      setNewMember({ email: '', first_name: '', last_name: '', role: 'employee' })
      fetchTeamMembers()
      setTimeout(() => setMessage(''), 2000)
    } catch (error) {
      setMessage(error.response?.data?.error || t('error'))
    } finally {
      setLoading(false)
    }
  }

  const handleAddWhitelist = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/admin/whitelist', newWhitelist)
      setMessage('Worker email whitelisted')
      setNewWhitelist({
        email: '',
        first_name: '',
        last_name: '',
        role: 'employee',
        department: '',
        designation: ''
      })
      fetchWhitelist()
      fetchOverview()
      setTimeout(() => setMessage(''), 2000)
    } catch (error) {
      setMessage(error.response?.data?.error || t('error'))
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveWhitelist = async (id) => {
    setLoading(true)
    try {
      await api.delete(`/admin/whitelist/${id}`)
      fetchWhitelist()
    } catch (error) {
      setMessage(error.response?.data?.error || t('error'))
    } finally {
      setLoading(false)
    }
  }

  const downloadExport = async (type) => {
    const response = await api.get(`/admin/reports/${type}.csv`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `marxen-${type}-report.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Ops Room</p>
          <h1>{t('admin_panel')}</h1>
          <p>Run the crew, spot Pulse dips early, and keep Flow visible without chasing people manually.</p>
        </div>
        <div className="hero-side">
          <LiveClock />
          <div
            className={`attendance-ring ${teamSummary.metrics?.average_attendance >= teamSummary.threshold ? 'on_track' : 'attention'}`}
            style={{ '--value': `${Math.min(teamSummary.metrics?.average_attendance || 0, 100)}%` }}
          >
            <span>{teamSummary.metrics?.average_attendance || 0}%</span>
            <small>Team Average</small>
          </div>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <span>Team Average</span>
          <strong>{teamSummary.metrics?.average_attendance || 0}%</strong>
          <small>{teamSummary.threshold || 75}% benchmark</small>
        </div>
        <div className="metric-card">
          <span>Present Today</span>
          <strong>{teamSummary.metrics?.present_today || 0}</strong>
          <small>Workers checked in</small>
        </div>
        <div className="metric-card">
          <span>Below Benchmark</span>
          <strong>{teamSummary.metrics?.below_threshold || 0}</strong>
          <small>Need immediate follow-up</small>
        </div>
        <div className="metric-card">
          <span>Total Workers</span>
          <strong>{teamSummary.metrics?.total_workers || 0}</strong>
          <small>Active worker accounts</small>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={activeTab === 'overview' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('overview')}
        >
          Mission Control
        </button>
        <button
          className={activeTab === 'company' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('company')}
        >
          {t('company_setup')}
        </button>
        <button
          className={activeTab === 'team' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('team')}
        >
          {t('team_management')}
        </button>
        <button
          className={activeTab === 'whitelist' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('whitelist')}
        >
          {t('email_whitelist')}
        </button>
        <button
          className={activeTab === 'reports' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('reports')}
        >
          Receipts
        </button>
      </div>

      {message && <div className="message mt-2">{message}</div>}

      {activeTab === 'overview' && (
        <div className="workspace-grid">
          <section className="panel wide-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Pulse Risk</p>
                <h2>Crew Pulse Board</h2>
              </div>
              <button type="button" className="secondary" onClick={fetchOverview}>
                Refresh
              </button>
            </div>
            {teamSummary.team?.length > 0 ? (
              <div className="people-table">
                {teamSummary.team.map((member) => (
                  <div key={member.id} className="people-row">
                    <div>
                      <strong>{member.first_name || member.email} {member.last_name || ''}</strong>
                      <small>{member.role} {member.department ? `- ${member.department}` : ''}</small>
                      <small>Current: {member.current_work_title || 'No active work'}</small>
                    </div>
                    <div className="people-progress">
                      <div className="progress-track">
                        <span style={{ width: `${Math.min(member.attendance_percentage, 100)}%` }} />
                      </div>
                      <strong>{member.attendance_percentage}%</strong>
                    </div>
                    <span className={member.status === 'attention' ? 'status-pill warning' : 'status-pill success'}>
                      {member.status === 'attention' ? 'Needs Ping' : 'Clean'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No worker attendance data yet.</p>
            )}
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Quick Moves</p>
                <h2>Ops Shortcuts</h2>
              </div>
            </div>
            <div className="action-list">
              <button type="button" onClick={() => setActiveTab('whitelist')}>Add someone to Access List</button>
              <button type="button" onClick={() => setActiveTab('team')}>Review Crew</button>
              <button type="button" onClick={() => setActiveTab('company')}>Tune company profile</button>
              <button type="button" onClick={() => setActiveTab('reports')}>Pull Receipts</button>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="report-grid">
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Pulse Export</p>
                <h2>Crew Pulse CSV</h2>
              </div>
              <button type="button" className="primary" onClick={() => downloadExport('attendance')}>
                Download
              </button>
            </div>
            <p className="muted">Includes Pulse score, present days, active Flow, and benchmark status.</p>
          </section>
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Flow Export</p>
                <h2>Flow Log CSV</h2>
              </div>
              <button type="button" className="primary" onClick={() => downloadExport('work')}>
                Download
              </button>
            </div>
            <p className="muted">Includes worker tasks, time spent, priority, and completion status.</p>
          </section>
        </div>
      )}

      {activeTab === 'company' && (
        <form className="panel mt-4" onSubmit={handleCompanySetup}>
          <h2>{t('company_setup')}</h2>
          <input
            type="text"
            placeholder={t('company_name')}
            value={companyData.name}
            onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
            required
          />
          <textarea
            placeholder={t('description')}
            value={companyData.description}
            onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
            rows="3"
          />
          <input
            type="url"
            placeholder={t('logo')}
            value={companyData.logo_url}
            onChange={(e) => setCompanyData({ ...companyData, logo_url: e.target.value })}
          />
          <button type="submit" className="primary mt-2" disabled={loading}>
            {loading ? t('loading') : t('submit')}
          </button>
        </form>
      )}

      {activeTab === 'team' && (
        <div className="mt-4">
          <form className="panel" onSubmit={handleAddMember}>
            <h2>{t('add_member')}</h2>
            <input
              type="email"
              placeholder={t('email')}
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder={t('first_name')}
              value={newMember.first_name}
              onChange={(e) => setNewMember({ ...newMember, first_name: e.target.value })}
            />
            <input
              type="text"
              placeholder={t('last_name')}
              value={newMember.last_name}
              onChange={(e) => setNewMember({ ...newMember, last_name: e.target.value })}
            />
            <select
              value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="primary mt-2" disabled={loading}>
              {loading ? t('loading') : t('add_member')}
            </button>
          </form>

          <div className="panel mt-4">
            <h2>{t('team_members')}</h2>
            {teamMembers.map((member) => (
              <div key={member.id} className="team-member-item">
                <p><strong>{member.first_name} {member.last_name}</strong></p>
                <p>{member.email} - {member.role}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'whitelist' && (
        <div className="mt-4">
          <form className="panel" onSubmit={handleAddWhitelist}>
            <h2>{t('whitelist_worker_email')}</h2>
            <input
              type="email"
              placeholder={t('email')}
              value={newWhitelist.email}
              onChange={(e) => setNewWhitelist({ ...newWhitelist, email: e.target.value })}
              required
            />
            <div className="form-grid">
              <input
                type="text"
                placeholder={t('first_name')}
                value={newWhitelist.first_name}
                onChange={(e) => setNewWhitelist({ ...newWhitelist, first_name: e.target.value })}
              />
              <input
                type="text"
                placeholder={t('last_name')}
                value={newWhitelist.last_name}
                onChange={(e) => setNewWhitelist({ ...newWhitelist, last_name: e.target.value })}
              />
            </div>
            <div className="form-grid">
              <select
                value={newWhitelist.role}
                onChange={(e) => setNewWhitelist({ ...newWhitelist, role: e.target.value })}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
              </select>
              <input
                type="text"
                placeholder={t('department')}
                value={newWhitelist.department}
                onChange={(e) => setNewWhitelist({ ...newWhitelist, department: e.target.value })}
              />
            </div>
            <input
              type="text"
              placeholder={t('designation')}
              value={newWhitelist.designation}
              onChange={(e) => setNewWhitelist({ ...newWhitelist, designation: e.target.value })}
            />
            <button type="submit" className="primary mt-2" disabled={loading}>
              {loading ? t('loading') : t('add_to_whitelist')}
            </button>
          </form>

          <div className="panel mt-4">
            <h2>{t('whitelisted_emails')}</h2>
            {whitelist.length > 0 ? (
              whitelist.map((entry) => (
                <div key={entry.id} className="team-member-item flex-between">
                  <div>
                    <p><strong>{entry.email}</strong></p>
                    <p>{entry.first_name} {entry.last_name} - {entry.role}</p>
                    <p className="text-sm">{entry.used_at ? t('used') : t('pending')}</p>
                  </div>
                  {!entry.used_at && (
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => handleRemoveWhitelist(entry.id)}
                      disabled={loading}
                    >
                      {t('remove')}
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p>{t('no_whitelisted_emails')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
