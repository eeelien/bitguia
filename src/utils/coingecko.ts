export async function getBTCPriceMXN(): Promise<number> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=mxn')
    const data = await response.json()
    return data.bitcoin.mxn
  } catch (error) {
    console.error('Error fetching BTC price:', error)
    return 2500000
  }
}

export async function getBTCHistoricalData(days: number) {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=mxn&days=${days}&interval=daily`
    )
    const data = await response.json()
    return data.prices.map(([timestamp, price]: [number, number]) => ({
      date: new Date(timestamp).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }),
      price: Math.round(price),
      timestamp,
    }))
  } catch (error) {
    console.error('Error fetching historical data:', error)
    return []
  }
}
