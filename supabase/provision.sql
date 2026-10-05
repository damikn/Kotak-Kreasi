-- Kotak Kreasi — Supabase provisioning script
-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
-- Safe to re-run: every statement is idempotent.

create extension if not exists pgcrypto;

-- ── works ────────────────────────────────────────────────────────────────────
-- Replaces Sheet1. Column names are plain snake_case; the legacy "Tanggal" text
-- format is kept in date_label so the teacher dashboard renders unchanged.
create table if not exists public.works (
  id            uuid primary key default gen_random_uuid(),
  kode          text not null unique,
  created_at    timestamptz not null default now(),
  date_label    text,
  student_name  text not null,
  fenomena      text not null default '',
  gagasan       text not null default '',
  pesan         text not null default '',
  pola          text not null default '',
  rima_suffix   text not null default '',
  rima_words    text not null default '',
  line1         text not null default '',
  line2         text not null default '',
  line3         text not null default '',
  line4         text not null default '',
  image_path    text,
  drive_url     text,
  auto_score    integer,
  grade         integer check (grade is null or (grade between 0 and 100)),
  comment       text not null default '',
  status        text not null default 'BELUM DINILAI',
  gallery       boolean not null default false,
  class_name    text not null default '',
  absen_no      integer
);

create index if not exists works_created_at_idx on public.works (created_at desc);
create index if not exists works_gallery_idx on public.works (created_at desc) where gallery;

-- Idempotent upgrades for databases created before these columns existed
alter table public.works add column if not exists class_name text not null default '';
alter table public.works add column if not exists absen_no integer;
create index if not exists works_class_idx on public.works (class_name, absen_no);

-- RLS with no policies: anon/authenticated keys are denied outright. The Nuxt
-- server talks to Postgres with the service_role key, which bypasses RLS.
alter table public.works enable row level security;
revoke all on public.works from anon, authenticated;

-- ── storage ──────────────────────────────────────────────────────────────────
-- Private bucket for the rendered pantun cards. Images are read through the
-- /api/karya/gambar/<kode> route, which hands out short-lived signed URLs.
insert into storage.buckets (id, name, public)
values ('works-images', 'works-images', false)
on conflict (id) do nothing;

-- No policies on storage.objects: only service_role (server-side) can read or
-- write inside this bucket.
