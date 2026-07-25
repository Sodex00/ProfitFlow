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
    let socket: WebSocket | null = null
    let retry: number | undefined
    const load = async () => {
      try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
        if (!res.ok) throw new Error('market unavailable')
        const data = await res.json()
        if (active) { setPrice(Number(data.price)); setLive(true) }
      } catch { if (active) setLive(false) }
    }
    const connect = () => {
      socket = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`)
      socket.onopen = () => active && setLive(true)
      socket.onmessage = event => {
        const tick = JSON.parse(event.data)
        if (active && tick.p) setPrice(Number(tick.p))
      }
      socket.onerror = () => socket?.close()
      socket.onclose = () => { if (active) { setLive(false); retry = window.setTimeout(connect, 2500) } }
    }
    load(); connect()
    const timer = window.setInterval(load, 10000)
    return () => { active = false; window.clearInterval(timer); window.clearTimeout(retry); socket?.close() }
  }, [symbol])
  return { price, live }
}
