import { useMemo } from 'react'
import type { Timeframe, Trade } from '../types'
import { num, shortDate } from '../lib'

type Candle = { open: number; high: number; low: number; close: number }

function candles(base: number, timeframe: Timeframe): Candle[] {
  const count = timeframe === '1d' ? 32 : timeframe === '4h' ? 38 : 46
  const volatility = timeframe === '1m' ? .002 : timeframe === '5m' ? .003 : timeframe === '15m' ? .004 : timeframe === '1h' ? .007 : timeframe === '4h' ? .012 : .018
  let previous = base * (1 - volatility * 2.4)
  return Array.from({ length: count }, (_, index) => {
    const wave = Math.sin(index * 1.83) * volatility + Math.cos(index * .61) * volatility * .55 + volatility * .18
    const open = previous
    const close = index === count - 1 ? base : open * (1 + wave)
    const high = Math.max(open, close) * (1 + volatility * (.25 + (index % 4) * .12))
    const low = Math.min(open, close) * (1 - volatility * (.22 + (index % 3) * .13))
    previous = close
    return { open, high, low, close }
  })
}

export function MarketChart({ price, trades, timeframe }: { price: number; trades: Trade[]; timeframe: Timeframe }) {
  const data = useMemo(() => candles(price, timeframe), [price, timeframe])
  const all = data.flatMap(c => [c.high, c.low]).concat(trades.filter(t => t.status === 'open').map(t => t.entryPrice))
  const min = Math.min(...all) * .996
  const max = Math.max(...all) * 1.004
  const y = (value: number) => 330 - (value - min) / Math.max(1, max - min) * 285
  const step = 1000 / data.length
  const width = Math.max(4, step * .62)
  const active = trades.filter(t => t.status === 'open').slice(-3)
  return <div className="market-chart">
    <svg viewBox="0 0 1000 360" preserveAspectRatio="none" role="img" aria-label="Свечной график рыночной цены">
      <defs><filter id="candleGlow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      {[55,125,195,265,335].map(v => <line key={v} x1="0" y1={v} x2="1000" y2={v} className="gridline"/>)}
      {[125,250,375,500,625,750,875].map(v => <line key={v} x1={v} y1="20" x2={v} y2="335" className="gridline vertical"/>)}
      {data.map((candle, index) => {
        const x = index * step + step / 2
        const rising = candle.close >= candle.open
        const color = rising ? '#b8ff4a' : '#ff667d'
        const top = y(Math.max(candle.open, candle.close))
        const bodyHeight = Math.max(2, Math.abs(y(candle.open) - y(candle.close)))
        return <g key={index} className="candle"><line x1={x} y1={y(candle.high)} x2={x} y2={y(candle.low)} stroke={color} strokeWidth="1.2" vectorEffect="non-scaling-stroke"/><rect x={x-width/2} y={top} width={width} height={bodyHeight} rx="1" fill={rising ? color : '#ff667d'} opacity={rising ? .92 : .84}/></g>
      })}
      {active.map((trade, index) => { const lineY = Math.max(25, Math.min(335, y(trade.entryPrice))); return <g key={trade.id}><line x1="0" y1={lineY} x2="1000" y2={lineY} className="entry-line"/><rect x="17" y={lineY-14} width="178" height="27" rx="5" className="entry-label"/><text x="28" y={lineY+4} className="entry-text">{trade.id} · вход {num(trade.entryPrice)}</text><circle cx={750-index*100} cy={lineY} r="4" fill="#b8ff4a" filter="url(#candleGlow)"/></g> })}
      <line x1="950" x2="1000" y1={y(price)} y2={y(price)} stroke="#f4f6f1" strokeDasharray="3 3"/><rect x="900" y={y(price)-13} width="96" height="25" rx="4" fill="#eef4e8"/><text x="909" y={y(price)+4} fill="#11140f" fontSize="11" fontWeight="800">{num(price)}</text>
    </svg>
    <div className="chart-times"><span>-24</span><span>-18</span><span>-12</span><span>-6</span><span>Сейчас</span></div>
    {active.at(-1) && <div className="chart-note">Вход {shortDate(active.at(-1)!.openedAt)}</div>}
  </div>
}
