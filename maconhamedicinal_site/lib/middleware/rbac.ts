import { createServerClient } from '@/lib/supabase/server';
import { AuthorizationError, NotFoundError } from '@/lib/errors';
import type { UserRole } from '@/types/database';

/**
 * Role-based access control middleware
 * Checks if the authenticated user has one of the allowed roles
 * 
 * @param userId - The authenticated user's ID
 * @param allowedRoles - Array of roles that are allowed to access the resource
 * @returns The user's role if authorized
 * @throws NotFoundError if user profile not found
 * @throws AuthorizationError if user doesn't have required role
 * 
 * @example
 * ```typescript
 * export async function GET(req: NextRequest) {
 *   const user = await requireAuth(req);
 *   await requireRole(user.id, ['ADMIN', 'DOCTOR']);
 *   // user is authorized as admin or doctor
 * }
 * ```
 */
export async function requireRole(
  userId: string,
  allowedRoles: UserRole[]
): Promise<UserRole> {
  const supabase = createServerClient();

  // Query profiles table for user role
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    throw new NotFoundError('User profile not found');
  }

  // Check if role is in allowed roles list
  if (!allowedRoles.includes(profile.role as UserRole)) {
    throw new AuthorizationError(
      `Access denied. Required roles: ${allowedRoles.join(', ')}`
    );
  }

  return profile.role as UserRole;
}
