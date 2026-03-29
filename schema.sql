-- ══════════════════════════════════════════════════════════════
--  ClinIQ v2 — Supabase Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ══════════════════════════════════════════════════════════════

-- 1. Molecules / BD targets
CREATE TABLE IF NOT EXISTS public.cliniq_molecules (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  phase       TEXT,               -- 'ph1','ph2','ph3','ph4'
  ta          TEXT,               -- Therapeutic Area
  indication  TEXT,
  sponsor     TEXT,
  moa         TEXT,               -- Mechanism of Action
  safety      TEXT,               -- 'Low','Medium','High'
  patent      INT,                -- Patent expiry year
  bdos        INT,                -- BD Opportunity Score 0-100
  bd          TEXT,               -- 'Available','Partnered','Proprietary','Acquired'
  reg         TEXT,               -- Regulatory designations
  upfront     TEXT,               -- Upfront deal value
  milestones  TEXT,               -- Milestone potential
  royalty     TEXT,               -- Royalty range
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. Sponsor / pharma companies
CREATE TABLE IF NOT EXISTS public.cliniq_sponsors (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  trial_count   INT,
  bdos          INT,
  region        TEXT,             -- 'USA','Europe','Emerging'
  size          TEXT,             -- 'big','mid','small'
  revenue       TEXT,
  phase3_count  INT,
  rev_note      TEXT,
  recent_acq    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 3. BD deals / M&A comparables
CREATE TABLE IF NOT EXISTS public.cliniq_deals (
  id          SERIAL PRIMARY KEY,
  asset       TEXT NOT NULL,
  phase       TEXT,
  ta          TEXT,
  deal_type   TEXT,               -- 'Licensing','Acquisition','Co-Dev'
  year        INT,
  upfront     TEXT,
  total_value TEXT,
  royalty     TEXT,
  acquirer    TEXT,
  target      TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 4. Patent cliff data
CREATE TABLE IF NOT EXISTS public.cliniq_patents (
  id          SERIAL PRIMARY KEY,
  drug        TEXT NOT NULL UNIQUE,
  expiry      INT,
  revenue_bn  NUMERIC,
  color       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Row Level Security ─────────────────────────────────────────
ALTER TABLE public.cliniq_molecules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cliniq_sponsors  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cliniq_deals     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cliniq_patents   ENABLE ROW LEVEL SECURITY;

-- Allow public read (anon key can read)
CREATE POLICY "Public read" ON public.cliniq_molecules FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.cliniq_sponsors  FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.cliniq_deals     FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.cliniq_patents   FOR SELECT USING (true);

-- Service role full access (ETL writes)
CREATE POLICY "Service write" ON public.cliniq_molecules FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write" ON public.cliniq_sponsors  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write" ON public.cliniq_deals     FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write" ON public.cliniq_patents   FOR ALL USING (auth.role() = 'service_role');

-- Confirm
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'cliniq_%'
ORDER BY table_name;
