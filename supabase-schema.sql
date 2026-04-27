-- ============================================================
-- Pactum MVP — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Enable UUID extension (usually already enabled)
create extension if not exists "pgcrypto";

-- ── Companies (one row per employer account) ─────────────────
create table if not exists companies (
  id        uuid primary key,   -- matches auth.users.id
  name      text not null,
  email     text not null unique,
  created_at timestamptz default now()
);

-- ── Assessments ───────────────────────────────────────────────
create table if not exists assessments (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid references companies(id) on delete cascade not null,
  title         text not null,
  role          text not null,
  description   text not null,
  rounds         jsonb not null default '[]',
  workspace_type text not null default 'report' check (workspace_type in ('report', 'email', 'spreadsheet', 'deck', 'code')),
  tension_level  text not null default 'junior' check (tension_level in ('junior', 'senior')),
  language       text check (language in ('python', 'javascript')), -- only set when workspace_type = 'code'
  is_active      boolean not null default true,
  created_at     timestamptz default now()
);

-- ── Candidates (one row per invite link) ─────────────────────
create table if not exists candidates (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid references companies(id) on delete cascade not null,
  assessment_id uuid references assessments(id) on delete cascade not null,
  name          text,
  email         text,
  invite_token  text unique not null,
  created_at    timestamptz default now()
);

-- ── Sessions ──────────────────────────────────────────────────
create table if not exists sessions (
  id            uuid primary key default gen_random_uuid(),
  candidate_id  uuid references candidates(id) on delete cascade not null,
  assessment_id uuid references assessments(id) on delete cascade not null,
  company_id    uuid references companies(id) on delete cascade not null,
  started_at    timestamptz default now(),
  completed_at  timestamptz,
  current_round  integer not null default 1,
  status         text not null default 'in_progress'
                 check (status in ('in_progress', 'completed', 'abandoned')),
  document_state jsonb,          -- workspace content persisted between page loads
  sandbox_id     text,           -- "{e2b_sandboxId}::{ptyId}" for code workspace sessions
  sandbox_paused boolean not null default false
);

-- ── Messages ──────────────────────────────────────────────────
create table if not exists messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade not null,
  round      integer not null,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null,
  created_at timestamptz default now()
);

-- ── Scores ────────────────────────────────────────────────────
create table if not exists scores (
  id                   uuid primary key default gen_random_uuid(),
  session_id           uuid references sessions(id) on delete cascade not null,
  candidate_id         uuid references candidates(id) not null,
  assessment_id        uuid references assessments(id) not null,
  company_id           uuid references companies(id) not null,
  total_score          integer,
  prompt_quality       integer,
  iteration_score      integer,
  output_quality       integer,
  critical_thinking    integer,
  efficiency           integer,
  summary              text,
  strengths            jsonb default '[]',
  improvements         jsonb default '[]',
  red_flags            jsonb default '[]',
  raw_grader_response  text,
  created_at           timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table companies    enable row level security;
alter table assessments  enable row level security;
alter table candidates   enable row level security;
alter table sessions     enable row level security;
alter table messages     enable row level security;
alter table scores       enable row level security;

-- Companies: users can only see/edit their own company
create policy "companies: own row" on companies
  for all using (id = auth.uid());

-- Assessments: company can CRUD their own
create policy "assessments: own company" on assessments
  for all using (company_id = auth.uid());

-- Candidates: company can read/create for their assessments
create policy "candidates: own company" on candidates
  for all using (company_id = auth.uid());

-- Sessions: company can read their sessions; service role handles inserts
create policy "sessions: own company read" on sessions
  for select using (company_id = auth.uid());

-- Messages: company can read their session messages
create policy "messages: own company read" on messages
  for select using (
    session_id in (
      select id from sessions where company_id = auth.uid()
    )
  );

-- Scores: company can read their scores
create policy "scores: own company read" on scores
  for select using (company_id = auth.uid());

-- ============================================================
-- Indexes
-- ============================================================

create index if not exists idx_assessments_company    on assessments(company_id);
create index if not exists idx_candidates_token       on candidates(invite_token);
create index if not exists idx_candidates_assessment  on candidates(assessment_id);
create index if not exists idx_sessions_candidate     on sessions(candidate_id);
create index if not exists idx_sessions_company       on sessions(company_id);
create index if not exists idx_messages_session       on messages(session_id);
create index if not exists idx_scores_session         on scores(session_id);
create index if not exists idx_scores_company         on scores(company_id);
