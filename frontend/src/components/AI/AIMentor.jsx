import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'

const AIMentor = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState('')
  const { t } = useTranslation()
  const promptChips = [
    'Plan my next power hour',
    'I feel stuck today',
    'Help me fix my Pulse',
    'Write a clean admin update'
  ]

  useEffect(() => {
    fetchConversationHistory()
    fetchRecommendations()
  }, [])

  const fetchConversationHistory = async () => {
    try {
      const res = await api.get('/ai/mentor/history')
      setMessages(res.data.conversation?.messages || [])
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }

  const fetchRecommendations = async () => {
    try {
      const res = await api.get('/ai/work/recommend')
      setRecommendations(res.data.recommendations)
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    setLoading(true)
    try {
      const res = await api.post('/ai/mentor/message', { message: input })
      setMessages([
        ...messages,
        { role: 'user', content: input, timestamp: new Date() },
        { role: 'assistant', content: res.data.message, timestamp: new Date() }
      ])
      setInput('')
      fetchRecommendations()
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ai-mentor">
      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Buddy Mode</p>
            <h2>{t('ai_mentor')}</h2>
          </div>
          <span className="status-pill success">Always around</span>
        </div>

        <div className="recommendations-box">
          <h3>{t('recommendations')}</h3>
          <p>{recommendations || 'Your AI Buddy can help with Flow planning, clean follow-ups, motivation, and getting unstuck.'}</p>
        </div>

        <div className="prompt-chips">
          {promptChips.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="secondary"
              onClick={() => setInput(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="messages-box">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <p><strong>{msg.role === 'user' ? 'You' : 'AI Mentor'}:</strong> {msg.content}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            placeholder={t('message')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="primary" disabled={loading}>
            {loading ? t('loading') : t('send')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AIMentor
