-- Run this in the Supabase SQL editor.
create extension if not exists "pgcrypto";

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  plan text not null default 'free',
  created_at timestamptz default now()
);

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  email text,
  department text,
  role text,
  status text default 'active',
  notes text,
  created_at timestamptz default now()
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  request text,
  posting text,
  requirements text,
  status text default 'open',
  created_at timestamptz default now()
);

create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  job_id uuid references jobs(id) on delete cascade,
  name text not null,
  email text,
  resume text,
  score int,
  summary text,
  brief text,
  stage text default 'applied',
  created_at timestamptz default now()
);

create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  day date not null default current_date,
  checked_in_at timestamptz default now(),
  unique (employee_id, day)
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  employee_id uuid references employees(id) on delete set null,
  type text,
  content text,
  created_at timestamptz default now()
);

create table if not exists knowledge (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz default now()
);

-- Row level security: every table is isolated per organization owner.
alter table organizations enable row level security;
create policy "own org" on organizations for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
-- Owners may not set or change their own plan; only the service role (payment webhook / SQL editor) can.
revoke insert, update on organizations from authenticated;
grant insert (owner_id, name) on organizations to authenticated;
grant update (name) on organizations to authenticated;

do $$
declare t text;
begin
  foreach t in array array['employees','jobs','candidates','attendance','documents','knowledge'] loop
    execute format('alter table %I enable row level security', t);
    execute format($p$create policy "org isolation" on %I for all
      using (org_id in (select id from organizations where owner_id = auth.uid()))
      with check (org_id in (select id from organizations where owner_id = auth.uid()))$p$, t);
  end loop;
end $$;

-- Public check-in (no account needed): staff enter their work email on a shared link.
create or replace function public_org_name(p_org uuid) returns text
language sql security definer set search_path = public as
$$ select name from organizations where id = p_org $$;

create or replace function public_checkin(p_org uuid, p_email text) returns text
language plpgsql security definer set search_path = public as $$
declare emp employees;
begin
  select * into emp from employees
   where org_id = p_org and lower(email) = lower(trim(p_email)) and status = 'active' limit 1;
  if emp.id is null then return 'not_found'; end if;
  insert into attendance (org_id, employee_id) values (p_org, emp.id)
    on conflict (employee_id, day) do nothing;
  return emp.name;
end $$;

grant execute on function public_org_name(uuid) to anon, authenticated;
grant execute on function public_checkin(uuid, text) to anon, authenticated;
