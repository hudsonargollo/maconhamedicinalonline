# maconhamedicinal.clubemkt.digital – Telemedicina Cannabis Medicinal

Este repositório contém toda a documentação e especificação técnica para o desenvolvimento da plataforma de telemedicina focada em **maconha medicinal** no Brasil.

- Banco de dados: **Supabase (Postgres + Auth + RLS)**
- Consultas: **Google Meet**, criado automaticamente via **Google Calendar API**
- Frontend: **Next.js + React + Tailwind + i18n (PT/EN)**
- Backend: **Next.js API routes / Supabase Edge Functions**
- Objetivo: permitir consulta online, emissão de receita médica e gestão de prontuário / consentimentos.

## Visão rápida

- `/docs/01-product-overview.md` – visão de produto, público, objetivos.
- `/docs/02-architecture.md` – arquitetura de alto nível.
- `/docs/03-db-schema.md` – schema do banco (Supabase).
- `/docs/04-api-spec.md` – especificação da API (endpoints + OpenAPI).
- `/docs/05-flows-and-integrations.md` – fluxos (agendamento, Google Meet, e‑mails).
- `/docs/06-consents-and-prescriptions.md` – detalhes de consentimento e receitas.
- `/docs/07-frontend-architecture.md` – estrutura do app Next.js.
- `/docs/08-backend-architecture.md` – funções, edge functions, integrações.
- `/docs/09-security-and-lgpd.md` – requisitos de segurança e LGPD.
- `/docs/10-project-plan-and-sprints.md` – plano de sprints para implementação.
- `/docs/99-full-documentation-extended.md` – documento completo consolidado.

## Objetivo principal

Dar uma base clara e completa para desenvolvimento (incluindo uso pelo **Kiro**) com:

- Escopo de produto bem definido.
- Fluxos principais fechados.
- Modelagem de dados pronta.
- Endpoints definidos.
- Plano de implementação por sprints.

Qualquer nova decisão de produto ou técnica deve ser registrada em `/docs`.
