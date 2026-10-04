import { useState } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function Contract() {
  const [limit, setLimit] = useState("");
  const [cool, setCool] = useState("");
  const [day, setDay] = useState("");
  const [text, setText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const create = () => {
    const lines = ["My trading contract"];
    if (limit) lines.push(`I stop trading for the week once I lose ₹${Number(limit).toLocaleString("en-IN")}.`);
    if (cool) lines.push(`After ${cool} losing trades in a row, I take a cool-off break.`);
    if (day) lines.push(`Every ${day}, I review my week.`);
    lines.push("A promise to myself, shared with someone I trust.");
    setText(lines.join("\n")); setCopied(false);
  };

  return (
    <div className="space-y-4">
      <div className="mirror-card space-y-3">
        <label className="block text-sm text-muted-foreground">Weekly loss limit (₹)
          <input className="field mt-1 w-full" type="number" min="0" value={limit} onChange={(e) => setLimit(e.target.value)} />
        </label>
        <label className="block text-sm text-muted-foreground">Cool-off after N losing trades in a row
          <input className="field mt-1 w-full" type="number" min="1" value={cool} onChange={(e) => setCool(e.target.value)} />
        </label>
        <label className="block text-sm text-muted-foreground">Weekly review day
          <select className="field mt-1 w-full" value={day} onChange={(e) => setDay(e.target.value)}>
            <option value="">Choose a day</option>
            {DAYS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <button className="btn-primary w-full" onClick={create}>Create card</button>
      </div>
      {text && (
        <div className="contract-card">
          <pre className="whitespace-pre-wrap font-display text-lg leading-relaxed">{text}</pre>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-ghost" onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); }}>{copied ? "Copied" : "Copy text"}</button>
            <a className="btn-ghost" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">Share on WhatsApp</a>
          </div>
        </div>
      )}
    </div>
  );
}
