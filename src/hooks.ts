import { useEffect, useState } from 'react'
import { demoTrades } from './data'
import type { Trade } from './types'

const KEY = 'profitflow.trades.v1'

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>(() => {
    try {
      const saved = localStorage.getItem(KEY)
      return saved ? JSON.parse(saved) : demoTrades
    } catch { return demoTrades }
  })

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(trades)) }, [trades])
  return [trades, setTrades] as const
}

export function useMarketPrice(symbol: string) {
  const fallback: Record<string, number> = { BTCUSDT: 67438.2, ETHUSDT: 3528.4, SOLUSDT: 153.82, BNBUSDT: 594.3, XRPUSDT: .598 }
  const [price, setPrice] = useState(fallback[symbol] ?? 100)
  const [live, setLive] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
        if (!res.ok) throw new Error('market unavailable')
        const data = await res.json()
        if (active) { setPrice(Number(data.price)); setLive(true) }
      } catch { if (active) setLive(false) }
    }
    load()
    const timer = window.setInterval(load, 15000)
    return () => { active = false; window.clearInterval(timer) }
  }, [symbol])
  return { price, live }
}
