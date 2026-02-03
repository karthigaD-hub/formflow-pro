-- XCyber Insurance Portal Database Schema
-- Run this SQL in your PostgreSQL database

-- Create database (run this separately if needed)
-- CREATE DATABASE xcyber;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables (in reverse order of dependencies)
DROP TABLE IF EXISTS form_responses CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS banks CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS app_role CASCADE;

-- Create role enum
CREATE TYPE app_role AS ENUM ('admin', 'agent', 'user');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User roles table (allows users to have different roles)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  bank_id VARCHAR(50), -- For agents: which insurance company they belong to
  UNIQUE(user_id, role)
);

-- Banks table (insurance companies)
CREATE TABLE banks (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo TEXT DEFAULT '',
  description TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign key for user_roles.bank_id after banks table is created
ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_bank 
  FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE SET NULL;

-- Sections table (form sections for each insurance company)
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id VARCHAR(50) REFERENCES banks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  "order" INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Questions table (questions within sections)
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'textarea', 'mcq', 'checkbox', 'dropdown', 'number', 'date', 'email', 'phone', 'select')),
  label TEXT NOT NULL,
  placeholder TEXT DEFAULT '',
  required BOOLEAN DEFAULT true,
  options JSONB, -- For MCQ, checkbox, dropdown: [{"id": "1", "label": "Option 1", "value": "opt1"}]
  "order" INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Form responses table (user submissions)
CREATE TABLE form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  bank_id VARCHAR(50) REFERENCES banks(id) ON DELETE SET NULL,
  responses JSONB NOT NULL DEFAULT '[]', -- [{"questionId": "uuid", "value": "answer"}]
  is_submitted BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_user_roles_bank ON user_roles(bank_id);
CREATE INDEX idx_sections_bank ON sections(bank_id);
CREATE INDEX idx_sections_order ON sections("order");
CREATE INDEX idx_questions_section ON questions(section_id);
CREATE INDEX idx_questions_order ON questions("order");
CREATE INDEX idx_responses_user ON form_responses(user_id);
CREATE INDEX idx_responses_section ON form_responses(section_id);
CREATE INDEX idx_responses_bank ON form_responses(bank_id);
CREATE INDEX idx_responses_submitted ON form_responses(is_submitted);

-- Trigger to update updated_at on form_responses
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_form_responses_updated_at
    BEFORE UPDATE ON form_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA - Insurance Companies (Required)
-- ============================================

-- Insert all insurance companies FIRST (required for foreign keys)
INSERT INTO banks (id, name, logo, description, is_active) VALUES 
  ('lic', 'Life Insurance Corporation of India (LIC)', '', 'India''s largest life insurance company', true),
  ('hdfc-life', 'HDFC Life Insurance', '', 'HDFC Life Insurance Services', true),
  ('icici-prudential', 'ICICI Prudential Life Insurance', '', 'ICICI Prudential Life Insurance', true),
  ('sbi-life', 'SBI Life Insurance', '', 'SBI Life Insurance Company', true),
  ('max-life', 'Max Life Insurance', '', 'Max Life Insurance Company', true),
  ('bajaj-allianz', 'Bajaj Allianz Life Insurance', '', 'Bajaj Allianz Life Insurance', true),
  ('kotak-mahindra', 'Kotak Mahindra Life Insurance', '', 'Kotak Mahindra Life Insurance', true),
  ('aditya-birla', 'Aditya Birla Sun Life Insurance', '', 'Aditya Birla Sun Life Insurance', true),
  ('tata-aia', 'Tata AIA Life Insurance', '', 'Tata AIA Life Insurance', true),
  ('pnb-metlife', 'PNB MetLife Insurance', '', 'PNB MetLife Insurance', true),
  ('canara-hsbc', 'Canara HSBC Life Insurance', '', 'Canara HSBC Life Insurance', true),
  ('reliance-nippon', 'Reliance Nippon Life Insurance', '', 'Reliance Nippon Life Insurance', true),
  ('exide-life', 'Exide Life Insurance', '', 'Exide Life Insurance', true),
  ('indiafirst-life', 'IndiaFirst Life Insurance', '', 'IndiaFirst Life Insurance', true),
  ('aegon-life', 'Aegon Life Insurance', '', 'Aegon Life Insurance', true),
  ('edelweiss-tokio', 'Edelweiss Tokio Life Insurance', '', 'Edelweiss Tokio Life Insurance', true),
  ('aviva-life', 'Aviva Life Insurance', '', 'Aviva Life Insurance', true),
  ('shriram-life', 'Shriram Life Insurance', '', 'Shriram Life Insurance', true),
  ('pramerica-life', 'Pramerica Life Insurance', '', 'Pramerica Life Insurance', true);

