# 02 – Architecture

## Stack Tecnológico

- **Frontend**
  - Next.js (React)
  - Tailwind CSS
  - i18n (PT/EN) com arquivos de tradução (`/locales/pt`, `/locales/en`)
- **Backend**
  - API Routes do Next.js
  - Supabase Edge Functions para tarefas de integração (Google Calendar, e‑mails em lote)
- **Banco de Dados**
  - Supabase Postgres
  - RLS (Row Level Security) para proteger dados por usuário/papel
- **Autenticação**
  - Supabase Auth (email + senha)
  - Tabela `profiles` estende informações do usuário + role
- **Vídeo / Consulta**
  - Google Meet, via events do Google Calendar com `conferenceData`
- **Armazenamento**
  - Supabase Storage para:
    - PDFs de receita,
    - anexos de prontuário.
- **E-mail**
  - Provedor SMTP compatível via Supabase / Edge Functions.

## Visão de Alto Nível

```text
[Cliente Web (Next.js)]
        |
        |  HTTPS / JSON (REST)
        v
[Next.js API Routes / Edge Functions]
        |
        +--> [Supabase Postgres + Auth + Storage]
        |
        +--> [Google Calendar API + Google Meet]
```

## Decisões Importantes de Arquitetura

- **Sem SaaS de terceiros** para agendamento/vídeo (além do Google):
  - Agendamento é controlado pelo nosso banco.
  - Link de vídeo é sempre um Google Meet gerado por evento de calendário.
- **Regra de negócio sempre no backend**:
  - Verificações como “não emitir receita sem consulta recente” devem acontecer no servidor.
  - O frontend nunca deve depender apenas de validação client-side para regras críticas.
- **Supabase com RLS como camada de segurança de dados**:
  - Paciente só acessa o que é dele (appointments, consents, prescriptions relacionados).
  - Médico acessa seus pacientes/consultas e prescrições.
  - Admin pode ter visão ampliada, com políticas específicas.
- **i18n na borda do frontend**:
  - Conteúdo PT/EN controlado por arquivos de tradução.
  - SEO específico por idioma (title/description por locale).

## Módulos Principais

- **Website / Landing**
  - Páginas públicas, SEO, blog, FAQ, sobre, etc.
- **Módulo de Agendamento**
  - Gestão de slots de agenda do médico.
  - Criação de appointments.
  - Integração com Google Calendar/Meet.
- **Módulo de Paciente**
  - Cadastro, login.
  - Painel com consultas e prescrições.
  - Gestão de consentimentos.
- **Módulo de Médico**
  - Dashboard diário.
  - Prontuário (notas, anexos).
  - Emissão de receitas.
- **Módulo Admin**
  - CMS (blog, FAQ, páginas).
  - Logs e visão geral.

