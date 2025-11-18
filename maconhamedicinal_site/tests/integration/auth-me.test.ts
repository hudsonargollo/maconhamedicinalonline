import { describe, it, expect, afterEach } from 'vitest';
import { GET } from '@/app/api/me/route';
import { createServerClient } from '@/lib/supabase/server';

describe('GET /api/me', () => {
  let testUserIds: string[] = [];

  // Cleanup test users after each test
  afterEach(async () => {
    if (testUserIds.length > 0) {
      const supabase = createServerClient();
      
      for (const userId of testUserIds) {
        try {
          const { error } = await supabase.auth.admin.deleteUser(userId);
          if (error) {
            console.error(`Failed to delete test user ${userId}:`, error);
          }
        } catch (error) {
          console.error(`Error cleaning up test user ${userId}:`, error);
        }
      }
      
      testUserIds = [];
    }
  });

  it('should retrieve patient profile successfully', async () => {
    // Arrange - Create a test patient
    const supabase = createServerClient();
    const uniqueEmail = `test-patient-${Date.now()}@example.com`;
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: uniqueEmail,
      password: 'SecurePass123!',
      email_confirm: true,
    });

    expect(authError).toBeNull();
    expect(authData.user).toBeDefined();
    
    const userId = authData.user!.id;
    testUserIds.push(userId);

    // Create profile
    await supabase.from('profiles').insert({
      id: userId,
      role: 'PATIENT',
      full_name: 'Test Patient',
      phone: '+5511999999999',
      birthdate: '1990-01-01',
      cpf: '12345678901',
    });

    // Create patient record
    await supabase.from('patients').insert({
      id: userId,
      address: {
        street: '123 Test St',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
      },
    });

    // Get session token
    const { data: sessionData } = await supabase.auth.signInWithPassword({
      email: uniqueEmail,
      password: 'SecurePass123!',
    });

    const token = sessionData.session?.access_token;
    expect(token).toBeDefined();

    // Create mock request with Authorization header
    const mockRequest = {
      headers: new Map([
        ['authorization', `Bearer ${token}`],
      ]),
    } as any;

    mockRequest.headers.get = function(key: string) {
      return this.get(key);
    };

    // Act
    const response = await GET(mockRequest);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('email');
    expect(data).toHaveProperty('role');
    expect(data.role).toBe('PATIENT');
    expect(data.fullName).toBe('Test Patient');
    expect(data).toHaveProperty('patient');
    expect(data.patient).toHaveProperty('address');
    expect(data.patient.address.city).toBe('São Paulo');
  });

  it('should retrieve doctor profile successfully', async () => {
    // Arrange - Create a test doctor
    const supabase = createServerClient();
    const uniqueEmail = `test-doctor-${Date.now()}@example.com`;
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: uniqueEmail,
      password: 'SecurePass123!',
      email_confirm: true,
    });

    expect(authError).toBeNull();
    expect(authData.user).toBeDefined();
    
    const userId = authData.user!.id;
    testUserIds.push(userId);

    // Create profile
    await supabase.from('profiles').insert({
      id: userId,
      role: 'DOCTOR',
      full_name: 'Dr. Test',
      phone: '+5511888888888',
      birthdate: '1980-01-01',
      cpf: '98765432109',
    });

    // Create doctor record
    await supabase.from('doctors').insert({
      id: userId,
      crm_number: '123456',
      crm_state: 'SP',
      specialty: 'Psychiatry',
      bio: 'Experienced psychiatrist',
    });

    // Get session token
    const { data: sessionData } = await supabase.auth.signInWithPassword({
      email: uniqueEmail,
      password: 'SecurePass123!',
    });

    const token = sessionData.session?.access_token;
    expect(token).toBeDefined();

    // Create mock request with Authorization header
    const mockRequest = {
      headers: new Map([
        ['authorization', `Bearer ${token}`],
      ]),
    } as any;

    mockRequest.headers.get = function(key: string) {
      return this.get(key);
    };

    // Act
    const response = await GET(mockRequest);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('email');
    expect(data).toHaveProperty('role');
    expect(data.role).toBe('DOCTOR');
    expect(data.fullName).toBe('Dr. Test');
    expect(data).toHaveProperty('doctor');
    expect(data.doctor.crmNumber).toBe('123456');
    expect(data.doctor.crmState).toBe('SP');
    expect(data.doctor.specialty).toBe('Psychiatry');
  });

  it('should return 401 for unauthenticated request', async () => {
    // Arrange - Create mock request without Authorization header
    const mockRequest = {
      headers: new Map(),
    } as any;

    mockRequest.headers.get = function(key: string) {
      return this.get(key);
    };

    // Act
    const response = await GET(mockRequest);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(data).toHaveProperty('error');
    expect(data.error.code).toBe('AUTHENTICATION_ERROR');
  });

  it('should return 401 for invalid token', async () => {
    // Arrange - Create mock request with invalid token
    const mockRequest = {
      headers: new Map([
        ['authorization', 'Bearer invalid-token-12345'],
      ]),
    } as any;

    mockRequest.headers.get = function(key: string) {
      return this.get(key);
    };

    // Act
    const response = await GET(mockRequest);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(data).toHaveProperty('error');
    expect(data.error.code).toBe('AUTHENTICATION_ERROR');
  });
});
