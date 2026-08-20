-- myScrap Phase 3: scraps table, RLS, private media bucket, realtime.
-- Apply when the project exists. Do not put API keys in this file.

create table if not exists public.scraps (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  type text not null default 'text',
  tags jsonb not null default '[]'::jsonb,
  title text not null default '',
  body text not null default '',
  url text not null default '',
  filename text not null default '',
  mime text not null default '',
  extension text not null default '',
  size bigint not null default 0,
  preview_text text not null default '',
  pages integer not null default 0,
  og jsonb,
  og_status text not null default '',
  sample boolean not null default false,
  ephemeral boolean not null default false,
  stored_media boolean not null default false,
  domain text not null default '',
  error text not null default '',
  memo text not null default '',
  media_path text,
  poster_path text
);

create index if not exists scraps_user_created_idx
  on public.scraps (user_id, created_at desc);

create index if not exists scraps_user_updated_idx
  on public.scraps (user_id, updated_at desc);

alter table public.scraps replica identity full;

grant select, insert, update, delete on table public.scraps to authenticated;

alter table public.scraps enable row level security;

drop policy if exists scraps_select_own on public.scraps;
create policy scraps_select_own
  on public.scraps for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists scraps_insert_own on public.scraps;
create policy scraps_insert_own
  on public.scraps for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists scraps_update_own on public.scraps;
create policy scraps_update_own
  on public.scraps for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists scraps_delete_own on public.scraps;
create policy scraps_delete_own
  on public.scraps for delete
  to authenticated
  using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('scrap-media', 'scrap-media', false)
on conflict (id) do nothing;

drop policy if exists scrap_media_select_own on storage.objects;
create policy scrap_media_select_own
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'scrap-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists scrap_media_insert_own on storage.objects;
create policy scrap_media_insert_own
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'scrap-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists scrap_media_update_own on storage.objects;
create policy scrap_media_update_own
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'scrap-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'scrap-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists scrap_media_delete_own on storage.objects;
create policy scrap_media_delete_own
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'scrap-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

do $$
begin
  alter publication supabase_realtime add table public.scraps;
exception
  when duplicate_object then null;
end $$;