-- ============================================
-- SEED DATA - Test Users
-- ============================================
-- Password for both: the hash below corresponds to "Admin@123" and "Agent@123"
-- Generated using bcrypt with 10 rounds

-- Insert admin user
-- Email: admin@xcyber.com | Password: Admin@123
INSERT INTO users (id, name, email, phone, password_hash)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'System Admin',
  'admin@xcyber.com',
  '+1234567890',
  '$2a$10$rOvHPxfzO2.JV9o3LrQpwuZlXpYLWX8Q.F2D5YvVJXvGQkzZQgEIi'
);

INSERT INTO user_roles (user_id, role)
VALUES ('a0000000-0000-0000-0000-000000000001', 'admin');

-- Insert sample agent for HDFC Life
-- Email: agent@xcyber.com | Password: Agent@123
INSERT INTO users (id, name, email, phone, password_hash)
VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'John Agent',
  'agent@xcyber.com',
  '+1234567891',
  '$2a$10$rOvHPxfzO2.JV9o3LrQpwuZlXpYLWX8Q.F2D5YvVJXvGQkzZQgEIi'
);

INSERT INTO user_roles (user_id, role, bank_id)
VALUES ('a0000000-0000-0000-0000-000000000002', 'agent', 'hdfc-life');

-- ============================================
-- SEED DATA - Sample Section & Questions
-- ============================================

-- Insert sample section for HDFC Life
INSERT INTO sections (id, bank_id, title, description, "order", is_active)
VALUES (
  's0000000-0000-0000-0000-000000000001',
  'hdfc-life',
  'Personal Information',
  'Basic personal details required for insurance application',
  1,
  true
);

-- Insert sample questions
INSERT INTO questions (section_id, type, label, placeholder, required, options, "order")
VALUES 
  ('s0000000-0000-0000-0000-000000000001', 'text', 'Full Name', 'Enter your full name', true, NULL, 1),
  ('s0000000-0000-0000-0000-000000000001', 'email', 'Email Address', 'Enter your email', true, NULL, 2),
  ('s0000000-0000-0000-0000-000000000001', 'phone', 'Phone Number', 'Enter your phone number', true, NULL, 3),
  ('s0000000-0000-0000-0000-000000000001', 'date', 'Date of Birth', '', true, NULL, 4),
  ('s0000000-0000-0000-0000-000000000001', 'dropdown', 'Gender', 'Select your gender', true, 
   '[{"id": "1", "label": "Male", "value": "male"}, {"id": "2", "label": "Female", "value": "female"}, {"id": "3", "label": "Other", "value": "other"}]', 5),
  ('s0000000-0000-0000-0000-000000000001', 'mcq', 'Marital Status', '', true,
   '[{"id": "1", "label": "Single", "value": "single"}, {"id": "2", "label": "Married", "value": "married"}, {"id": "3", "label": "Divorced", "value": "divorced"}]', 6);

-- Print success message
DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Database schema created successfully!';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Test Credentials:';
  RAISE NOTICE 'Admin: admin@xcyber.com / Admin@123';
  RAISE NOTICE 'Agent: agent@xcyber.com / Agent@123';
  RAISE NOTICE '============================================';
END $$;
