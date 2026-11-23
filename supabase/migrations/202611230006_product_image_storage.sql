-- Product photo storage bucket and seller-scoped object policies.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images" on storage.objects
for select to public using (bucket_id = 'product-images');

drop policy if exists "Authenticated sellers upload own product images" on storage.objects;
create policy "Authenticated sellers upload own product images" on storage.objects
for insert to authenticated with check (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and storage.extension(name) in ('jpg','jpeg','png','webp')
);

drop policy if exists "Sellers update own product images" on storage.objects;
create policy "Sellers update own product images" on storage.objects
for update to authenticated using (
  bucket_id = 'product-images' and owner_id = (select auth.uid()::text)
) with check (
  bucket_id = 'product-images' and owner_id = (select auth.uid()::text)
);

drop policy if exists "Sellers delete own product images" on storage.objects;
create policy "Sellers delete own product images" on storage.objects
for delete to authenticated using (
  bucket_id = 'product-images' and owner_id = (select auth.uid()::text)
);
