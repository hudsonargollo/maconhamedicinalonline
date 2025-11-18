# 03 – Database Schema (Supabase)

O banco será criado no Supabase com as seguintes tabelas principais:

- `profiles`
- `patients`
- `doctors`
- `appointments`
- `consents`
- `prescriptions`
- Opcional/Complementar:
  - `consult_notes`
  - `blog_posts`
  - `faqs`
  - `audit_logs`

## 3.1. Tabelas Principais

### profiles

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('PATIENT','DOCTOR','ADMIN')),
  full_name text NOT NULL,
  phone text,
  birthdate date,
  cpf text,
  created_at timestamptz DEFAULT now()
);
```

### patients

```sql
CREATE TABLE patients (
  id uuid PRIMARY KEY REFERENCES profiles(id),
  address jsonb,
  created_at timestamptz DEFAULT now()
);
```

### doctors

```sql
CREATE TABLE doctors (
  id uuid PRIMARY KEY REFERENCES profiles(id),
  crm_number text NOT NULL,
  crm_state text NOT NULL,
  specialty text,
  bio text,
  created_at timestamptz DEFAULT now()
);
```

### appointments

```sql
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id),
  doctor_id uuid REFERENCES doctors(id),
  scheduled_at timestamptz NOT NULL,
  duration_minutes int NOT NULL DEFAULT 45,
  status text CHECK (status IN (
    'BOOKED','CONFIRMED','IN_SESSION','COMPLETED',
    'NO_SHOW','CANCELLED_PATIENT','CANCELLED_DOCTOR'
  )),
  reason text,
  calendar_event_id text,
  meet_link text,
  created_at timestamptz DEFAULT now()
);
```

### consents

```sql
CREATE TABLE consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id),
  type text CHECK (type IN ('TELEMEDICINE_CONSENT','CANNABIS_TREATMENT_TCLE')),
  version text,
  content_snapshot text,
  signed_at timestamptz DEFAULT now(),
  signer_ip text,
  fingerprint text,
  created_at timestamptz DEFAULT now()
);
```

### prescriptions

```sql
CREATE TABLE prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id),
  doctor_id uuid REFERENCES doctors(id),
  appointment_id uuid REFERENCES appointments(id),
  class_type text CHECK (class_type IN ('A','B','C1')),
  requires_physical_copy boolean DEFAULT false,
  status text CHECK (status IN ('ISSUED','PHYSICAL_SENT','CANCELLED')),
  pdf_url text,
  postal_tracking_code text,
  created_at timestamptz DEFAULT now()
);
```

## 3.2. RLS (Resumo Conceitual)

- `profiles`
  - Usuário logado: `id = auth.uid()`.
  - Admin: acesso mais amplo.
- `patients`
  - Paciente: só seu próprio registro.
  - Médico/Admin: leituras conforme papel.
- `appointments`
  - Paciente: `patient_id` ligado ao seu `profiles.id`.
  - Médico: `doctor_id` ligado ao seu `profiles.id`.
- `prescriptions`, `consents`
  - Mesmo conceito: paciente vê o que é dele, médico/admin conforme papel.

As políticas detalhadas podem ser implementadas depois diretamente no painel do Supabase.
