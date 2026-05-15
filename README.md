# Trading Journal

A personal PWA trading journal. Log trades, import IBKR CSV history, get AI weekly reviews, and track portfolio goals.

## Stack

- **React 18** + TypeScript (strict)
- **Vite** + vite-plugin-pwa (Workbox service worker)
- **Supabase** — PostgreSQL + Auth + RLS
- **Tailwind CSS** — dark theme, mobile-first
- **Framer Motion** — page transitions and animations
- **Recharts** — equity curve, win-rate charts
- **Gemini 2.0 Flash** — AI weekly review generation
- **Finnhub** — S&P 500 YTD / weekly comparison

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

| Variable | Where to get it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase project → Settings → API |
| `VITE_GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/) |
| `VITE_FINNHUB_API_KEY` | [Finnhub](https://finnhub.io/) (free tier works) |

### 3. Set up the database

Open your Supabase project → SQL Editor and run the contents of `supabase-schema.sql`.

### 4. Generate PWA icons

```bash
node scripts/generate-icons.cjs
```

This creates `public/icons/icon-192.png`, `public/icons/icon-512.png`, and `public/apple-touch-icon.png`.

### 5. Run locally

```bash
npm run dev
```

## Deploy to Vercel

1. Push to GitHub.
2. Import the repo in Vercel.
3. Set the four environment variables in Vercel project settings.
4. Deploy — `vercel.json` handles SPA rewrites and security headers automatically.

## Project structure

```
src/
├── components/     # Reusable UI components
├── pages/          # TradesPage, ReviewPage, PatternsPage, GoalsPage
├── hooks/          # Supabase data hooks (useTrades, useReviews, …)
├── store/          # Zustand stores (authStore, tradesStore)
├── lib/            # supabase.ts, gemini.ts, sp500.ts, utils.ts
└── types/          # TypeScript interfaces
```
