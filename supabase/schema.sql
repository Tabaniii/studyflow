-- StudyFlow schema v5: malam ini + ritual kumpul + lampiran instruksi
-- Jalankan SELURUH file ini sekaligus di Supabase Dashboard -> SQL Editor.
-- AMAN DIULANG: tidak menghapus tabel/data. Kolom baru ditambah, data lama di-backfill.
-- v3 -> v4: tugas selesai (is_done) diisi status 'dikumpul'.
-- v4 -> v5: jam tidur, checklist ritual, tabel + bucket lampiran.

-- ============================================================
-- Profil pengguna
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  study_time time not null default '19:00',
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists sleep_time time not null default '23:00';

grant select, insert, update on public.profiles to authenticated;

alter table public.profiles enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- Tugas
-- ============================================================
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  title text not null,
  course text not null,
  deadline date not null,
  priority text not null default 'sedang',
  is_done boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.tasks add column if not exists deadline_time time not null default '23:59';
alter table public.tasks add column if not exists weight_percent numeric(5,2) not null default 10;
alter table public.tasks add column if not exists estimated_hours numeric(5,1);
alter table public.tasks add column if not exists status text;
alter table public.tasks add column if not exists description text not null default '';
alter table public.tasks add column if not exists announced_via text not null default 'lainnya';
alter table public.tasks add column if not exists source_link text not null default '';
alter table public.tasks add column if not exists submit_via text not null default 'lms';
alter table public.tasks add column if not exists file_format text not null default 'bebas';
alter table public.tasks add column if not exists task_type text not null default 'individu';
alter table public.tasks add column if not exists members text not null default '';
alter table public.tasks add column if not exists pic_name text not null default '';
alter table public.tasks add column if not exists recurrence text not null default 'tidak';
alter table public.tasks add column if not exists series_id uuid;
alter table public.tasks add column if not exists spawned_next boolean not null default false;
alter table public.tasks add column if not exists ritual_checks jsonb not null default '{}'::jsonb;

-- backfill status dari is_done (tugas lama)
update public.tasks
set status = case when is_done then 'dikumpul' else 'belum_mulai' end
where status is null or status = '';

alter table public.tasks alter column status set default 'belum_mulai';
alter table public.tasks alter column status set not null;

-- constraint: drop dulu supaya file ini aman dijalankan ulang
alter table public.tasks drop constraint if exists tasks_priority_check;
alter table public.tasks add constraint tasks_priority_check
  check (priority in ('rendah', 'sedang', 'tinggi'));

alter table public.tasks drop constraint if exists tasks_weight_percent_check;
alter table public.tasks add constraint tasks_weight_percent_check
  check (weight_percent >= 0 and weight_percent <= 100);

alter table public.tasks drop constraint if exists tasks_estimated_hours_check;
alter table public.tasks add constraint tasks_estimated_hours_check
  check (estimated_hours is null or estimated_hours >= 0);

alter table public.tasks drop constraint if exists tasks_status_check;
alter table public.tasks add constraint tasks_status_check
  check (status in ('belum_mulai', 'dikerjakan', 'dikumpul', 'menunggu_nilai'));

alter table public.tasks drop constraint if exists tasks_announced_via_check;
alter table public.tasks add constraint tasks_announced_via_check
  check (announced_via in ('wa', 'classroom', 'lms', 'kelas', 'email', 'lainnya'));

alter table public.tasks drop constraint if exists tasks_submit_via_check;
alter table public.tasks add constraint tasks_submit_via_check
  check (submit_via in ('lms', 'email', 'print', 'drive', 'presentasi', 'lainnya'));

alter table public.tasks drop constraint if exists tasks_file_format_check;
alter table public.tasks add constraint tasks_file_format_check
  check (file_format in ('pdf', 'docx', 'zip', 'github', 'bebas', 'lainnya'));

alter table public.tasks drop constraint if exists tasks_task_type_check;
alter table public.tasks add constraint tasks_task_type_check
  check (task_type in ('individu', 'kelompok'));

alter table public.tasks drop constraint if exists tasks_recurrence_check;
alter table public.tasks add constraint tasks_recurrence_check
  check (recurrence in ('tidak', 'harian', 'mingguan', 'bulanan'));

grant select, insert, update, delete on public.tasks to authenticated;

alter table public.tasks enable row level security;

drop policy if exists "tasks: read own" on public.tasks;
create policy "tasks: read own" on public.tasks
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "tasks: insert own" on public.tasks;
create policy "tasks: insert own" on public.tasks
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "tasks: update own" on public.tasks;
create policy "tasks: update own" on public.tasks
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "tasks: delete own" on public.tasks;
create policy "tasks: delete own" on public.tasks
  for delete to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- Profil dibuat otomatis saat user register
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, study_time, sleep_time)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'study_time', '19:00')::time,
    coalesce(new.raw_user_meta_data ->> 'sleep_time', '23:00')::time
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Lampiran instruksi (screenshot WA, foto papan, PDF soal)
-- ============================================================
create table if not exists public.task_attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  storage_path text not null,
  file_name text not null,
  mime_type text not null default 'application/octet-stream',
  size_bytes integer,
  created_at timestamptz not null default now()
);

grant select, insert, delete on public.task_attachments to authenticated;

alter table public.task_attachments enable row level security;

drop policy if exists "attachments: read own" on public.task_attachments;
create policy "attachments: read own" on public.task_attachments
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "attachments: insert own" on public.task_attachments;
create policy "attachments: insert own" on public.task_attachments
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "attachments: delete own" on public.task_attachments;
create policy "attachments: delete own" on public.task_attachments
  for delete to authenticated
  using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'task-attachments',
  'task-attachments',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
on conflict (id) do update
set file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "attachments storage select own" on storage.objects;
create policy "attachments storage select own"
on storage.objects for select to authenticated
using (
  bucket_id = 'task-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "attachments storage insert own" on storage.objects;
create policy "attachments storage insert own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'task-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "attachments storage delete own" on storage.objects;
create policy "attachments storage delete own"
on storage.objects for delete to authenticated
using (
  bucket_id = 'task-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

notify pgrst, 'reload schema';
