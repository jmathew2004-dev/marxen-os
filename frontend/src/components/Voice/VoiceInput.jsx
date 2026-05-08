import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'

const VoiceInput = ({ onCheckIn }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [interimText, setInterimText] = useState('')
  const [message, setMessage] = useState('')
  const { t } = useTranslation()
  const [recognition, setRecognition] = useState(null)
  const transcriptRef = useRef('')

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setMessage('Voice is not supported in this browser. Type a quick note below and clock in.')
      return
    }

    const recognizer = new SpeechRecognition()
    recognizer.continuous = true
    recognizer.interimResults = true
    recognizer.lang = 'en-IN'

    recognizer.onstart = () => {
      setIsRecording(true)
      setMessage('')
      setTranscription('')
      setInterimText('')
      transcriptRef.current = ''
    }

    recognizer.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          transcriptRef.current += transcript + ' '
          setTranscription(transcriptRef.current)
        } else {
          interim += transcript
        }
      }
      setInterimText(interim)
    }

    recognizer.onerror = (event) => {
      setMessage(event.error === 'not-allowed'
        ? 'Mic permission was blocked. Allow access or type a quick note below.'
        : 'Voice capture stopped. Type a note and clock in.')
      setIsRecording(false)
    }

    recognizer.onend = () => {
      setIsRecording(false)
      setInterimText('')
    }

    try {
      recognizer.start()
      setRecognition(recognizer)
    } catch {
      setMessage('Voice capture is already active. Stop it first, then try again.')
    }
  }

  const submitVoiceCheckIn = async () => {
    const finalText = (transcription || interimText).trim()
    try {
      await api.post('/attendance/check-in', { voice_transcription: finalText || null })
      setMessage('Check-in successful')
      setTimeout(() => {
        onCheckIn()
        setMessage('')
        setTranscription('')
        setInterimText('')
        transcriptRef.current = ''
      }, 1000)
    } catch (error) {
      setMessage(error.response?.data?.error || t('error'))
    }
  }

  const stopRecording = async () => {
    if (recognition) {
      recognition.stop()
      setIsRecording(false)
    }
    await submitVoiceCheckIn()
  }

  return (
    <div className="voice-input mt-4">
      <h3>{t('voice_check_in')}</h3>
      {message && <div className="message">{message}</div>}

      <div className="transcription-box">
        {transcription || interimText || 'Start speaking, or type your quick note below.'}
      </div>

      <textarea
        placeholder="Quick note fallback"
        rows="3"
        value={transcription}
        onChange={(event) => {
          transcriptRef.current = event.target.value
          setTranscription(event.target.value)
        }}
      />

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
        >
          {isRecording ? t('stop_recording') : 'Clock in with note'}
        </button>
      </div>
    </div>
  )
}

export default VoiceInput
