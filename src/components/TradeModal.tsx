import { useState } from "react";
import { ShoppingCart, X } from "lucide-react";
import { symbols } from "../data";
import type { Trade } from "../types";
import { useMarketPrice } from "../hooks";

type Props = {
  currentPrice: number;
  initialSymbol: string;
  currency: string;
  fxRate: number;
  trade?: Trade | null;
  onClose: () => void;
  onCreate: (trade: Trade) => void;
};

export function TradeModal({
  currentPrice,
  initialSymbol,
  currency,
  fxRate,
  trade,
  onClose,
  onCreate,
}: Props) {
  const [symbol, setSymbol] = useState(trade?.symbol ?? initialSymbol);
  const { price: selectedMarketPrice } = useMarketPrice(symbol);
  const side = "long" as const;
  const [entry, setEntry] = useState(String(trade?.entryPrice ?? currentPrice));
  const [budget, setBudget] = useState(
    String(
      trade
        ? Math.round(trade.amount * trade.entryPrice * fxRate * 100) / 100
        : currency === "RUB"
          ? 10000
          : 250,
    ),
  );
  const entryNum = Number(entry) || 0;
  const priceToPercent = (value?: number) =>
    value && entryNum ? Math.abs(((value - entryNum) / entryNum) * 100).toFixed(2) : "";
  const [tpPercent, setTpPercent] = useState(priceToPercent(trade?.takeProfit));
  const [slPercent, setSlPercent] = useState(priceToPercent(trade?.stopLoss));
  const [date, setDate] = useState(
    trade
      ? new Date(trade.openedAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
  );
  const [note, setNote] = useState(trade?.note ?? "");
  const effectiveEntry = Number(entry) || selectedMarketPrice || currentPrice;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onCreate({
      id: trade?.id ?? `PF-${String(Date.now()).slice(-4)}`,
      symbol,
      side,
      entryPrice: effectiveEntry,
      amount: Number(budget) / fxRate / effectiveEntry,
      takeProfit: tpPercent
        ? effectiveEntry * (1 + ((side === "long" ? 1 : -1) * Number(tpPercent)) / 100)
        : undefined,
      stopLoss: slPercent
        ? effectiveEntry * (1 + ((side === "long" ? -1 : 1) * Number(slPercent)) / 100)
        : undefined,
      openedAt: new Date(date).toISOString(),
      status: trade?.status ?? "open",
      note,
    });
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form className="modal" onSubmit={submit}>
        <header>
          <div>
            <span className="eyebrow">
              {trade ? "Редактирование покупки" : "Спотовая операция"}
            </span>
            <h2>{trade ? "Изменить покупку" : "Купить актив"}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        <div className="spot-operation">
          <ShoppingCart />
          <div>
            <strong>Покупка актива</strong>
            <small>Позиция закроется после продажи актива</small>
          </div>
        </div>
        <div className="form-grid">
          <label>
            Актив
            <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
              {symbols.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Дата и время
            <input
              type="datetime-local"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label>
            Цена покупки
            <input
              type="number"
              min="0"
              step="any"
              value={entry}
              placeholder={`По рынку: ${selectedMarketPrice}`}
              onChange={(e) => setEntry(e.target.value)}
            />
            <small>Оставьте пустым для актуальной цены</small>
          </label>
          <label>
            Сумма покупки, {currency}
            <input
              type="number"
              min="0"
              step="any"
              required
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
            <small>
              Будет куплено ≈ {(Number(budget) / fxRate / effectiveEntry).toFixed(8)}{" "}
              {symbol.replace("USDT", "")}
            </small>
          </label>
          <label>
            Take Profit, %
            <div className="percent-input">
              <input
                type="number"
                min="0"
                step="0.1"
                value={tpPercent}
                placeholder="Например, 5"
                onChange={(e) => setTpPercent(e.target.value)}
              />
              <span>%</span>
            </div>
            <small>
              {tpPercent
                ? `Цена: ${(effectiveEntry * (1 + ((side === "long" ? 1 : -1) * Number(tpPercent)) / 100)).toFixed(2)}`
                : "Процент от цены входа"}
            </small>
          </label>
          <label>
            Stop Loss, %
            <div className="percent-input">
              <input
                type="number"
                min="0"
                step="0.1"
                value={slPercent}
                placeholder="Например, 2"
                onChange={(e) => setSlPercent(e.target.value)}
              />
              <span>%</span>
            </div>
            <small>
              {slPercent
                ? `Цена: ${(effectiveEntry * (1 + ((side === "long" ? -1 : 1) * Number(slPercent)) / 100)).toFixed(2)}`
                : "Процент от цены входа"}
            </small>
          </label>
        </div>
        <label>
          Комментарий
          <textarea
            value={note}
            placeholder="Почему вы открываете позицию?"
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Отмена
          </button>
          <button className="btn primary">
            {trade ? "Сохранить изменения" : "Записать покупку"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function CloseTradeModal({
  trade,
  currentPrice,
  onClose,
  onSubmit,
}: {
  trade: Trade;
  currentPrice: number;
  onClose: () => void;
  onSubmit: (price: number) => void;
}) {
  const [price, setPrice] = useState("");
  const { price: livePrice } = useMarketPrice(trade.symbol);
  const marketPrice = livePrice || currentPrice;
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        className="modal compact"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(Number(price) || marketPrice);
        }}
      >
        <header>
          <div>
            <span className="eyebrow">
              {trade.id} · {trade.symbol}
            </span>
            <h2>Продать актив</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        <p className="modal-hint">
          Укажите фактическую цену продажи или используйте актуальную рыночную цену.
        </p>
        <label>
          Цена продажи
          <input
            type="number"
            min="0"
            step="any"
            value={price}
            placeholder={`По рынку: ${marketPrice}`}
            onChange={(e) => setPrice(e.target.value)}
          />
          <small>Если поле пустое, цена зафиксируется по рынку при продаже</small>
        </label>
        <button
          type="button"
          className="market-price"
          onClick={() => setPrice(String(marketPrice))}
        >
          <i /> По рынку сейчас <strong>${marketPrice.toLocaleString("en-US")}</strong>
        </button>
        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Отмена
          </button>
          <button className="btn primary">Продать и рассчитать</button>
        </div>
      </form>
    </div>
  );
}
