# Stovest — African & Global Stock Investment Dashboard

Next.js 14 · React 18 · Tailwind · TypeScript

## Run
```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Live data
- Quotes: Yahoo Finance (no key). FX: open.er-api.com. News: Google News RSS.
- Optional premium feeds: add a Finnhub key (US) and/or EODHD key (JSE) in Settings,
  or set `FINNHUB_API_KEY` / `EODHD_API_KEY` in `.env.local`.
- The header banner shows Connected only when live quotes were actually received;
  otherwise it shows Offline and sample data is used.

## Shortcuts
Cmd/Ctrl+K opens AI search · Esc closes dialogs.
