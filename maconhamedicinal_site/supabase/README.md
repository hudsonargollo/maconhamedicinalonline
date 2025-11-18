# Supabase Database Migrations

This directory contains all database migrations and setup scripts for the Maconha Medicinal telemedicine platform.

## Directory Structure

```
supabase/
├── migrations/
│   ├── 20250101000000_initial_schema.sql      # Core tables and indexes
│   ├── 20250101000001_updated_at_triggers.sql # Automatic timestamp triggers
│   └── 20250101000002_row_level_security.sql  # RLS policies
├── MIGRATION_GUIDE.md                          # Detailed migration instructions
├── verify_setup.sql                            # Verification script
└── README.md                                   # This file
```

## Quick Start

### 1. Run Migrations

Follow the instructions in `MIGRATION_GUIDE.md` to run the migrations in your Supabase project.

**TL;DR**: Copy and paste each migration file into the Supabase SQL Editor and run them in order.

### 2. Verify Setup

After running migrations, execute `verify_setup.sql` in the SQL Editor to confirm everything is set up correctly.

### 3. Test the Setup

Use the API endpoints to test the database:
- Register a patient: `POST /api/auth/register`
- Get profile: `GET /api/me`

## Migration Files

### 20250101000000_initial_schema.sql

Creates the core database schema:

**Tables**:
- `profiles` - User profiles extending Supabase Auth
- `patients` - Patient-specific data
- `doctors` - Doctor-specific data with CRM credentials
- `appointments` - Appointment scheduling
- `consents` - Immutable consent records
- `prescriptions` - Medical prescription records
- `audit_logs` - Security and compliance audit trail

**Features**:
- Foreign key relationships
- CHECK constraints for data validation
- Indexes for query performance
- Comprehensive comments for documentation

### 20250101000001_updated_at_triggers.sql

Implements automatic timestamp management:

**Features**:
- `update_updated_at_column()` trigger function
- Triggers on all tables with `updated_at` columns
- Automatic timestamp updates on row modifications

### 20250101000002_row_level_security.sql

Configures Row Level Security for data isolation:

**Features**:
- RLS enabled on all tables
- `get_user_role()` helper function
- Role-based access policies:
  - **Patients**: Can only view/update their own data
  - **Doctors**: Can view their patients and appointments
  - **Admins**: Full access to all data
- Service role policies for system operations

## Database Schema Overview

### User Roles

- `PATIENT` - Patients seeking medical consultation
- `DOCTOR` - Medical professionals providing consultations
- `ADMIN` - System administrators

### Key Relationships

```
auth.users (Supabase Auth)
    ↓
profiles (role, personal info)
    ↓
├── patients (address)
└── doctors (CRM, specialty)
    ↓
appointments (patient ↔ doctor)
    ↓
├── consents (patient consent records)
└── prescriptions (medical prescriptions)
```

### Data Flow

1. User registers via API → Creates `auth.users` + `profiles` + `patients`/`doctors`
2. Patient books appointment → Creates `appointments` record
3. Patient signs consent → Creates `consents` record
4. Doctor issues prescription → Creates `prescriptions` record
5. All actions logged → Creates `audit_logs` records

## Security Features

### Row Level Security (RLS)

All tables have RLS enabled with policies that enforce:
- Users can only access their own data
- Doctors can access data for their patients
- Admins have full access
- Service role can perform system operations

### Data Validation

- CHECK constraints on enum fields (role, status, type)
- Foreign key constraints for referential integrity
- NOT NULL constraints on required fields
- Length validation on specific fields (e.g., CRM state = 2 chars)

### Audit Trail

All critical operations are logged in `audit_logs`:
- User registration and authentication
- Profile updates
- Appointment creation/modification
- Prescription issuance
- Consent signing

## Performance Optimization

### Indexes

Strategic indexes on:
- Foreign keys for join performance
- Frequently queried fields (role, status, dates)
- Audit log queries (actor, timestamp)

### Query Patterns

Optimized for common queries:
- User profile lookup by ID
- Appointments by patient/doctor
- Prescriptions by patient/doctor
- Audit logs by user and date range

## Maintenance

### Adding New Migrations

1. Create a new file: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
2. Write your migration SQL
3. Test in a development environment
4. Document in this README
5. Run in production

### Rollback Strategy

- Keep all migration files in version control
- Document rollback procedures in `MIGRATION_GUIDE.md`
- Test rollbacks in development first
- Always backup before running migrations in production

## Troubleshooting

### Common Issues

1. **"permission denied for table"**
   - This is expected with RLS enabled
   - Use the service role key for admin operations
   - Use API endpoints for user operations

2. **"relation does not exist"**
   - Migrations didn't run successfully
   - Check migration order
   - Verify you're connected to the correct database

3. **"function does not exist"**
   - Helper functions migration didn't run
   - Run `20250101000002_row_level_security.sql`

See `MIGRATION_GUIDE.md` for detailed troubleshooting steps.

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Design Document](../.kiro/specs/auth-and-database-foundation/design.md)

## Support

For issues or questions:
1. Check the verification script output
2. Review the migration guide
3. Check Supabase Dashboard logs
4. Consult the design document
