-- Readable source excerpt / paste / image description for draft and detail.
-- body stays the short AI summary for shelf cards; preview_text stays analysis.

alter table public.scraps
  add column if not exists source_text text not null default '';
