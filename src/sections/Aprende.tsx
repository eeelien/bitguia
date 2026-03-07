import { BookOpen, Lock, Users, Shield, TrendingUp, Zap } from 'lucide-react'
import { useState } from 'react'

interface Card {
  id: string
  title: string
  content: string
  icon: React.ReactNode
  difficulty: 'básico' | 'intermedio' | 'avanzado'
  color: string
}

const educationalCards: Card[] = [
  {
    id: '1',
    title: '¿Qué es Bitcoin?',
    content: 'Bitcoin es una moneda digital descentralizada creada en 2009. No necesita bancos - funciona peer-to-peer (directo entre usuarios). Es limitada a 21 millones de unidades y es resistente a la censura.',
    icon: <TrendingUp className="w-6 h-6" />,
    difficulty: 'básico',
    color: 'blue',
  },
  {
    id: '2',
    title: 'Blockchain: El corazón de Bitcoin',
    content: 'Blockchain es una cadena de bloques conectados. Cada bloque contiene transacciones verificadas. Es inmutable (no se puede cambiar lo pasado) y transparente - todos pueden ver las transacciones, pero sin saber quién es el dueño.',
    icon: <Shield className="w-6 h-6" />,
    difficulty: 'intermedio',
    color: 'purple',
  },
  {
    id: '3',
    title: 'Minería Bitcoin',
    content: 'Minería es el proceso de validar transacciones y crear nuevos bloques. Los mineros resuelven problemas matemáticos complejos. Reciben BTC como recompensa. Cada 4 años, la recompensa se reduce (halving).',
    icon: <Zap className="w-6 h-6" />,
    difficulty: 'intermedio',
    color: 'yellow',
  },
  {
    id: '4',
    title: 'Wallets (Billeteras)',
    content: 'Una wallet es donde guardas tus BTC. Tiene una dirección pública (para recibir dinero) y una clave privada (para gastar). Nunca compartas tu clave privada con nadie - es como tu contraseña de banco pero mucho más importante.',
    icon: <Lock className="w-6 h-6" />,
    difficulty: 'básico',
    color: 'green',
  },
  {
    id: '5',
    title: 'Criptografía en Bitcoin',
    content: 'Bitcoin usa matemáticas avanzada para ser seguro. SHA-256 y ECDSA son los algoritmos principales. La criptografía asimétrica permite firmar transacciones sin revelar tu clave privada. Por eso es imposible falsificar transacciones.',
    icon: <Shield className="w-6 h-6" />,
    difficulty: 'avanzado',
    color: 'red',
  },
  {
    id: '6',
    title: 'Consenso y Nodos',
    content: 'La red de Bitcoin tiene miles de nodos (computadoras). Cada nodo valida transacciones independientemente. Para cambiar algo en Bitcoin, la mayoría debe estar de acuerdo. Por eso es descentralizado - nadie puede controlar todo.',
    icon: <Users className="w-6 h-6" />,
    difficulty: 'intermedio',
    color: 'indigo',
  },
  {
    id: '7',
    title: 'Precio y Volatilidad',
    content: 'El precio de Bitcoin fluctúa según oferta y demanda. Es volatile (sube y baja mucho). Algunos ven esto como oportunidad, otros como riesgo. A largo plazo, muchos creen que tiende a subir, pero no hay garantías.',
    icon: <TrendingUp className="w-6 h-6" />,
    difficulty: 'básico',
    color: 'orange',
  },
  {
    id: '8',
    title: 'Bitcoin vs Altcoins',
    content: 'Bitcoin fue la primera criptomoneda. Altcoins son otras monedas como Ethereum, Litecoin, etc. Bitcoin es la más segura pero tiene menos funciones. Altcoins pueden hacer más cosas pero tienen más riesgo.',
    icon: <BookOpen className="w-6 h-6" />,
    difficulty: 'intermedio',
    color: 'pink',
  },
  {
    id: '9',
    title: 'Scaling: Problemas de Bitcoin',
    content: 'Bitcoin es lento (10 min por bloque). Procesa ~7 transacciones por segundo. Esto es intencional - más descentralización significa más lento. Soluciones como Lightning Network permiten transacciones rápidas fuera de la cadena principal.',
    icon: <Zap className="w-6 h-6" />,
    difficulty: 'avanzado',
    color: 'cyan',
  },
  {
    id: '10',
    title: 'Halving: Reducción de Recompensas',
    content: 'Cada 4 años (210,000 bloques), la recompensa de minería se divide por 2. Fue 50 BTC, luego 25, luego 12.5, ahora 6.25. En 2140, habrá exactamente 21 millones de BTC. Esto es lo que hace Bitcoin escaso.',
    icon: <TrendingUp className="w-6 h-6" />,
    difficulty: 'intermedio',
    color: 'lime',
  },
  {
    id: '11',
    title: 'HODL vs Trading',
    content: 'HODL = Hold On for Dear Life. Compra y mantiene largo plazo (meses/años). Trading = compra y vende frecuentemente para aprovechar cambios de precio. HODL es menos estresante pero requiere paciencia. Trading es más activo pero más riesgoso.',
    icon: <TrendingUp className="w-6 h-6" />,
    difficulty: 'básico',
    color: 'violet',
  },
  {
    id: '12',
    title: 'Regulación Global',
    content: 'Bitcoin no tiene propietario, pero gobiernos lo regulan diferente. Algunos países lo prohíben, otros lo aceptan. En México, es legal tener Bitcoin pero hay reglas sobre exchanges. Siempre cumple leyes locales.',
    icon: <Users className="w-6 h-6" />,
    difficulty: 'básico',
    color: 'emerald',
  },
]

