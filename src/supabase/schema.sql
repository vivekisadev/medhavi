-- ============================================================
-- Niyomi — Supabase Database Schema
-- AI-Enabled Scholarship & Fellowship Management System
-- Ministry of Tribal Affairs (MoTA) — SIH26239
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================
-- SCHEMES TABLE
-- ========================
CREATE TABLE schemes (
  id TEXT PRIMARY KEY CHECK (id IN ('NOS', 'NFST')),
  scheme_name TEXT NOT NULL,
  description TEXT NOT NULL,
  eligibility_rules JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO schemes (id, scheme_name, description, eligibility_rules) VALUES
('NOS', 'National Overseas Scholarship',
 'Financial assistance for ST students pursuing Master''s and Ph.D. programmes at foreign universities.',
 '{"income_limit": 600000, "max_age_masters": 32, "max_age_phd": 35, "min_qualifying_marks": 55, "net_required": false, "qs_rank_required": true, "pvtg_priority": true}'::jsonb),
('NFST', 'National Fellowship for Higher Education of ST Students',
 'Fellowship for ST research scholars pursuing Ph.D. in UGC recognized Indian institutions.',
 '{"income_limit": null, "max_age_masters": null, "max_age_phd": null, "min_qualifying_marks": 55, "net_required": true, "qs_rank_required": false, "pvtg_priority": true}'::jsonb);

-- ========================
-- USERS TABLE
-- ========================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'official')),
  st_caste_name TEXT NOT NULL DEFAULT '',
  pvtg_status BOOLEAN DEFAULT FALSE,
  date_of_birth DATE,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================
-- APPLICATIONS TABLE
-- ========================
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheme_id TEXT NOT NULL REFERENCES schemes(id),
  application_no TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'ai_verified', 'deficiency_flagged', 'official_approved', 'disbursed')),
  ai_confidence_score FLOAT DEFAULT 0 CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 100),
  annual_income FLOAT,
  age INT,
  qualifying_marks FLOAT,
  university_name TEXT DEFAULT '',
  course_type TEXT DEFAULT '',
  net_qualification TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================
-- DOCUMENTS TABLE
-- ========================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('caste_cert', 'income_cert', 'admission_letter', 'net_scorecard', 'qs_rank_proof')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  quality_score INT DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
  ocr_extracted_payload JSONB DEFAULT '{}',
  is_valid BOOLEAN DEFAULT FALSE,
  defect_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================
-- AUDIT TRAIL TABLE
-- ========================
CREATE TABLE audit_trail (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  notes TEXT DEFAULT '',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================
-- INDEXES
-- ========================
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_scheme ON applications(scheme_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_documents_application ON documents(application_id);
CREATE INDEX idx_audit_application ON audit_trail(application_id);
CREATE INDEX idx_audit_timestamp ON audit_trail(timestamp DESC);

-- ========================
-- ROW LEVEL SECURITY
-- ========================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Students own applications" ON applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students own documents" ON documents FOR SELECT USING (
  application_id IN (SELECT id FROM applications WHERE user_id = auth.uid())
);

-- Students can INSERT their own profile
CREATE POLICY "Students insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
-- Students can INSERT their own applications
CREATE POLICY "Students insert own applications" ON applications FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Students can INSERT documents for their own applications
CREATE POLICY "Students insert own documents" ON documents FOR INSERT WITH CHECK (
  application_id IN (SELECT id FROM applications WHERE user_id = auth.uid())
);
-- Students can INSERT audit entries for their own applications
CREATE POLICY "Students insert own audit" ON audit_trail FOR INSERT WITH CHECK (
  application_id IN (SELECT id FROM applications WHERE user_id = auth.uid())
);

CREATE POLICY "Officials read all" ON users FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'official')
);
CREATE POLICY "Officials read all apps" ON applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'official')
);
CREATE POLICY "Officials read all docs" ON documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'official')
);
CREATE POLICY "Officials update apps" ON applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'official')
);
CREATE POLICY "Officials insert apps" ON applications FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'official')
);
CREATE POLICY "Officials insert audit" ON audit_trail FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'official')
);

-- ========================
-- AUTO-UPDATE TRIGGERS
-- ========================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_apps_updated BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
