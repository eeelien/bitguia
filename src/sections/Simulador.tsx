import { useState, useEffect } from 'react'
import { Wallet, TrendingUp, AlertCircle, Trash2, Plus } from 'lucide-react'
import { supabase } from '../utils/supabase'
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

interface SimuladorProps {
  sessionId: string
}

export default function Simulador({ sessionId }: SimuladorProps) {
  const [portfolio, setPortfolio] = useState<Portfolio>({ balance_mxn: 10000, btc_balance: 0 })
  const [trades, setTrades] = useState<Trade[]>([])
  const [btcPrice, setBtcPrice] = useState<number>(2500000)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'buy' | 'sell' | 'dca'>('buy')
  const [amountInput, setAmountInput] = useState('')
  const [stopLossPrice, setStopLossPrice] = useState('')
  const [dcaFrequency, setDcaFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [dcaAmount, setDcaAmount] = useState('')

  useEffect(() => {
    loadPortfolio()
    loadTrades()
    fetchBTCPrice()
    const interval = setInterval(fetchBTCPrice, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadPortfolio = async () => {
    const { data } = await supabase
      .from('simulator_portfolio')
      .select('*')
      .eq('user_id', sessionId)
      .maybeSingle()

    if (data) {
      setPortfolio({ balance_mxn: data.balance_mxn, btc_balance: data.btc_balance })
    } else {
      await supabase.from('simulator_portfolio').insert({
        user_id: sessionId,
        balance_mxn: 10000,
        btc_balance: 0,
      })
    }
  }

  const loadTrades = async () => {
    const { data } = await supabase
      .from('simulator_trades')
      .select('*')
      .eq('user_id', sessionId)
      .order('created_at', { ascending: false })

    if (data) setTrades(data)
  }

  const fetchBTCPrice = async () => {
    const price = await getBTCPriceMXN()
    setBtcPrice(price)

    if (stopLossPrice && Number(stopLossPrice) > price && portfolio.btc_balance > 0) {
      setError(`⚠️ Stop loss activado: Precio cayó a $${price.toLocaleString('es-MX')}`)
    }
  }

  const executeTrade = async (type: 'buy' | 'sell', mxnAmount: number) => {
    setError('')
    setLoading(true)

    const btcAmount = mxnAmount / btcPrice

    if (type === 'buy' && mxnAmount > portfolio.balance_mxn) {
      setError('Saldo insuficiente para esta compra')
      setLoading(false)
      return
    }

    if (type === 'sell' && btcAmount > portfolio.btc_balance) {
      setError('No tienes suficiente BTC para esta venta')
      setLoading(false)
      return
    }

    const newBalance = type === 'buy'
      ? portfolio.balance_mxn - mxnAmount
      : portfolio.balance_mxn + mxnAmount

    const newBTC = type === 'buy'
      ? portfolio.btc_balance + btcAmount
      : portfolio.btc_balance - btcAmount

    const { error: updateError } = await supabase
      .from('simulator_portfolio')
      .update({
        balance_mxn: newBalance,
        btc_balance: newBTC,
        updated_at: new Date(),
      })
      .eq('user_id', sessionId)

    if (!updateError) {
      const { data: newTrade } = await supabase
        .from('simulator_trades')
        .insert({
          user_id: sessionId,
          type,
          amount_mxn: mxnAmount,
          btc_amount: btcAmount,
          price_mxn: btcPrice,
        })
        .select()

      if (newTrade) {
        setTrades(prev => [newTrade[0], ...prev])
        setPortfolio({ balance_mxn: newBalance, btc_balance: newBTC })
        setAmountInput('')
      }
    } else {
      setError('Error en la transacción')
    }

    setLoading(false)
  }

  const handleTrade = async () => {
    const amount = Number(amountInput)
    if (!amount || amount <= 0) {
      setError('Ingresa una cantidad válida')
      return
    }

    if (mode === 'buy' || mode === 'sell') {
      await executeTrade(mode, amount)
    } else if (mode === 'dca') {
      const dcaAmt = Number(dcaAmount)
      if (!dcaAmt || dcaAmt <= 0) {
        setError('Ingresa una cantidad válida para DCA')
        return
      }

      for (let i = 0; i < 3; i++) {
        await executeTrade('buy', dcaAmt)
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      setDcaAmount('')
    }
  }

  const totalValue = portfolio.btc_balance * btcPrice + portfolio.balance_mxn
  const gainLoss = totalValue - 10000
  const gainLossPercent = (gainLoss / 10000) * 100

  const resetPortfolio = async () => {
    if (confirm('¿Resetear el portafolio a $10,000 MXN?')) {
      await supabase
        .from('simulator_portfolio')
        .update({
          balance_mxn: 10000,
          btc_balance: 0,
          updated_at: new Date(),
        })
        .eq('user_id', sessionId)

      await supabase
        .from('simulator_trades')
        .delete()
        .eq('user_id', sessionId)

      setPortfolio({ balance_mxn: 10000, btc_balance: 0 })
      setTrades([])
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Wallet className="w-6 h-6 text-orange-500" />
              Tu Portafolio
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Saldo MXN</p>
                <p className="text-2xl font-bold text-green-400">
                  ${portfolio.balance_mxn.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">BTC Holdings</p>
                <p className="text-2xl font-bold text-orange-400">
                  {portfolio.btc_balance.toFixed(6)} BTC
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Valor Total</p>
                <p className="text-2xl font-bold text-blue-400">
                  ${totalValue.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className={`bg-gray-800 rounded-lg p-4 ${gainLoss >= 0 ? 'border border-green-700/30' : 'border border-red-700/30'}`}>
                <p className="text-sm text-gray-400 mb-1">Ganancia/Pérdida</p>
                <p className={`text-2xl font-bold ${gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {gainLoss >= 0 ? '+' : ''}{gainLoss.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                </p>
                <p className={`text-xs ${gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
              <p className="text-sm text-blue-200">
                <span className="font-semibold">Precio BTC actual:</span> ${btcPrice.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN
              </p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="text-lg font-bold mb-4">Realizar transacción</h3>

            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => { setMode('buy'); setError('') }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    mode === 'buy' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  Comprar
                </button>
                <button
                  onClick={() => { setMode('sell'); setError('') }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    mode === 'sell' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  Vender
                </button>
                <button
                  onClick={() => { setMode('dca'); setError('') }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    mode === 'dca' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  DCA
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-900/20 border border-red-700/30 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              {mode !== 'dca' && (
                <input
                  type="number"
                  value={amountInput}
                  onChange={e => { setAmountInput(e.target.value); setError('') }}
                  placeholder={`Cantidad en MXN`}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                />
              )}

              {mode === 'dca' && (
                <div className="space-y-3">
                  <input
                    type="number"
                    value={dcaAmount}
                    onChange={e => { setDcaAmount(e.target.value); setError('') }}
                    placeholder="Cantidad por compra (MXN)"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  />
                  <select
                    value={dcaFrequency}
                    onChange={e => setDcaFrequency(e.target.value as any)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                  </select>
                  <p className="text-xs text-gray-400">
                    DCA: Simula 3 compras iguales. En la vida real, espera entre cada una.
                  </p>
                </div>
              )}

              {(mode === 'buy' || mode === 'sell') && (
                <div className="p-3 bg-gray-800 rounded-lg text-sm">
                  <p className="text-gray-300">
                    {mode === 'buy' && amountInput && `Obtendrías: ${(Number(amountInput) / btcPrice).toFixed(6)} BTC`}
                    {mode === 'sell' && amountInput && `Recibirías: $${Number(amountInput).toLocaleString('es-MX')} MXN`}
                  </p>
                </div>
              )}

              <button
                onClick={handleTrade}
                disabled={loading || !amountInput}
                className={`w-full py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  mode === 'buy' ? 'bg-green-600 hover:bg-green-700 disabled:bg-gray-700' :
                  mode === 'sell' ? 'bg-red-600 hover:bg-red-700 disabled:bg-gray-700' :
                  'bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700'
                }`}
              >
                <Plus className="w-4 h-4" />
                {loading ? 'Procesando...' : `${mode === 'buy' ? 'Comprar' : mode === 'sell' ? 'Vender' : 'Aplicar DCA'} Ahora`}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="font-semibold mb-4 text-lg">Stop Loss</h3>
            <input
              type="number"
              value={stopLossPrice}
              onChange={e => setStopLossPrice(e.target.value)}
              placeholder="Precio límite (MXN)"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 mb-2"
            />
            <p className="text-xs text-gray-400 mb-3">
              Recibirás alerta si BTC cae a este precio.
            </p>
            <div className="p-3 bg-orange-900/20 border border-orange-700/30 rounded-lg text-xs text-orange-200">
              Stop Loss es educativo. Las ventas son manuales en la simulación.
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="font-semibold mb-4">Últimas transacciones</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {trades.length === 0 ? (
                <p className="text-sm text-gray-500">Sin transacciones aún</p>
              ) : (
                trades.slice(0, 10).map(trade => (
                  <div key={trade.id} className="p-3 bg-gray-800 rounded-lg text-sm">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${trade.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.type === 'buy' ? '↑ Compra' : '↓ Venta'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(trade.created_at).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                    <p className="text-gray-300 text-xs mt-1">
                      {trade.btc_amount.toFixed(6)} BTC @ ${trade.price_mxn.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={resetPortfolio}
            className="w-full bg-red-900/20 hover:bg-red-900/30 border border-red-700/30 text-red-300 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Resetear portafolio
          </button>
        </div>
      </div>
    </div>
  )
}
