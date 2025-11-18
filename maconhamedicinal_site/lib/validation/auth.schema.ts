import { z } from 'zod';

// Custom CPF validator
const validateCPF = (cpf: string): boolean => {
  // Remove any non-digit characters
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // CPF must have exactly 11 digits
  if (cleanCPF.length !== 11) {
    return false;
  }
  
  // Check for known invalid CPFs (all digits the same)
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }
  
  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) checkDigit = 0;
  if (checkDigit !== parseInt(cleanCPF.charAt(9))) {
    return false;
  }
  
  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) checkDigit = 0;
  if (checkDigit !== parseInt(cleanCPF.charAt(10))) {
    return false;
  }
  
  return true;
};

// Custom phone validator for Brazilian format
const validatePhone = (phone: string): boolean => {
  // Remove any non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Brazilian phone numbers: country code (55) + area code (2 digits) + number (8-9 digits)
  // Total: 12-13 digits with country code, or 10-11 without
  // Format: +55 11 99999-9999 or 11 99999-9999
  
  // With country code: 12-13 digits
  if (cleanPhone.startsWith('55')) {
    return cleanPhone.length >= 12 && cleanPhone.length <= 13;
  }
  
  // Without country code: 10-11 digits
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

export const registerPatientSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
  
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(255, 'Full name is too long')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Full name contains invalid characters'),
  
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine(validatePhone, {
      message: 'Invalid phone format. Use format: +5511999999999 or 11999999999',
    }),
  
  birthdate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD')
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, 'Invalid date')
    .refine((date) => {
      const parsed = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - parsed.getFullYear();
      return age >= 18 && age <= 120;
    }, 'Patient must be at least 18 years old'),
  
  cpf: z
    .string()
    .min(1, 'CPF is required')
    .refine(validateCPF, {
      message: 'Invalid CPF format or check digits',
    }),
});

export type RegisterPatientDto = z.infer<typeof registerPatientSchema>;
