# 07 – Frontend Architecture (Next.js)

## 7.1. Páginas Principais

- `/` – Landing page bilingue (PT/EN).
- `/blog` – lista de artigos.
- `/blog/[slug]` – artigo individual.
- `/auth/login` – login.
- `/auth/register` – registro de paciente.
- `/dashboard` – painel do paciente.
- `/doctor` – painel do médico.
- `/admin` – painel admin.
- `/consent` – página para assinatura de termos (quando necessário).
- `/verify/prescription/[id]` – página pública de verificação.

## 7.2. i18n

- Pastas:
  - `/locales/pt/landing.json`
  - `/locales/en/landing.json`
  - etc.
- Autodetecção:
  - Usa `Accept-Language` ou `navigator.language`.
  - Define idioma inicial.
  - Sempre oferecer toggle manual (PT / EN).

## 7.3. Componentes Reutilizáveis

- `Layout` (navbar + footer + switch de idioma).
- `Button`, `Input`, `Select` (com Tailwind).
- `Card`, `Modal`.
- `AppointmentCard`.
- `PrescriptionCard`.

## 7.4. Integração com Supabase

- Uso do client SDK no frontend para:
  - login/logout,
  - obter sessão atual,
  - chamadas autenticadas à API.
- Token JWT do Supabase enviado automaticamente:
  - via header `Authorization: Bearer <token>`.

