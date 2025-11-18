# Supabase Client Utilities

This directory contains Supabase client utilities for both server-side and client-side operations.

## Usage

### Server-Side (Server Components, API Routes, Server Actions)

Use `createServerClient()` for operations that need to respect the user's session:

```typescript
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createServerClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Query data (respects RLS policies)
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id);
  
  return Response.json({ data });
}
```

### Admin Operations (Server-Side Only)

Use `createServiceRoleClient()` for operations that need to bypass Row Level Security:

```typescript
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function createUserProfile(userId: string, data: any) {
  const supabase = createServiceRoleClient();
  
  // This bypasses RLS - use with caution!
  const { data: profile, error } = await supabase
    .from('profiles')
    .insert({ id: userId, ...data })
    .select()
    .single();
  
  return profile;
}
```

⚠️ **Warning**: The service role client bypasses all Row Level Security policies. Only use it for:
- Creating user profiles during registration
- Admin operations that require elevated privileges
- Background jobs and scheduled tasks

Never expose the service role key to the client-side!

### Client-Side (Client Components, Browser)

Use `createBrowserClient()` for client-side operations:

```typescript
'use client';

import { createBrowserClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export function UserProfile() {
  const [profile, setProfile] = useState(null);
  const supabase = createBrowserClient();
  
  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setProfile(data);
      }
    }
    
    loadProfile();
  }, []);
  
  return <div>{profile?.full_name}</div>;
}
```

## Authentication Examples

### Sign Up

```typescript
const supabase = createBrowserClient();

const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});
```

### Sign In

```typescript
const supabase = createBrowserClient();

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});
```

### Sign Out

```typescript
const supabase = createBrowserClient();

await supabase.auth.signOut();
```

### Get Current User

```typescript
// Server-side
const supabase = createServerClient();
const { data: { user } } = await supabase.auth.getUser();

// Client-side
const supabase = createBrowserClient();
const { data: { user } } = await supabase.auth.getUser();
```

## Best Practices

1. **Use the right client for the context**:
   - Server Components/API Routes → `createServerClient()`
   - Client Components → `createBrowserClient()`
   - Admin operations → `createServiceRoleClient()`

2. **Never expose service role key**:
   - Only use `createServiceRoleClient()` in server-side code
   - Never send the service role key to the client

3. **Handle errors properly**:
   - Always check for errors in Supabase responses
   - Provide meaningful error messages to users

4. **Respect RLS policies**:
   - Design your RLS policies carefully
   - Test them thoroughly
   - Only bypass them when absolutely necessary

## Environment Variables

Required environment variables (set in `.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

See `SUPABASE_SETUP.md` in the project root for setup instructions.
