-- Drop existing tables to ensure clean state
DROP TABLE IF EXISTS risk_assessments CASCADE;
DROP TABLE IF EXISTS risk_submissions CASCADE;
DROP TABLE IF EXISTS liquidity_snapshots CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'admin', 'risk_officer', 'employee'
  department VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Risk Submissions Table (Employee Uploads & Frontline Reports)
CREATE TABLE risk_submissions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  filename VARCHAR(255),
  file_path TEXT,
  pii_clean BOOLEAN DEFAULT false,
  submitted_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  submitted_by_name VARCHAR(150),
  status VARCHAR(50) DEFAULT 'PENDING_REVIEW', -- 'PENDING_REVIEW', 'CONFIRMED', 'REJECTED', 'ARCHIVED'
  ai_prediction JSONB,
  custom_rules_applied TEXT,
  decision_notes TEXT,
  decided_by VARCHAR(150),
  decided_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Confirmed Risk Registry Assessments
CREATE TABLE risk_assessments (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER REFERENCES risk_submissions(id) ON DELETE SET NULL,
  borrower_id VARCHAR(50) NOT NULL,
  borrower_name VARCHAR(150) NOT NULL,
  loan_amount DECIMAL(15, 2) NOT NULL,
  loan_purpose VARCHAR(100),
  loan_term_months INTEGER DEFAULT 12,
  risk_score INTEGER NOT NULL,
  risk_level VARCHAR(20) NOT NULL, -- 'Low', 'Moderate', 'High', 'Critical'
  default_probability DECIMAL(5, 2),
  recommendation VARCHAR(150),
  ai_explanation TEXT,
  assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Liquidity & Capital Snapshots
CREATE TABLE liquidity_snapshots (
  id SERIAL PRIMARY KEY,
  month_date DATE NOT NULL,
  total_capital DECIMAL(18, 2) NOT NULL,
  total_disbursed DECIMAL(18, 2) NOT NULL,
  remaining_liquidity DECIMAL(18, 2) NOT NULL,
  statutory_limit DECIMAL(18, 2) NOT NULL,
  risk_level VARCHAR(20) DEFAULT 'Low',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);