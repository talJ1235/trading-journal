-- Run this in the Supabase SQL editor

-- user_settings table
create table if not exists user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  currency text not null default 'USD',
  week_start text not null default 'monday',
  show_micha_questions boolean not null default true,
  default_asset_type text not null default 'stock',
  default_position_size numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table user_settings enable row level security;

create policy "user can manage own settings" on user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- deletion_requests table
create table if not exists deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz not null default now()
);

alter table deletion_requests enable row level security;

create policy "user can insert own deletion request" on deletion_requests
  for insert with check (auth.uid() = user_id);

create policy "user can read own deletion requests" on deletion_requests
  for select using (auth.uid() = user_id);
