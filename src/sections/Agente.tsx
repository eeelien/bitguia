import { useState, useEffect, useRef } from 'react'
import { Send, Loader, AlertCircle, TrendingUp } from 'lucide-react'
import { supabase } from '../utils/supabase'
import { getBTCPriceMXN } from '../utils/coingecko'

interface Message {
  id: string
  message: string
  response: string
  created_at: string
}

interface AgenteProps {
  sessionId: string
}

export default function Agente({ sessionId }: AgenteProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [btcPrice, setBtcPrice] = useState<number | null>(null)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages()
    fetchBTCPrice()
    const interval = setInterval(fetchBTCPrice, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', sessionId)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  const fetchBTCPrice = async () => {
    const price = await getBTCPriceMXN()
    setBtcPrice(price)
  }

  const callGroqAPI = async (userMessage: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY
    if (!apiKey) {
      throw new Error('Groq API key not configured. Please add VITE_GROQ_API_KEY to .env')
    }

    const currentPrice = btcPrice || (await getBTCPriceMXN())

    const systemPrompt = `Eres un agente educativo experto en Bitcoin para usuarios mexicanos.
Tu objetivo es educar sobre Bitcoin de manera clara y accesible, sin dar asesoramiento financiero.
Responde siempre en español mexicano simple.
Precio actual de Bitcoin: $${currentPrice.toLocaleString('es-MX')} MXN.
Cuando hagas análisis, sé breve y educativo. Siempre incluye un disclaimer que esto es solo educación, no asesoramiento.`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Error calling Groq API')
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  const handleSend = async () => {
    if (!input.trim()) return

    setLoading(true)
    setError('')

    try {
      const agentResponse = await callGroqAPI(input)

      const { data } = await supabase
        .from('chat_messages')
        .insert({
          user_id: sessionId,
          message: input,
          response: agentResponse,
        })
        .select()

      if (data) {
        setMessages(prev => [...prev, data[0]])
      }

      setInput('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error sending message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col bg-gray-900 rounded-lg border border-gray-800 h-96 lg:h-auto">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <p>Inicia una conversación con el agente educativo sobre Bitcoin</p>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className="space-y-3">
                <div className="flex justify-end">
                  <div className="bg-orange-500 text-black rounded-lg px-4 py-2 max-w-xs break-words">
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-gray-800 rounded-lg px-4 py-2 max-w-xs break-words">
                    <p className="text-sm text-gray-200">{msg.response}</p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-800 p-4">
          {error && (
            <div className="mb-3 flex items-start gap-2 bg-red-900/20 border border-red-700/30 rounded-lg p-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-200">{error}</p>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && !loading && handleSend()}
              placeholder="Pregunta sobre Bitcoin..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 text-black font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-orange-500" />
            <h3 className="font-bold text-lg">Precio actual</h3>
          </div>

          {btcPrice ? (
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500 mb-1">
                ${btcPrice.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
              </div>
              <p className="text-sm text-gray-400 mb-4">MXN</p>
              <button
                onClick={fetchBTCPrice}
                className="w-full bg-orange-500 hover:bg-orange-600 text-black font-medium py-2 rounded-lg transition-colors text-sm"
              >
                Actualizar precio
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Loader className="w-6 h-6 animate-spin text-orange-500 mx-auto" />
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 text-blue-200">Preguntas sugeridas:</h4>
            <div className="space-y-2 text-xs text-gray-300">
              <button
                onClick={() => setInput('¿Qué es Bitcoin?')}
                className="block w-full text-left hover:text-orange-400 transition-colors"
              >
                ¿Qué es Bitcoin?
              </button>
              <button
                onClick={() => setInput('¿Cómo funciona la tecnología blockchain?')}
                className="block w-full text-left hover:text-orange-400 transition-colors"
              >
                ¿Cómo funciona blockchain?
              </button>
              <button
                onClick={() => setInput('¿Cuál es la diferencia entre Bitcoin y otras criptomonedas?')}
                className="block w-full text-left hover:text-orange-400 transition-colors"
              >
                Bitcoin vs altcoins
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
