-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_role(uuid) IS 'Returns the role of a user from the profiles table';

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- PATIENTS POLICIES
-- ============================================================================

CREATE POLICY "Patients can view own record"
  ON patients FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Patients can update own record"
  ON patients FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Doctors can view their patients"
  ON patients FOR SELECT
  USING (
    get_user_role(auth.uid()) = 'DOCTOR' AND
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.patient_id = patients.id
      AND appointments.doctor_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all patients"
  ON patients FOR SELECT
  USING (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Admins can update all patients"
  ON patients FOR UPDATE
  USING (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Service role can insert patients"
  ON patients FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- DOCTORS POLICIES
-- ============================================================================

CREATE POLICY "Doctors can view own record"
  ON doctors FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Doctors can update own record"
  ON doctors FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Anyone authenticated can view doctor profiles"
  ON doctors FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update all doctors"
  ON doctors FOR UPDATE
  USING (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Service role can insert doctors"
  ON doctors FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- APPOINTMENTS POLICIES
-- ============================================================================

CREATE POLICY "Patients can view own appointments"
  ON appointments FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "Patients can insert own appointments"
  ON appointments FOR INSERT
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors can view own appointments"
  ON appointments FOR SELECT
  USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can update own appointments"
  ON appointments FOR UPDATE
  USING (doctor_id = auth.uid());

CREATE POLICY "Admins can view all appointments"
  ON appointments FOR SELECT
  USING (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Admins can manage all appointments"
  ON appointments FOR ALL
  USING (get_user_role(auth.uid()) = 'ADMIN');

-- ============================================================================
-- CONSENTS POLICIES
-- ============================================================================

CREATE POLICY "Patients can view own consents"
  ON consents FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "Patients can insert own consents"
  ON consents FOR INSERT
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors can view patient consents for their appointments"
  ON consents FOR SELECT
  USING (
    get_user_role(auth.uid()) = 'DOCTOR' AND
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.patient_id = consents.patient_id
      AND appointments.doctor_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all consents"
  ON consents FOR SELECT
  USING (get_user_role(auth.uid()) = 'ADMIN');

-- ============================================================================
-- PRESCRIPTIONS POLICIES
-- ============================================================================

CREATE POLICY "Patients can view own prescriptions"
  ON prescriptions FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view own prescriptions"
  ON prescriptions FOR SELECT
  USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can insert prescriptions"
  ON prescriptions FOR INSERT
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update own prescriptions"
  ON prescriptions FOR UPDATE
  USING (doctor_id = auth.uid());

CREATE POLICY "Admins can view all prescriptions"
  ON prescriptions FOR SELECT
  USING (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Admins can manage all prescriptions"
  ON prescriptions FOR ALL
  USING (get_user_role(auth.uid()) = 'ADMIN');

-- ============================================================================
-- AUDIT LOGS POLICIES
-- ============================================================================

CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  USING (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  USING (actor_user_id = auth.uid());

CREATE POLICY "Service role can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Users can view own profile" ON profiles IS 'Users can view their own profile data';
COMMENT ON POLICY "Doctors can view their patients" ON patients IS 'Doctors can view patients they have appointments with';
COMMENT ON POLICY "Anyone authenticated can view doctor profiles" ON doctors IS 'All authenticated users can view doctor profiles for booking';
COMMENT ON POLICY "Service role can insert profiles" ON profiles IS 'Service role can create profiles during registration';
