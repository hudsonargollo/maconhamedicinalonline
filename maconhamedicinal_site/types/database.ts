// Database type definitions for Maconha Medicinal platform

export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export type AppointmentStatus =
  | 'BOOKED'
  | 'CONFIRMED'
  | 'IN_SESSION'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'CANCELLED_PATIENT'
  | 'CANCELLED_DOCTOR';

export type ConsentType = 'TELEMEDICINE_CONSENT' | 'CANNABIS_TREATMENT_TCLE';

export type PrescriptionClass = 'A' | 'B' | 'C1';

export type PrescriptionStatus = 'ISSUED' | 'PHYSICAL_SENT' | 'CANCELLED';

export interface Profile {
  id: string;
  role: UserRole;
  fullName: string;
  phone: string | null;
  birthdate: string | null;
  cpf: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    complement?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  crmNumber: string;
  crmState: string;
  specialty: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  reason: string | null;
  calendarEventId: string | null;
  meetLink: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Consent {
  id: string;
  patientId: string;
  type: ConsentType;
  version: string;
  contentSnapshot: string;
  signedAt: string;
  signerIp: string | null;
  fingerprint: string;
  createdAt: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string | null;
  classType: PrescriptionClass;
  requiresPhysicalCopy: boolean;
  status: PrescriptionStatus;
  pdfUrl: string | null;
  postalTrackingCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}
