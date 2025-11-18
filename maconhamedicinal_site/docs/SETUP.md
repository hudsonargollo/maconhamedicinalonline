# Environment Setup Guide

This guide provides step-by-step instructions for setting up the Maconha Medicinal platform development environment, including Supabase configuration, environment variables, and database migrations.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: For version control
- **Supabase Account**: Sign up at [https://supabase.com](https://supabase.com)

## Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd maconhamedicinal_site

# 2. Install dependencies
npm install

# 3. Set up environment variables (see below)
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Run database migrations (see Supabase Setup section)

# 5. Start the development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Environment Variables

### Required Variables

Create a `.env.local` file in the root of the `maconhamedicinal_site` directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Variable Descriptions

| Variable | Description | Where to Find | Required |
|----------|-------------|---------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous key for client-side operations | Supabase Dashboard → Settings → API | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for server-side admin operations | Supabase Dashboard → Settings → API | Yes |
| `NEXT_PUBLIC_APP_URL` | Base URL of your application | Local: `http://localhost:3000`<br>Production: Your domain | Yes |
| `NODE_ENV` | Environment mode | `development` or `production` | Yes |

### Security Notes

- **Never commit `.env.local` to version control** - it's already in `.gitignore`
- The `SUPABASE_SERVICE_ROLE_KEY` has admin privileges - keep it secret
- Use different Supabase projects for development, staging, and production
- Rotate keys if they are ever exposed

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in the project details:
   - **Name**: `maconhamedicinal-dev` (or your preferred name)
   - **Database Password**: Generate a strong password (save it securely)
   - **Region**: Choose the closest region to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (2-3 minutes)

### 2. Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings → API**
2. Copy the following values to your `.env.local` file:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configure Authentication

1. Go to **Authentication → Providers** in your Supabase dashboard
2. Enable **Email** provider (should be enabled by default)
3. Configure email settings:
   - **Enable email confirmations**: Disable for development, enable for production
   - **Secure email change**: Enable for production
   - **Secure password change**: Enable for production

### 4. Configure Email Templates (Optional for Development)

For production, customize the email templates:

1. Go to **Authentication → Email Templates**
2. Customize templates for:
   - Confirmation email
   - Password reset
   - Magic link

## Database Migration Process

### Understanding Migrations

The database schema is managed through SQL migration files located in `supabase/migrations/`. These files are executed in order to create and update the database schema.

### Migration Files

The project includes the following migrations:

1. **20250101000000_initial_schema.sql**
   - Creates core tables: profiles, patients, doctors, appointments, consents, prescriptions, audit_logs
   - Adds foreign key constraints and indexes
   - Sets up CHECK constraints for data validation

2. **20250101000001_updated_at_triggers.sql**
   - Creates trigger function for automatic timestamp updates
   - Applies triggers to all tables with `updated_at` columns

3. **20250101000002_row_level_security.sql**
   - Enables Row Level Security (RLS) on all tables
   - Creates helper function `get_user_role()`
   - Implements security policies for patients, doctors, and admins

### Running Migrations

#### Option 1: Using Supabase Dashboard (Recommended for Development)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of each migration file in order:
   - First: `supabase/migrations/20250101000000_initial_schema.sql`
   - Second: `supabase/migrations/20250101000001_updated_at_triggers.sql`
   - Third: `supabase/migrations/20250101000002_row_level_security.sql`
5. Click **Run** for each migration
6. Verify no errors appear in the output

#### Option 2: Using Supabase CLI (Recommended for Production)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-id
   ```

4. Push migrations:
   ```bash
   supabase db push
   ```

### Verifying Migrations

After running migrations, verify the setup:

1. Go to **SQL Editor** in Supabase dashboard
2. Run the verification script from `supabase/verify_setup.sql`:
   ```sql
   -- Check all tables exist
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;

   -- Check RLS is enabled
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';

   -- Check policies exist
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```

3. Expected output:
   - 7 tables: appointments, audit_logs, consents, doctors, patients, prescriptions, profiles
   - All tables should have `rowsecurity = true`
   - Multiple policies should exist for each table

### Migration Troubleshooting

**Error: "relation already exists"**
- The table was already created. You can safely ignore this or drop the table first.

**Error: "permission denied"**
- Ensure you're using the service role key or running migrations through the dashboard.

**Error: "function get_user_role does not exist"**
- Run the RLS migration file again, ensuring the function is created before policies.

**RLS policies not working**
- Verify RLS is enabled: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
- Check policies are created: Query `pg_policies` table
- Test with different user roles

## Database Schema Overview

### Core Tables

- **profiles**: User account information (extends Supabase Auth)
- **patients**: Patient-specific data (address, medical history)
- **doctors**: Doctor-specific data (CRM, specialty)
- **appointments**: Scheduling and telemedicine sessions
- **consents**: Legal consent records (LGPD compliance)
- **prescriptions**: Medical prescriptions with tracking
- **audit_logs**: Security and compliance audit trail

### Relationships

```
auth.users (Supabase Auth)
    ↓
profiles (role: PATIENT | DOCTOR | ADMIN)
    ↓
patients ←──┐
    ↓       │
doctors ←───┼─── appointments
            │
            ├─── consents
            │
            └─── prescriptions
```

### Row Level Security (RLS)

All tables have RLS enabled with policies that enforce:

- **Patients**: Can only view/edit their own data
- **Doctors**: Can view patients assigned to their appointments
- **Admins**: Can view/edit all data

This ensures LGPD compliance and data privacy at the database level.

## Development Workflow

### Starting Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## Production Deployment

### Environment Variables for Production

Update your `.env.local` (or configure in your hosting platform):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key
NEXT_PUBLIC_APP_URL=https://maconhamedicinal.clubemkt.digital
NODE_ENV=production
```

### Deployment Checklist

- [ ] Create separate Supabase project for production
- [ ] Run all migrations on production database
- [ ] Verify RLS policies are working
- [ ] Enable email confirmations in Supabase Auth settings
- [ ] Configure custom email templates
- [ ] Set up custom domain (if applicable)
- [ ] Configure CORS settings in Supabase
- [ ] Enable rate limiting
- [ ] Set up monitoring and error tracking
- [ ] Test authentication flow end-to-end
- [ ] Verify audit logging is working

### Recommended Hosting Platforms

- **Vercel** (Recommended for Next.js)
  - Automatic deployments from Git
  - Environment variable management
  - Edge functions support

- **Netlify**
  - Similar features to Vercel
  - Good Next.js support

- **AWS Amplify**
  - Full AWS integration
  - More configuration required

## Troubleshooting

### Common Issues

**Issue: "Invalid API key"**
- Solution: Verify your Supabase keys in `.env.local` are correct
- Check you're using the right project (dev vs prod)

**Issue: "CORS error"**
- Solution: Add your domain to allowed origins in Supabase dashboard
- Go to Settings → API → CORS

**Issue: "Row Level Security policy violation"**
- Solution: Check that RLS policies are properly configured
- Verify user has correct role in profiles table
- Test policies using Supabase SQL Editor

**Issue: "Cannot connect to database"**
- Solution: Check Supabase project is running
- Verify network connectivity
- Check database password is correct

**Issue: "Migration failed"**
- Solution: Check migration file syntax
- Ensure migrations run in correct order
- Drop and recreate tables if needed (development only)

### Getting Help

- **Documentation**: See `docs/` folder for detailed guides
- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **GitHub Issues**: Report bugs and request features

## Additional Resources

- [API Documentation](./API.md) - Detailed API endpoint documentation
- [Supabase Migration Guide](../supabase/MIGRATION_GUIDE.md) - Database migration details
- [Supabase README](../supabase/README.md) - Database schema documentation
- [Project Architecture](../../maconhamedicinalonline/docs/02-architecture.md) - System architecture overview

## Next Steps

After completing the setup:

1. Test the registration endpoint: `POST /api/auth/register`
2. Test the profile endpoint: `GET /api/me`
3. Explore the database schema in Supabase dashboard
4. Review the API documentation in `docs/API.md`
5. Start building your frontend components
