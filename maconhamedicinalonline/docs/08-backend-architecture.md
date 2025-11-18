# 08 – Backend Architecture

## 8.1. API Routes

Exemplos de rotas:

- `/api/auth/register` – cadastro de paciente.
- `/api/appointments` – GET/POST para paciente.
- `/api/doctor/appointments` – GET para médico.
- `/api/appointments/[id]` – PATCH (reagendar/cancelar).
- `/api/prescriptions` – POST emissão de receita.
- `/api/prescriptions/[id]/pdf` – GET PDF.
- `/api/verify/prescription/[id]` – GET verificação pública.

Cada rota:
- Valida token do Supabase.
- Valida role (PACIENTE, MÉDICO, ADMIN).
- Aplica regras de negócio.
- Usa Supabase Client (server-side) para ler/escrever no Postgres.

## 8.2. Edge Functions (Supabase)

Funções principais:

- `createCalendarEvent`:
  - Input: appointment_id.
  - Acessa tabela `google_credentials` do médico.
  - Cria evento no Google Calendar.
  - Salva `calendar_event_id` e `meet_link` em `appointments`.

- `updateCalendarEvent`:
  - Input: appointment_id.
  - Atualiza horário no Google Calendar.

- `deleteCalendarEvent`:
  - Input: appointment_id.
  - Deleta evento no Google Calendar se existir.

## 8.3. Integração Google OAuth

- Apenas o médico (ou conta principal da clínica) precisa conectar.
- Fluxo:
  1. Médico logado clica em “Conectar Google”.
  2. Redireciona para o consent screen do Google.
  3. Ao retornar, o backend recebe:
     - `refresh_token`,
     - `access_token`,
     - `expires_in`.
  4. Grava `refresh_token` criptografado em tabela `google_credentials`.
  5. Usa `refresh_token` para obter novos `access_token` quando necessário.

