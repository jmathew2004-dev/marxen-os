import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'

const AIMentor = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState('')
  const [aiProvider, setAiProvider] = useState('checking')
  const [aiModel, setAiModel] = useState('')
  const [aiStatus, setAiStatus] = useState('Checking AI Buddy')
  const [error, setError] = useState('')
  const { t } = useTranslation()
  const promptChips = [
    'Plan my next 90 minutes',
    'I feel stuck today',
    'Give me a confidence boost',
    'Help me fix my Pulse',
    'Write a clean admin update'
  ]

  const statusClass = aiProvider === 'claude'
    ? 'success'
    : aiProvider === 'fallback'
      ? 'warning'
      : 'neutral'

  const statusLabel = aiProvider === 'claude'
    ? `Claude live${aiModel ? ` - ${aiModel}` : ''}`
    : aiProvider === 'fallback'
      ? 'Buddy fallback'
      : 'Checking Claude'

  useEffect(() => {
    fetchConversationHistory()
    fetchRecommendations()
  }, [])

  const fetchConversationHistory = async () => {
    try {
      const res = await api.get('/ai/mentor/history')
      setMessages(res.data.conversation?.messages || [])
      setAiProvider(res.data.provider || 'checking')
      setAiModel(res.data.model || '')
    } catch (error) {
      console.error('Error fetching history:', error)
      setAiProvider('fallback')
    }
  }

  const fetchRecommendations = async () => {
    try {
      const res = await api.get('/ai/work/recommend')
      setRecommendations(res.data.recommendations)
      setAiProvider(res.data.provider || 'checking')
      setAiModel(res.data.model || '')
      setAiStatus(res.data.provider_status || 'AI Buddy ready')
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      setAiProvider('fallback')
      setAiStatus('Recommendations are offline right now')
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    const userMessage = input.trim()
    if (!userMessage) return

    setLoading(true)
    setError('')
    try {
      const res = await api.post('/ai/mentor/message', { message: userMessage })
      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'user', content: userMessage, timestamp: new Date() },
        { role: 'assistant', content: res.data.message, timestamp: new Date() }
      ])
      setAiProvider(res.data.provider || 'fallback')
      setAiModel(res.data.model || '')
      setAiStatus(res.data.provider_status || 'AI Buddy ready')
      setInput('')
      fetchRecommendations()
    } catch (error) {
      console.error('Error sending message:', error)
      setError(error.response?.data?.error || 'AI Buddy could not reply right now. Try once more after a moment.')
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
            <h2>Marxen AI Buddy</h2>
          </div>
          <span className={`status-pill ${statusClass}`} title={aiStatus}>{statusLabel}</span>
        </div>

        <div className="recommendations-box">
          <h3>Buddy Board</h3>
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
              <span>{msg.role === 'user' ? 'You' : 'AI Buddy'}</span>
              <p>{msg.content}</p>
            </div>
          ))}
          {!messages.length && (
            <div className="message assistant">
              <span>AI Buddy</span>
              <p>Tell me what is happening today. I can plan your next focus block, write an admin update, help your Pulse, or just sit with you through a rough work moment.</p>
            </div>
          )}
        </div>

        {error && <div className="ai-error">{error}</div>}

        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            placeholder="Ask AI Buddy anything..."
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
