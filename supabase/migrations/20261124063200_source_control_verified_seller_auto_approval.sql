-- Keep verified-email auto-approval in source control and remove the
-- redundant temporary trigger introduced by the preceding hardening migration.

create or replace function public.auto_approve_verified_seller_application()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_email_confirmed_at timestamptz;
begin
  if auth.uid() = new.user_id then
    if length(trim(coalesce(new.business_name, ''))) < 2
       or length(trim(coalesce(new.contact_name, ''))) < 2
       or new.phone !~ '^[0-9]{10}$'
       or length(trim(coalesce(new.category, ''))) = 0 then
      raise exception 'Complete shop details and a valid 10-digit mobile number are required';
    end if;

    select u.email_confirmed_at
      into v_email_confirmed_at
      from auth.users as u
     where u.id = new.user_id;

    if v_email_confirmed_at is not null then
      new.status := 'approved';
      new.reviewed_at := now();
    else
      new.status := 'pending';
      new.reviewed_at := null;
    end if;
  end if;
  return new;
end;
$function$;

drop trigger if exists set_seller_application_status_from_verified_email
  on public.seller_applications;
drop function if exists private.set_seller_application_status_from_verified_email();

drop trigger if exists trg_auto_approve_verified_seller_application
  on public.seller_applications;
create trigger trg_auto_approve_verified_seller_application
before insert on public.seller_applications
for each row
execute function public.auto_approve_verified_seller_application();
