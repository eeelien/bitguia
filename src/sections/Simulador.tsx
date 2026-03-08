import { useState, useEffect } from 'react'
import { Wallet, AlertCircle, Trash2, Plus } from 'lucide-react'
import { getBTCPriceMXN } from '../utils/coingecko'

interface Trade {
  id: string
  type: 'buy' | 'sell'
  amount_mxn: number
  btc_amount: number
  price_mxn: number
  created_at: string
}
interface Portfolio {
  balance_mxn: number
  btc_balance: number
}

const INITIAL_PORTFOLIO: Portfolio = { balance_mxn: 10000, btc_balance: 0 }

export default function Simulador() {
  const [portfolio, setPortfolio] = useState<Portfolio>(() => {
    const saved = localStorage.getItem('bitguia_portfolio')
    return saved ? JSON.parse(saved) : INITIAL_PORTFOLIO
  })
  const [trades, setTrades] = useState<Trade[]>(() => {
    const saved = localStorage.getItem('bitguia_trades')
    return saved ? JSON.parse(saved) : []
  })
  const [btcPrice, setBtcPrice] = useState<number>(2500000)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'buy' | 'sell' | 'dca'>('buy')
  const [amountInput, setAmountInput] = useState('')
  const [stopLossPrice, setStopLossPrice] = useState('')
  const [dcaFrequency, setDcaFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [dcaAmount, setDcaAmount] = useState('')

  useEffect(() => {
    fetchBTCPrice()
    const interval = setInterval(fetchBTCPrice, 10000)
    return () => clearInterval(interval)
  }, [])
  useEffect(() => { localStorage.setItem('bitguia_portfolio', JSON.stringify(portfolio)) }, [portfolio])
  useEffect(() => { localStorage.setItem('bitguia_trades', JSON.stringify(trades)) }, [trades])

  const fetchBTCPrice = async () => {
    try {
      const price = await getBTCPriceMXN()
      if (price && price > 0) {
        setBtcPrice(price)
        if (stopLossPrice && Number(stopLossPrice) > price) {
          setError(`⚠️ Stop loss: BTC está en $${price.toLocaleString('es-MX')} MXN`)
        }
      }
    } catch (err) {
      console.error('Error fetching BTC price', err)
    }
  }

  const executeTrade = (type: 'buy' | 'sell', mxnAmount: number) => {
    setError('')
    if (!btcPrice || btcPrice <= 0) { setError('Esperando precio de BTC...'); return }
    try {
      setLoading(true)
      const btcAmount = mxnAmount / btcPrice
      if (type === 'buy' && mxnAmount > portfolio.balance_mxn) { setError('Saldo insuficiente'); setLoading(false); return }
      if (type === 'sell' && btcAmount > portfolio.btc_balance) { setError('No tienes suficiente BTC'); setLoading(false); return }
      const newPortfolio: Portfolio = {
        balance_mxn: type === 'buy' ? portfolio.balance_mxn - mxnAmount : portfolio.balance_mxn + mxnAmount,
        btc_balance: type === 'buy' ? portfolio.btc_balance + btcAmount : portfolio.btc_balance - btcAmount,
      }
      const newTrade: Trade = { id: Date.now().toString(), type, amount_mxn: mxnAmount, btc_amount: btcAmount, price_mxn: btcPrice, created_at: new Date().toISOString() }
      setPortfolio(newPortfolio)
      setTrades(prev => [newTrade, ...prev])
      setAmountInput('')
    } catch (err) {
      setError('Error al ejecutar la operación')
    } finally {
      setLoading(false)
    }
  }

  const handleTrade = () => {
    if (mode === 'dca') {
      const dcaAmt = Number(dcaAmount)
      if (!dcaAmt || dcaAmt <= 0) { setError('Ingresa una cantidad válida para DCA'); return }
      for (let i = 0; i < 3; i++) executeTrade('buy', dcaAmt)
      setDcaAmount('')
      return
    }
    const amount = Number(amountInput)
    if (!amount || amount <= 0) { setError('Ingresa una cantidad válida'); return }
    executeTrade(mode, amount)
  }

  const resetPortfolio = () => {
    if (confirm('¿Resetear el portafolio a $10,000 MXN?')) {
      setPortfolio(INITIAL_PORTFOLIO)
      setTrades([])
      localStorage.removeItem('bitguia_portfolio')
      localStorage.removeItem('bitguia_trades')
    }
  }

  const totalValue = portfolio.btc_balance * btcPrice + portfolio.balance_mxn
  const gainLoss = totalValue - 10000
  const gainLossPercent = (gainLoss / 10000) * 100

  return (
    <div className="space-y-6">
      <div className="p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg text-center">
        <p className="text-xs text-yellow-200 font-semibold">⚠️ SIMULACIÓN — El dinero es ficticio. Solo con fines educativos.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Wallet className="w-6 h-6 text-orange-500" />Tu Portafolio (Simulado)</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4"><p className="text-sm text-gray-400 mb-1">Saldo MXN</p><p className="text-2xl font-bold text-green-400">${portfolio.balance_mxn.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</p></div>
              <div className="bg-gray-800 rounded-lg p-4"><p className="text-sm text-gray-400 mb-1">BTC Holdings</p><p className="text-2xl font-bold text-orange-400">{portfolio.btc_balance.toFixed(6)} BTC</p></div>
              <div className="bg-gray-800 rounded-lg p-4"><p className="text-sm text-gray-400 mb-1">Valor Total</p><p className="text-2xl font-bold text-blue-400">${totalValue.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</p></div>
              <div className={`bg-gray-800 rounded-lg p-4 ${gainLoss >= 0 ? 'border border-green-700/30' : 'border border-red-700/30'}`}>
                <p className="text-sm text-gray-400 mb-1">Ganancia/Pérdida</p>
                <p className={`text-2xl font-bold ${gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>{gainLoss >= 0 ? '+' : ''}{gainLoss.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</p>
                <p className={`text-xs ${gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>{gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%</p>
              </div>
            </div>
            <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg"><p className="text-sm text-blue-200"><span className="font-semibold">Precio BTC actual:</span> ${btcPrice.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN</p></div>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="text-lg font-bold mb-4">Realizar transacción</h3>
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {(['buy', 'sell', 'dca'] as const).map(m => (
                  <button key={m} onClick={() => { setMode(m); setError('') }} className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${mode === m ? m === 'buy' ? 'bg-green-600 text-white' : m === 'sell' ? 'bg-red-600 text-white' : 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300'}`}>
                    {m === 'buy' ? 'Comprar' : m === 'sell' ? 'Vender' : 'DCA'}
                  </button>
                ))}
              </div>
              {error && (<div className="flex items-start gap-2 bg-red-900/20 border border-red-700/30 rounded-lg p-3"><AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" /><p className="text-sm text-red-200">{error}</p></div>)}
              {mode !== 'dca' ? (
                <input min="0" type="number" value={amountInput} onChange={e => { setAmountInput(e.target.value); setError('') }} placeholder="Cantidad en MXN" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500" />
              ) : (
                <div className="space-y-3">
                  <input min="0" type="number" value={dcaAmount} onChange={e => { setDcaAmount(e.target.value); setError('') }} placeholder="Cantidad por compra (MXN)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500" />
                  <select value={dcaFrequency} onChange={e => setDcaFrequency(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500">
                    <option value="daily">Diario</option><option value="weekly">Semanal</option><option value="monthly">Mensual</option>
                  </select>
                  <p className="text-xs text-gray-400">Simula 3 compras iguales consecutivas.</p>
                </div>
              )}
              {mode !== 'dca' && amountInput && (<div className="p-3 bg-gray-800 rounded-lg text-sm text-gray-300">{mode === 'buy' ? `Obtendrías: ${(Number(amountInput) / btcPrice).toFixed(6)} BTC` : `Recibirías: $${Number(amountInput).toLocaleString('es-MX')} MXN`}</div>)}
              <button onClick={handleTrade} disabled={loading} className={`w-full py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${mode === 'buy' ? 'bg-green-600 hover:bg-green-700' : mode === 'sell' ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'} disabled:bg-gray-700`}>
                <Plus className="w-4 h-4" />{mode === 'buy' ? 'Comprar' : mode === 'sell' ? 'Vender' : 'Aplicar DCA'}
              </button>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="font-semibold mb-4 text-lg">Stop Loss</h3>
            <input min="0" type="number" value={stopLossPrice} onChange={e => setStopLossPrice(e.target.value)} placeholder="Precio límite (MXN)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 mb-2" />
            <p className="text-xs text-gray-400 mb-3">Recibirás alerta si BTC cae a este precio.</p>
            <div className="p-3 bg-orange-900/20 border border-orange-700/30 rounded-lg text-xs text-orange-200">Stop Loss es educativo. Las ventas son manuales.</div>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="font-semibold mb-4">Últimas transacciones</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {trades.length === 0 ? (<p className="text-sm text-gray-500">Sin transacciones aún</p>) : (
                trades.slice(0, 10).map(trade => (
                  <div key={trade.id} className="p-3 bg-gray-800 rounded-lg text-sm">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${trade.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>{trade.type === 'buy' ? '↑ Compra' : '↓ Venta'}</span>
                      <span className="text-xs text-gray-400">{new Date(trade.created_at).toLocaleDateString('es-MX')}</span>
                    </div>
                    <p className="text-gray-300 text-xs mt-1">{trade.btc_amount.toFixed(6)} BTC @ ${trade.price_mxn.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <button onClick={resetPortfolio} className="w-full bg-red-900/20 hover:bg-red-900/30 border border-red-700/30 text-red-300 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" />Resetear portafolio
          </button>
        </div>
      </div>
    </div>
  )
}
