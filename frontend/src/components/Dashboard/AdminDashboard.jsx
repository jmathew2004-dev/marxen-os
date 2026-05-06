import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('company')
  const [companyData, setCompanyData] = useState({ name: '', description: '', logo_url: '' })
  const [teamMembers, setTeamMembers] = useState([])
  const [newMember, setNewMember] = useState({ email: '', first_name: '', last_name: '', role: 'employee' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { t } = useTranslation()

  useEffect(() => {
    if (activeTab === 'team') {
      fetchTeamMembers()
    }
  }, [activeTab])

  const fetchTeamMembers = async () => {
    try {
      const res = await api.get('/admin/users')
      setTeamMembers(res.data.team_members)
    } catch (error) {
      console.error('Error fetching team:', error)
    }
  }

  const handleCompanySetup = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/admin/company/setup', companyData)
      setMessage('✅ Company setup successful')
      setTimeout(() => setMessage(''), 2000)
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.error || t('error')))
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/admin/users', newMember)
      setMessage('✅ Team member added')
      setNewMember({ email: '', first_name: '', last_name: '', role: 'employee' })
      fetchTeamMembers()
      setTimeout(() => setMessage(''), 2000)
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.error || t('error')))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-dashboard">
      <h1>{t('admin_panel')}</h1>

      <div className="admin-tabs">
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
      </div>

      {message && <div className="message mt-2">{message}</div>}

      {activeTab === 'company' && (
        <form className="card mt-4" onSubmit={handleCompanySetup}>
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
          <form className="card" onSubmit={handleAddMember}>
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

          <div className="card mt-4">
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
    </div>
  )
}

export default AdminDashboard
