create table if not exists public.seller_projects (
  id uuid primary key default gen_random_uuid(),
  seller_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) between 10 and 3000),
  category text not null check (char_length(category) between 2 and 80),
  price_paise bigint not null default 0 check (price_paise >= 0),
  demo_url text,
  file_path text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index if not exists seller_projects_seller_created_idx on public.seller_projects(seller_user_id,created_at desc);
create index if not exists seller_projects_status_created_idx on public.seller_projects(status,created_at desc);
alter table public.seller_projects enable row level security;
drop policy if exists "Sellers view own projects" on public.seller_projects;
create policy "Sellers view own projects" on public.seller_projects for select to authenticated using (seller_user_id = auth.uid());
drop policy if exists "Approved sellers submit projects" on public.seller_projects;
create policy "Approved sellers submit projects" on public.seller_projects for insert to authenticated with check (
 seller_user_id = auth.uid() and status = 'pending' and exists (
   select 1 from public.seller_applications sa where sa.user_id = auth.uid() and sa.status = 'approved'
 )
);
drop policy if exists "Admins manage seller projects" on public.seller_projects;
create policy "Admins manage seller projects" on public.seller_projects for all to authenticated using ((auth.jwt()->'app_metadata'->>'role')='admin') with check ((auth.jwt()->'app_metadata'->>'role')='admin');
drop policy if exists "Public view approved projects" on public.seller_projects;
create policy "Public view approved projects" on public.seller_projects for select to anon, authenticated using (status='approved');
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('seller-project-files','seller-project-files',false,26214400,array['application/zip','application/x-zip-compressed','application/pdf','image/jpeg','image/png','image/webp','text/plain'])
on conflict (id) do update set public=false,file_size_limit=26214400,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "Approved sellers upload own project files" on storage.objects;
create policy "Approved sellers upload own project files" on storage.objects for insert to authenticated with check (
 bucket_id='seller-project-files' and (storage.foldername(name))[1]=(select auth.uid()::text)
 and exists (select 1 from public.seller_applications sa where sa.user_id=auth.uid() and sa.status='approved')
);
drop policy if exists "Sellers read own project files" on storage.objects;
create policy "Sellers read own project files" on storage.objects for select to authenticated using (
 bucket_id='seller-project-files' and ((storage.foldername(name))[1]=(select auth.uid()::text) or (select (auth.jwt()->'app_metadata'->>'role'))='admin')
);
drop policy if exists "Sellers delete own project files" on storage.objects;
create policy "Sellers delete own project files" on storage.objects for delete to authenticated using (
 bucket_id='seller-project-files' and owner_id=(select auth.uid()::text)
);
