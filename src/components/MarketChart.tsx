import { useMemo } from 'react'
import type { Trade } from '../types'
import { num, shortDate } from '../lib'

function createPath(base: number) {
  const values = [0,-.008,.006,.003,.016,.011,.025,.019,.031,.022,.038,.046,.041,.055,.049,.062,.07,.064,.079,.073,.085,.091,.088,.101]
  return values.map((change, i) => ({ x: i / (values.length - 1) * 1000, price: base * (1 + change) }))
}

export function MarketChart({ price, trades }: { price: number; trades: Trade[] }) {
  const data = useMemo(() => createPath(price / 1.101), [price])
  const min = Math.min(...data.map(d => d.price)) * .992
  const max = Math.max(...data.map(d => d.price)) * 1.008
  const y = (value: number) => 330 - (value - min) / (max - min) * 280
  const line = data.map((d,i) => `${i ? 'L' : 'M'} ${d.x} ${y(d.price)}`).join(' ')
  const active = trades.filter(t => t.status === 'open').slice(-3)
  return <div className="market-chart">
    <svg viewBox="0 0 1000 360" preserveAspectRatio="none" role="img" aria-label="График рыночной цены">
      <defs><linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b8ff4a" stopOpacity=".23"/><stop offset="1" stopColor="#b8ff4a" stopOpacity="0"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      {[55,125,195,265,335].map(v => <line key={v} x1="0" y1={v} x2="1000" y2={v} className="gridline"/>)}
      {[125,250,375,500,625,750,875].map(v => <line key={v} x1={v} y1="20" x2={v} y2="335" className="gridline vertical"/>)}
      <path d={`${line} L 1000 350 L 0 350 Z`} fill="url(#chartArea)"/>
      <path d={line} fill="none" stroke="#b8ff4a" strokeWidth="2.2" vectorEffect="non-scaling-stroke" filter="url(#glow)"/>
      {active.map((trade, index) => {
        const lineY = Math.max(30, Math.min(325, y(trade.entryPrice)))
        return <g key={trade.id}><line x1="0" y1={lineY} x2="1000" y2={lineY} className="entry-line"/><rect x="20" y={lineY-13} width="168" height="25" rx="5" className="entry-label"/><text x="30" y={lineY+4} className="entry-text">{trade.id} · вход {num(trade.entryPrice)}</text><circle cx={760-index*120} cy={lineY} r="5" fill="#b8ff4a"/></g>
      })}
      <circle cx="1000" cy={y(data.at(-1)!.price)} r="5" fill="#b8ff4a"/>
    </svg>
    <div className="chart-times"><span>09:00</span><span>12:00</span><span>15:00</span><span>18:00</span><span>21:00</span></div>
    {active.at(-1) && <div className="chart-note">Вход {shortDate(active.at(-1)!.openedAt)}</div>}
  </div>
}
