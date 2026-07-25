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
