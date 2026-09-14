-- Custom type names and scrap snapshots. Apply on the live project.

create table if not exists public.shelf_types (
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, name)
);

alter table public.shelf_types enable row level security;

drop policy if exists shelf_types_own on public.shelf_types;
create policy shelf_types_own
  on public.shelf_types
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on table public.shelf_types to authenticated;

alter table public.scraps
  add column if not exists revisions jsonb not null default '[]'::jsonb;
