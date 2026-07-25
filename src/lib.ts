import type { Trade } from "./types";

export const money = (value: number, digits = 0) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
  }).format(value);

export const currencyMoney = (value: number, currency = "USD", digits = 0) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: digits,
  }).format(value);

export const num = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: value < 10 ? 4 : 2,
  }).format(value);

export const tradePnl = (trade: Trade, livePrice?: number) => {
  const exit = trade.exitPrice ?? livePrice;
  if (!exit) return 0;
  const direction = trade.side === "long" ? 1 : -1;
  return (exit - trade.entryPrice) * trade.amount * direction;
};

export const tradePnlPercent = (trade: Trade, livePrice?: number) => {
  const basis = trade.entryPrice * trade.amount;
  return basis ? (tradePnl(trade, livePrice) / basis) * 100 : 0;
};

export const shortDate = (iso: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
