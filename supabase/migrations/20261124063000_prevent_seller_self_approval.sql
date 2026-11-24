-- Prevent clients from self-approving seller applications.
-- Preserve automatic approval only for users with a confirmed email address.

create or replace function private.set_seller_application_status_from_verified_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_email_confirmed_at timestamptz;
begin
  if new.user_id is distinct from auth.uid() then
    raise exception 'Seller application must belong to the signed-in user';
  end if;

  select u.email_confirmed_at
    into v_email_confirmed_at
  from auth.users as u
  where u.id = new.user_id;

  if v_email_confirmed_at is null then
    new.status := 'pending';
    new.reviewed_at := null;
  else
    new.status := 'approved';
    new.reviewed_at := now();
  end if;

  return new;
end;
$function$;

revoke all on function private.set_seller_application_status_from_verified_email() from public;

drop trigger if exists set_seller_application_status_from_verified_email
  on public.seller_applications;

create trigger set_seller_application_status_from_verified_email
before insert on public.seller_applications
for each row
execute function private.set_seller_application_status_from_verified_email();

drop policy if exists "Users can submit seller applications"
  on public.seller_applications;

create policy "Users can submit seller applications"
on public.seller_applications
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and status in ('pending', 'approved')
);
