-- Run once in the Supabase SQL editor (safe to re-run).
alter table organizations add column if not exists industry text;
alter table organizations add column if not exists size text;
alter table organizations add column if not exists country text;
alter table organizations add column if not exists currency text default 'USD';

revoke insert, update on organizations from authenticated;
grant insert (owner_id, name, industry, size, country, currency) on organizations to authenticated;
grant update (name, industry, size, country, currency) on organizations to authenticated;
