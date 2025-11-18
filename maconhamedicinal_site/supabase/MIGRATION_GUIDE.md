# Database Migration Guide

This guide explains how to run and verify the database migrations for the Maconha Medicinal platform.

## Prerequisites

- Supabase project created and configured (see `SUPABASE_SETUP.md`)
- Environment variables set in `.env.local`
- Access to Supabase Dashboard

## Migration Files

The migrations are located in `supabase/migrations/` and should be run in order:

1. `20250101000000_initial_schema.sql` - Core tables and indexes
2. `20250101000001_updated_at_triggers.sql` - Automatic timestamp triggers
3. `20250101000002_row_level_security.sql` - RLS policies and helper functions

## Running Migrations

### Option 1: Using Supabase Dashboard (Recommended for First Setup)

1. Go to your Supabase project dashboard at [https://app.supabase.com](https://app.supabase.com)
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of each migration file in order:
   - First: `20250101000000_initial_schema.sql`
   - Second: `20250101000001_updated_at_triggers.sql`
   - Third: `20250101000002_row_level_security.sql`
5. Click **Run** for each migration
6. Verify there are no errors in the output

### Option 2: Using Supabase CLI (For Development)

If you have the Supabase CLI installed:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Option 3: Using psql (Advanced)

If you have direct database access:

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run each migration file
\i supabase/migrations/20250101000000_initial_schema.sql
\i supabase/migrations/20250101000001_updated_at_triggers.sql
\i supabase/migrations/20250101000002_row_level_security.sql
```

## Verification Steps

After running the migrations, verify the setup:

### 1. Verify Tables Created

In the Supabase Dashboard, go to **Table Editor** and confirm these tables exist:
- ✅ profiles
- ✅ patients
- ✅ doctors
- ✅ appointments
- ✅ consents
- ✅ prescriptions
- ✅ audit_logs

### 2. Verify RLS Enabled

Run this query in the SQL Editor:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'patients', 'doctors', 'appointments', 'consents', 'prescriptions', 'audit_logs');
```

All tables should show `rowsecurity = true`.

### 3. Verify Policies Created

Run this query to check RLS policies:

```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

You should see multiple policies for each table.

### 4. Verify Triggers

Run this query to check triggers:

```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

You should see `update_*_updated_at` triggers for profiles, patients, doctors, appointments, and prescriptions.

### 5. Verify Indexes

Run this query to check indexes:

```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

You should see indexes like `idx_profiles_role`, `idx_appointments_patient_id`, etc.

## Testing RLS Policies

### Test 1: Create a Test Patient

Run this in SQL Editor to create a test user and profile:

```sql
-- This will fail if RLS is working correctly (good!)
-- You should use the API endpoint instead
INSERT INTO profiles (id, role, full_name, phone, birthdate, cpf)
VALUES (
  gen_random_uuid(),
  'PATIENT',
  'Test Patient',
  '+5511999999999',
  '1990-01-01',
  '12345678901'
);
```

This should fail because RLS prevents direct inserts. Use the registration API endpoint instead.

### Test 2: Verify Helper Function

```sql
-- Create a test profile first via the API, then test the helper function
SELECT get_user_role('your-user-uuid-here');
```

This should return 'PATIENT', 'DOCTOR', or 'ADMIN'.

## Common Issues and Solutions

### Issue: "permission denied for table profiles"

**Solution**: This is expected! RLS is working correctly. You need to:
- Use the service role key for admin operations
- Use the API endpoints for user operations
- Authenticate users properly before database access

### Issue: "relation does not exist"

**Solution**: The migrations didn't run successfully. Check:
- You're connected to the correct database
- You ran migrations in the correct order
- There were no errors in the migration output

### Issue: "function get_user_role does not exist"

**Solution**: The RLS migration didn't run. Run `20250101000002_row_level_security.sql` again.

### Issue: Triggers not firing

**Solution**: 
- Verify triggers exist with the verification query above
- Check that the `update_updated_at_column()` function exists
- Ensure you're updating records (not inserting)

## Rollback Procedure

If you need to rollback the migrations:

```sql
-- Drop all policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
-- (repeat for all policies)

-- Drop triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
-- (repeat for all triggers)

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS get_user_role(uuid);

-- Drop tables (in reverse order of dependencies)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS prescriptions;
DROP TABLE IF EXISTS consents;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS profiles;
```

⚠️ **Warning**: This will delete all data! Only use in development.

## Next Steps

After successfully running and verifying migrations:

1. ✅ Test the registration endpoint: `POST /api/auth/register`
2. ✅ Test the profile endpoint: `GET /api/me`
3. ✅ Verify audit logs are being created
4. ✅ Test RLS policies with different user roles

## Support

If you encounter issues:
1. Check the Supabase Dashboard logs
2. Review the SQL Editor output for error messages
3. Verify your environment variables are correct
4. Check the Supabase documentation: https://supabase.com/docs
