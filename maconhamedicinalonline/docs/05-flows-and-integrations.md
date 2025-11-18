# 05 – Flows and Integrations

## 5.1. Fluxo de Agendamento + Google Calendar + Google Meet

1. Paciente escolhe data/hora no frontend.
2. Frontend chama `POST /api/appointments`.
3. Backend:
   - cria registro em `appointments` com status `BOOKED`/`CONFIRMED`;
   - envia mensagem (Edge Function) para criar evento no calendário do médico.
4. Edge Function:
   - Usa credenciais OAuth do médico (armazenadas de forma segura);
   - Cria evento no Google Calendar com `conferenceData.createRequest`;
   - Recebe `hangoutLink` (Meet) e `eventId`;
   - Atualiza registro em `appointments` com `calendar_event_id` e `meet_link`.
5. Paciente recebe:
   - E-mail de confirmação com data/hora + link para painel.
6. No painel:
   - Botão **“Entrar na consulta”** abre o `meet_link`.

Reagendamento/Cancelamento:
- Atualiza `appointments`.
- Edge Function chama `events.patch` ou `events.delete` na API do Google.

---

## 5.2. Fluxo de Consentimento

1. Paciente faz login e agenda a primeira consulta.
2. Antes de confirmar o agendamento ou antes da primeira consulta:
   - Sistema detecta se não há `TELEMEDICINE_CONSENT` assinado.
   - Exibe modal com texto do consentimento + checkbox + campo de confirmação (nome).
3. Ao confirmar:
   - Backend grava em `consents`:
     - `patient_id`,
     - `type`,
     - `version`,
     - `content_snapshot`,
     - `signed_at`,
     - `signer_ip`,
     - `fingerprint`.
4. Para TCLE de cannabis (`CANNABIS_TREATMENT_TCLE`):
   - Exigido antes da primeira receita.
   - Mesmo fluxo, possivelmente dentro do painel do paciente.

---

## 5.3. Fluxo de Emissão de Receita

1. Médico acessa consulta finalizada no painel.
2. Clica em “Emitir receita”.
3. Backend:
   - valida se:
     - consulta está `COMPLETED`,
     - existe `CANNABIS_TREATMENT_TCLE` assinado,
     - paciente possui dados mínimos (nome completo, CPF).
4. Médico preenche:
   - medicamento, dose, posologia, duração, classe (A/B/C1).
5. Ao confirmar:
   - Sistema cria registro em `prescriptions`.
   - Gera PDF:
     - dados do médico (CRM),
     - dados do paciente,
     - prescrição,
     - hash/QR apontando para `/api/verify/prescription/:id`.
   - Salva PDF no Supabase Storage.
   - Atualiza `pdf_url`.
6. Paciente recebe:
   - notificação por e-mail.
   - receita disponível no painel.

Para classe A:
- Sistema marca `requires_physical_copy = true`.
- Permite registrar código de rastreio quando o físico é postado.

---

## 5.4. Integração com E-mail

- Usar Edge Function ou serviço de e-mail do Supabase.
- Templates:
  - Confirmação de consulta.
  - Lembrete (24h / 1h).
  - Receita disponível.
- Sempre em PT, com opção de EN para usuários com idioma configurado como inglês.
