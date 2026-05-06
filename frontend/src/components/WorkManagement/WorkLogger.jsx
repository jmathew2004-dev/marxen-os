import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'

const WorkLogger = ({ onWorkAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    time_spent_minutes: '',
    priority: 'medium',
    status: 'completed'
  })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { t } = useTranslation()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await api.get('/work/categories')
      setCategories(res.data.categories)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.time_spent_minutes) {
      setMessage('❌ ' + t('error') + ': Please fill required fields')
      return
    }

    setLoading(true)
    try {
      await api.post('/work/log-work', formData)
      setMessage('✅ Work logged successfully')
      setFormData({
        title: '',
        description: '',
        category_id: '',
        time_spent_minutes: '',
        priority: 'medium',
        status: 'completed'
      })
      setTimeout(() => {
        onWorkAdded()
        setMessage('')
      }, 1000)
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.error || t('error')))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{t('add_work')}</h2>
      {message && <div className="message">{message}</div>}

      <input
        type="text"
        placeholder={t('title')}
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />

      <select
        value={formData.category_id}
        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
      >
        <option value="">{t('work_category')}</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      <textarea
        placeholder={t('description')}
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows="3"
      />

      <input
        type="number"
        placeholder={t('time_spent')}
        value={formData.time_spent_minutes}
        onChange={(e) => setFormData({ ...formData, time_spent_minutes: e.target.value })}
        required
      />

      <div className="flex gap-2">
        <select
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>

        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        >
          <option value="completed">{t('completed')}</option>
          <option value="in_progress">{t('in_progress')}</option>
          <option value="paused">{t('paused')}</option>
        </select>
      </div>

      <button type="submit" className="primary mt-2" disabled={loading}>
        {loading ? t('loading') : 'Log Work'}
      </button>
    </form>
  )
}

export default WorkLogger
