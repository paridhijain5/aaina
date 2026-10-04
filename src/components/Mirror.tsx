import { useState } from "react";
import { inr, type Results } from "@/utils/analytics";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Props {
  r: Results;
  chargesPct: number;
  setChargesPct: (n: number) => void;
  expiryDays: string[];
  setExpiryDays: (d: string[]) => void;
}

function Card({ title, value, sub, note }: { title: string; value: string; sub?: string; note: string }) {
  return (
    <div className="mirror-card">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{title}</p>
      <p className="mt-2 font-display text-3xl text-foreground">{value}</p>
      {sub && <p className="mt-1 text-sm text-foreground/80">{sub}</p>}
      <p className="mt-3 text-sm text-muted-foreground">{note}</p>
    </div>
  );
}

export function Mirror({ r, chargesPct, setChargesPct, expiryDays, setExpiryDays }: Props) {
  const [unit, setUnit] = useState("");
  const [unitValue, setUnitValue] = useState("");
  const uv = Number(unitValue);

  return (
    <div className="space-y-4">
      <Card
        title="Net result"
        value={inr(r.net)}
        sub={`Gross ${inr(r.gross)} · Charges ${inr(r.charges)}`}
        note="What your closed trades made or lost, after estimated charges."
      />
      <div className="-mt-2 flex flex-wrap items-center gap-2 px-1 text-sm text-muted-foreground">
        <label htmlFor="cp">Charges %</label>
        <input id="cp" type="number" step="0.01" min="0" value={chargesPct}
          onChange={(e) => setChargesPct(Number(e.target.value) || 0)} className="field w-24" />
        <span>Estimate. Check your contract notes.</span>
      </div>
      {r.hasOpen && <p className="px-1 text-sm text-muted-foreground">Open positions not counted.</p>}

      <Card
        title="Charges share of losses"
        value={r.chargesShare === null ? "n/a" : `${r.chargesShare.toFixed(1)}%`}
        note="How much of the gross loss the estimated charges equal. Shown only when gross is a loss."
      />

      <Card
        title="Expiry-day share"
        value={`${r.expiryPct.toFixed(0)}%`}
        sub={`${r.expiryCount} of ${r.count} trades`}
        note="Share of your trades placed on the weekdays you mark as expiry days."
      />
      <div className="-mt-2 flex flex-wrap gap-2 px-1">
        {DAYS.map((d) => (
          <label key={d} className="chip">
            <input type="checkbox" checked={expiryDays.includes(d)}
              onChange={(e) => setExpiryDays(e.target.checked ? [...expiryDays, d] : expiryDays.filter((x) => x !== d))} />
            {d}
          </label>
        ))}
      </div>

      <Card
        title="Size after losses"
        value={r.ratio === null ? "Not enough data" : `${r.ratio.toFixed(2)}×`}
        sub={r.ratio === null ? `${r.lossCases} after losses, ${r.winCases} after wins` : `After loss ${inr(r.afterLoss!)} · after win ${inr(r.afterWin!)}`}
        note="Average size of your next trade after a losing close, compared with after a winning close."
      />

      <div className="mirror-card space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">In your own units</p>
        <div className="flex flex-wrap gap-2">
          <input className="field flex-1" placeholder="Unit, e.g. monthly rent" value={unit} onChange={(e) => setUnit(e.target.value)} maxLength={40} />
          <input className="field w-32" type="number" min="0" placeholder="₹ value" value={unitValue} onChange={(e) => setUnitValue(e.target.value)} />
        </div>
        {unit && uv > 0 && (
          <p className="text-foreground">
            {r.net < 0
              ? `Your net result equals ${(Math.abs(r.net) / uv).toFixed(1)} x ${unit}.`
              : `Your net result is not a loss in this period.`}
          </p>
        )}
      </div>

      <div className="group-box">
        <p className="font-display text-lg text-foreground">What happens across the group, not about you</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/85">
          <li>About 88-89% of individual F&amp;O traders lost money in FY26.</li>
          <li>Among traders who lost two years in a row and kept trading, about 90% lost again.</li>
          <li>Options generated about 92% of retail F&amp;O losses.</li>
          <li>Transaction costs were about 35% of loss-makers' gross losses.</li>
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Source: SEBI F&amp;O profitability studies; verify figures at sebi.gov.in before relying on them
        </p>
      </div>
    </div>
  );
}
