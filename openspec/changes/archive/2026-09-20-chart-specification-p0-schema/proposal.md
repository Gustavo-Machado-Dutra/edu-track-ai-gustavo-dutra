# Proposal

## Why

O SPEC.md define que o Agent de IA deve usar Structured Output (JSON Schema) e um contrato formal `ChartSpecification` para comunicação entre Backend/Agent e Frontend. A seção 17.5 e 17.14 do SPEC marcam explicitamente que "o schema definitivo deverá ser formalizado e validado antes da implementação" como decisão **P0 pendente**. Sem este schema, não é possível implementar a validação de Structured Output no Backend, a renderização no Frontend ou a integração do Agent com Tools e gráficos.

## What Changes

- Formalizar o schema definitivo do `ChartSpecification` como contrato versionado (JSON Schema).
- Definir schemas de Structured Output para respostas do Agent (incluindo ChartSpecification).
- Estabelecer regras de validação: `strict: true`, `additionalProperties: false`, validação dupla (LLM + Backend).
- Remover a ambiguidade do exemplo conceitual atual e torná-lo em contrato testável.

## Capabilities

### New Capabilities
- `chart-specification`: Contrato oficial `ChartSpecification` entre Agent/Backend e Frontend para visualizações dinâmicas, incluindo JSON Schema, tipos de gráfico permitidos, regras de validação e exemplos válidos/inválidos.
- `structured-output-contracts`: Contratos versionados de Structured Output (JSON Schema) para respostas estruturadas do Agent, com validação obrigatória no Backend antes do envio ao Frontend.

### Modified Capabilities
- Nenhuma.

## Impact

- SPEC.md: remoção da marcação "pendente" nas seções 17.5 e 17.14 após formalização.
- Backend (NestJS): novo módulo/serviço de validação JSON Schema para Structured Output; testes de contrato.
- Frontend (React): tipos TypeScript derivados do schema; componentes de renderização orientados a `ChartSpecification`.
- OpenSpec: este change registra a decisão P0 como concluída.
