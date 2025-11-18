-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Profiles table (extends Supabase Auth)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('PATIENT', 'DOCTOR', 'ADMIN')),
  full_name text NOT NULL,
  phone text,
  birthdate date,
  cpf text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Patients table
CREATE TABLE patients (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  address jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Doctors table
CREATE TABLE doctors (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  crm_number text NOT NULL,
  crm_state text NOT NULL CHECK (length(crm_state) = 2),
  specialty text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Appointments table
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  duration_minutes int NOT NULL DEFAULT 45,
  status text NOT NULL DEFAULT 'BOOKED' CHECK (status IN (
    'BOOKED', 'CONFIRMED', 'IN_SESSION', 'COMPLETED',
    'NO_SHOW', 'CANCELLED_PATIENT', 'CANCELLED_DOCTOR'
  )),
  reason text,
  calendar_event_id text,
  meet_link text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Consents table
CREATE TABLE consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('TELEMEDICINE_CONSENT', 'CANNABIS_TREATMENT_TCLE')),
  version text NOT NULL,
  content_snapshot text NOT NULL,
  signed_at timestamptz DEFAULT now(),
  signer_ip text,
  fingerprint text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Prescriptions table
CREATE TABLE prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  class_type text NOT NULL CHECK (class_type IN ('A', 'B', 'C1')),
  requires_physical_copy boolean DEFAULT false,
  status text NOT NULL DEFAULT 'ISSUED' CHECK (status IN ('ISSUED', 'PHYSICAL_SENT', 'CANCELLED')),
  pdf_url text,
  postal_tracking_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Audit logs table
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX idx_consents_patient_id ON consents(patient_id);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX idx_audit_logs_actor_user_id ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE profiles IS 'User profiles extending Supabase Auth with role-based information';
COMMENT ON TABLE patients IS 'Patient-specific data extending profiles';
COMMENT ON TABLE doctors IS 'Doctor-specific data extending profiles with CRM credentials';
COMMENT ON TABLE appointments IS 'Appointment scheduling with Google Calendar integration';
COMMENT ON TABLE consents IS 'Immutable consent records for legal compliance';
COMMENT ON TABLE prescriptions IS 'Medical prescription records with regulatory tracking';
COMMENT ON TABLE audit_logs IS 'Security and compliance audit trail';

COMMENT ON COLUMN profiles.role IS 'User role: PATIENT, DOCTOR, or ADMIN';
COMMENT ON COLUMN profiles.cpf IS 'Brazilian CPF document number (11 digits)';
COMMENT ON COLUMN patients.address IS 'JSONB address object with street, city, state, zipCode, complement';
COMMENT ON COLUMN doctors.crm_state IS 'Two-letter Brazilian state code for CRM registration';
COMMENT ON COLUMN appointments.status IS 'Appointment lifecycle status';
COMMENT ON COLUMN appointments.calendar_event_id IS 'Google Calendar event ID for integration';
COMMENT ON COLUMN appointments.meet_link IS 'Google Meet link for telemedicine session';
COMMENT ON COLUMN consents.type IS 'Consent type: TELEMEDICINE_CONSENT or CANNABIS_TREATMENT_TCLE';
COMMENT ON COLUMN consents.content_snapshot IS 'Immutable snapshot of consent content at signing time';
COMMENT ON COLUMN consents.fingerprint IS 'Browser fingerprint for consent verification';
COMMENT ON COLUMN prescriptions.class_type IS 'Prescription class: A (controlled), B (special), C1 (cannabis)';
COMMENT ON COLUMN prescriptions.requires_physical_copy IS 'Whether physical prescription copy must be mailed';
COMMENT ON COLUMN audit_logs.action IS 'Action performed (e.g., REGISTER, LOGIN, UPDATE_PROFILE)';
COMMENT ON COLUMN audit_logs.entity_type IS 'Type of entity affected (e.g., USER, APPOINTMENT, PRESCRIPTION)';
