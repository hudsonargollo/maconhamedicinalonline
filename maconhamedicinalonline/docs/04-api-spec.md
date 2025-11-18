# 04 – API Specification

A API será REST, com autenticação via Supabase (JWT).  
Endpoints principais (resumo):

## 4.1. Auth

### POST `/api/auth/register`

- Cria usuário no Supabase Auth.
- Cria registro em `profiles` com role `PATIENT`.

### Login

- Feito preferencialmente via SDK do Supabase no frontend.
- Backend apenas confere `req.headers.authorization` (Bearer token).

---

## 4.2. Paciente

### GET `/api/me`

Retorna o perfil (profile + role).

### GET `/api/appointments`

Retorna lista de consultas do paciente autenticado.

### POST `/api/appointments`

Cria um agendamento:

- Valida disponibilidade.
- Salva em `appointments`.
- Dispara Edge Function para criar evento no Google Calendar e gerar Meet link.

### POST `/api/consents/sign`

Body:

```json
{
  "type": "TELEMEDICINE_CONSENT",
  "version": "v1.0",
  "content_hash": "hash-do-texto-renderizado"
}
```

Salva registro em `consents` e associa ao paciente logado.

---

## 4.3. Médico / Admin

### GET `/api/doctor/appointments`

Lista as consultas para o médico autenticado, filtradas por data (ex: `?from=...&to=...`).

### PATCH `/api/appointments/:id`

Atualiza status, horário (reagendamento), etc.  
Ao reagendar/cancelar, chama Edge Function para atualizar/deletar o evento no Google Calendar.

### POST `/api/prescriptions`

Cria uma nova receita vinculada a uma consulta.

- Valida se existe consulta COMPLETED nos últimos X dias.
- Gera PDF com QR e salva em Supabase Storage.
- Retorna metadados da receita.

### GET `/api/prescriptions/:id/pdf`

Retorna o PDF (stream ou URL assinado temporário).

### GET `/api/patients/:id`

Retorna dados de paciente e histórico (somente para médico/admin).

---

## 4.4. Verificação de Receita

### GET `/api/verify/prescription/:id`

Endpoint público para validar autenticidade de uma receita escaneando o QR.

Retorna:

```json
{
  "valid": true,
  "patient_initials": "J.S.",
  "doctor": {
    "name": "Dr. X",
    "crm": "0000 - UF"
  },
  "issued_at": "2025-01-01T10:00:00Z",
  "class_type": "C1"
}
```

---

## 4.5. OpenAPI (YAML – Esboço)

```yaml
openapi: 3.0.0
info:
  title: Maconha Medicinal API
  version: 1.0.0
servers:
  - url: https://maconhamedicinal.clubemkt.digital
paths:
  /api/auth/register:
    post:
      summary: Register new patient
      responses:
        "200":
          description: OK
  /api/appointments:
    get:
      summary: List logged user appointments
    post:
      summary: Create appointment
  /api/prescriptions:
    post:
      summary: Create prescription
  /api/verify/prescription/{id}:
    get:
      summary: Verify prescription authenticity
```
