import { useMemo, useState } from "react";
import Papa from "papaparse";
import { analyse, autoMap, FIELDS, rowsToTrades, type Field, type Trade } from "@/utils/analytics";
import { DEMO_TRADES } from "@/utils/demoData";
import { Mirror } from "@/components/Mirror";
import { Listen } from "@/components/Listen";
import { Contract } from "@/components/Contract";

type Tab = "Mirror" | "Listen" | "Contract";

export default function App() {
  const [trades, setTrades] = useState<Trade[] | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [skipped, setSkipped] = useState(0);
  const [csv, setCsv] = useState<{ headers: string[]; rows: Record<string, string>[] } | null>(null);
  const [map, setMap] = useState<Record<Field, string> | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("Mirror");
  const [chargesPct, setChargesPct] = useState(0.1);
  const [expiryDays, setExpiryDays] = useState<string[]>(["Thu"]);
  const [key, setKey] = useState(0);

  const results = useMemo(() => (trades ? analyse(trades, chargesPct, expiryDays) : null), [trades, chargesPct, expiryDays]);

  const reset = () => {
    window.speechSynthesis?.cancel();
    setTrades(null); setIsDemo(false); setSkipped(0); setCsv(null); setMap(null); setError("");
    setTab("Mirror"); setChargesPct(0.1); setExpiryDays(["Thu"]); setKey((k) => k + 1);
  };

  const onFile = (f: File) => {
    setError("");
    Papa.parse<Record<string, string>>(f, {
      header: true, skipEmptyLines: true,
      complete: (res) => {
        const headers = res.meta.fields ?? [];
        if (!headers.length) { setError("We couldn't read any columns in this file."); return; }
        setCsv({ headers, rows: res.data }); setMap(autoMap(headers));
      },
      error: () => setError("We couldn't read this file. Please check it is a CSV."),
    });
  };

  const confirmMap = () => {
    if (!csv || !map) return;
    const { trades: t, skipped: s } = rowsToTrades(csv.rows, map);
    if (t.length < 4) { setError(`Only ${t.length} valid trades found. We need at least 4 to show a picture. Please check the column choices.`); return; }
    setTrades(t); setSkipped(s); setIsDemo(false); setCsv(null); setError("");
  };

  return (
    <div key={key} className="flex min-h-screen flex-col">
      <header className="mx-auto w-full max-w-xl px-5 pt-8">
        <h1 className="font-display text-4xl text-foreground">Aaina <span className="text-muted-foreground">आईना</span></h1>
        <p className="mt-1 text-sm text-muted-foreground">A calm look at your own past trades.</p>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-6">
        {!trades && !csv && (
          <div className="mirror-card space-y-4">
            <button className="btn-primary w-full" onClick={() => { setTrades(DEMO_TRADES); setIsDemo(true); setSkipped(0); }}>Try demo data</button>
            <label className="btn-ghost block w-full cursor-pointer text-center">
              Upload CSV
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
            </label>
            <p className="text-xs text-muted-foreground">Columns needed: date, symbol, side, quantity, price. The file is read on your device only.</p>
          </div>
        )}

        {csv && map && (
          <div className="mirror-card space-y-3">
            <p className="font-display text-xl">Match your columns</p>
            {FIELDS.map((f) => (
              <label key={f} className="flex items-center justify-between gap-3 text-sm">
                <span className="capitalize text-muted-foreground">{f}</span>
                <select className="field w-48" value={map[f]} onChange={(e) => setMap({ ...map, [f]: e.target.value })}>
                  <option value="">Choose column</option>
                  {csv.headers.map((h) => <option key={h}>{h}</option>)}
                </select>
              </label>
            ))}
            <button className="btn-primary w-full" disabled={FIELDS.some((f) => !map[f])} onClick={confirmMap}>Show my mirror</button>
          </div>
        )}

        {error && <p className="mt-4 rounded-lg bg-muted p-3 text-sm text-foreground">{error}</p>}

        {trades && results && (
          <>
            <div className="mb-4 flex flex-wrap gap-2 text-xs">
              {isDemo && <span className="badge">Synthetic demo data</span>}
              {skipped > 0 && <span className="badge">{skipped} rows skipped</span>}
            </div>
            <nav className="mb-5 grid grid-cols-3 gap-2">
              {(["Mirror", "Listen", "Contract"] as Tab[]).map((t) => (
                <button key={t} className={tab === t ? "tab tab-active" : "tab"} onClick={() => setTab(t)}>{t}</button>
              ))}
            </nav>
            {tab === "Mirror" && <Mirror r={results} chargesPct={chargesPct} setChargesPct={setChargesPct} expiryDays={expiryDays} setExpiryDays={setExpiryDays} />}
            {tab === "Listen" && <Listen r={results} />}
            {tab === "Contract" && <Contract />}
          </>
        )}
      </main>

      <footer className="border-t border-border bg-card px-5 py-4 text-center text-xs text-muted-foreground">
        <p>Not investment advice. No tips, no predictions. Your data never leaves your device.</p>
        <button className="mt-2 underline hover:text-foreground" onClick={reset}>Delete my data</button>
      </footer>
    </div>
  );
}
