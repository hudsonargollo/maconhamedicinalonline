# 09 – Security and LGPD

## 9.1. Segurança

- **HTTPS obrigatório** em toda a aplicação.
- **Autenticação** via Supabase Auth (JWT).
- **Autorização**:
  - validação de roles no backend.
  - uso de RLS nas tabelas.
- **Senhas**
  - tratadas e armazenadas somente pelo Supabase (hash seguro).
- **Uploads**
  - tipos de arquivo limitados (PDF, imagens).
  - tamanho máximo controlado.
  - armazenados em buckets privados no Supabase Storage.

## 9.2. LGPD

- Coleta apenas dados necessários:
  - identificação mínima,
  - contato,
  - dados clínicos relacionados ao tratamento.
- Política de privacidade clara na landing page.
- Possibilidade de:
  - exportar dados do paciente sob demanda,
  - anonimizar dados (respeitando obrigações legais de guarda de prontuário).

## 9.3. Logs e Auditoria

- Tabela `audit_logs` (sugerida) para registrar:
  - logins,
  - criação/edição de consulta,
  - criação de receita,
  - assinatura de consentimento.
- Logs contendo:
  - `actor_user_id`,
  - `action`,
  - `entity_type`,
  - `entity_id`,
  - `timestamp`,
  - `ip`.

## 9.4. Boas Práticas Adicionais

- Rotacionar segredos (chaves de API, secrets JWT, etc.).
- Minimizar dados enviados ao frontend.
- Evitar logging de dados sensíveis em texto puro.
