import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { AuthenticationError } from '@/lib/errors';
import type { User } from '@supabase/supabase-js';

/**
 * Authentication middleware for API routes
 * Extracts and validates JWT token from Authorization header
 * 
 * @param req - Next.js request object
 * @returns Authenticated user object
 * @throws AuthenticationError if token is missing or invalid
 * 
 * @example
 * ```typescript
 * export async function GET(req: NextRequest) {
 *   const user = await requireAuth(req);
 *   // user is authenticated
 * }
 * ```
 */
export async function requireAuth(req: NextRequest): Promise<User> {
  // Extract token from Authorization header
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader) {
    throw new AuthenticationError('Missing authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  
  if (!token || token === authHeader) {
    throw new AuthenticationError('Invalid authorization header format');
  }

  // Create Supabase client and validate token
  const supabase = createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new AuthenticationError('Invalid or expired token');
  }

  return user;
}
