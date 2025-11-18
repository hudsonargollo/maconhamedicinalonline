import { describe, it, expect, afterEach } from 'vitest';
import { createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

describe('RLS Policies', () => {
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

  it('should prevent patients from viewing other patients data', async () => {
    // Arrange - Create two patients
    const supabase = createServerClient();
    
    // Patient 1
    const email1 = `test-patient1-${Date.now()}@example.com`;
    const { data: authData1 } = await supabase.auth.admin.createUser({
      email: email1,
      password: 'SecurePass123!',
      email_confirm: true,
    });
    const userId1 = authData1.user!.id;
    testUserIds.push(userId1);

    await supabase.from('profiles').insert({
      id: userId1,
      role: 'PATIENT',
      full_name: 'Patient One',
      phone: '+5511999999991',
      birthdate: '1990-01-01',
      cpf: '11111111111',
    });

    await supabase.from('patients').insert({
      id: userId1,
      address: { city: 'São Paulo' },
    });

    // Patient 2
    const email2 = `test-patient2-${Date.now()}@example.com`;
    const { data: authData2 } = await supabase.auth.admin.createUser({
      email: email2,
      password: 'SecurePass123!',
      email_confirm: true,
    });
    const userId2 = authData2.user!.id;
    testUserIds.push(userId2);

    await supabase.from('profiles').insert({
      id: userId2,
      role: 'PATIENT',
      full_name: 'Patient Two',
      phone: '+5511999999992',
      birthdate: '1991-01-01',
      cpf: '22222222222',
    });

    await supabase.from('patients').insert({
      id: userId2,
      address: { city: 'Rio de Janeiro' },
    });

    // Get session for patient 1
    const { data: sessionData1 } = await supabase.auth.signInWithPassword({
      email: email1,
      password: 'SecurePass123!',
    });

    // Create client authenticated as patient 1
    const patient1Client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${sessionData1.session?.access_token}`,
          },
        },
      }
    );

    // Act - Try to query patient 2's data as patient 1
    const { data: otherPatientData, error } = await patient1Client
      .from('patients')
      .select('*')
      .eq('id', userId2)
      .single();

    // Assert - Should not be able to see other patient's data
    expect(otherPatientData).toBeNull();
    expect(error).toBeDefined();
  });

  it('should allow doctors to view their assigned patients', async () => {
    // Arrange - Create a doctor and a patient with an appointment
    const supabase = createServerClient();
    
    // Create doctor
    const doctorEmail = `test-doctor-${Date.now()}@example.com`;
    const { data: doctorAuth } = await supabase.auth.admin.createUser({
      email: doctorEmail,
      password: 'SecurePass123!',
      email_confirm: true,
    });
    const doctorId = doctorAuth.user!.id;
    testUserIds.push(doctorId);

    await supabase.from('profiles').insert({
      id: doctorId,
      role: 'DOCTOR',
      full_name: 'Dr. Test',
      phone: '+5511888888888',
      birthdate: '1980-01-01',
      cpf: '88888888888',
    });

    await supabase.from('doctors').insert({
      id: doctorId,
      crm_number: '123456',
      crm_state: 'SP',
    });

    // Create patient
    const patientEmail = `test-patient-${Date.now()}@example.com`;
    const { data: patientAuth } = await supabase.auth.admin.createUser({
      email: patientEmail,
      password: 'SecurePass123!',
      email_confirm: true,
    });
    const patientId = patientAuth.user!.id;
    testUserIds.push(patientId);

    await supabase.from('profiles').insert({
      id: patientId,
      role: 'PATIENT',
      full_name: 'Test Patient',
      phone: '+5511999999999',
      birthdate: '1990-01-01',
      cpf: '99999999999',
    });

    await supabase.from('patients').insert({
      id: patientId,
      address: { city: 'São Paulo' },
    });

    // Create appointment linking doctor and patient
    await supabase.from('appointments').insert({
      patient_id: patientId,
      doctor_id: doctorId,
      scheduled_at: new Date(Date.now() + 86400000).toISOString(),
      duration_minutes: 45,
      status: 'BOOKED',
    });

    // Get session for doctor
    const { data: doctorSession } = await supabase.auth.signInWithPassword({
      email: doctorEmail,
      password: 'SecurePass123!',
    });

    // Create client authenticated as doctor
    const doctorClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${doctorSession.session?.access_token}`,
          },
        },
      }
    );

    // Act - Doctor tries to view their assigned patient
    const { data: patientData, error } = await doctorClient
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    // Assert - Doctor should be able to see their assigned patient
    expect(error).toBeNull();
    expect(patientData).toBeDefined();
    expect(patientData?.id).toBe(patientId);
  });

  it('should allow admins to view all data', async () => {
    // Arrange - Create an admin and a patient
    const supabase = createServerClient();
    
    // Create admin
    const adminEmail = `test-admin-${Date.now()}@example.com`;
    const { data: adminAuth } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: 'SecurePass123!',
      email_confirm: true,
    });
    const adminId = adminAuth.user!.id;
    testUserIds.push(adminId);

    await supabase.from('profiles').insert({
      id: adminId,
      role: 'ADMIN',
      full_name: 'Admin User',
      phone: '+5511777777777',
      birthdate: '1985-01-01',
      cpf: '77777777777',
    });

    // Create patient
    const patientEmail = `test-patient-${Date.now()}@example.com`;
    const { data: patientAuth } = await supabase.auth.admin.createUser({
      email: patientEmail,
      password: 'SecurePass123!',
      email_confirm: true,
    });
    const patientId = patientAuth.user!.id;
    testUserIds.push(patientId);

    await supabase.from('profiles').insert({
      id: patientId,
      role: 'PATIENT',
      full_name: 'Test Patient',
      phone: '+5511999999999',
      birthdate: '1990-01-01',
      cpf: '99999999999',
    });

    await supabase.from('patients').insert({
      id: patientId,
      address: { city: 'São Paulo' },
    });

    // Get session for admin
    const { data: adminSession } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: 'SecurePass123!',
    });

    // Create client authenticated as admin
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${adminSession.session?.access_token}`,
          },
        },
      }
    );

    // Act - Admin tries to view all profiles
    const { data: allProfiles, error: profilesError } = await adminClient
      .from('profiles')
      .select('*');

    // Assert - Admin should be able to see all profiles
    expect(profilesError).toBeNull();
    expect(allProfiles).toBeDefined();
    expect(allProfiles!.length).toBeGreaterThanOrEqual(2);

    // Act - Admin tries to view all patients
    const { data: allPatients, error: patientsError } = await adminClient
      .from('patients')
      .select('*');

    // Assert - Admin should be able to see all patients
    expect(patientsError).toBeNull();
    expect(allPatients).toBeDefined();
    expect(allPatients!.length).toBeGreaterThanOrEqual(1);
  });

  it('should block unauthorized access to appointments', async () => {
    // Arrange - Create two patients and a doctor with appointment for patient 1
    const supabase = createServerClient();
    
    // Create doctor
    const doctorEmail = `test-doctor-${Date.now()}@example.com`;
    const { data: doctorAuth } = await supabase.auth.admin.createUser({
      email: doctorEmail,
      password: 'SecurePass123!',
      email_confirm: true,
    });
    const doctorId = doctorAuth.user!.id;
    testUserIds.push(doctorId);

    await supabase.from('profiles').insert({
      id: doctorId,
      role: 'DOCTOR',
      full_name: 'Dr. Test',
      phone: '+5511888888888',
      birthdate: '1980-01-01',
      cpf: '88888888888',
    });

    await supabase.from('doctors').insert({
      id: doctorId,
      crm_number: '123456',
      crm_state: 'SP',
    });

    // Create patient 1
    const patient1Email = `test-patient1-${Date.now()}@example.com`;
    const { data: patient1Auth } = await supabase.auth.admin.createUser({
      email: patient1Email,
      password: 'SecurePass123!',
      email_confirm: true,
    });
    const patient1Id = patient1Auth.user!.id;
    testUserIds.push(patient1Id);

    await supabase.from('profiles').insert({
      id: patient1Id,
      role: 'PATIENT',
      full_name: 'Patient One',
      phone: '+5511999999991',
      birthdate: '1990-01-01',
      cpf: '11111111111',
    });

    await supabase.from('patients').insert({
      id: patient1Id,
      address: { city: 'São Paulo' },
    });

    // Create patient 2
    const patient2Email = `test-patient2-${Date.now()}@example.com`;
    const { data: patient2Auth } = await supabase.auth.admin.createUser({
      email: patient2Email,
      password: 'SecurePass123!',
      email_confirm: true,
    });
    const patient2Id = patient2Auth.user!.id;
    testUserIds.push(patient2Id);

    await supabase.from('profiles').insert({
      id: patient2Id,
      role: 'PATIENT',
      full_name: 'Patient Two',
      phone: '+5511999999992',
      birthdate: '1991-01-01',
      cpf: '22222222222',
    });

    await supabase.from('patients').insert({
      id: patient2Id,
      address: { city: 'Rio de Janeiro' },
    });

    // Create appointment for patient 1
    const { data: appointment } = await supabase.from('appointments').insert({
      patient_id: patient1Id,
      doctor_id: doctorId,
      scheduled_at: new Date(Date.now() + 86400000).toISOString(),
      duration_minutes: 45,
      status: 'BOOKED',
    }).select().single();

    // Get session for patient 2
    const { data: patient2Session } = await supabase.auth.signInWithPassword({
      email: patient2Email,
      password: 'SecurePass123!',
    });

    // Create client authenticated as patient 2
    const patient2Client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${patient2Session.session?.access_token}`,
          },
        },
      }
    );

    // Act - Patient 2 tries to view patient 1's appointment
    const { data: appointmentData, error } = await patient2Client
      .from('appointments')
      .select('*')
      .eq('id', appointment!.id)
      .single();

    // Assert - Patient 2 should not be able to see patient 1's appointment
    expect(appointmentData).toBeNull();
    expect(error).toBeDefined();
  });
});
