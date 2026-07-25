import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Trade, Period } from '../types'
import { tradePnl } from '../lib'

export function AnalyticsChart({ trades, period }: { trades: Trade[]; period: Period }) {
  const closed = trades.filter(t => t.status === 'closed')
  const groups = period === 'day' ? ['09','11','13','15','17','19','21'] : period === 'week' ? ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'] : period === 'month' ? ['1 нед','2 нед','3 нед','4 нед'] : ['Янв','Мар','Май','Июл','Сен','Ноя']
  const seed = closed.length ? closed.map(tradePnl) : [0]
  const data = groups.map((label, i) => ({ label, pnl: Math.round((seed[i % seed.length] ?? 0) * (.55 + (i % 3) * .28)) }))
  return <div className="analytics-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
    <CartesianGrid vertical={false} stroke="#252823" strokeDasharray="3 5"/>
    <XAxis dataKey="label" tick={{ fill: '#73776e', fontSize: 11 }} axisLine={false} tickLine={false}/>
    <YAxis tick={{ fill: '#73776e', fontSize: 11 }} axisLine={false} tickLine={false}/>
    <Tooltip cursor={{ fill: '#ffffff08' }} contentStyle={{ background: '#151814', border: '1px solid #292d27', borderRadius: 10, fontSize: 12 }} formatter={(v) => [`$${Number(v).toFixed(0)}`, 'P&L']}/>
    <Bar dataKey="pnl" fill="#b8ff4a" radius={[4,4,0,0]} maxBarSize={34}/>
  </BarChart></ResponsiveContainer></div>
}
