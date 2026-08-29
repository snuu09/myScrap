-- MyBrary: plan tiers and user profiles (policy-only MVP; no payment).

do $$
begin
  create type public.plan_tier as enum ('free', 'standard', 'premium', 'admin');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan_tier public.plan_tier not null default 'free',
  trial_ends_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles for select
  to authenticated
  using (auth.uid() = user_id);

grant select on table public.profiles to authenticated;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, plan_tier, trial_ends_at)
  values (new.id, 'free', now() + interval '14 days')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

insert into public.profiles (user_id, plan_tier, trial_ends_at)
select id, 'free', now() + interval '14 days'
from auth.users
on conflict (user_id) do nothing;
