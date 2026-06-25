import React, { useState, useEffect, useRef } from 'react'
import { IconSparkles, IconSmile, IconFrown, IconMic, IconSend, IconUser } from '../components/ui/Icons'
import { readAuthSession, getAccessToken } from '../lib/authSession'
import './ChatAide.css'

const getStoredUser = () => {
  return readAuthSession()
}

const ChatAide = () => {
  const [user] = useState(() => getStoredUser())
  const [messages, setMessages] = useState([
    { id: 1, text: "Bonjour ! Je suis l'assistant intelligent de CongoTransit. Comment puis-je vous accompagner aujourd'hui ?", sender: 'bot', time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Setup Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'fr-FR'

      recognition.onresult = (event) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          setInput(prev => (prev + ' ' + finalTranscript).trim())
        }
      }

      recognition.onerror = () => {
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognition
    }
  }, [])

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start()
        setIsRecording(true)
      } else {
        alert("La reconnaissance vocale n'est pas supportée par votre navigateur.")
      }
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const now = new Date()
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    const userMessage = { id: Date.now(), text: input, sender: 'user', time: timeString }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const history = messages
        .filter(msg => !msg.error)
        .slice(-8)
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))

      const response = await fetch(`${import.meta.env.VITE_API_URL}/aide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify({
          message: userMessage.text,
          history
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue lors de la communication avec l\'assistant.');
      }

      const reply = data?.data?.reply || data?.reply || 'Une erreur est survenue.'
      const botTime = new Date()
      const botTimeString = `${botTime.getHours().toString().padStart(2, '0')}:${botTime.getMinutes().toString().padStart(2, '0')}`

      const botMessage = { id: Date.now() + 1, text: reply, sender: 'bot', time: botTimeString }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage = error.message || 'Désolé, je ne suis pas disponible pour le moment.'
      setMessages(prev => [...prev, { id: Date.now() + 1, text: errorMessage, sender: 'bot', error: true, time: timeString }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='dashboard-page fade-in' style={{ width: '100%', padding: '0 20px 20px 20px' }}>
      <div className='chat-app-container'>
        <div className='chat-app-header'>
          <div className='chat-app-header-content'>
            <div className='chat-app-header-icon'>
              <IconSparkles size={24} />
            </div>
            <div>
              <h2>Assistant CongoTransit</h2>
              <p>IA à votre service</p>
            </div>
          </div>
        </div>

        <div className='chat-app-messages'>
          {messages.map((msg, index) => {
            const isUser = msg.sender === 'user'
            return (
              <div key={msg.id} className={`chat-app-row ${isUser ? 'chat-app-row-user' : 'chat-app-row-bot'}`}>
                {!isUser ? (
                  <div className='chat-app-avatar chat-app-avatar-bot'>
                    <IconSparkles size={20} />
                  </div>
                ) : (
                  <div className='chat-app-avatar chat-app-avatar-user'>
                    <IconUser size={20} />
                  </div>
                )}

                <div className='chat-app-content-wrapper'>
                  <div className={`chat-app-meta ${isUser ? 'chat-app-meta-user' : 'chat-app-meta-bot'}`}>
                    <span className='chat-app-time'>{msg.time}</span>
                    <span className='chat-app-name'>{isUser ? (user?.nom_affichage || 'Vous') : 'Assistant'}</span>
                  </div>
                  <div className={`chat-app-bubble ${isUser ? 'chat-app-bubble-user' : 'chat-app-bubble-bot'}`}>
                    {msg.text}
                  </div>
                  {!isUser && !msg.error && index > 0 && (
                    <div className='chat-app-reactions'>
                      <IconFrown size={16} className='reaction-icon' />
                      <IconSmile size={16} className='reaction-icon active' />
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {isLoading && (
            <div className='chat-app-row chat-app-row-bot'>
              <div className='chat-app-avatar chat-app-avatar-bot'>
                <IconSparkles size={20} />
              </div>
              <div className='chat-app-content-wrapper'>
                <div className='chat-app-meta chat-app-meta-bot'>
                  <span className='chat-app-name'>Assistant</span>
                </div>
                <div className='chat-app-bubble chat-app-bubble-bot chat-app-typing'>
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className='chat-app-input-area'>
          <div className='chat-app-input-wrapper'>
            <input
              type='text'
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder='Écrivez votre message ici...'
              className='chat-app-input'
              disabled={isLoading}
            />
            <button 
              type='button' 
              className={`chat-app-mic-btn ${isRecording ? 'recording' : ''}`}
              onClick={toggleRecording}
              title={isRecording ? "Arrêter l'enregistrement" : "Dictée vocale"}
            >
              <IconMic size={20} />
            </button>
            <button type='submit' disabled={isLoading || !input.trim()} className='chat-app-send-btn' title="Envoyer">
              <IconSend size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatAide
