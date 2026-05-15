-- Trading Journal — Supabase Schema
-- Run this in the Supabase SQL editor to create all tables and RLS policies.

-- ─────────────────────────────────────────────
-- TRADES
-- ─────────────────────────────────────────────
create table if not exists public.trades (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  symbol         text not null,
  type           text not null check (type in ('stock', 'option', 'futures', 'crypto', 'forex')),
  direction      text not null check (direction in ('long', 'short')),
  entry_date     date not null,
  exit_date      date,
  entry_price    numeric,
  exit_price     numeric,
  quantity       numeric,
  signal         text,
  planned_target numeric,
  planned_stop   numeric,
  emotion_before integer check (emotion_before between 1 and 5),
  emotion_during integer check (emotion_during between 1 and 5),
  emotion_after  integer check (emotion_after between 1 and 5),
  followed_plan  boolean,
  lesson         text,
  tag            text check (tag in ('planned', 'surgical', 'impulse', 'emotional_exit', 'news_play')),
  pnl            numeric,
  notes          text,
  created_at     timestamptz not null default now()
);

alter table public.trades enable row level security;

create policy "trades: users own their rows"
  on public.trades for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists trades_user_entry_date_idx on public.trades (user_id, entry_date desc);

-- ─────────────────────────────────────────────
-- GOALS
-- ─────────────────────────────────────────────
create table if not exists public.goals (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  target_amount  numeric not null,
  target_date    date not null,
  current_amount numeric not null default 0,
  created_at     timestamptz not null default now()
);

alter table public.goals enable row level security;

create policy "goals: users own their rows"
  on public.goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Only one goal per user (enforced in application layer; unique index optional)
-- create unique index if not exists goals_user_unique on public.goals (user_id);

-- ─────────────────────────────────────────────
-- DEPOSITS
-- ─────────────────────────────────────────────
create table if not exists public.deposits (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  amount     numeric not null check (amount > 0),
  date       date not null,
  notes      text,
  created_at timestamptz not null default now()
);

alter table public.deposits enable row level security;

create policy "deposits: users own their rows"
  on public.deposits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists deposits_user_date_idx on public.deposits (user_id, date desc);

-- ─────────────────────────────────────────────
-- WEEKLY REVIEWS
-- ─────────────────────────────────────────────
create table if not exists public.weekly_reviews (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  week_start     date not null,
  week_end       date not null,
  ai_review      text,
  market_context text,
  generated_at   timestamptz not null default now()
);

alter table public.weekly_reviews enable row level security;

create policy "weekly_reviews: users own their rows"
  on public.weekly_reviews for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create unique index if not exists weekly_reviews_user_week_idx on public.weekly_reviews (user_id, week_start);
