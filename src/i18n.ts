import { inr, type Results } from "./utils/analytics";

export type Lang = "en" | "hi";

export const UI = {
  en: { listen: "Listen", stop: "Stop", noVoice: "Your device has no English voice installed. You can read the text below." },
  hi: { listen: "सुनें", stop: "रोकें", noVoice: "Your device has no Hindi voice installed. You can read the text below." },
};

export function buildSummary(r: Results, lang: Lang): string {
  const share = r.chargesShare === null ? null : r.chargesShare.toFixed(1);
  const ratio = r.ratio === null ? null : r.ratio.toFixed(2);
  if (lang === "hi") {
    return [
      `आपने कुल ${r.count} ट्रेड दर्ज किए।`,
      `चार्जेज़ से पहले आपका नतीजा ${inr(r.gross)} रहा।`,
      `अनुमानित चार्जेज़ ${inr(r.charges)} रहे, इसलिए शुद्ध नतीजा ${inr(r.net)} है।`,
      share ? `चार्जेज़ आपके कुल नुकसान के लगभग ${share} प्रतिशत के बराबर थे।` : `चार्जेज़ और नुकसान की तुलना यहाँ लागू नहीं होती।`,
      `आपके ${r.count} में से ${r.expiryCount} ट्रेड चुने गए एक्सपायरी दिनों पर हुए।`,
      ratio ? `नुकसान के बाद अगला ट्रेड, मुनाफ़े के बाद वाले ट्रेड से ${ratio} गुना आकार का था।` : `नुकसान के बाद ट्रेड के आकार की तुलना के लिए पर्याप्त डेटा नहीं है।`,
    ].join(" ");
  }
  return [
    `You recorded ${r.count} trades.`,
    `Before charges, your result was ${inr(r.gross)}.`,
    `Estimated charges were ${inr(r.charges)}, so the net result is ${inr(r.net)}.`,
    share ? `Charges were about ${share} percent of your gross loss.` : `The charges to loss comparison does not apply here.`,
    `${r.expiryCount} of your ${r.count} trades were placed on the expiry days you selected.`,
    ratio ? `After a losing close, your next trade was ${ratio} times the size of the trade after a winning close.` : `There is not enough data to compare trade sizes after losses and wins.`,
  ].join(" ");
}
