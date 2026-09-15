-- User-defined scrap-to-scrap links (bidirectional in the client).

alter table public.scraps
  add column if not exists linked_ids uuid[] not null default '{}';
