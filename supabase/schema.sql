-- StudyFlow schema v3: auth + tugas per-user + profil jam belajar
-- Jalankan SELURUH file ini sekaligus di Supabase Dashboard -> SQL Editor.
-- PERINGATAN: script ini menghapus tabel tasks & profiles lama beserta isinya.
-- v3: menambahkan GRANT eksplisit — memperbaiki error "permission denied for table"
-- yang muncul saat default privileges project tidak otomatis memberi akses.

drop table if exists public.tasks cascade;
drop table if exists public.profiles cascade;
drop function if exists public.handle_new_user() cascade;

-- ============================================================
-- Profil pengguna: menyimpan jam belajar untuk pengingat
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  study_time time not null default '19:00',
  created_at timestamptz not null default now()
);

grant select, insert, update on public.profiles to authenticated;

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select to authenticated
  using (auth.uid() = id);

create policy "profiles: insert own" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- Tugas: dimiliki per user, RLS memastikan data tidak tercampur
-- ============================================================
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  title text not null,
  course text not null,
  deadline date not null,
  priority text not null default 'sedang' check (priority in ('rendah', 'sedang', 'tinggi')),
  is_done boolean not null default false,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.tasks to authenticated;

alter table public.tasks enable row level security;

create policy "tasks: read own" on public.tasks
  for select to authenticated
  using (auth.uid() = user_id);

create policy "tasks: insert own" on public.tasks
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "tasks: update own" on public.tasks
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "tasks: delete own" on public.tasks
  for delete to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- Profil dibuat otomatis saat user register.
-- Jam belajar diambil dari metadata yang dikirim form register.
-- ============================================================
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, study_time)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'study_time', '19:00')::time);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- pastikan PostgREST memuat ulang struktur tabel terbaru
notify pgrst, 'reload schema';
