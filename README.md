# Aaina (the mirror)

A browser-only app that helps Indian retail F&O traders see their own past trading behaviour honestly.

## Run
```
npm install
npm run dev
```

## Third-party components
- React
- Vite
- Tailwind CSS
- papaparse (CSV parsing in the browser)
- Web Speech API (speechSynthesis, built into the browser)

## Guardrail compliance
| Rule | How it is met |
|---|---|
| No tips / buy-sell-hold advice / predictions | Only computed numbers about past trades are shown |
| No broker or product mentions | None in the UI or text |
| Calm, non-shaming language | Neutral wording; never labels the user |
| Data never leaves the device | CSV parsed in-browser; no backend, no storage, no requests |
| Delete my data | Footer button clears all state |
| Contract has no trade data | Built only from user-entered rules |
