# maconhamedicinal.clubemkt.digital — Full System Documentation (EXTENDED EDITION)

## Table of Contents
1. Product Overview
2. Vision & Objectives
3. System Architecture
4. Feature Scope
5. User Personas
6. Detailed User Stories
7. Functional Requirements (FR)
8. Non-Functional Requirements (NFR)
9. Full Supabase Schema (SQL)
10. ERD (ASCII Diagram)
11. Wireframes (Text-Based)
12. API Specification (OpenAPI YAML)
13. Scheduling Flow (Google Calendar & Meet)
14. Consent System Specification
15. Prescription System Specification
16. Email Templates
17. Frontend Architecture
18. Backend Architecture
19. Security & Compliance
20. Sprint Breakdown (6 Sprints)
21. QA Checklist
22. Future Improvements

---

# 1. Product Overview
A complete telemedicine platform developed specifically for medical cannabis prescriptions in Brazil.

Purpose:
- Enable legal teleconsultation.
- Provide medical cannabis education.
- Automate Google Meet scheduling.
- Manage EMR, consents, and prescriptions.

---

# 2. Vision & Objectives
- Become the top medical cannabis portal in Brazil.
- Deliver the fastest patient onboarding flow.
- Achieve SEO dominance with PT/EN content.
- Ensure first-class clinical documentation.

---

# 3. System Architecture
Frontend: Next.js, React, Tailwind, i18n  
Backend: Next.js API routes + Supabase Edge Functions  
Database: Supabase Postgres + RLS  
Auth: Supabase Auth  
Video: Google Meet via Calendar API  
Storage: Supabase Storage  
PDF: Node PDFKit  
Email: Supabase SMTP  

---

# 4. Feature Scope
- Booking
- Telemedicine consents
- Video consult (Meet)
- EMR
- Prescriptions
- Blog CMS
- Admin panel
- Audit logging

---

# 5. User Personas
**Patient:** general public, non-technical  
**Doctor:** cannabis prescriber  
**Admin:** operations & content  

---

# 6. Detailed User Stories
- US-P1: As a patient, I want to book a consultation easily.
- US-P2: As a patient, I want to access my Meet link from a simple dashboard.
- US-P3: As a patient, I want to see and download my prescriptions.
- US-D1: As a doctor, I want to manage my availability.
- US-D2: As a doctor, I want to see my daily agenda and open each consult with one click.
- US-D3: As a doctor, I want to issue prescriptions in a safe, legally-compliant way.
- US-A1: As an admin, I want to edit blog and pages without touching code.

---

# 7. Functional Requirements (Highlights)

## FR-010 — Patient Registration
- Creates Supabase Auth user.
- Stores profile with role `PATIENT`.
- Validates email uniqueness and basic phone format.

## FR-020 — Booking
- Validates availability.
- Creates appointment record.
- Auto-confirms and triggers calendar event creation.

## FR-030 — Consents
- Blocks consultation if telemed consent missing.
- Blocks prescription if cannabis TCLE missing.

## FR-040 — Google Meet Integration
- Creates Google Calendar event with conference data.
- Patches event on reschedule.
- Deletes event on cancel.

## FR-050 — EMR
- Notes versioning.
- Attachments.
- Doctor-only visibility, except for high-level summaries if needed.

## FR-060 — Prescriptions
- Tied to a completed appointment.
- PDF with QR code pointing to verification endpoint.

---

# 8. Non-Functional Requirements
- Security: RLS, JWT, encrypted storage.
- Performance: decent LCP, fast API responses.
- Availability: aim for >99.5% uptime.
- LGPD: clear privacy policy, data export, and deletion options (within legal bounds).
- Maintainability: clean code, documented endpoints, modular design.

---

# 9. Full Supabase Schema (SQL – summarized)
(See `03-db-schema.md` for full DDL. Main tables:)

```sql
CREATE TABLE profiles (...);
CREATE TABLE patients (...);
CREATE TABLE doctors (...);
CREATE TABLE appointments (...);
CREATE TABLE consents (...);
CREATE TABLE prescriptions (...);
-- plus optional: consult_notes, blog_posts, faqs, audit_logs
```

---

# 10. ERD (ASCII Diagram)

```text
profiles (1)───(1) doctors
     │
     └───(1) patients

patients (1)───(∞) appointments ───(∞) consult_notes
                      │
                      └───(1) prescriptions

patients (1)───(∞) consents
```

---

# 11. Wireframes (Text-Based)

## Landing Page (PT/EN)

```text
[LOGO]                       [PT | EN]

H1: Consulta de Cannabis Medicinal Sem Sair de Casa
Sub: Receba orientação médica especializada e, se indicado, sua receita de forma 100% online.

[CTA PRINCIPAL] Agendar Consulta

--- Como Funciona ---
[1] Preencha seus dados
[2] Escolha horário
[3] Consulte por video
[4] Receba sua receita

--- Benefícios ---
[Cards explicando segurança, legalidade, comodidade]

--- Sobre o Médico ---
Foto | CRM | Bio resumida

--- Depoimentos (placeholder) ---

--- FAQ ---

[CTA FINAL] Quero agendar minha consulta
```

