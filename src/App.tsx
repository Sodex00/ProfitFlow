import { useMemo, useState } from 'react'
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Bell, Bitcoin, ChevronDown, CircleDollarSign, Clock3, LayoutDashboard, Menu, Plus, Search, Settings, Target, Trash2, TrendingUp, Wallet, X } from 'lucide-react'
import { AnalyticsChart } from './components/Analytics'
import { Intro } from './components/Intro'
import { MarketChart } from './components/MarketChart'
import { CloseTradeModal, TradeModal } from './components/TradeModal'
import { symbols } from './data'
import { useMarketPrice, useTrades } from './hooks'
import { money, num, shortDate, tradePnl, tradePnlPercent } from './lib'
import type { Period, Trade } from './types'

const assetColors: Record<string, string> = { BTCUSDT: '#f7931a', ETHUSDT: '#7387e8', SOLUSDT: '#9a63ff', BNBUSDT: '#f3ba2f', XRPUSDT: '#3d9be9' }

export default function App() {
  const [intro, setIntro] = useState(() => !sessionStorage.getItem('profitflow.introSeen'))
  const [mobileNav, setMobileNav] = useState(false)
  const [trades, setTrades] = useTrades()
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [period, setPeriod] = useState<Period>('month')
  const [createOpen, setCreateOpen] = useState(false)
  const [closingTrade, setClosingTrade] = useState<Trade | null>(null)
  const [filter, setFilter] = useState<'all'|'open'|'closed'>('all')
  const [toast, setToast] = useState('')
  const { price, live } = useMarketPrice(symbol)

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2600) }
  const finishIntro = () => { sessionStorage.setItem('profitflow.introSeen', '1'); setIntro(false) }
  const closed = trades.filter(t => t.status === 'closed')
  const open = trades.filter(t => t.status === 'open')
  const pnl = closed.reduce((sum, t) => sum + tradePnl(t), 0)
  const wins = closed.filter(t => tradePnl(t) >= 0).length
  const losses = closed.length - wins
  const volume = trades.reduce((sum, t) => sum + t.entryPrice * t.amount, 0)
  const visibleTrades = trades.filter(t => filter === 'all' || t.status === filter).slice().reverse()
  const selectedOpen = open.filter(t => t.symbol === symbol)
  const dayChange = 2.84
  const chartTrades = useMemo(() => trades.filter(t => t.symbol === symbol), [trades, symbol])

  const addTrade = (trade: Trade) => { setTrades(prev => [...prev, trade]); setSymbol(trade.symbol); setCreateOpen(false); notify('Позиция добавлена в журнал') }
  const closeTrade = (exitPrice: number) => {
    if (!closingTrade) return
    setTrades(prev => prev.map(t => t.id === closingTrade.id ? { ...t, exitPrice, closedAt: new Date().toISOString(), status: 'closed' } : t))
    setClosingTrade(null); notify('Сделка закрыта, результат рассчитан')
  }
  const removeTrade = (id: string) => { if (window.confirm('Удалить сделку из журнала?')) { setTrades(prev => prev.filter(t => t.id !== id)); notify('Сделка удалена') } }

  if (intro) return <Intro onDone={finishIntro}/>
  return <div className="app-shell">
    <aside className={mobileNav ? 'sidebar open' : 'sidebar'}>
      <div className="brand"><span className="brand-mark"><TrendingUp/></span><span>Profit<b>Flow</b></span><button className="nav-close" onClick={() => setMobileNav(false)}><X/></button></div>
      <nav>
        <span className="nav-label">Рабочее пространство</span>
        <a className="active" href="#overview"><LayoutDashboard/> Обзор</a>
        <a href="#journal"><Activity/> Журнал сделок <em>{trades.length}</em></a>
        <a href="#analytics"><BarChart3/> Аналитика</a>
        <a href="#market"><Bitcoin/> Рынок</a>
        <span className="nav-label secondary">Управление</span>
        <a href="#settings"><Wallet/> Портфель</a>
        <a href="#settings"><Settings/> Настройки</a>
      </nav>
      <div className="sidebar-card"><span><Target size={16}/> Цель месяца</span><strong>$2 500 <small>/ $4 000</small></strong><div><i style={{ width: '62%' }}/></div><p>Осталось $1 500</p></div>
      <div className="profile"><span>SD</span><div><strong>Trader</strong><small>Локальный профиль</small></div><ChevronDown size={16}/></div>
    </aside>
    {mobileNav && <button className="nav-overlay" onClick={() => setMobileNav(false)} />}

    <main>
      <header className="topbar">
        <button className="menu-btn" onClick={() => setMobileNav(true)}><Menu/></button>
        <div className="search"><Search size={17}/><input placeholder="Найти сделку или актив..."/><kbd>⌘ K</kbd></div>
        <div className="top-actions"><span className={live ? 'live' : 'offline'}><i/> {live ? 'Рынок онлайн' : 'Демо-курс'}</span><button className="icon-btn"><Bell size={18}/><i className="notif"/></button><button className="btn primary small" onClick={() => setCreateOpen(true)}><Plus size={17}/> Новая сделка</button></div>
      </header>

      <div className="content" id="overview">
        <section className="welcome"><div><span className="eyebrow">Торговая панель</span><h1>Ваш результат — <span>в цифрах.</span></h1><p>Следите за позициями, анализируйте решения и улучшайте стратегию.</p></div><div className="date-chip"><Clock3 size={16}/>{new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</div></section>

        <section className="metrics">
          <article><div className="metric-top"><span>Общий P&L</span><i className="metric-icon green"><CircleDollarSign/></i></div><strong className={pnl >= 0 ? 'positive' : 'negative'}>{pnl >= 0 ? '+' : ''}{money(pnl, 2)}</strong><p><b className="positive"><ArrowUpRight/> 12.8%</b> за выбранный период</p><div className="spark green-spark"/></article>
          <article><div className="metric-top"><span>Винрейт</span><i className="metric-icon purple"><Target/></i></div><strong>{closed.length ? Math.round(wins / closed.length * 100) : 0}%</strong><p><b>{wins} побед</b> · {losses} убытков</p><div className="win-bar"><i style={{ width: `${closed.length ? wins/closed.length*100 : 0}%` }}/></div></article>
          <article><div className="metric-top"><span>Объём сделок</span><i className="metric-icon blue"><BarChart3/></i></div><strong>{money(volume)}</strong><p><b>{trades.length} сделок</b> всего</p><div className="spark blue-spark"/></article>
          <article><div className="metric-top"><span>Открытые позиции</span><i className="metric-icon orange"><Activity/></i></div><strong>{open.length}</strong><p><b className="positive">{open.length ? '+' + money(open.reduce((s,t) => s + tradePnl(t, t.symbol === symbol ? price : t.entryPrice), 0), 2) : '$0'}</b> плавающий P&L</p><button onClick={() => document.getElementById('journal')?.scrollIntoView({ behavior: 'smooth' })}>Посмотреть <ArrowRight/></button></article>
        </section>

        <section className="grid-main" id="market">
          <article className="panel chart-panel">
            <header className="panel-head"><div className="asset-select"><span className="coin" style={{ background: assetColors[symbol] }}>{symbol.slice(0,1)}</span><select value={symbol} onChange={e => setSymbol(e.target.value)}>{symbols.map(s => <option key={s}>{s.replace('USDT',' / USDT')}</option>)}</select></div><div className="time-tabs"><button>1ч</button><button className="active">1Д</button><button>1Н</button><button>1М</button></div></header>
            <div className="price-row"><strong>${num(price)}</strong><span className="positive"><ArrowUpRight/> {dayChange}%</span><small>Сегодня</small></div>
            <MarketChart price={price} trades={chartTrades}/>
            <div className="chart-legend"><span><i className="dot entry"/> Линия входа</span><span><i className="dot tp"/> Take Profit</span><span><i className="dot sl"/> Stop Loss</span><small>{selectedOpen.length} активных отметок</small></div>
          </article>

          <article className="panel positions-panel">
            <header className="panel-head"><div><span className="eyebrow">В рынке</span><h2>Активные позиции</h2></div><span className="count">{open.length}</span></header>
            <div className="positions-list">{open.length ? open.map(trade => {
              const livePrice = trade.symbol === symbol ? price : trade.entryPrice * 1.008
              const result = tradePnl(trade, livePrice)
              return <div className="position" key={trade.id} onClick={() => setSymbol(trade.symbol)}>
                <div className="position-main"><span className="coin small" style={{ background: assetColors[trade.symbol] }}>{trade.symbol[0]}</span><div><strong>{trade.symbol.replace('USDT','')}</strong><small>{trade.side.toUpperCase()} · {trade.amount}</small></div><span className={result >= 0 ? 'positive' : 'negative'}>{result >= 0 ? '+' : ''}{money(result,2)}<small>{tradePnlPercent(trade,livePrice).toFixed(2)}%</small></span></div>
                <div className="position-levels"><span>Вход <b>${num(trade.entryPrice)}</b></span><span>Сейчас <b>${num(livePrice)}</b></span></div>
                <button className="close-position" onClick={e => { e.stopPropagation(); setClosingTrade(trade) }}>Закрыть позицию</button>
              </div>
            }) : <div className="empty"><Activity/><strong>Нет активных позиций</strong><p>Создайте новую сделку, чтобы увидеть её здесь.</p></div>}</div>
            <button className="new-position" onClick={() => setCreateOpen(true)}><Plus/> Добавить позицию</button>
          </article>
        </section>

        <section className="grid-lower" id="analytics">
          <article className="panel analytics-panel">
            <header className="panel-head"><div><span className="eyebrow">Динамика</span><h2>Доходы и расходы</h2></div><div className="period-tabs">{(['day','week','month','year'] as Period[]).map((p,i) => <button key={p} className={period===p?'active':''} onClick={() => setPeriod(p)}>{['День','Неделя','Месяц','Год'][i]}</button>)}</div></header>
            <div className="analytics-summary"><div><span>Чистый результат</span><strong className={pnl>=0?'positive':'negative'}>{pnl>=0?'+':''}{money(pnl,2)}</strong></div><span className="positive"><ArrowUpRight/> Лучший период +$1 240</span></div>
            <AnalyticsChart trades={trades} period={period}/>
            <div className="result-split"><div><i className="win"/><span>Прибыльные<strong>{wins} сделки</strong></span><b className="positive">{money(closed.filter(t=>tradePnl(t)>=0).reduce((s,t)=>s+tradePnl(t),0),2)}</b></div><div><i className="loss"/><span>Убыточные<strong>{losses} сделки</strong></span><b className="negative">{money(closed.filter(t=>tradePnl(t)<0).reduce((s,t)=>s+tradePnl(t),0),2)}</b></div></div>
          </article>

          <article className="panel allocation-panel"><header className="panel-head"><div><span className="eyebrow">Портфель</span><h2>Распределение</h2></div><button className="icon-btn"><ChevronDown/></button></header><div className="donut" style={{ background: `conic-gradient(#b8ff4a 0 48%, #7457ff 48% 75%, #3c96ff 75% 90%, #f5a84b 90%)` }}><div><strong>{money(volume)}</strong><small>Объём</small></div></div><div className="allocation-list">{[['BTC','48%','#b8ff4a'],['ETH','27%','#7457ff'],['SOL','15%','#3c96ff'],['Другие','10%','#f5a84b']].map(x=><div key={x[0]}><i style={{background:x[2]}}/><span>{x[0]}</span><b>{x[1]}</b></div>)}</div></article>
        </section>

        <section className="panel journal" id="journal">
          <header className="panel-head"><div><span className="eyebrow">История решений</span><h2>Журнал сделок</h2></div><div className="journal-actions"><div className="filter-tabs">{(['all','open','closed'] as const).map((f,i)=><button key={f} className={filter===f?'active':''} onClick={()=>setFilter(f)}>{['Все','Открытые','Закрытые'][i]}</button>)}</div><button className="btn outline" onClick={()=>setCreateOpen(true)}><Plus/> Записать</button></div></header>
          <div className="trade-table"><div className="trade-row trade-head"><span>Актив / ID</span><span>Направление</span><span>Вход</span><span>Выход / Сейчас</span><span>Результат</span><span>Дата</span><span/></div>{visibleTrades.map(trade => {
            const exit = trade.exitPrice ?? (trade.symbol===symbol ? price : trade.entryPrice*1.008); const result = tradePnl(trade,exit)
            return <div className="trade-row" key={trade.id}><span className="asset-cell"><i className="coin tiny" style={{background:assetColors[trade.symbol]}}>{trade.symbol[0]}</i><b>{trade.symbol.replace('USDT','')}</b><small>{trade.id}</small></span><span><i className={`side-tag ${trade.side}`}>{trade.side==='long'?<ArrowUpRight/>:<ArrowDownRight/>}{trade.side}</i></span><span><b>${num(trade.entryPrice)}</b><small>{trade.amount} ед.</small></span><span><b>${num(exit)}</b><small className={trade.status==='open'?'positive':''}>{trade.status==='open'?'live':'закрыта'}</small></span><span className={result>=0?'positive':'negative'}><b>{result>=0?'+':''}{money(result,2)}</b><small>{tradePnlPercent(trade,exit).toFixed(2)}%</small></span><span><b>{shortDate(trade.openedAt)}</b><small>{trade.note||'Без заметки'}</small></span><span className="row-actions">{trade.status==='open'&&<button title="Закрыть" onClick={()=>setClosingTrade(trade)}><Target/></button>}<button title="Удалить" onClick={()=>removeTrade(trade.id)}><Trash2/></button></span></div>
          })}</div>
        </section>
        <footer><span>ProfitFlow © {new Date().getFullYear()}</span><p>Данные хранятся локально на этом устройстве. Не является финансовой рекомендацией.</p><span className="secure"><i/> Local-first</span></footer>
      </div>
    </main>
    {createOpen && <TradeModal currentPrice={price} initialSymbol={symbol} onClose={()=>setCreateOpen(false)} onCreate={addTrade}/>} 
    {closingTrade && <CloseTradeModal trade={closingTrade} currentPrice={closingTrade.symbol===symbol?price:closingTrade.entryPrice*1.008} onClose={()=>setClosingTrade(null)} onSubmit={closeTrade}/>} 
    {toast && <div className="toast"><span>✓</span>{toast}</div>}
  </div>
}
