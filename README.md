# Aaina (आईना), the mirror

**Team Vanta | SANGYAN Hackathon | Track D: Financial Habits & Behavioural Resilience**

A privacy-first behavioural mirror for retail derivatives traders. Users load their
own broker statement, which is analysed **in the browser and never uploaded**, and see
their real results and behaviour patterns, then set safeguards of their own choosing.

Aaina gives no tips, no predictions and no buy/sell/hold advice.

## Features
- **The Mirror:** net result after estimated charges, expiry-day share of trades,
  loss-chasing check, and the result in the user's own units (e.g. months of rent).
- **Aaina Bolta Hai:** a spoken summary in Hindi and English (Web Speech API), with text shown.
- **Safety Contract:** rules the user sets themselves, shareable via WhatsApp. No amounts are suggested.
- **Try demo data:** synthetic sample trades so the demo works without a broker file.

## Run locally
```bash
npm install
npm run dev
```
Open the local link shown in the terminal.

## Privacy and guardrails
| SANGYAN rule | How Aaina complies |
|---|---|
| No tips or buy/sell/hold advice | Output is limited to computed facts about the user's own past trades |
| No predictions | Only realised past data; cohort statistics are labelled "the group, not you" |
| No promotion or monetisation | No broker links, ads or upsells |
| No OTP, SMS or sensitive data | User-chosen CSV parsed in the browser; no login, no accounts, no server |
| Uncertainty stated | Charges marked "estimate"; open positions excluded; "not enough data" shown |

## Third-party components (disclosure)
React, Vite, Tailwind CSS, papaparse (CSV parsing), browser Web Speech API.
The prototype was scaffolded with Lovable and edited in VS Code.
Population statistics are from SEBI's published F&O profitability studies;
verify at sebi.gov.in.

## Disclaimer
Not investment advice. Demo data is synthetic.
