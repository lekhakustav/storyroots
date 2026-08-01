create extension if not exists pgcrypto;

create table if not exists public.appointment_slots (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'Asia/Kathmandu',
  capacity integer not null default 1 check (capacity > 0),
  booking_count integer not null default 0 check (booking_count >= 0),
  status text not null default 'available' check (status in ('available', 'blocked', 'full')),
  created_at timestamptz not null default now(),
  unique (starts_at, timezone)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  booking_reference text not null unique check (booking_reference ~ '^SR-[A-Z0-9]{6}$'),
  slot_id uuid not null references public.appointment_slots(id),
  story_for text not null,
  storyteller_name text not null,
  customer_relationship text not null,
  is_gift boolean not null default false,
  gift_type text,
  preferred_language text not null,
  other_language text,
  sharing_method text not null,
  story_interests jsonb not null default '[]'::jsonb,
  keepsake_interest text not null,
  occasion text not null,
  occasion_date date,
  country text not null,
  city text not null,
  timezone text not null,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  contact_method text not null check (contact_method in ('email', 'phone', 'whatsapp')),
  notes text,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed')),
  terms_accepted_at timestamptz not null default now(),
  privacy_accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists appointment_slots_available_idx on public.appointment_slots (starts_at) where status = 'available';
create index if not exists appointments_slot_idx on public.appointments (slot_id);

alter table public.appointment_slots enable row level security;
alter table public.appointments enable row level security;

drop policy if exists "public can read available future slots" on public.appointment_slots;
create policy "public can read available future slots" on public.appointment_slots for select to anon, authenticated using (status = 'available' and starts_at > now() and booking_count < capacity);

create or replace function public.book_storyroots_appointment(p_slot_id uuid, p_appointment jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot public.appointment_slots;
  v_reference text;
  v_id uuid;
begin
  select * into v_slot from public.appointment_slots where id = p_slot_id for update;
  if not found or v_slot.status <> 'available' or v_slot.starts_at <= now() or v_slot.booking_count >= v_slot.capacity then
    if found and v_slot.booking_count >= v_slot.capacity then update public.appointment_slots set status = 'full' where id = p_slot_id; end if;
    raise exception 'slot unavailable';
  end if;
  loop
    v_reference := 'SR-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
    exit when not exists (select 1 from public.appointments where booking_reference = v_reference);
  end loop;
  insert into public.appointments (
    booking_reference, slot_id, story_for, storyteller_name, customer_relationship, is_gift, gift_type,
    preferred_language, other_language, sharing_method, story_interests, keepsake_interest, occasion, occasion_date,
    country, city, timezone, customer_name, customer_email, customer_phone, contact_method, notes
  ) values (
    v_reference, p_slot_id, p_appointment->>'storyFor', p_appointment->>'storytellerName', p_appointment->>'customerRelationship',
    coalesce((p_appointment->>'isGift')::boolean, false), nullif(p_appointment->>'giftType', ''), p_appointment->>'preferredLanguage',
    nullif(p_appointment->>'otherLanguage', ''), p_appointment->>'sharingMethod', coalesce(p_appointment->'storyInterests', '[]'::jsonb),
    p_appointment->>'keepsakeInterest', p_appointment->>'occasion', nullif(p_appointment->>'occasionDate', '')::date,
    p_appointment->>'country', p_appointment->>'city', p_appointment->>'timezone', p_appointment->>'customerName',
    nullif(p_appointment->>'customerEmail', ''), nullif(p_appointment->>'customerPhone', ''), p_appointment->>'contactMethod', nullif(p_appointment->>'notes', '')
  ) returning id into v_id;
  update public.appointment_slots set booking_count = booking_count + 1, status = case when booking_count + 1 >= capacity then 'full' else status end where id = p_slot_id;
  return jsonb_build_object('bookingReference', v_reference, 'storytellerName', p_appointment->>'storytellerName', 'consultationDate', p_appointment->>'consultationDate', 'consultationTime', p_appointment->>'consultationTime', 'timezone', p_appointment->>'timezone', 'contactMethod', p_appointment->>'contactMethod', 'startsAt', v_slot.starts_at, 'endsAt', v_slot.ends_at, 'appointmentId', v_id);
end;
$$;

revoke all on function public.book_storyroots_appointment(uuid, jsonb) from public;
grant execute on function public.book_storyroots_appointment(uuid, jsonb) to anon, authenticated;

insert into public.appointment_slots (starts_at, ends_at, timezone)
select make_timestamptz(extract(year from (current_date + day_offset))::int, extract(month from (current_date + day_offset))::int, extract(day from (current_date + day_offset))::int, hour_value, 0, 0, 'Asia/Kathmandu'),
       make_timestamptz(extract(year from (current_date + day_offset))::int, extract(month from (current_date + day_offset))::int, extract(day from (current_date + day_offset))::int, hour_value, 45, 0, 'Asia/Kathmandu'), 'Asia/Kathmandu'
from generate_series(1, 30) as days(day_offset)
cross join unnest(array[10,14,18]) as hours(hour_value)
where extract(isodow from (current_date + day_offset)) between 1 and 5
on conflict (starts_at, timezone) do nothing;