## Patient Dashboard

```text
[Topo] Olá, {Nome do Paciente}

[Próxima consulta]
- Data/hora
- Status
- Botão: [Entrar na consulta] (abre Google Meet)

[Consultas passadas]
- Lista com data, resumo, link para prescrições se existirem

[Minhas receitas]
- Lista de PDFs emitidos
```

## Doctor Dashboard

```text
[Topo] Agenda do dia – {Data}

[Lista de consultas]
09:00 – João Silva – [Abrir consulta]
10:00 – Maria Souza – [Abrir consulta]
...

Ao clicar em "Abrir consulta":
- Ver dados do paciente
- Ver histórico de consents
- Campo de notas clínicas
- Botão: [Emitir receita]
```

---

# 12. API Specification (OpenAPI YAML – Simplified)

```yaml
openapi: 3.0.0
info:
  title: Maconha Medicinal Telemed API
  version: 1.0.0
servers:
  - url: https://maconhamedicinal.clubemkt.digital

paths:
  /api/auth/register:
    post:
      summary: Register new patient
      tags: [Auth]
      responses:
        "200":
          description: OK

  /api/appointments:
    get:
      summary: List logged user appointments
      tags: [Appointments]
    post:
      summary: Create appointment
      tags: [Appointments]

  /api/doctor/appointments:
    get:
      summary: List doctor appointments
      tags: [Appointments]

  /api/prescriptions:
    post:
      summary: Create prescription
      tags: [Prescriptions]

  /api/prescriptions/{id}/pdf:
    get:
      summary: Get prescription PDF
      tags: [Prescriptions]

  /api/verify/prescription/{id}:
    get:
      summary: Verify prescription authenticity
      tags: [Public]
```

---

# 13. Scheduling Flow (Google Calendar & Meet)

1. Appointment is created with status `CONFIRMED`.
2. Edge Function is triggered with `appointment_id`.
3. Function loads doctor Google credentials.
4. Calls Google Calendar API:
   - `events.insert` with:
     - start/end times,
     - patient email as attendee,
     - `conferenceData.createRequest`.
5. Receives:
   - `event.id` → stored as `calendar_event_id`,
   - `hangoutLink` → stored as `meet_link`.
6. Emails are sent with basic details.
7. On reschedule:
   - `events.patch` with new start/end.
8. On cancel:
   - `events.delete`.

---

# 14. Consent System Specification

- Consent types:
  - TELEMEDICINE_CONSENT
  - CANNABIS_TREATMENT_TCLE
- Stored as immutable records per patient.
- Each record snapshots the content text + version.
- Fingerprint is a hash of (patient_id + content + timestamp).

Usage:
- Before first teleconsult: require telemedicine consent.
- Before first cannabis prescription: require TCLE.

---

# 15. Prescription System Specification

- Requires:
  - Completed appointment within recent X days.
  - TCLE signed.
- Doctor fills:
  - medication, dose, route, posology, duration.
  - class type (A/B/C1).
- System:
  - creates prescription record,
  - generates PDF,
  - embeds QR code with verification URL,
  - stores PDF in Storage.

---

# 16. Email Templates

## Appointment Confirmation (PT)

```text
Assunto: Sua consulta está confirmada

Olá, {{nome}},

Sua consulta de cannabis medicinal está confirmada para {{data_hora}}.

No dia e horário marcados, acesse seu painel e clique em "Entrar na consulta".

Até lá!
```

## Prescription Ready (PT)

```text
Assunto: Sua receita está disponível

Olá, {{nome}},

Sua receita médica foi emitida e está disponível no seu painel da plataforma.

Você pode fazer o download em PDF e apresentá-la à farmácia ou importadora.

Qualquer dúvida, estamos à disposição.
```

---

# 17. Frontend Architecture
(Ver `07-frontend-architecture.md` para detalhes.)

---

# 18. Backend Architecture
(Ver `08-backend-architecture.md` para detalhes.)

---

# 19. Security & Compliance
(Ver `09-security-and-lgpd.md` para detalhes.)

---

# 20. Sprint Breakdown (6 Sprints)
(Ver `10-project-plan-and-sprints.md`.)

---

# 21. QA Checklist

- [ ] Cadastro de usuário funciona (inclui criação de profile).
- [ ] Agendamento cria appointment e evento no Google Calendar.
- [ ] Link de Meet aparece corretamente para paciente e médico.
- [ ] Consentimentos são exigidos conforme regras.
- [ ] Receitas são geradas apenas para consultas concluídas.
- [ ] PDF abre corretamente e QR aponta para o endpoint público.
- [ ] RLS bloqueia acesso cruzado (um paciente não vê dados de outro).
- [ ] Logs críticos são gravados.

---

# 22. Future Improvements

- Pagamentos integrados (Pix/cartão).
- Suporte a múltiplos médicos.
- App mobile.
- Ferramentas de analytics para acompanhar eficácia das consultas e funil.

---

# END OF EXTENDED DOCUMENT
