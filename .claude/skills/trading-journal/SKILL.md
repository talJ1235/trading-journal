---
name: "Trading Journal"
description: "Domain logic for the trading journal app — Supabase schema, CSV import, AI review, micha.stocks methodology. Activate for any feature related to trades, goals, patterns, or reviews."
---

# Trading Journal — Domain Logic

## Supabase Schema

### trades
create table trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  symbol text not null,
  type text check (type in ('stock','etf')),
  direction text check (direction in ('long','short')),
  entry_date date not null,
  exit_date date,
  entry_price numeric,
  exit_price numeric,
  quantity integer,
  signal text,
  planned_target numeric,
  planned_stop numeric,
  emotion_before integer check (emotion_before between 1 and 5),
  emotion_during integer check (emotion_during between 1 and 5),
  emotion_after integer check (emotion_after between 1 and 5),
  followed_plan text check (followed_plan in ('yes','partial','no')),
  lesson text,
  tag text check (tag in ('planned','impulse','emotional_exit','surgical','news_play')),
  pnl numeric,
  notes text,
  created_at timestamptz default now()
);

### goals
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  target_amount numeric not null,
  target_date date not null,
  current_amount numeric default 0,
  created_at timestamptz default now()
);

### deposits
create table deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  amount numeric not null,
  date date not null,
  notes text,
  created_at timestamptz default now()
);

### weekly_reviews
create table weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  week_start date not null,
  week_end date not null,
  ai_review text,
  market_context text,
  generated_at timestamptz default now()
);

## Auto-Tagging Logic
Apply automatically when saving a trade:
- planned — signal is filled + planned_target + planned_stop all set
- impulse — signal is empty OR no planned_target/stop
- surgical — planned + followed_plan = 'yes' + pnl > 0
- emotional_exit — followed_plan = 'no' + emotion_after <= 2
- news_play — signal contains 'news' or 'earnings'

## CSV Import from IBKR
IBKR CSV export columns to map:
- Symbol → symbol
- Buy/Sell → direction (Buy=long, Sell=short)
- Date/Time → entry_date
- Quantity → quantity
- T. Price → entry_price
- Realized P/L → pnl

Parse with PapaParse. Skip header rows that start with "Trades".
After import — user fills in signal, emotions, and lesson manually.

## AI Review Engine (Gemini 2.0 Flash)
Call at end of each week. Send:
- All trades from that week (symbol, direction, pnl, tag, followed_plan, emotions)
- User's historical win rate and avg pnl

System prompt principles (based on micha.stocks methodology):
- Did the user trade with a clear signal?
- Were there impulse trades? How many?
- Did the user follow the plan or exit emotionally?
- What was the best and worst execution?
- One concrete recommendation for next week
- Tone: direct, no flattery, like a trading mentor

## micha.stocks Recommended Questions (Pre-Trade)
Show as optional suggestions — not required:
1. מהו הסיגנל? (Tradytics / גרף / ווליום)
2. מה מחיר הכניסה המדויק?
3. מה היעד?
4. מה הסטופ?
5. כמה מניות / גודל פוזיציה?

## S&P 500 Comparison
Fetch weekly S&P 500 return from Finnhub or fallback to static data.
Compare to user portfolio return for the same period.
Display: "You: +3.2% | S&P 500: +1.8% | You beat the market ✓"
