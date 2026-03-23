-- Supabase schema template for JOB-EX
-- Run this in Supabase SQL editor (with your own table names if needed).
--
-- Notes:
-- 1) This project keeps localStorage as a fallback during migration.
-- 2) Keep RLS enabled and policies as written for safety.

-- Extensions
create extension if not exists "pgcrypto";

-- Roles:
-- - student: profiles.role = 'student'
-- - institution admin: profiles.role = 'institution_admin'

-- Profiles table (student + institution admin)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('student', 'institution_admin')),

  name text not null default '',
  school text not null default '',
  major text not null default '',
  status text not null default '',
  interests text[] not null default '{}',

  -- Optional for students until they verify institution code
  institution_code text not null default '',

  created_at timestamptz not null default now()
);

-- Institutions table (for mapping institution_code -> admin user)
create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  institution_code text not null unique,
  institution_name text not null,
  admin_id uuid not null references auth.users(id) on delete cascade,
  contact_email text not null default '',
  created_at timestamptz not null default now()
);

-- Simulation step results (AI history)
create table if not exists public.simulation_step_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  institution_code text not null,

  run_id text not null,
  role_id text not null,
  level_index int not null,
  level_label text not null default '',
  student_email text not null default '',
  student_name text not null default '',

  result_json jsonb not null,
  answer_text text not null default '',
  analyzed_at timestamptz not null,
  is_resubmission boolean not null default false,

  created_at timestamptz not null default now(),

  -- idempotency for resync
  unique (user_id, run_id, role_id, level_index, analyzed_at)
);

-- Simulation final results (overall + strengths + next_steps + trait scores)
create table if not exists public.simulation_final_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  institution_code text not null,

  run_id text not null,
  role_id text not null,
  student_email text not null default '',
  student_name text not null default '',

  final_json jsonb not null,
  analyzed_at timestamptz not null,

  created_at timestamptz not null default now(),

  unique (user_id, run_id, role_id, analyzed_at)
);

-- -------------------------
-- RLS Policies
-- -------------------------
alter table public.profiles enable row level security;
alter table public.institutions enable row level security;
alter table public.simulation_step_results enable row level security;
alter table public.simulation_final_results enable row level security;

-- profiles: user can read/update their own row
create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id);

-- institutions: admin can read their own institution, others can read by code if needed
create policy "institutions_select_by_admin" on public.institutions
for select using (admin_id = auth.uid());

create policy "institutions_insert_admin" on public.institutions
for insert with check (admin_id = auth.uid());

create policy "institutions_update_admin" on public.institutions
for update using (admin_id = auth.uid())
with check (admin_id = auth.uid());

-- institution code lookup for student verification can be done by public select
-- if you want it public, change to allow by admin or authenticated.
create policy "institutions_select_authenticated" on public.institutions
for select using (true);

-- simulation_step_results: only owner can insert/select
create policy "step_select_own" on public.simulation_step_results
for select using (auth.uid() = user_id);

create policy "step_insert_own" on public.simulation_step_results
for insert with check (auth.uid() = user_id);

-- institution admin can select student records for their institution_code
create policy "step_select_institution_admin" on public.simulation_step_results
for select using (
  exists (
    select 1
    from public.institutions i
    where i.admin_id = auth.uid()
      and i.institution_code = simulation_step_results.institution_code
  )
);

-- simulation_final_results: same as step results
create policy "final_select_own" on public.simulation_final_results
for select using (auth.uid() = user_id);

create policy "final_insert_own" on public.simulation_final_results
for insert with check (auth.uid() = user_id);

create policy "final_select_institution_admin" on public.simulation_final_results
for select using (
  exists (
    select 1
    from public.institutions i
    where i.admin_id = auth.uid()
      and i.institution_code = simulation_final_results.institution_code
  )
);

-- ------------------------------------------------------------
-- Institution Activity Events (AI 진로검사 / 멘토 질문 / Pick / VOD 등)
-- ------------------------------------------------------------
-- 공통 이벤트 테이블: 학생 모듈 사용 기록을 기관 코드 기준으로 집계하기 위함
create table if not exists public.institution_activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  institution_code text not null,
  student_email text not null default '',
  student_name text not null default '',

  event_type text not null,
  occurred_at timestamptz not null default now(),

  duration_seconds int,
  meta_json jsonb not null default '{}'::jsonb
);

alter table public.institution_activity_events enable row level security;

-- 학생(본인)은 자신이 남긴 이벤트만 insert/select
create policy "activity_insert_own" on public.institution_activity_events
for insert with check (auth.uid() = user_id);

create policy "activity_select_own" on public.institution_activity_events
for select using (auth.uid() = user_id);

-- 기관 담당자는 자신 기관 코드에 해당하는 이벤트를 조회
create policy "activity_select_institution_admin" on public.institution_activity_events
for select using (
  exists (
    select 1
    from public.institutions i
    where i.admin_id = auth.uid()
      and i.institution_code = institution_activity_events.institution_code
  )
);

