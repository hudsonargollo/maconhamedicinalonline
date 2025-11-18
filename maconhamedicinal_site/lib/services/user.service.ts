import { createServiceRoleClient } from '../supabase/server';
import { ConflictError, NotFoundError } from '../errors';
import { AuditService } from './audit.service';
import type { RegisterPatientDto } from '../validation/auth.schema';
import type { Profile, Patient, Doctor, UserRole } from '@/types/database';

/**
 * Extended user profile with role-specific data
 */
export interface UserProfile extends Profile {
  email: string;
  patient?: Patient;
  doctor?: Doctor;
}

/**
 * Response from registerPatient method
 */
export interface RegisterPatientResponse {
  user: {
    id: string;
    email: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  profile: UserProfile;
}

/**
 * Service for managing user accounts and profiles
 * Handles user registration, authentication, and profile retrieval
 */
export class UserService {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  /**
   * Registers a new patient user
   * Creates Supabase Auth user, profile record, and patient record
   * 
   * @param data - Patient registration data
   * @param ipAddress - Optional IP address for audit logging
   * @param userAgent - Optional user agent for audit logging
   * @returns Promise resolving to user, session, and profile data
   * @throws ConflictError if email already exists
   * 
   * @example
   * ```typescript
   * const userService = new UserService();
   * const result = await userService.registerPatient({
   *   email: 'patient@example.com',
   *   password: 'securepass123',
   *   fullName: 'John Doe',
   *   phone: '+5511999999999',
   *   birthdate: '1990-01-01',
   *   cpf: '12345678901'
   * });
   * ```
   */
  async registerPatient(
    data: RegisterPatientDto,
    ipAddress?: string,
    userAgent?: string
  ): Promise<RegisterPatientResponse> {
    const supabase = createServiceRoleClient();

    // 1. Create Supabase Auth user with email and password
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true, // Auto-confirm email for now
    });

    if (authError) {
      // Handle duplicate email error
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        throw new ConflictError('Email is already registered');
      }
      throw new Error(`Failed to create user: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('User creation failed: no user returned');
    }

    const userId = authData.user.id;

    try {
      // 2. Insert profile record with role PATIENT
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          role: 'PATIENT' as UserRole,
          full_name: data.fullName,
          phone: data.phone,
          birthdate: data.birthdate,
          cpf: data.cpf,
        })
        .select()
        .single();

      if (profileError) {
        // Rollback: delete the auth user if profile creation fails
        await supabase.auth.admin.deleteUser(userId);
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      // 3. Insert patient record with same ID
      const { error: patientError } = await supabase
        .from('patients')
        .insert({
          id: userId,
          address: null, // Address can be added later
        });

      if (patientError) {
        // Rollback: delete the auth user and profile if patient creation fails
        await supabase.auth.admin.deleteUser(userId);
        throw new Error(`Failed to create patient record: ${patientError.message}`);
      }

      // 4. Create audit log entry for REGISTER action
      try {
        await this.auditService.log({
          actorUserId: userId,
          action: 'REGISTER',
          entityType: 'USER',
          entityId: userId,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        });
      } catch (auditError) {
        // Log audit error but don't fail the registration
        console.error('Failed to create audit log:', auditError);
      }

      // 5. Create a session for the user by signing them in
      const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (sessionError || !sessionData.session) {
        // User is created but couldn't sign in - still return success
        console.error('Failed to create session:', sessionError);
      }

      // 6. Return user profile data
      return {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
        },
        session: {
          access_token: sessionData?.session?.access_token || '',
          refresh_token: sessionData?.session?.refresh_token || '',
          expires_in: sessionData?.session?.expires_in || 3600,
        },
        profile: {
          id: profileData.id,
          email: authData.user.email!,
          role: profileData.role as UserRole,
          fullName: profileData.full_name,
          phone: profileData.phone,
          birthdate: profileData.birthdate,
          cpf: profileData.cpf,
          createdAt: profileData.created_at,
          updatedAt: profileData.updated_at,
          patient: {
            id: userId,
            address: null,
            createdAt: profileData.created_at,
            updatedAt: profileData.updated_at,
          },
        },
      };
    } catch (error) {
      // If any error occurs after user creation, attempt cleanup
      try {
        await supabase.auth.admin.deleteUser(userId);
      } catch (cleanupError) {
        console.error('Failed to cleanup user after error:', cleanupError);
      }
      throw error;
    }
  }

  /**
   * Retrieves a user's complete profile including role-specific data
   * 
   * @param userId - The user's ID
   * @returns Promise resolving to the user's profile with role-specific data
   * @throws NotFoundError if user profile is not found
   * 
   * @example
   * ```typescript
   * const userService = new UserService();
   * const profile = await userService.getUserProfile(userId);
   * if (profile.role === 'PATIENT') {
   *   console.log(profile.patient?.address);
   * }
   * ```
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    const supabase = createServiceRoleClient();

    // Query profiles table for user ID
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profileData) {
      throw new NotFoundError('User profile not found');
    }

    // Get user email from auth
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(userId);

    if (authError || !user) {
      throw new NotFoundError('User not found');
    }

    const profile: UserProfile = {
      id: profileData.id,
      email: user.email!,
      role: profileData.role as UserRole,
      fullName: profileData.full_name,
      phone: profileData.phone,
      birthdate: profileData.birthdate,
      cpf: profileData.cpf,
      createdAt: profileData.created_at,
      updatedAt: profileData.updated_at,
    };

    // Join with patients or doctors table based on role
    if (profileData.role === 'PATIENT') {
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', userId)
        .single();

      if (!patientError && patientData) {
        profile.patient = {
          id: patientData.id,
          address: patientData.address,
          createdAt: patientData.created_at,
          updatedAt: patientData.updated_at,
        };
      }
    } else if (profileData.role === 'DOCTOR') {
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', userId)
        .single();

      if (!doctorError && doctorData) {
        profile.doctor = {
          id: doctorData.id,
          crmNumber: doctorData.crm_number,
          crmState: doctorData.crm_state,
          specialty: doctorData.specialty,
          bio: doctorData.bio,
          createdAt: doctorData.created_at,
          updatedAt: doctorData.updated_at,
        };
      }
    }

    // Return combined profile data
    return profile;
  }
}
