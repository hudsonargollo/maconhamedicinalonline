import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { POST } from '@/app/api/auth/register/route';
import { createServerClient } from '@/lib/supabase/server';

describe('POST /api/auth/register', () => {
  let testUserIds: string[] = [];

  // Cleanup test users after each test
  afterEach(async () => {
    if (testUserIds.length > 0) {
      const supabase = createServerClient();
      
      for (const userId of testUserIds) {
        try {
          // Delete user using admin API
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

  it('should register a new patient successfully', async () => {
    // Arrange
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const requestBody = {
      email: uniqueEmail,
      password: 'SecurePass123!',
      fullName: 'Test Patient',
      phone: '+5511999999999',
      birthdate: '1990-01-01',
      cpf: '12345678901',
    };

    const mockRequest = {
      json: async () => requestBody,
      headers: new Map([
        ['x-forwarded-for', '127.0.0.1'],
        ['user-agent', 'test-agent'],
      ]),
    } as any;

    mockRequest.headers.get = function(key: string) {
      return this.get(key);
    };

    // Act
    const response = await POST(mockRequest);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('user');
    expect(data).toHaveProperty('session');
    expect(data).toHaveProperty('profile');
    expect(data.user.email).toBe(uniqueEmail);
    expect(data.profile.role).toBe('PATIENT');
    expect(data.profile.fullName).toBe('Test Patient');

    // Store user ID for cleanup
    if (data.user?.id) {
      testUserIds.push(data.user.id);
    }

    // Verify profile record was created
    const supabase = createServerClient();
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    expect(profileError).toBeNull();
    expect(profile).toBeDefined();
    expect(profile?.role).toBe('PATIENT');

    // Verify patient record was created
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', data.user.id)
      .single();

    expect(patientError).toBeNull();
    expect(patient).toBeDefined();

    // Verify audit log entry was created
    const { data: auditLogs, error: auditError } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('actor_user_id', data.user.id)
      .eq('action', 'REGISTER');

    expect(auditError).toBeNull();
    expect(auditLogs).toBeDefined();
    expect(auditLogs?.length).toBeGreaterThan(0);
  });

  it('should return validation error for invalid email', async () => {
    // Arrange
    const requestBody = {
      email: 'invalid-email',
      password: 'SecurePass123!',
      fullName: 'Test Patient',
      phone: '+5511999999999',
      birthdate: '1990-01-01',
      cpf: '12345678901',
    };

    const mockRequest = {
      json: async () => requestBody,
      headers: new Map([
        ['x-forwarded-for', '127.0.0.1'],
        ['user-agent', 'test-agent'],
      ]),
    } as any;

    mockRequest.headers.get = function(key: string) {
      return this.get(key);
    };

    // Act
    const response = await POST(mockRequest);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return validation error for short password', async () => {
    // Arrange
    const requestBody = {
      email: `test-${Date.now()}@example.com`,
      password: 'short',
      fullName: 'Test Patient',
      phone: '+5511999999999',
      birthdate: '1990-01-01',
      cpf: '12345678901',
    };

    const mockRequest = {
      json: async () => requestBody,
      headers: new Map([
        ['x-forwarded-for', '127.0.0.1'],
        ['user-agent', 'test-agent'],
      ]),
    } as any;

    mockRequest.headers.get = function(key: string) {
      return this.get(key);
    };

    // Act
    const response = await POST(mockRequest);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return validation error for invalid phone format', async () => {
    // Arrange
    const requestBody = {
      email: `test-${Date.now()}@example.com`,
      password: 'SecurePass123!',
      fullName: 'Test Patient',
      phone: 'invalid-phone',
      birthdate: '1990-01-01',
      cpf: '12345678901',
    };

    const mockRequest = {
      json: async () => requestBody,
      headers: new Map([
        ['x-forwarded-for', '127.0.0.1'],
        ['user-agent', 'test-agent'],
      ]),
    } as any;

    mockRequest.headers.get = function(key: string) {
      return this.get(key);
    };

    // Act
    const response = await POST(mockRequest);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return conflict error for duplicate email', async () => {
    // Arrange - First registration
    const uniqueEmail = `test-duplicate-${Date.now()}@example.com`;
    const requestBody = {
      email: uniqueEmail,
      password: 'SecurePass123!',
      fullName: 'Test Patient',
      phone: '+5511999999999',
      birthdate: '1990-01-01',
      cpf: '12345678901',
    };

    const mockRequest1 = {
      json: async () => requestBody,
      headers: new Map([
        ['x-forwarded-for', '127.0.0.1'],
        ['user-agent', 'test-agent'],
      ]),
    } as any;

    mockRequest1.headers.get = function(key: string) {
      return this.get(key);
    };

    // Act - First registration
    const response1 = await POST(mockRequest1);
    const data1 = await response1.json();

    // Store user ID for cleanup
    if (data1.user?.id) {
      testUserIds.push(data1.user.id);
    }

    expect(response1.status).toBe(200);

    // Arrange - Second registration with same email
    const mockRequest2 = {
      json: async () => requestBody,
      headers: new Map([
        ['x-forwarded-for', '127.0.0.1'],
        ['user-agent', 'test-agent'],
      ]),
    } as any;

    mockRequest2.headers.get = function(key: string) {
      return this.get(key);
    };

    // Act - Second registration
    const response2 = await POST(mockRequest2);
    const data2 = await response2.json();

    // Assert
    expect(response2.status).toBe(409);
    expect(data2).toHaveProperty('error');
    expect(data2.error.code).toBe('CONFLICT');
  });
});
