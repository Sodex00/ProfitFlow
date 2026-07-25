import type { Trade } from "./types";

const isoAgo = (days: number, hour: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 20, 0, 0);
  return date.toISOString();
};

export const demoTrades: Trade[] = [
  {
    id: "PF-2408",
    symbol: "BTCUSDT",
    side: "long",
    entryPrice: 65420,
    exitPrice: 67118,
    amount: 0.18,
    takeProfit: 68000,
    stopLoss: 64200,
    openedAt: isoAgo(1, 10),
    closedAt: isoAgo(1, 18),
    status: "closed",
    note: "Пробой локального сопротивления",
  },
  {
    id: "PF-2391",
    symbol: "ETHUSDT",
    side: "long",
    entryPrice: 3520,
    exitPrice: 3472,
    amount: 2.4,
    takeProfit: 3650,
    stopLoss: 3450,
    openedAt: isoAgo(3, 12),
    closedAt: isoAgo(3, 16),
    status: "closed",
  },
  {
    id: "PF-2377",
    symbol: "SOLUSDT",
    side: "long",
    entryPrice: 151.8,
    exitPrice: 147.2,
    amount: 18,
    takeProfit: 160,
    stopLoss: 146,
    openedAt: isoAgo(7, 9),
    closedAt: isoAgo(6, 14),
    status: "closed",
  },
  {
    id: "PF-2360",
    symbol: "BTCUSDT",
    side: "long",
    entryPrice: 62120,
    exitPrice: 63340,
    amount: 0.12,
    takeProfit: 64000,
    stopLoss: 61000,
    openedAt: isoAgo(14, 11),
    closedAt: isoAgo(13, 19),
    status: "closed",
  },
  {
    id: "PF-2412",
    symbol: "BTCUSDT",
    side: "long",
    entryPrice: 66840,
    amount: 0.1,
    takeProfit: 70000,
    stopLoss: 64800,
    openedAt: isoAgo(0, 13),
    status: "open",
    note: "Ретест уровня",
  },
];

export const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT"];
