# 10 – Project Plan and Sprints

Plano pensado em 6 sprints (1–2 semanas cada).

## Sprint 1 – Fundamentos (Supabase + Auth + Schema)

- Criar projeto Supabase.
- Configurar Auth (e-mail/senha).
- Implementar schema:
  - `profiles`, `patients`, `doctors`, `appointments`, `consents`, `prescriptions`.
- Configurar RLS básica.
- Criar protótipo de `/api/auth/register`.

## Sprint 2 – Agendamento + Integração com Google Calendar/Meet

- Implementar rotas:
  - `POST /api/appointments`,
  - `GET /api/appointments`.
- Implementar tela simples de agendamento.
- Criar Edge Function `createCalendarEvent`.
- Configurar Google OAuth + armazenamento de credenciais.
- Testar criação automática de evento + Meet link.

## Sprint 3 – Painel do Paciente + Consentimentos

- Implementar `/dashboard` com:
  - lista de consultas futuras/passadas,
  - botão “Entrar na consulta” (Meet link).
- Criar fluxo de assinatura de:
  - `TELEMEDICINE_CONSENT`.
- Garantir bloqueio de consulta sem consentimento.

## Sprint 4 – Painel do Médico + EMR

- Implementar `/doctor`:
  - lista de consultas do dia.
  - acesso a detalhes do paciente.
  - inserção de notas e anexos.
- Iniciar modelagem de `consult_notes` (se necessário).

## Sprint 5 – Prescrições

- Implementar `POST /api/prescriptions`.
- Gerar PDF com QR.
- Salvar PDF em Storage.
- Implementar `/api/verify/prescription/:id`.
- Exibir receitas no painel do paciente.

## Sprint 6 – Landing, Blog, SEO e Admin Básico

- Criar landing page PT/EN com i18n.
- Implementar `/blog` + `/blog/[slug]`.
- Implementar painel `/admin` simples para:
  - criar/editar posts de blog,
  - editar FAQ e páginas estáticas.
- Ajustar meta tags de SEO.

Ao final das 6 sprints:
- Sistema pronto para operação inicial (MVP já muito sólido).
