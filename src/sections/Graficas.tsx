import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Loader } from 'recharts'
import { TrendingUp, Loader as LoaderIcon } from 'lucide-react'
import { getBTCHistoricalData, getBTCPriceMXN } from '../utils/coingecko'

interface ChartData {
  date: string
  price: number
  timestamp: number
}

export default function Graficas() {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState<7 | 30 | 90>(7)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [priceChange, setPriceChange] = useState<number | null>(null)

  useEffect(() => {
    loadData(period)
  }, [period])

  const loadData = async (days: 7 | 30 | 90) => {
    setLoading(true)
    const chartData = await getBTCHistoricalData(days)
    if (chartData.length > 0) {
      setData(chartData)
      const price = await getBTCPriceMXN()
      setCurrentPrice(price)

      const oldestPrice = chartData[0].price
      const change = ((price - oldestPrice) / oldestPrice) * 100
      setPriceChange(change)
    }
    setLoading(false)
  }

  const stats = data.length > 0 ? {
    high: Math.max(...data.map(d => d.price)),
    low: Math.min(...data.map(d => d.price)),
    average: Math.round(data.reduce((sum, d) => sum + d.price, 0) / data.length),
  } : null

  const analysis = currentPrice && priceChange !== null ? (
    <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
      <h4 className="font-semibold text-sm mb-3 text-blue-200">Análisis automático</h4>
      <div className="space-y-2 text-sm text-gray-300">
        <p>
          <span className="text-blue-300">Precio actual:</span>{' '}
          <span className="font-bold text-orange-400">${currentPrice.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</span>
        </p>
        <p>
          <span className="text-blue-300">Cambio en {period} días:</span>{' '}
          <span className={`font-bold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
          </span>
        </p>
        <p>
          <span className="text-blue-300">Máximo:</span>{' '}
          <span className="font-mono">${stats!.high.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</span>
        </p>
        <p>
          <span className="text-blue-300">Mínimo:</span>{' '}
          <span className="font-mono">${stats!.low.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</span>
        </p>
        <p>
          <span className="text-blue-300">Promedio:</span>{' '}
          <span className="font-mono">${stats!.average.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</span>
        </p>

        <div className="mt-3 pt-3 border-t border-blue-700/30">
          <p className="text-xs text-gray-400">
            {priceChange > 10 && '📈 Tendencia alcista fuerte en este periodo.'}
            {priceChange > 0 && priceChange <= 10 && '📈 Tendencia alcista leve.'}
            {priceChange < -10 && '📉 Tendencia bajista fuerte en este periodo.'}
            {priceChange < 0 && priceChange >= -10 && '📉 Tendencia bajista leve.'}
            {priceChange === 0 && '➡️ Precio estable en este periodo.'}
          </p>
        </div>
      </div>
    </div>
  ) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold">Gráficas BTC/MXN</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[7, 30, 90].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p as 7 | 30 | 90)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                period === p
                  ? 'bg-orange-500 text-black'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              {p}D
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 rounded-lg border border-gray-800 p-6">
          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <LoaderIcon className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => `$${value.toLocaleString('es-MX')}`}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#F7931A"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-500">
              No hay datos disponibles
            </div>
          )}
        </div>

        <div className="space-y-4">
          {analysis}

          <div className="p-4 bg-amber-900/20 border border-amber-700/30 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 text-amber-200">Interpretación de gráficas</h4>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>• Línea hacia arriba = precio sube (alcista)</li>
              <li>• Línea hacia abajo = precio baja (bajista)</li>
              <li>• Línea plana = precio estable</li>
              <li>Usa % de cambio para comparar periodos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
