export type Side = "BUY" | "SELL";
export interface Trade {
  date: string; // YYYY-MM-DD
  symbol: string;
  side: Side;
  quantity: number;
  price: number;
}
export interface ClosedLot {
  symbol: string;
  pnl: number;
  closeIndex: number;
}

export function parseDate(raw: string): string | null {
  const s = String(raw ?? "").trim();
  let y: number, m: number, d: number;
  let mt = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (mt) {
    y = +mt[1]!; m = +mt[2]!; d = +mt[3]!;
  } else {
    mt = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (!mt) return null;
    d = +mt[1]!; m = +mt[2]!; y = +mt[3]!;
  }
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function parseSide(raw: string): Side | null {
  const s = String(raw ?? "").trim().toLowerCase();
  if (s === "buy" || s === "b") return "BUY";
  if (s === "sell" || s === "s") return "SELL";
  return null;
}

export const FIELDS = ["date", "symbol", "side", "quantity", "price"] as const;
export type Field = (typeof FIELDS)[number];
const ALIASES: Record<Field, string[]> = {
  date: ["date", "trade_date"],
  symbol: ["symbol", "instrument"],
  side: ["side", "trade_type", "buy_sell"],
  quantity: ["quantity", "qty"],
  price: ["price"],
};
export function autoMap(headers: string[]): Record<Field, string> {
  const out = {} as Record<Field, string>;
  for (const f of FIELDS) {
    out[f] = headers.find((h) => ALIASES[f].includes(h.trim().toLowerCase())) ?? "";
  }
  return out;
}

export function rowsToTrades(rows: Record<string, string>[], map: Record<Field, string>) {
  const trades: Trade[] = [];
  let skipped = 0;
  for (const r of rows) {
    const date = parseDate(r[map.date] ?? "");
    const symbol = String(r[map.symbol] ?? "").trim();
    const side = parseSide(r[map.side] ?? "");
    const quantity = Number(String(r[map.quantity] ?? "").replace(/,/g, ""));
    const price = Number(String(r[map.price] ?? "").replace(/,/g, ""));
    if (!date || !symbol || !side || !(quantity > 0) || !(price > 0)) {
      skipped++;
      continue;
    }
    trades.push({ date, symbol, side, quantity, price });
  }
  return { trades, skipped };
}

/** FIFO matching per symbol. Trades are processed in date order (stable). */
export function matchFifo(trades: Trade[]) {
  const ordered = trades.map((t, i) => ({ t, i })).sort((a, b) => (a.t.date < b.t.date ? -1 : a.t.date > b.t.date ? 1 : a.i - b.i));
  const sorted = ordered.map((o) => o.t);
  const open: Record<string, { side: Side; qty: number; price: number }[]> = {};
  const lots: ClosedLot[] = [];
  sorted.forEach((t, idx) => {
    const q = (open[t.symbol] ??= []);
    let remaining = t.quantity;
    while (remaining > 0 && q.length && q[0]!.side !== t.side) {
      const head = q[0]!;
      const m = Math.min(head.qty, remaining);
      const pnl = head.side === "BUY" ? (t.price - head.price) * m : (head.price - t.price) * m;
      lots.push({ symbol: t.symbol, pnl, closeIndex: idx });
      head.qty -= m;
      remaining -= m;
      if (head.qty === 0) q.shift();
    }
    if (remaining > 0) q.push({ side: t.side, qty: remaining, price: t.price });
  });
  const hasOpen = Object.values(open).some((q) => q.length > 0);
  return { sorted, lots, hasOpen };
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export function weekday(date: string) {
  return WEEKDAYS[new Date(date + "T00:00:00Z").getUTCDay()] ?? "";
}

export interface Results {
  count: number;
  gross: number;
  turnover: number;
  charges: number;
  net: number;
  chargesShare: number | null;
  expiryCount: number;
  expiryPct: number;
  afterLoss: number | null;
  afterWin: number | null;
  ratio: number | null;
  lossCases: number;
  winCases: number;
  hasOpen: boolean;
}

export function analyse(trades: Trade[], chargesPct: number, expiryDays: string[]): Results {
  const { sorted, lots, hasOpen } = matchFifo(trades);
  const gross = lots.reduce((s, l) => s + l.pnl, 0);
  const turnover = trades.reduce((s, t) => s + t.price * t.quantity, 0);
  const charges = turnover * (chargesPct / 100);
  const net = gross - charges;
  const chargesShare = gross < 0 ? (charges / Math.abs(gross)) * 100 : null;
  const expiryCount = trades.filter((t) => expiryDays.includes(weekday(t.date))).length;
  const expiryPct = trades.length ? (expiryCount / trades.length) * 100 : 0;

  const size = (t: Trade) => t.quantity * t.price;
  const avgSize = sorted.length ? turnover / sorted.length : 0;
  const lossNext: number[] = [];
  const winNext: number[] = [];
  for (const l of lots) {
    const next = sorted[l.closeIndex + 1];
    if (!next || l.pnl === 0) continue;
    (l.pnl < 0 ? lossNext : winNext).push(size(next));
  }
  const mean = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;
  const enough = lossNext.length >= 3 && winNext.length >= 3;
  const afterLoss = enough ? mean(lossNext) : null;
  const afterWin = enough ? mean(winNext) : null;
  void avgSize;
  return {
    count: trades.length, gross, turnover, charges, net, chargesShare,
    expiryCount, expiryPct, afterLoss, afterWin,
    ratio: enough && afterWin ? afterLoss! / afterWin : null,
    lossCases: lossNext.length, winCases: winNext.length, hasOpen,
  };
}

export const inr = (n: number) =>
  (n < 0 ? "-₹" : "₹") + Math.abs(Math.round(n)).toLocaleString("en-IN");
