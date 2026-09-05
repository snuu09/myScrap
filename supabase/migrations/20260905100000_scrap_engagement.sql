-- Engagement fields for bookmark / read / remind (MyBrary detail actions).
alter table public.scraps
  add column if not exists bookmarked boolean not null default false,
  add column if not exists read_at timestamptz null,
  add column if not exists remind_at timestamptz null;