const difficultyColors = {
  básico: 'bg-blue-900/20 border-blue-700/30',
  intermedio: 'bg-amber-900/20 border-amber-700/30',
  avanzado: 'bg-red-900/20 border-red-700/30',
}

const difficultyTextColors = {
  básico: 'text-blue-200',
  intermedio: 'text-amber-200',
  avanzado: 'text-red-200',
}

export default function Aprende() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [filter, setFilter] = useState<'todos' | 'básico' | 'intermedio' | 'avanzado'>('todos')

  const filteredCards = filter === 'todos' ? educationalCards : educationalCards.filter(card => card.difficulty === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-6 h-6 text-orange-500" />
        <h2 className="text-2xl font-bold">Centro de Aprendizaje</h2>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('todos')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'todos'
              ? 'bg-orange-500 text-black'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
          }`}
        >
          Todos
        </button>
        {['básico', 'intermedio', 'avanzado'].map(difficulty => (
          <button
            key={difficulty}
            onClick={() => setFilter(difficulty as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
              filter === difficulty
                ? 'bg-orange-500 text-black'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            {difficulty}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map(card => (
          <div
            key={card.id}
            onClick={() => setSelectedCard(selectedCard === card.id ? null : card.id)}
            className={`bg-gray-900 rounded-lg border border-gray-800 p-6 cursor-pointer transition-all hover:border-orange-500/50 ${
              selectedCard === card.id ? 'border-orange-500 shadow-lg shadow-orange-500/20' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`text-orange-400`}>{card.icon}</div>
              <span className={`text-xs px-2 py-1 rounded font-medium ${difficultyColors[card.difficulty]} ${difficultyTextColors[card.difficulty]}`}>
                {card.difficulty}
              </span>
            </div>

            <h3 className="font-bold text-lg mb-3 text-white">{card.title}</h3>

            {selectedCard === card.id && (
              <div className="text-gray-300 text-sm leading-relaxed">
                {card.content}
              </div>
            )}

            {selectedCard !== card.id && (
              <p className="text-gray-400 text-sm">Haz click para expandir...</p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mt-8">
        <h3 className="font-bold text-lg mb-4">Roadmap de Aprendizaje</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
            <div>
              <p className="font-semibold text-sm">Nivel Básico</p>
              <p className="text-gray-400 text-xs">Aprende qué es Bitcoin, cómo funcionan las wallets y la diferencia entre HODL y trading.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
            <div>
              <p className="font-semibold text-sm">Nivel Intermedio</p>
              <p className="text-gray-400 text-xs">Entiende blockchain, minería, halving y consenso. Empieza a usar el simulador.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
            <div>
              <p className="font-semibold text-sm">Nivel Avanzado</p>
              <p className="text-gray-400 text-xs">Criptografía, scaling, sidechains. Investiga papers y comunidades técnicas.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-6">
        <h3 className="font-bold mb-2 text-yellow-200">Disclaimer Educativo</h3>
        <p className="text-sm text-yellow-100/80 mb-3">
          BitGuía es solo para educación. No somos asesores financieros. El simulator usa dinero ficticio. La volatilidad real de Bitcoin es impredecible.
        </p>
        <div className="space-y-2 text-xs text-yellow-100/70">
          <p>• Nunca inviertas dinero que no puedas perder</p>
          <p>• Hodl es un meme - invierte en lo que crees</p>
          <p>• La seguridad es tu responsabilidad</p>
          <p>• Busca múltiples fuentes antes de decidir</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="font-bold text-lg mb-4">Recursos Recomendados</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>• <span className="text-orange-400">Bitcoin Whitepaper</span> por Satoshi Nakamoto - El documento original</li>
          <li>• <span className="text-orange-400">Mastering Bitcoin</span> por Andreas Antonopoulos - Libro técnico</li>
          <li>• <span className="text-orange-400">Bitcoin.org</span> - Documentación oficial</li>
          <li>• <span className="text-orange-400">The Bitcoin Standard</span> - Perspectiva económica</li>
          <li>• <span className="text-orange-400">Stack Exchange</span> - Preguntas técnicas</li>
        </ul>
      </div>
    </div>
  )
}
