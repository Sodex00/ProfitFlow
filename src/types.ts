export type Side = 'long' | 'short'
export type TradeStatus = 'open' | 'closed'

export interface Trade {
  id: string
  symbol: string
  side: Side
  entryPrice: number
  exitPrice?: number
  amount: number
  takeProfit?: number
  stopLoss?: number
  openedAt: string
  closedAt?: string
  status: TradeStatus
  note?: string
}

export type Period = 'day' | 'week' | 'month' | 'year'
export type Page = 'spot' | 'futures' | 'analytics' | 'settings'
export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
