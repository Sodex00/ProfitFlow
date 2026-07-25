import { useMemo, useState } from 'react'
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Bell, Bitcoin, CandlestickChart, ChevronDown, CircleDollarSign, Clock3, Gauge, Menu, Pencil, Plus, Search, Settings, ShieldCheck, Target, Trash2, TrendingUp, User, Wallet, X } from 'lucide-react'
import { AnalyticsChart } from './components/Analytics'
import { Intro } from './components/Intro'
import { MarketChart } from './components/MarketChart'
import { CloseTradeModal, TradeModal } from './components/TradeModal'
import { symbols } from './data'
import { useCandles, useFxRate, useMarketPrice, useTrades } from './hooks'
import { currencyMoney, money, num, shortDate, tradePnl, tradePnlPercent } from './lib'
import type { Candle, Page, Period, Timeframe, Trade } from './types'

const assetColors: Record<string, string> = { BTCUSDT: '#f7931a', ETHUSDT: '#7387e8', SOLUSDT: '#9a63ff', BNBUSDT: '#f3ba2f', XRPUSDT: '#3d9be9' }

export default function App() {
  const [intro, setIntro] = useState(() => !sessionStorage.getItem('profitflow.introSeen'))
  const [mobileNav, setMobileNav] = useState(false)
  const [trades, setTrades] = useTrades()
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [period, setPeriod] = useState<Period>('month')
  const [page, setPage] = useState<Page>('spot')
  const [timeframe, setTimeframe] = useState<Timeframe>('1h')
  const [createOpen, setCreateOpen] = useState(false)
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)
  const [closingTrade, setClosingTrade] = useState<Trade | null>(null)
  const [filter, setFilter] = useState<'all'|'open'|'closed'>('all')
  const [expandedTrade,setExpandedTrade] = useState<string|null>(null)
  const [toast, setToast] = useState('')
  const [profile, setProfile] = useState(() => JSON.parse(localStorage.getItem('profitflow.profile') || '{"name":"Trader","email":"local@profitflow.app","currency":"USD","risk":"2"}'))
  const { price, live } = useMarketPrice(symbol)
  const { candles, remainingMs } = useCandles(symbol,timeframe)
  const fxRate = useFxRate(profile.currency)

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2600) }
  const finishIntro = () => { sessionStorage.setItem('profitflow.introSeen', '1'); setIntro(false) }
  const spotTrades = trades.filter(t => t.market !== 'futures')
  const futuresTrades = trades.filter(t => t.market === 'futures')
  const closed = spotTrades.filter(t => t.status === 'closed')
  const open = spotTrades.filter(t => t.status === 'open')
  const pnl = closed.reduce((sum, t) => sum + tradePnl(t), 0)
  const wins = closed.filter(t => tradePnl(t) >= 0).length
  const losses = closed.length - wins
  const volume = trades.reduce((sum, t) => sum + t.entryPrice * t.amount, 0)
  const visibleTrades = spotTrades.filter(t => filter === 'all' || t.status === filter).slice().reverse()
  const selectedOpen = open.filter(t => t.symbol === symbol)
  const dayChange = 2.84
  const chartTrades = useMemo(() => trades.filter(t => t.symbol === symbol), [trades, symbol])
  const candleCountdown = `${String(Math.floor(remainingMs/60000)).padStart(2,'0')}:${String(Math.floor(remainingMs/1000)%60).padStart(2,'0')}`

  const addTrade = (trade: Trade) => { setTrades(prev => [...prev, { ...trade, side:'long', market:'spot' }]); setSymbol(trade.symbol); setCreateOpen(false); notify('Покупка добавлена в спотовый журнал') }
  const addFuturesTrade = (trade:Trade) => { setTrades(prev=>[...prev,trade]); notify('Фьючерсная позиция добавлена в журнал') }
  const saveTrade = (trade: Trade) => { setTrades(prev => prev.map(t => t.id === trade.id ? trade : t)); setEditingTrade(null); notify('Изменения сохранены') }
  const navigate = (next: Page) => { setPage(next); setMobileNav(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const closeTrade = (exitPrice: number) => {
    if (!closingTrade) return
    setTrades(prev => prev.map(t => t.id === closingTrade.id ? { ...t, exitPrice, closedAt: new Date().toISOString(), status: 'closed' } : t))
    setClosingTrade(null); notify(closingTrade.market==='futures'?'Сделка закрыта, результат рассчитан':'Актив продан, результат рассчитан')
  }
  const removeTrade = (id: string) => { if (window.confirm('Удалить сделку из журнала?')) { setTrades(prev => prev.filter(t => t.id !== id)); notify('Сделка удалена') } }

  if (intro) return <Intro onDone={finishIntro}/>
  return <div className="app-shell">
    <aside className={mobileNav ? 'sidebar open' : 'sidebar'}>
      <div className="brand"><span className="brand-mark"><TrendingUp/></span><span>Profit<b>Flow</b></span><button className="nav-close" onClick={() => setMobileNav(false)}><X/></button></div>
      <nav>
        <span className="nav-label">Торговля</span>
        <a className={page==='spot'?'active':''} onClick={()=>navigate('spot')}><Bitcoin/> Спотовая торговля <em>{open.length}</em></a>
        <a className={page==='futures'?'active':''} onClick={()=>navigate('futures')}><CandlestickChart/> Фьючерсы</a>
        <span className="nav-label secondary">Управление</span>
        <a className={page==='analytics'?'active':''} onClick={()=>navigate('analytics')}><BarChart3/> Аналитика</a>
        <a className={page==='settings'?'active':''} onClick={()=>navigate('settings')}><Settings/> Профиль и настройки</a>
      </nav>
      <div className="sidebar-card"><span><Target size={16}/> Цель месяца</span><strong>$2 500 <small>/ $4 000</small></strong><div><i style={{ width: '62%' }}/></div><p>Осталось $1 500</p></div>
      <button className="profile" onClick={()=>navigate('settings')}><span>{profile.name.slice(0,2).toUpperCase()}</span><div><strong>{profile.name}</strong><small>{profile.email}</small></div><ChevronDown size={16}/></button>
    </aside>
    {mobileNav && <button className="nav-overlay" onClick={() => setMobileNav(false)} />}

    <main>
      <header className="topbar">
        <button className="menu-btn" onClick={() => setMobileNav(true)}><Menu/></button>
        <div className="search"><Search size={17}/><input placeholder="Найти сделку или актив..."/><kbd>⌘ K</kbd></div>
        <div className="top-actions"><span className={live ? 'live' : 'offline'}><i/> {live ? 'Поток котировок онлайн' : 'Переподключение...'}</span><button className="icon-btn"><Bell size={18}/><i className="notif"/></button>{page==='spot'&&<button className="btn primary small" onClick={() => setCreateOpen(true)}><Plus size={17}/> Новая сделка</button>}</div>
      </header>

      <div className="content" id="overview">
        <section className="welcome"><div><span className="eyebrow">{page==='spot'?'Спотовый рынок':page==='futures'?'Деривативы':page==='analytics'?'Статистика торговли':'Личный кабинет'}</span><h1>{page==='spot'?'Спотовая торговля':page==='futures'?'Фьючерсная торговля':page==='analytics'?'Аналитика результатов':'Профиль и настройки'} <span>{page==='spot'?'без шума.':page==='futures'?'под контролем.':page==='analytics'?'в деталях.':'ProfitFlow.'}</span></h1><p>{page==='spot'?'Управляйте позициями и уровнями риска в одном месте.':page==='futures'?'Планируйте сделки с плечом и заранее контролируйте риск.':page==='analytics'?'Доходность, винрейт и структура вашего портфеля.':'Персонализируйте рабочее пространство и риск-параметры.'}</p></div><div className="date-chip"><Clock3 size={16}/>{new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</div></section>

        {(page==='spot'||page==='analytics')&&<>
        <section className="metrics">
          <article><div className="metric-top"><span>Общий P&L</span><i className="metric-icon green"><CircleDollarSign/></i></div><strong className={pnl >= 0 ? 'positive' : 'negative'}>{pnl >= 0 ? '+' : ''}{money(pnl, 2)}</strong><p><b className="positive"><ArrowUpRight/> 12.8%</b> за выбранный период</p><div className="spark green-spark"/></article>
          <article><div className="metric-top"><span>Винрейт</span><i className="metric-icon purple"><Target/></i></div><strong>{closed.length ? Math.round(wins / closed.length * 100) : 0}%</strong><p><b>{wins} побед</b> · {losses} убытков</p><div className="win-bar"><i style={{ width: `${closed.length ? wins/closed.length*100 : 0}%` }}/></div></article>
          <article><div className="metric-top"><span>Объём сделок</span><i className="metric-icon blue"><BarChart3/></i></div><strong>{money(volume)}</strong><p><b>{trades.length} сделок</b> всего</p><div className="spark blue-spark"/></article>
          <article><div className="metric-top"><span>Открытые позиции</span><i className="metric-icon orange"><Activity/></i></div><strong>{open.length}</strong><p><b className="positive">{open.length ? '+' + money(open.reduce((s,t) => s + tradePnl(t, t.symbol === symbol ? price : t.entryPrice), 0), 2) : '$0'}</b> плавающий P&L</p><button onClick={() => document.getElementById('journal')?.scrollIntoView({ behavior: 'smooth' })}>Посмотреть <ArrowRight/></button></article>
        </section>
        </>}

        {page==='spot'&&<>
        <section className="grid-main" id="market">
          <article className="panel chart-panel">
            <header className="panel-head"><div className="asset-select"><span className="coin" style={{ background: assetColors[symbol] }}>{symbol.slice(0,1)}</span><select value={symbol} onChange={e => setSymbol(e.target.value)}>{symbols.map(s => <option key={s}>{s.replace('USDT',' / USDT')}</option>)}</select></div><div className="time-tabs">{(['1m','5m','15m','1h','4h','1d'] as Timeframe[]).map(t=><button key={t} className={timeframe===t?'active':''} onClick={()=>setTimeframe(t)}>{t}</button>)}</div></header>
            <div className="price-row"><strong>${num(price)}</strong><span className="positive"><ArrowUpRight/> {dayChange}%</span><small>Закрытие свечи через <b className="candle-timer">{candleCountdown}</b></small></div>
            <MarketChart price={price} trades={chartTrades} timeframe={timeframe} candles={candles}/>
            <div className="chart-legend"><span><i className="dot entry"/> Линия входа</span><span><i className="dot tp"/> Take Profit</span><span><i className="dot sl"/> Stop Loss</span><small>{selectedOpen.length} активных отметок</small></div>
          </article>

          <article className="panel positions-panel">
            <header className="panel-head"><div><span className="eyebrow">Спотовый портфель</span><h2>Купленные активы</h2></div><span className="count">{open.length}</span></header><div className="spot-flow"><span>Покупка</span><ArrowRight/><span>Хранение</span><ArrowRight/><span>Продажа</span></div>
            <div className="positions-list">{open.length ? open.map(trade => {
              const livePrice = trade.symbol === symbol ? price : trade.entryPrice * 1.008
              const result = tradePnl(trade, livePrice)
              return <div className="position" key={trade.id} onClick={() => setSymbol(trade.symbol)}>
                <div className="position-main"><span className="coin small" style={{ background: assetColors[trade.symbol] }}>{trade.symbol[0]}</span><div><strong>{trade.symbol.replace('USDT','')}</strong><small>Куплено на {currencyMoney(trade.amount*trade.entryPrice*fxRate,profile.currency,2)}</small></div><span className={result >= 0 ? 'positive' : 'negative'}>{result >= 0 ? '+' : ''}{currencyMoney(result*fxRate,profile.currency,2)}<small>{tradePnlPercent(trade,livePrice).toFixed(2)}%</small></span></div>
                <div className="position-levels"><span>Вход <b>${num(trade.entryPrice)}</b></span><span>Сейчас <b>${num(livePrice)}</b></span></div>
                <div className="position-actions"><button onClick={e => { e.stopPropagation(); setEditingTrade(trade) }}><Pencil/> Изменить</button><button onClick={e => { e.stopPropagation(); setClosingTrade(trade) }}>Продать</button></div>
              </div>
            }) : <div className="empty"><Activity/><strong>Нет активных позиций</strong><p>Создайте новую сделку, чтобы увидеть её здесь.</p></div>}</div>
            <button className="new-position" onClick={() => setCreateOpen(true)}><Plus/> Добавить позицию</button>
          </article>
        </section>
        </>}

        {page==='analytics'&&<>
        <section className="grid-lower" id="analytics">
          <article className="panel analytics-panel">
            <header className="panel-head"><div><span className="eyebrow">Динамика</span><h2>Доходы и расходы</h2></div><div className="period-tabs">{(['day','week','month','year'] as Period[]).map((p,i) => <button key={p} className={period===p?'active':''} onClick={() => setPeriod(p)}>{['День','Неделя','Месяц','Год'][i]}</button>)}</div></header>
            <div className="analytics-summary"><div><span>Чистый результат</span><strong className={pnl>=0?'positive':'negative'}>{pnl>=0?'+':''}{money(pnl,2)}</strong></div><span className="positive"><ArrowUpRight/> Лучший период +$1 240</span></div>
            <AnalyticsChart trades={trades} period={period}/>
            <div className="result-split"><div><i className="win"/><span>Прибыльные<strong>{wins} сделки</strong></span><b className="positive">{money(closed.filter(t=>tradePnl(t)>=0).reduce((s,t)=>s+tradePnl(t),0),2)}</b></div><div><i className="loss"/><span>Убыточные<strong>{losses} сделки</strong></span><b className="negative">{money(closed.filter(t=>tradePnl(t)<0).reduce((s,t)=>s+tradePnl(t),0),2)}</b></div></div>
          </article>

          <article className="panel allocation-panel"><header className="panel-head"><div><span className="eyebrow">Портфель</span><h2>Распределение</h2></div><button className="icon-btn"><ChevronDown/></button></header><div className="donut" style={{ background: `conic-gradient(#b8ff4a 0 48%, #7457ff 48% 75%, #3c96ff 75% 90%, #f5a84b 90%)` }}><div><strong>{money(volume)}</strong><small>Объём</small></div></div><div className="allocation-list">{[['BTC','48%','#b8ff4a'],['ETH','27%','#7457ff'],['SOL','15%','#3c96ff'],['Другие','10%','#f5a84b']].map(x=><div key={x[0]}><i style={{background:x[2]}}/><span>{x[0]}</span><b>{x[1]}</b></div>)}</div></article>
        </section>
        </>}

        {page==='spot'&&<>
        <section className="panel journal" id="journal">
          <header className="panel-head"><div><span className="eyebrow">История решений</span><h2>Журнал сделок</h2></div><div className="journal-actions"><div className="filter-tabs">{(['all','open','closed'] as const).map((f,i)=><button key={f} className={filter===f?'active':''} onClick={()=>setFilter(f)}>{['Все','Открытые','Закрытые'][i]}</button>)}</div><button className="btn outline" onClick={()=>setCreateOpen(true)}><Plus/> Записать</button></div></header>
          <div className="trade-table"><div className="trade-row trade-head"><span>Актив / ID</span><span>Операция</span><span>Покупка</span><span>Продажа / Сейчас</span><span>Результат</span><span>Дата</span><span/></div>{visibleTrades.map(trade => {
            const exit = trade.exitPrice ?? (trade.symbol===symbol ? price : trade.entryPrice*1.008); const result = tradePnl(trade,exit)
            const targetPct=trade.takeProfit?Math.abs((trade.takeProfit-trade.entryPrice)/trade.entryPrice*100):0; const riskPct=trade.stopLoss?Math.abs((trade.stopLoss-trade.entryPrice)/trade.entryPrice*100):0; const probability=Math.max(12,Math.min(88,Math.round(68-targetPct*2.1+riskPct*.8)))
            return <div className={expandedTrade===trade.id?'trade-entry expanded':'trade-entry'} key={trade.id}><div className="trade-row" onClick={()=>setExpandedTrade(expandedTrade===trade.id?null:trade.id)}><span className="asset-cell"><i className="coin tiny" style={{background:assetColors[trade.symbol]}}>{trade.symbol[0]}</i><b>{trade.symbol.replace('USDT','')}</b><small>{trade.id}</small></span><span><i className="side-tag buy"><ArrowDownRight/>Покупка</i></span><span><b>{currencyMoney(trade.entryPrice*trade.amount*fxRate,profile.currency,2)}</b><small>по ${num(trade.entryPrice)}</small></span><span><b>${num(exit)}</b><small className={trade.status==='open'?'positive':''}>{trade.status==='open'?'хранится':'продано'}</small></span><span className={result>=0?'positive':'negative'}><b>{result>=0?'+':''}{currencyMoney(result*fxRate,profile.currency,2)}</b><small>{tradePnlPercent(trade,exit).toFixed(2)}%</small></span><span><b>{shortDate(trade.openedAt)}</b><small>{trade.note||'Нажмите для деталей'}</small></span><span className="row-actions" onClick={e=>e.stopPropagation()}>{trade.status==='open'&&<><button title="Изменить" onClick={()=>setEditingTrade(trade)}><Pencil/></button><button title="Продать" onClick={()=>setClosingTrade(trade)}><Target/></button></>}<button title="Удалить" onClick={()=>removeTrade(trade.id)}><Trash2/></button></span></div>{expandedTrade===trade.id&&<div className="trade-details"><div><span>Ожидаемая прибыль</span><strong className="positive">{targetPct?`+${targetPct.toFixed(2)}%`:'TP не задан'}</strong><small>{trade.takeProfit?currencyMoney(Math.abs(trade.takeProfit-trade.entryPrice)*trade.amount*fxRate,profile.currency,2):'Укажите Take Profit'}</small></div><div><span>Допустимый риск</span><strong className="negative">{riskPct?`−${riskPct.toFixed(2)}%`:'SL не задан'}</strong><small>{trade.stopLoss?currencyMoney(Math.abs(trade.stopLoss-trade.entryPrice)*trade.amount*fxRate,profile.currency,2):'Укажите Stop Loss'}</small></div><div><span>Расчётная вероятность цели</span><strong>{targetPct?`${probability}%`:'—'}</strong><small>Эвристическая оценка, не прогноз</small></div><div><span>Risk / Reward</span><strong>{riskPct?(targetPct/riskPct).toFixed(2):'—'}</strong><small>отношение прибыли к риску</small></div></div>}</div>
          })}</div>
        </section>
        </>}
        {page==='futures'&&<FuturesPage symbol={symbol} setSymbol={setSymbol} price={price} timeframe={timeframe} setTimeframe={setTimeframe} trades={futuresTrades} candles={candles} countdown={candleCountdown} onCreate={addFuturesTrade} onDelete={removeTrade}/>} 
        {page==='settings'&&<SettingsPage profile={profile} onSave={(next)=>{setProfile(next);localStorage.setItem('profitflow.profile',JSON.stringify(next));notify('Профиль и настройки сохранены')}}/>}
        <footer><span>ProfitFlow © {new Date().getFullYear()}</span><p>Данные хранятся локально на этом устройстве. Не является финансовой рекомендацией.</p><span className="secure"><i/> Local-first</span></footer>
      </div>
    </main>
    {createOpen && <TradeModal currentPrice={price} initialSymbol={symbol} currency={profile.currency} fxRate={fxRate} onClose={()=>setCreateOpen(false)} onCreate={addTrade}/>} 
    {editingTrade && <TradeModal currentPrice={price} initialSymbol={editingTrade.symbol} currency={profile.currency} fxRate={fxRate} trade={editingTrade} onClose={()=>setEditingTrade(null)} onCreate={saveTrade}/>} 
    {closingTrade && <CloseTradeModal trade={closingTrade} currentPrice={closingTrade.symbol===symbol?price:closingTrade.entryPrice*1.008} onClose={()=>setClosingTrade(null)} onSubmit={closeTrade}/>} 
    {toast && <div className="toast"><span>✓</span>{toast}</div>}
  </div>
}

function FuturesPage({ symbol, setSymbol, price, timeframe, setTimeframe, trades, candles, countdown, onCreate, onDelete }: { symbol:string; setSymbol:(s:string)=>void; price:number; timeframe:Timeframe; setTimeframe:(t:Timeframe)=>void; trades:Trade[]; candles:Candle[]; countdown:string; onCreate:(t:Trade)=>void; onDelete:(id:string)=>void }) {
  const [side,setSide]=useState<'long'|'short'>('long'); const [margin,setMargin]=useState('250'); const [leverage,setLeverage]=useState(5)
  const positionSize=Number(margin)*leverage; const liquidation=side==='long'?price*(1-1/leverage*.92):price*(1+1/leverage*.92)
  const submit=()=>onCreate({id:`FUT-${String(Date.now()).slice(-4)}`,symbol,side,entryPrice:price,amount:positionSize/price,openedAt:new Date().toISOString(),status:'open',market:'futures',leverage,note:`Маржа ${money(Number(margin))}`})
  return <><section className="futures-layout"><article className="panel futures-chart"><header className="panel-head"><div className="asset-select"><span className="coin" style={{background:assetColors[symbol]}}>{symbol[0]}</span><select value={symbol} onChange={e=>setSymbol(e.target.value)}>{symbols.map(s=><option key={s}>{s.replace('USDT',' / USDT')} PERP</option>)}</select></div><div className="time-tabs">{(['1m','5m','15m','1h','4h','1d'] as Timeframe[]).map(t=><button key={t} className={timeframe===t?'active':''} onClick={()=>setTimeframe(t)}>{t}</button>)}</div></header><div className="price-row"><strong>${num(price)}</strong><span className="positive"><ArrowUpRight/> LIVE</span><small>Свеча закроется через <b className="candle-timer">{countdown}</b></small></div><MarketChart price={price} trades={trades.filter(t=>t.symbol===symbol)} timeframe={timeframe} candles={candles}/></article><article className="panel order-ticket"><span className="eyebrow">Симулятор позиции</span><h2>Фьючерсный ордер</h2><div className="side-switch"><button className={side==='long'?'active long':''} onClick={()=>setSide('long')}><ArrowUpRight/> Long</button><button className={side==='short'?'active short':''} onClick={()=>setSide('short')}><ArrowDownRight/> Short</button></div><label>Маржа, USDT<input value={margin} type="number" onChange={e=>setMargin(e.target.value)}/></label><label>Кредитное плечо <b>{leverage}×</b><input type="range" min="1" max="50" value={leverage} onChange={e=>setLeverage(Number(e.target.value))}/><div className="leverage-marks"><span>1×</span><span>10×</span><span>25×</span><span>50×</span></div></label><div className="futures-calc"><span>Размер позиции <b>{money(positionSize)}</b></span><span>Расчётная ликвидация <b className="negative">${num(liquidation)}</b></span><span>Комиссия открытия <b>${(positionSize*.0005).toFixed(2)}</b></span></div><button className={`btn futures-submit ${side}`} onClick={submit}>{side==='long'?'Открыть Long':'Открыть Short'}</button><p className="risk-note"><ShieldCheck/> Сделка сохраняется только в локальный журнал.</p></article></section><section className="panel futures-journal"><header className="panel-head"><div><span className="eyebrow">История деривативов</span><h2>Журнал фьючерсных сделок</h2></div><span className="count">{trades.length}</span></header>{trades.length?<div className="futures-table">{trades.slice().reverse().map(trade=>{const result=tradePnl(trade,trade.status==='open'?price:trade.exitPrice);return <div key={trade.id}><span><i className={`side-tag ${trade.side}`}>{trade.side}</i><b>{trade.symbol.replace('USDT','')} PERP</b><small>{trade.id}</small></span><span>Вход<b>${num(trade.entryPrice)}</b></span><span>Плечо<b>{trade.leverage}×</b></span><span>P&L<b className={result>=0?'positive':'negative'}>{result>=0?'+':''}{money(result,2)}</b></span><span>{shortDate(trade.openedAt)}</span><button onClick={()=>onDelete(trade.id)}><Trash2/></button></div>})}</div>:<div className="empty"><CandlestickChart/><strong>Журнал пока пуст</strong><p>Откройте первую тестовую фьючерсную позицию.</p></div>}</section></>
}

type Profile = { name:string; email:string; currency:string; risk:string }
function SettingsPage({ profile, onSave }: { profile:Profile; onSave:(profile:Profile)=>void }) {
  const [form,setForm]=useState(profile); const update=(key:keyof Profile,value:string)=>setForm((p:Profile)=>({...p,[key]:value}))
  return <section className="settings-grid"><article className="panel profile-card"><div className="profile-avatar">{form.name.slice(0,2).toUpperCase()}<i/></div><h2>{form.name}</h2><p>{form.email}</p><div className="profile-stat"><span><b>Локальный</b>тип аккаунта</span><span><b>Защищено</b>хранение</span></div></article><form className="panel settings-form" onSubmit={e=>{e.preventDefault();onSave(form)}}><header><User/><div><span className="eyebrow">Личные данные</span><h2>Профиль трейдера</h2></div></header><div className="form-grid"><label>Отображаемое имя<input value={form.name} onChange={e=>update('name',e.target.value)}/></label><label>Email<input type="email" value={form.email} onChange={e=>update('email',e.target.value)}/></label><label>Основная валюта<select value={form.currency} onChange={e=>update('currency',e.target.value)}><option>USD</option><option>EUR</option><option>RUB</option></select></label><label>Риск на сделку, %<input type="number" min="0.1" max="100" step="0.1" value={form.risk} onChange={e=>update('risk',e.target.value)}/></label></div><div className="settings-options"><label><span><Gauge/>Подтверждать удаление<small>Защита от случайного удаления сделки</small></span><input type="checkbox" defaultChecked/></label><label><span><Bell/>Рыночные уведомления<small>Показывать статус подключения котировок</small></span><input type="checkbox" defaultChecked/></label><label><span><Wallet/>Демонстрационные данные<small>Оставить примеры сделок в журнале</small></span><input type="checkbox"/></label></div><button className="btn primary">Сохранить настройки</button></form></section>
}
