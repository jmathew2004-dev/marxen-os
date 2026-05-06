import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'

const VoiceInput = ({ onCheckIn }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [message, setMessage] = useState('')
  const { t } = useTranslation()
  const [recognition, setRecognition] = useState(null)

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setMessage('❌ Speech Recognition not supported')
      return
    }

    const recognizer = new SpeechRecognition()
    recognizer.continuous = true
    recognizer.interimResults = true

    recognizer.onstart = () => {
      setIsRecording(true)
      setTranscription('')
    }

    recognizer.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          setTranscription((prev) => prev + transcript + ' ')
        } else {
          interim += transcript
        }
      }
    }

    recognizer.onend = () => {
      setIsRecording(false)
    }

    recognizer.start()
    setRecognition(recognizer)
  }

  const stopRecording = async () => {
    if (recognition) {
      recognition.stop()
      setIsRecording(false)

      if (transcription.trim()) {
        try {
          await api.post('/attendance/check-in', { voice_transcription: transcription })
          setMessage('✅ Check-in successful')
          setTimeout(() => {
            onCheckIn()
            setMessage('')
            setTranscription('')
          }, 1000)
        } catch (error) {
          setMessage('❌ ' + (error.response?.data?.error || t('error')))
        }
      }
    }
  }

  return (
    <div className="voice-input mt-4">
      <h3>{t('voice_check_in')}</h3>
      {message && <div className="message">{message}</div>}

      <div className="transcription-box">
        {transcription || 'Listening...'}
      </div>

      <div className="flex gap-2 mt-2">
        <button
          className="primary"
          onClick={startRecording}
          disabled={isRecording}
        >
          {t('start_recording')}
        </button>
        <button
          className="secondary"
          onClick={stopRecording}
          disabled={!isRecording}
        >
          {t('stop_recording')}
        </button>
      </div>
    </div>
  )
}

export default VoiceInput
