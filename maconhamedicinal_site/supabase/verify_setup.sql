-- ============================================================================
-- DATABASE SETUP VERIFICATION SCRIPT
-- ============================================================================
-- Run this script in Supabase SQL Editor to verify your database setup
-- All checks should return expected results as documented below
-- ============================================================================

-- Check 1: Verify all tables exist
-- Expected: 7 tables (profiles, patients, doctors, appointments, consents, prescriptions, audit_logs)
SELECT 
  'Tables Check' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 7 THEN '✅ PASS'
    ELSE '❌ FAIL - Expected 7 tables'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'patients', 'doctors', 'appointments', 'consents', 'prescriptions', 'audit_logs');

-- Check 2: Verify RLS is enabled on all tables
-- Expected: 7 tables with RLS enabled
SELECT 
  'RLS Enabled Check' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 7 THEN '✅ PASS'
    ELSE '❌ FAIL - Expected 7 tables with RLS'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'patients', 'doctors', 'appointments', 'consents', 'prescriptions', 'audit_logs')
AND rowsecurity = true;

-- Check 3: Verify RLS policies exist
-- Expected: At least 20 policies across all tables
SELECT 
  'RLS Policies Check' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 20 THEN '✅ PASS'
    ELSE '❌ FAIL - Expected at least 20 policies'
  END as status
FROM pg_policies 
WHERE schemaname = 'public';

-- Check 4: Verify triggers exist
-- Expected: 5 triggers (one for each table with updated_at)
SELECT 
  'Triggers Check' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 5 THEN '✅ PASS'
    ELSE '❌ FAIL - Expected 5 triggers'
  END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name LIKE 'update_%_updated_at';

-- Check 5: Verify indexes exist
-- Expected: At least 9 custom indexes (plus primary keys)
SELECT 
  'Indexes Check' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 9 THEN '✅ PASS'
    ELSE '❌ FAIL - Expected at least 9 indexes'
  END as status
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%';

-- Check 6: Verify helper functions exist
-- Expected: 2 functions (update_updated_at_column, get_user_role)
SELECT 
  'Helper Functions Check' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 2 THEN '✅ PASS'
    ELSE '❌ FAIL - Expected at least 2 functions'
  END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('update_updated_at_column', 'get_user_role');

-- Check 7: Verify foreign key constraints
-- Expected: At least 10 foreign key constraints
SELECT 
  'Foreign Keys Check' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 10 THEN '✅ PASS'
    ELSE '❌ FAIL - Expected at least 10 foreign keys'
  END as status
FROM information_schema.table_constraints
WHERE constraint_schema = 'public'
AND constraint_type = 'FOREIGN KEY';

-- Check 8: Verify CHECK constraints
-- Expected: At least 7 check constraints (role, status, type fields)
SELECT 
  'Check Constraints Check' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 7 THEN '✅ PASS'
    ELSE '❌ FAIL - Expected at least 7 check constraints'
  END as status
FROM information_schema.table_constraints
WHERE constraint_schema = 'public'
AND constraint_type = 'CHECK';

-- ============================================================================
-- DETAILED BREAKDOWN (for debugging)
-- ============================================================================

-- List all tables
SELECT '=== TABLES ===' as section;
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- List all RLS policies
SELECT '=== RLS POLICIES ===' as section;
SELECT tablename, policyname, cmd as operation
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- List all triggers
SELECT '=== TRIGGERS ===' as section;
SELECT event_object_table as table_name, trigger_name
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- List all indexes
SELECT '=== INDEXES ===' as section;
SELECT tablename, indexname
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname NOT LIKE '%_pkey'
ORDER BY tablename, indexname;

-- List all foreign keys
SELECT '=== FOREIGN KEYS ===' as section;
SELECT 
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- List all check constraints
SELECT '=== CHECK CONSTRAINTS ===' as section;
SELECT 
  tc.table_name,
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints AS tc
JOIN information_schema.check_constraints AS cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT '=== VERIFICATION SUMMARY ===' as section;
SELECT 
  CASE 
    WHEN (
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('profiles', 'patients', 'doctors', 'appointments', 'consents', 'prescriptions', 'audit_logs')
    ) = 7
    AND (
      SELECT COUNT(*) FROM pg_tables 
      WHERE schemaname = 'public' 
      AND rowsecurity = true
    ) = 7
    AND (
      SELECT COUNT(*) FROM pg_policies 
      WHERE schemaname = 'public'
    ) >= 20
    AND (
      SELECT COUNT(*) FROM information_schema.triggers 
      WHERE trigger_schema = 'public'
      AND trigger_name LIKE 'update_%_updated_at'
    ) = 5
    THEN '✅ ALL CHECKS PASSED - Database setup is complete!'
    ELSE '❌ SOME CHECKS FAILED - Review the results above'
  END as overall_status;
