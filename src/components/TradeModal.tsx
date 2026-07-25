import { useEffect, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, X } from 'lucide-react'
import { symbols } from '../data'
import type { Side, Trade } from '../types'

type Props = { currentPrice: number; initialSymbol: string; onClose: () => void; onCreate: (trade: Trade) => void }

export function TradeModal({ currentPrice, initialSymbol, onClose, onCreate }: Props) {
  const [symbol, setSymbol] = useState(initialSymbol)
  const [side, setSide] = useState<Side>('long')
  const [entry, setEntry] = useState(String(currentPrice))
  const [amount, setAmount] = useState('0.1')
  const [tp, setTp] = useState('')
  const [sl, setSl] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0,16))
  const [note, setNote] = useState('')
  useEffect(() => setEntry(String(currentPrice)), [currentPrice])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    onCreate({
      id: `PF-${String(Date.now()).slice(-4)}`, symbol, side,
      entryPrice: Number(entry), amount: Number(amount),
      takeProfit: tp ? Number(tp) : undefined, stopLoss: sl ? Number(sl) : undefined,
      openedAt: new Date(date).toISOString(), status: 'open', note,
    })
  }

  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <form className="modal" onSubmit={submit}>
      <header><div><span className="eyebrow">Новая позиция</span><h2>Записать сделку</h2></div><button type="button" className="icon-btn" onClick={onClose}><X size={18}/></button></header>
      <div className="side-switch">
        <button type="button" className={side === 'long' ? 'active long' : ''} onClick={() => setSide('long')}><ArrowUpRight size={18}/> Long</button>
        <button type="button" className={side === 'short' ? 'active short' : ''} onClick={() => setSide('short')}><ArrowDownRight size={18}/> Short</button>
      </div>
      <div className="form-grid">
        <label>Актив<select value={symbol} onChange={e => setSymbol(e.target.value)}>{symbols.map(s => <option key={s}>{s}</option>)}</select></label>
        <label>Дата и время<input type="datetime-local" required value={date} onChange={e => setDate(e.target.value)}/></label>
        <label>Цена входа<input type="number" min="0" step="any" required value={entry} onChange={e => setEntry(e.target.value)}/></label>
        <label>Количество<input type="number" min="0" step="any" required value={amount} onChange={e => setAmount(e.target.value)}/></label>
        <label>Take Profit<input type="number" min="0" step="any" value={tp} placeholder="Не задан" onChange={e => setTp(e.target.value)}/></label>
        <label>Stop Loss<input type="number" min="0" step="any" value={sl} placeholder="Не задан" onChange={e => setSl(e.target.value)}/></label>
      </div>
      <label>Комментарий<textarea value={note} placeholder="Почему вы открываете позицию?" onChange={e => setNote(e.target.value)}/></label>
      <div className="modal-actions"><button type="button" className="btn ghost" onClick={onClose}>Отмена</button><button className="btn primary">Создать позицию</button></div>
    </form>
  </div>
}

export function CloseTradeModal({ trade, currentPrice, onClose, onSubmit }: { trade: Trade; currentPrice: number; onClose: () => void; onSubmit: (price: number) => void }) {
  const [price, setPrice] = useState(String(currentPrice))
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <form className="modal compact" onSubmit={e => { e.preventDefault(); onSubmit(Number(price)) }}>
      <header><div><span className="eyebrow">{trade.id} · {trade.symbol}</span><h2>Закрыть позицию</h2></div><button type="button" className="icon-btn" onClick={onClose}><X size={18}/></button></header>
      <p className="modal-hint">Укажите фактическую цену выхода или используйте актуальную рыночную цену.</p>
      <label>Цена выхода<input type="number" min="0" step="any" required value={price} onChange={e => setPrice(e.target.value)}/></label>
      <button type="button" className="market-price" onClick={() => setPrice(String(currentPrice))}><i/> По рынку сейчас <strong>${currentPrice.toLocaleString('en-US')}</strong></button>
      <div className="modal-actions"><button type="button" className="btn ghost" onClick={onClose}>Отмена</button><button className="btn primary">Закрыть и рассчитать</button></div>
    </form>
  </div>
}
