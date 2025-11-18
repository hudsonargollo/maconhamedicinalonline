# API Documentation

This document provides detailed information about the Maconha Medicinal platform API endpoints, including request/response formats, authentication requirements, and error handling.

## Base URL

```
Development: http://localhost:3000
Production: https://maconhamedicinal.clubemkt.digital
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are obtained through the registration or login endpoints and are valid for 1 hour.

## Endpoints

### POST /api/auth/register

Registers a new patient user in the system. Creates a Supabase Auth user, profile record, patient record, and audit log entry.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "patient@example.com",
  "password": "securePassword123",
  "fullName": "João Silva",
  "phone": "+5511999999999",
  "birthdate": "1990-01-15",
  "cpf": "12345678901"
}
```

**Field Descriptions:**

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `email` | string | Yes | User's email address | Valid email format |
| `password` | string | Yes | User's password | Minimum 8 characters |
| `fullName` | string | Yes | User's full name | Minimum 2 characters |
| `phone` | string | Yes | User's phone number | Format: +[country code][number] (10-15 digits) |
| `birthdate` | string | Yes | User's date of birth | ISO 8601 date format (YYYY-MM-DD) |
| `cpf` | string | Yes | Brazilian CPF number | Exactly 11 digits (numbers only) |

#### Response

**Success (200 OK):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "patient@example.com",
    "aud": "authenticated",
    "role": "authenticated",
    "created_at": "2025-01-15T10:30:00.000Z"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600,
    "expires_at": 1705318200,
    "refresh_token": "v1.MRjVpvFQ7...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "patient@example.com"
    }
  },
  "profile": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "role": "PATIENT",
    "fullName": "João Silva",
    "phone": "+5511999999999",
    "birthdate": "1990-01-15",
    "cpf": "12345678901",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request - Validation Error:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "errors": [
      {
        "code": "invalid_string",
        "message": "Invalid email format",
        "path": ["email"]
      },
      {
        "code": "too_small",
        "message": "Password must be at least 8 characters",
        "path": ["password"]
      }
    ]
  }
}
```

**409 Conflict - Email Already Exists:**
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Email already registered"
  }
}
```

**500 Internal Server Error:**
```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

#### Example Usage

**cURL:**
```bash
curl -X POST https://maconhamedicinal.clubemkt.digital/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "securePassword123",
    "fullName": "João Silva",
    "phone": "+5511999999999",
    "birthdate": "1990-01-15",
    "cpf": "12345678901"
  }'
```

**JavaScript (fetch):**
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'patient@example.com',
    password: 'securePassword123',
    fullName: 'João Silva',
    phone: '+5511999999999',
    birthdate: '1990-01-15',
    cpf: '12345678901',
  }),
});

const data = await response.json();

if (response.ok) {
  // Store the access token for future requests
  localStorage.setItem('access_token', data.session.access_token);
  console.log('Registration successful:', data.profile);
} else {
  console.error('Registration failed:', data.error);
}
```

---

### GET /api/me

Retrieves the authenticated user's profile information, including role-specific data (patient or doctor details).

#### Request

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**No request body required.**

#### Response

**Success (200 OK) - Patient:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "patient@example.com",
  "role": "PATIENT",
  "fullName": "João Silva",
  "phone": "+5511999999999",
  "birthdate": "1990-01-15",
  "cpf": "12345678901",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z",
  "patient": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "address": {
      "street": "Rua das Flores, 123",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567",
      "complement": "Apto 45"
    },
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Success (200 OK) - Doctor:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "email": "doctor@example.com",
  "role": "DOCTOR",
  "fullName": "Dr. Maria Santos",
  "phone": "+5511988888888",
  "birthdate": "1985-05-20",
  "cpf": "98765432109",
  "createdAt": "2025-01-10T08:00:00.000Z",
  "updatedAt": "2025-01-10T08:00:00.000Z",
  "doctor": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "crmNumber": "123456",
    "crmState": "SP",
    "specialty": "Neurologia",
    "bio": "Especialista em tratamentos com cannabis medicinal",
    "createdAt": "2025-01-10T08:00:00.000Z",
    "updatedAt": "2025-01-10T08:00:00.000Z"
  }
}
```

**Error Responses:**

**401 Unauthorized - Missing or Invalid Token:**
```json
{
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Unauthorized"
  }
}
```

**404 Not Found - Profile Not Found:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "User profile not found"
  }
}
```

**500 Internal Server Error:**
```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

#### Example Usage

**cURL:**
```bash
curl -X GET https://maconhamedicinal.clubemkt.digital/api/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**JavaScript (fetch):**
```javascript
const token = localStorage.getItem('access_token');

const response = await fetch('/api/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const data = await response.json();

if (response.ok) {
  console.log('User profile:', data);
  
  // Check user role and access role-specific data
  if (data.role === 'PATIENT') {
    console.log('Patient address:', data.patient.address);
  } else if (data.role === 'DOCTOR') {
    console.log('Doctor CRM:', data.doctor.crmNumber);
  }
} else {
  console.error('Failed to fetch profile:', data.error);
  
  if (response.status === 401) {
    // Token expired or invalid - redirect to login
    window.location.href = '/login';
  }
}
```

---

## Error Codes Reference

All API endpoints use consistent error codes and formats:

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Request validation failed. Check the `errors` array for details. |
| 401 | `AUTHENTICATION_ERROR` | Missing, invalid, or expired authentication token. |
| 403 | `AUTHORIZATION_ERROR` | User does not have permission to access this resource. |
| 404 | `NOT_FOUND` | Requested resource does not exist. |
| 409 | `CONFLICT` | Resource conflict (e.g., duplicate email). |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server error. Contact support if this persists. |

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Registration endpoint**: 5 requests per hour per IP address
- **Other endpoints**: 100 requests per minute per authenticated user

When rate limit is exceeded, the API returns:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 3600
  }
}
```

## Security Considerations

### Password Requirements

- Minimum 8 characters
- Passwords are hashed using bcrypt before storage
- Never send passwords in GET requests or URL parameters

### Token Security

- Store tokens securely (use httpOnly cookies or secure storage)
- Never expose tokens in URLs or logs
- Tokens expire after 1 hour - use refresh tokens to obtain new access tokens
- Implement token refresh logic before expiration

### HTTPS

- All API requests must use HTTPS in production
- HTTP requests will be automatically redirected to HTTPS

### CORS

The API implements CORS restrictions:
- Allowed origins are configured per environment
- Credentials (cookies, authorization headers) are allowed
- Preflight requests are handled automatically

## Audit Logging

All security-critical actions are logged in the audit system:

- User registration
- User login
- Profile updates
- Admin actions

Audit logs include:
- Actor user ID
- Action type
- Entity type and ID
- Timestamp
- IP address
- User agent

Logs are retained for compliance and security investigation purposes.
