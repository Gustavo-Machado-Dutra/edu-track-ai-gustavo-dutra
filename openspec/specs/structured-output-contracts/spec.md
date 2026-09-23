# structured-output-contracts Specification

## Purpose
Define os contratos versionados de Structured Output (JSON Schema) para respostas estruturadas do Agent de IA, incluindo regras de validação obrigatória no Backend antes do envio ao Frontend.

## Requirements

### Requirement: Structured Output é obrigatório para respostas estruturadas do Agent
Toda resposta do Agent que contenha dados estruturados (não apenas texto livre) DEVE utilizar Structured Output com JSON Schema formal. Respostas em JSON livre sem schema NÃO SÃO PERMITIDAS quando existe contrato formal.

#### Scenario: Agent responde com Structured Output válido
- **WHEN** o Agent produz resposta estruturada
- **THEN** a resposta segue JSON Schema versionado
- **E** o Backend valida antes de encaminhar ao Frontend

#### Scenario: Agent tenta responder com JSON livre
- **WHEN** o Agent produz JSON sem seguir schema formal existindo contrato
- **THEN** o Backend REJEITA como Structured Output inválido
- **E** a resposta NÃO é encaminhada ao Frontend

### Requirement: Formato é JSON Schema com strict mode
O Structured Output DEVE utilizar JSON Schema como formato, com as seguintes configurações obrigatórias quando suportadas:
- `strict: true` (modo estrito)
- `additionalProperties: false` (propriedades adicionais proibidas)

#### Scenario: Schema com configurações obrigatórias
- **WHEN** o Backend valida Structured Output
- **THEN** o schema utilizado tem `strict: true` e `additionalProperties: false`
- **E** propriedades extras na resposta causam falha de validação

### Requirement: Validação independente no Backend (segunda camada)
O Backend DEVE realizar validação independente e obrigatória de toda resposta estruturada do Agent, independentemente de ter passado na validação do LLM via `response_format`.

#### Scenario: Backend valida independentemente
- **WHEN** resposta do Agent chega ao Backend
- **THEN** Backend executa validação JSON Schema própria
- **E** apenas se passar, a resposta é encaminhada ao Frontend

#### Scenario: Resposta passa no LLM mas falha no Backend
- **WHEN** LLM retorna objeto que passa em `response_format` mas falha na validação do Backend
- **THEN** Backend REJEITA
- **E** erro é registrado em `AIToolExecution` com status de falha de validação

### Requirement: Contratos versionados
Todos os schemas de Structured Output DEVEM ser mantidos como contratos versionados de implementação:
- Cada schema tem versão explícita (ex: `v1`, `v2`)
- Alterações comportamentais geram nova versão
- Versão é referenciada em `datasetVersion` e `promptVersion`

#### Scenario: Schema com versão explícita
- **WHEN** Backend valida Structured Output
- **THEN** utiliza schema com versão conhecida
- **E** `promptVersion` e `datasetVersion` são registrados na auditoria

### Requirement: Frontend nunca consome saída bruta do LLM
O Frontend DEVE receber apenas respostas que passaram pela validação completa do Backend. O Frontend NÃO DEVE:
- Processar saída bruta do LLM
- Tentar corrigir/parsear JSON malformado
- Confiar em campos não definidos no schema

#### Scenario: Frontend recebe apenas validado
- **WHEN** Frontend consome endpoint do Agent
- **THEN** resposta já validada pelo Backend
- **E** Frontend usa tipagem TypeScript derivada do schema

### Requirement: Schemas de resposta do Agent (exemplos de contratos)
Além do `ChartSpecification`, os seguintes contratos de resposta estruturada DEVEM ser definidos:

1. **AgentTextResponse**: Resposta textual simples do Agent
2. **AgentAnalysisResponse**: Resposta com análise + métricas + opcional ChartSpecification
3. **AgentActionResponse**: Resposta confirmando execução de Tool (criar tarefa, etc.)

#### Scenario: Contratos definidos e versionados
- **WHEN** sistema implementa Agent
- **THEN** existem JSON Schemas para cada tipo de resposta estruturada
- **E** cada schema tem versão, `strict: true`, `additionalProperties: false`
- **E** Backend valida contra schema correspondente ao tipo de resposta
