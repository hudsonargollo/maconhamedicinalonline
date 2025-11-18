import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { UserService } from '@/lib/services/user.service';
import { errorHandler } from '@/lib/errors';

/**
 * GET /api/me
 * Retrieves the authenticated user's profile including role-specific data
 * 
 * @param request - Next.js request object with Authorization header
 * @returns Response with user profile data
 */
export async function GET(request: NextRequest) {
  try {
    // Use requireAuth middleware to validate JWT token
    const user = await requireAuth(request);

    // Call userService.getUserProfile() with authenticated user ID
    const userService = new UserService();
    const profile = await userService.getUserProfile(user.id);

    // Return 200 with profile data including role-specific fields
    return NextResponse.json(profile, { status: 200 });

  } catch (error) {
    // Use errorHandler middleware for consistent error responses
    console.error('Get profile error:', error);
    return errorHandler(error as Error);
  }
}
