# Supabase Setup Guide

This guide will help you set up your Supabase project for the Maconha Medicinal telemedicine platform.

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in or create a new account
3. Click "New Project"
4. Fill in the project details:
   - **Name**: `maconhamedicinal-online` (or your preferred name)
   - **Database Password**: Choose a strong password (save this securely)
   - **Region**: Choose the closest region to your users (e.g., `South America (São Paulo)` for Brazil)
   - **Pricing Plan**: Start with the Free tier for development
5. Click "Create new project"
6. Wait for the project to be provisioned (this may take a few minutes)

## Step 2: Configure Authentication Settings

1. In your Supabase project dashboard, navigate to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled (it should be enabled by default)
3. Configure email settings:
   - Go to **Authentication** → **Email Templates**
   - Customize the email templates if needed (optional for now)
4. Configure authentication settings:
   - Go to **Authentication** → **Settings**
   - Set **Site URL** to `http://localhost:3000` for development
   - Add additional redirect URLs if needed
   - Configure password requirements:
     - Minimum password length: 8 characters (recommended)
     - Enable password strength requirements

## Step 3: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll find the following credentials:
   - **Project URL**: This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role**: This is your `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

## Step 4: Update Environment Variables

1. Open the `.env.local` file in the `maconhamedicinal_site` directory
2. Replace the placeholder values with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

3. Save the file

⚠️ **Important Security Notes:**
- Never commit `.env.local` to version control (it's already in `.gitignore`)
- Never expose the `SUPABASE_SERVICE_ROLE_KEY` to the client-side
- The `service_role` key bypasses Row Level Security - use it only in server-side code

## Step 5: Verify the Setup

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. The Supabase client utilities are now available:
   - **Server-side**: `import { createServerClient } from '@/lib/supabase/server'`
   - **Client-side**: `import { createBrowserClient } from '@/lib/supabase/client'`
   - **Admin operations**: `import { createServiceRoleClient } from '@/lib/supabase/server'`

## Next Steps

After completing this setup, you can proceed to:
1. Create the database schema and migrations (Task 2)
2. Implement TypeScript types and validation schemas (Task 3)
3. Build the authentication endpoints (Tasks 8-10)

## Troubleshooting

### Connection Issues
- Verify your API keys are correct
- Check that your Supabase project is active
- Ensure you're using the correct project URL

### Authentication Issues
- Verify the Email provider is enabled
- Check the Site URL configuration
- Review the authentication logs in Supabase dashboard

### Environment Variable Issues
- Restart your Next.js dev server after changing `.env.local`
- Verify the variable names match exactly (including `NEXT_PUBLIC_` prefix)
- Check for typos or extra spaces in the values

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
