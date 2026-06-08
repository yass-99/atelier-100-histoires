-- 2026-06-08_session_image_url.sql
alter table sessions add column if not exists image_url text;
comment on column sessions.image_url is 'URL de la photo hero de l''atelier (nullable).';
