import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user.service';
import { registerPatientSchema } from '@/lib/validation/auth.schema';
import { ValidationError, errorHandler } from '@/lib/errors';
import { ZodError } from 'zod';

/**
 * POST /api/auth/register
 * Registers a new patient user
 * 
 * @param request - Next.js request object
 * @returns Response with user, session, and profile data
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input using registerPatientSchema
    let validatedData;
    try {
      validatedData = registerPatientSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError('Validation failed', error.errors);
      }
      throw error;
    }

    // Extract IP address and user agent for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Call userService.registerPatient()
    const userService = new UserService();
    const result = await userService.registerPatient(
      validatedData,
      ipAddress,
      userAgent
    );

    // Return 200 response with user, session, and profile data
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    // Use errorHandler middleware for consistent error responses
    console.error('Registration error:', error);
    return errorHandler(error as Error);
  }
}
