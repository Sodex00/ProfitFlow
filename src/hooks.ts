import { useEffect, useState } from 'react'
import { demoTrades } from './data'
import type { Candle, Timeframe, Trade } from './types'

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

export function useCandles(symbol: string, timeframe: Timeframe) {
  const [candles, setCandles] = useState<Candle[]>([])
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    let active = true
    let socket: WebSocket | null = null
    const load = async () => {
      try {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${timeframe}&limit=60`)
        const rows = await response.json()
        if (active && Array.isArray(rows)) setCandles(rows.map((row: (number|string)[]) => ({ openTime:Number(row[0]), open:Number(row[1]), high:Number(row[2]), low:Number(row[3]), close:Number(row[4]), closeTime:Number(row[6]) })))
      } catch { /* keep last visible series */ }
    }
    load()
    socket = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${timeframe}`)
    socket.onmessage = event => {
      const k = JSON.parse(event.data).k
      const next:Candle = { openTime:k.t, open:Number(k.o), high:Number(k.h), low:Number(k.l), close:Number(k.c), closeTime:k.T }
      if (!active) return
      setCandles(previous => previous.at(-1)?.openTime === next.openTime ? [...previous.slice(0,-1),next] : [...previous.slice(-59),next])
    }
    const clock = window.setInterval(() => setNow(Date.now()), 1000)
    return () => { active=false; socket?.close(); window.clearInterval(clock) }
  }, [symbol,timeframe])
  return { candles, remainingMs: Math.max(0, (candles.at(-1)?.closeTime ?? now) - now) }
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
