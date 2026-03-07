import { useState, useEffect } from 'react'
import { Bitcoin, MessageCircle, TrendingUp, Wallet, BookOpen, AlertCircle } from 'lucide-react'
import Agente from './sections/Agente'
import Graficas from './sections/Graficas'
import Simulador from './sections/Simulador'
import Aprende from './sections/Aprende'

function App() {
  const [activeTab, setActiveTab] = useState('agente')
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    localStorage.setItem('bitguia_session', sessionId)
  }, [sessionId])

  const tabs = [
    { id: 'agente', label: 'Agente', icon: MessageCircle },
    { id: 'graficas', label: 'Gráficas', icon: TrendingUp },
    { id: 'simulador', label: 'Simulador', icon: Wallet },
    { id: 'aprende', label: 'Aprende', icon: BookOpen },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 mb-6">
            <Bitcoin className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold">BitGuía</h1>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-orange-500 text-black'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4 flex items-start gap-2 bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-200">
            Aviso Legal: BitGuía es una herramienta educativa. Esto NO es asesoramiento financiero. Las transacciones son simuladas.
          </p>
        </div>

        {activeTab === 'agente' && <Agente />}
        {activeTab === 'graficas' && <Graficas />}
        {activeTab === 'simulador' && <Simulador />}
        {activeTab === 'aprende' && <Aprende />}
      </main>

      <footer className="bg-gray-900 border-t border-gray-800 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>BitGuía © 2024 | Precios en tiempo real desde CoinGecko</p>
        </div>
      </footer>
    </div>
  )
}

export default App
