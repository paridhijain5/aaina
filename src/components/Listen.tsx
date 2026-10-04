import { useState } from "react";
import type { Results } from "@/utils/analytics";
import { buildSummary, UI, type Lang } from "@/i18n";

export function Listen({ r }: { r: Results }) {
  const [lang, setLang] = useState<Lang>("en");
  const [noVoice, setNoVoice] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const text = buildSummary(r, lang);
  const code = lang === "hi" ? "hi-IN" : "en-IN";

  const speak = () => {
    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (!synth) { setNoVoice(true); return; }
    if (speaking) { synth.cancel(); setSpeaking(false); return; }
    const voices = synth.getVoices();
    const prefix = code.slice(0, 2);
    const voice = voices.find((v) => v.lang === code) ?? voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
    if (!voice) { setNoVoice(true); return; }
    setNoVoice(false);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = code; u.voice = voice; u.rate = 0.95;
    u.onend = () => setSpeaking(false);
    synth.cancel(); synth.speak(u); setSpeaking(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["hi", "en"] as Lang[]).map((l) => (
          <button key={l} className={lang === l ? "tab tab-active" : "tab"} onClick={() => { setLang(l); setNoVoice(false); }}>
            {l === "hi" ? "हिन्दी" : "English"}
          </button>
        ))}
      </div>
      <button className="btn-primary w-full" onClick={speak}>{speaking ? UI[lang].stop : UI[lang].listen}</button>
      {noVoice && <p className="text-sm text-destructive">{UI[lang].noVoice}</p>}
      <p className="mirror-card leading-relaxed text-foreground">{text}</p>
    </div>
  );
}
