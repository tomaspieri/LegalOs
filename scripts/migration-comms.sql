-- Run this in the Supabase SQL editor to add communications tables

CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT NOT NULL CHECK (status IN ('completed', 'missed', 'voicemail', 'busy')),
  duration_seconds INTEGER,
  started_at TIMESTAMPTZ NOT NULL,
  recording_url TEXT,
  transcript TEXT,
  external_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL,
  external_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS call_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS calls_case_id_idx ON calls(case_id);
CREATE INDEX IF NOT EXISTS calls_firm_id_idx ON calls(firm_id);
CREATE INDEX IF NOT EXISTS calls_started_at_idx ON calls(started_at DESC);
CREATE INDEX IF NOT EXISTS messages_case_id_idx ON messages(case_id);
CREATE INDEX IF NOT EXISTS messages_firm_id_idx ON messages(firm_id);
CREATE INDEX IF NOT EXISTS messages_sent_at_idx ON messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS call_summaries_call_id_idx ON call_summaries(call_id);
