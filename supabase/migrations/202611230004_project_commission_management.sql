-- Project-scoped commission management.
-- Each product/business project owns independent commission rules and ledger entries.

create table if not exists public.business_projects (
  id uuid primary key default gen_random_uuid(),
  project_key text not null unique check (project_key ~ '^[a-z0-9][a-z0-9-]*$'),
  display_name text not null,
  currency_code char(3) not null default 'INR' check (currency_code ~ '^[A-Z]{3}$'),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.project_commission_rules (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.business_projects(id) on delete restrict,
  category text,
  seller_user_id uuid references auth.users(id) on delete restrict,
  rate_bps integer not null default 0 check (rate_bps between 0 and 10000),
  fixed_fee_minor bigint not null default 0 check (fixed_fee_minor >= 0),
  priority integer not null default 0,
  is_active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create index if not exists project_commission_rules_lookup_idx
  on public.project_commission_rules(project_id, is_active, priority desc);

create table if not exists public.project_commission_ledger (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.business_projects(id) on delete restrict,
  order_id uuid references public.orders(id) on delete restrict,
  seller_user_id uuid references auth.users(id) on delete restrict,
  rule_id uuid references public.project_commission_rules(id) on delete set null,
  entry_type text not null default 'commission'
    check (entry_type in ('commission','reversal','adjustment')),
  gross_amount_minor bigint not null check (gross_amount_minor >= 0),
  commission_base_minor bigint not null check (commission_base_minor >= 0),
  rate_bps integer not null check (rate_bps between 0 and 10000),
  fixed_fee_minor bigint not null default 0 check (fixed_fee_minor >= 0),
  commission_amount_minor bigint not null,
  currency_code char(3) not null check (currency_code ~ '^[A-Z]{3}$'),
  status text not null default 'accrued'
    check (status in ('accrued','approved','paid','reversed','held')),
  source_entry_id uuid references public.project_commission_ledger(id) on delete restrict,
  note text not null default '',
  created_at timestamptz not null default now(),
  settled_at timestamptz,
  check (
    (entry_type = 'commission' and commission_amount_minor >= 0)
    or (entry_type in ('reversal','adjustment') and commission_amount_minor <> 0)
  )
);

create unique index if not exists project_commission_one_order_seller_idx
  on public.project_commission_ledger(project_id, order_id, seller_user_id)
  where entry_type = 'commission' and order_id is not null;

create index if not exists project_commission_ledger_project_status_idx
  on public.project_commission_ledger(project_id, status, created_at desc);

create table if not exists public.project_commission_payouts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.business_projects(id) on delete restrict,
  seller_user_id uuid not null references auth.users(id) on delete restrict,
  amount_minor bigint not null check (amount_minor > 0),
  currency_code char(3) not null check (currency_code ~ '^[A-Z]{3}$'),
  status text not null default 'pending'
    check (status in ('pending','processing','paid','failed','cancelled')),
  payment_reference text,
  note text not null default '',
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists project_commission_payouts_project_status_idx
  on public.project_commission_payouts(project_id, status, created_at desc);

insert into public.business_projects(project_key, display_name, currency_code)
values ('wholesale-marketplace', 'Wholesale Marketplace', 'INR')
on conflict (project_key) do update
set display_name = excluded.display_name,
    currency_code = excluded.currency_code;

alter table public.business_projects enable row level security;
alter table public.project_commission_rules enable row level security;
alter table public.project_commission_ledger enable row level security;
alter table public.project_commission_payouts enable row level security;

create policy "Admins manage business projects"
on public.business_projects for all to authenticated
using ((select auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "Admins manage project commission rules"
on public.project_commission_rules for all to authenticated
using ((select auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "Admins manage project commission ledger"
on public.project_commission_ledger for all to authenticated
using ((select auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "Admins manage project commission payouts"
on public.project_commission_payouts for all to authenticated
using ((select auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

grant select, insert, update, delete on public.business_projects to authenticated;
grant select, insert, update, delete on public.project_commission_rules to authenticated;
grant select, insert, update, delete on public.project_commission_ledger to authenticated;
grant select, insert, update, delete on public.project_commission_payouts to authenticated;

grant all on public.business_projects to service_role;
grant all on public.project_commission_rules to service_role;
grant all on public.project_commission_ledger to service_role;
grant all on public.project_commission_payouts to service_role;
