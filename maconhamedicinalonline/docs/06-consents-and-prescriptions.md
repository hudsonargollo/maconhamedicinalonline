# 06 – Consents and Prescriptions

## 6.1. Tipos de Consentimento

- `TELEMEDICINE_CONSENT`
  - Autorização para consulta médica à distância.
- `CANNABIS_TREATMENT_TCLE`
  - Termo de Consentimento Livre e Esclarecido específico para tratamento com cannabis medicinal.

Cada tipo possui:
- `version` (ex: `v1.0`, `v1.1`),
- texto integral (armazenado também em tabela de configuração ou em arquivo),
- histórico por paciente.

## 6.2. Campos Registrados em `consents`

- `patient_id`
- `type`
- `version`
- `content_snapshot` (texto congelado da versão assinada)
- `signed_at`
- `signer_ip`
- `fingerprint` (hash do conteúdo + paciente + timestamp)

## 6.3. Regras de Negócio

- Nenhuma consulta pode ser iniciada sem `TELEMEDICINE_CONSENT`.
- Nenhuma receita envolvendo cannabis pode ser emitida sem `CANNABIS_TREATMENT_TCLE`.
- Um novo consentimento pode ser exigido se a versão mudar (ex: v1.0 → v1.1).

---

## 6.4. Receitas Médicas

Classes:
- **A** – exige via física, controle rígido.
- **B** – controle intermediário.
- **C1** – geralmente associada a canabinoides em contexto medicinal.

Campos mínimos de uma receita:
- Dados do médico (nome, CRM, UF, contato).
- Dados do paciente (nome, CPF – se necessário).
- Data de emissão.
- Medicamento(s):
  - nome,
  - concentração,
  - via de administração,
  - posologia,
  - duração do tratamento.
- Assinatura (digital + QR de verificação).

## 6.5. PDF + QR Code

- O PDF da receita terá um QR code que aponta para:
  - `/api/verify/prescription/:id`
- Esse endpoint retorna:
  - se a receita é válida,
  - dados básicos para conferência.

Isso permite que:
- Farmácias,
- Pacientes,
- Autoridades de fiscalização

confiram se a receita foi realmente emitida pelo sistema.

