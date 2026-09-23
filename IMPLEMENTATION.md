# EduTrack AI — Implementation Guide

Este documento define **como o projeto deve ser implementado, testado, verificado e evoluído**.

Ele não substitui `SPEC.md`, `schema.prisma`, `DESIGN.md` ou `context.md`.

## 1. Fontes de verdade

Use cada arquivo para sua finalidade:

| Arquivo | Finalidade |
|---|---|
| `SPEC.md` | Requisitos, comportamento e decisões permanentes |
| `schema.prisma` | Modelo físico PostgreSQL/Prisma |
| `DESIGN.md` | Design System e regras visuais |
| `context.md` | Contexto operacional e convenções |
| `IMPLEMENTATION.md` | Processo de implementação e verificação |
| `openspec/` | Mudanças formais em andamento |
| Código/testes/migrations/infra | Estado real da implementação |

Nunca considerar uma funcionalidade implementada apenas porque ela aparece em `SPEC.md`.

---

# 2. Processo obrigatório

O processo de desenvolvimento é:

```text
TLC Specify
    ↓
Design quando necessário
    ↓
Tasks
    ↓
Execute
    ↓
Test
    ↓
Verify
```

Quando houver mudança formal de comportamento:

```text
OpenSpec Proposal
    ↓
Requirements
    ↓
Scenarios
    ↓
Design
    ↓
Tasks
    ↓
Implementation
    ↓
Tests
    ↓
Verification
    ↓
Archive
```

TLC controla a execução.

OpenSpec documenta o delta da mudança.

---

# 3. Skills do ambiente

As skills de desenvolvimento já estão disponíveis no ambiente.

Utilizar diretamente:

- TLC Spec-Driven Development
- OpenSpec

Essas ferramentas não fazem parte das dependências runtime do produto.

Não modificar o `package.json` apenas para provisionar ferramentas de desenvolvimento do agente.

---

# 4. Regra de autonomia

O agente deve trabalhar autonomamente enquanto existirem tarefas implementáveis.

Depois de concluir uma task:

```text
Verify
→ atualizar estado
→ selecionar próxima task
→ continuar
```

Não encerrar o trabalho apenas porque:

- os documentos foram lidos;
- o plano foi criado;
- uma primeira task foi concluída;
- o código compila.

O trabalho deve continuar até:

1. o MVP estar verificavelmente implementado; ou
2. existir um bloqueio real que dependa de uma decisão não definida.

---

# 5. Regra de estado real

O estado real do projeto deve ser inferido por:

```text
código
+
testes
+
migrations
+
schema
+
infraestrutura
+
configuração
+
OpenSpec
```

Classificar cada capacidade como:

```text
IMPLEMENTED
PARTIAL
MISSING
BLOCKED
CONFLICTING
```

Não inferir estado de implementação a partir de documentação isoladamente.

---

# 6. Discovery antes de implementação

Antes de criar ou alterar uma feature:

1. localizar os módulos relevantes;
2. ler os arquivos relacionados;
3. localizar testes existentes;
4. localizar schemas/DTOs;
5. localizar services/controllers/repositories;
6. localizar migrations;
7. identificar padrões já utilizados;
8. verificar OpenSpec relacionado;
9. confirmar o requisito no `SPEC.md`.

Não alterar código sem primeiro entender o padrão existente.

---

# 7. Regra de mínimo contexto

Cada task deve receber apenas o contexto necessário.

Preferir:

```text
requisito
+
cenários
+
arquivos relevantes
+
dependências
+
critérios de aceitação
+
comandos de verificação
```

Evitar fornecer:

```text
todo o SPEC
todo o repositório
todo o histórico
todos os OpenSpecs
```

quando não forem necessários.

---

# 8. Decomposição de tarefas

Não implementar grandes blocos em uma única task.

Prefira:

```text
Auth foundation
→ Access token
→ Refresh token
→ Rotation
→ Revocation
→ Authorization
```

em vez de:

```text
Implementar autenticação completa.
```

Uma task deve possuir:

- objetivo único;
- escopo delimitado;
- arquivos principais conhecidos;
- critérios de aceitação;
- verificação clara.

---

# 9. Quando decompor novamente

Se durante a execução uma task apresentar:

- muitas responsabilidades;
- múltiplos domínios;
- dependências inesperadas;
- mudanças arquiteturais;
- muitos arquivos não relacionados;
- risco elevado;

pare a implementação da task e decomponha-a novamente.

Não transformar uma task originalmente pequena em um mega-refactor.

---

# 10. Não inventar requisitos

Não inventar:

- campos;
- endpoints;
- métricas;
- enums;
- regras de negócio;
- permissões;
- Tools;
- schemas;
- comportamentos;
- integrações;
- componentes;
- arquitetura.

Quando faltar informação:

```text
verificar SPEC
→ verificar schema
→ verificar DESIGN
→ verificar context
→ verificar OpenSpec
→ verificar código existente
→ consultar documentação oficial quando necessário
```

Se ainda não houver definição suficiente:

```text
BLOCKED
```

ou criar a mudança formal apropriada.

---

# 11. Mudanças permanentes

Uma decisão que altera permanentemente o produto deve ser registrada no artefato apropriado.

Exemplos:

```text
requisito permanente → SPEC.md
modelo físico → schema.prisma
design → DESIGN.md
contexto operacional → context.md
mudança em andamento → OpenSpec
```

Não esconder decisões permanentes somente no código.

---

# 12. OpenSpec

Uma mudança OpenSpec deve representar somente o delta em relação ao estado atual.

Não duplicar `SPEC.md`.

Uma mudança deve responder:

```text
O que está mudando?
Por que está mudando?
Qual comportamento novo existe?
Quais cenários devem funcionar?
Como será implementado?
Como será verificado?
```

---

# 13. Alterações no código

Antes de alterar:

```text
read
→ understand
→ modify
→ test
```

Preferir a menor alteração necessária.

Evitar refactors não relacionados.

Não trocar uma biblioteca ou framework existente sem necessidade.

Não introduzir arquitetura paralela para resolver problema local.

---

# 14. Backend

O Backend é a autoridade para:

```text
authentication
authorization
validation
business rules
ownership
persistence
```

Frontend e Mobile não acessam PostgreSQL diretamente.

A IA também não acessa PostgreSQL diretamente.

Todas as operações persistentes passam pelo Backend.

---

# 15. Ownership e isolamento

Todo recurso pertencente ao usuário deve validar ownership no Backend.

Isso inclui, quando aplicável:

```text
users
subjects
tasks
study_sessions
conversations
messages
insights
reports
devices
notifications
```

Nunca confiar somente em:

```text
userId enviado pelo frontend
userId enviado pelo LLM
filtro do cliente
```

O contexto autenticado deve determinar o usuário autorizado.

---

# 16. API

Os contratos da API devem ser explícitos.

Cada endpoint deve definir:

```text
method
route
request
response
authentication
authorization
validation
errors
HTTP status
OpenAPI
tests
```

Não criar endpoints adicionais somente por conveniência.

---

# 17. Banco de dados

`schema.prisma` é a fonte de verdade do modelo físico.

Mudanças devem seguir:

```text
schema
→ migration
→ tests
```

Garantir:

```text
foreign keys
constraints
indexes
relations
uniqueness
cascade behavior
```

Não realizar alterações estruturais manuais sem refletir no Prisma.

---

# 18. Analytics

A arquitetura analítica é:

```text
NestJS
 ↓
Analytics Service
 ↓
FastAPI
 ↓
Pandas
 ↓
Structured Dataset
```

Responsabilidades:

```text
Backend/Analytics
→ buscar dados
→ filtrar
→ agregar
→ calcular métricas
→ preparar dataset
```

A IA interpreta o dataset.

A IA não substitui o cálculo determinístico das métricas oficiais.

---

# 19. Métricas

Implementar somente métricas formalmente especificadas.

Não criar:

```text
score novo
métrica nova
média composta
ranking novo
indicador novo
```

sem requisito formal.

As métricas oficiais devem ser calculadas deterministicamente.

---

# 20. IA — arquitetura

A arquitetura runtime é:

```text
Web / Mobile
 ↓
AI Agent API
 ↓
Agent Orchestrator
 ↓
Context Manager
 ↓
LLM Provider Adapter
 ↓
OpenRouter
 ↓
Tool Calling
 ↓
Backend / Domain / Analytics
 ↓
Structured Output
 ↓
Backend Validation
 ↓
Client
```

---

# 21. Provider Adapter

O código do Agent deve depender de uma abstração.

O Adapter deve encapsular:

```text
provider
model
messages
tool calling
structured output
timeout
retry
fallback
model tracking
prompt version
```

As regras de negócio não devem conhecer detalhes específicos do provider.

---

# 22. Runtime LLM

O runtime do MVP utiliza:

```text
Provider:
OpenRouter

Primary model:
qwen/qwen3-coder:free

Fallback:
openrouter/free
```

O modelo utilizado pelos agentes de desenvolvimento é independente do modelo runtime do produto.

Não misturar os dois conceitos.

---

# 23. Tool Calling

Fluxo obrigatório:

```text
LLM
 ↓
Tool Call
 ↓
Input Schema Validation
 ↓
Authorization
 ↓
Domain Service
 ↓
Tool Result
 ↓
LLM
```

O LLM não executa a Tool diretamente.

O Backend permanece como autoridade final.

---

# 24. Tools

Tools iniciais:

```text
create_task
list_tasks
get_task
update_task
complete_task
get_user_metrics
get_dashboard_data
generate_analysis
```

Cada Tool deve possuir:

```text
name
description
input schema
output schema
risk
permissions
authorization rules
error behavior
```

---

# 25. Ações do Agent

### Leitura

Executar após validação normal.

### Escrita explicitamente solicitada

Executar depois de:

```text
schema validation
authorization
ownership
business validation
```

### Ações destrutivas

Exigem confirmação explícita.

Nunca assumir confirmação.

---

# 26. Auditoria do Agent

Registrar execuções relevantes:

```text
user
conversation
intent
tool
input
output
status
model
prompt version
resource affected
timestamps
execution id
```

Usar `ai_tool_executions`.

Quando uma Tool altera uma entidade persistente, deve ser possível rastrear a execução responsável.

---

# 27. Structured Output

Quando um contrato estruturado existir:

```text
LLM
 ↓
Schema Validation
 ↓
Backend Validation
 ↓
Client
```

Nunca confiar diretamente no output bruto do LLM.

Respostas inválidas devem ser rejeitadas ou reprocessadas conforme a política definida.

---

# 28. AgentResponse

O Backend deve construir a resposta final com base no estado real da execução.

Não permitir que o LLM declare uma Tool como executada quando o Backend não executou essa Tool.

Informações de execução devem vir do Backend.

---

# 29. Gráficos

O Agent pode determinar:

```text
intent
metric
dimension
period
filters
grouping
visualization type
```

O gráfico deve ser representado por `ChartSpecification`.

O LLM não gera código de renderização.

---

# 30. ChartSpecification

A specification deve conter, no mínimo:

```text
type
title
description
xAxis
yAxis
series
data
filters
source
datasetVersion
```

Tipos permitidos devem ser somente os definidos pelo sistema.

Nunca aceitar código executável produzido pelo LLM.

---

# 31. Validação de gráficos

Antes de chegar ao Frontend, validar:

```text
schema
type
series
fields
dataset compatibility
value types
size limits
filters
source
dataset version
absence of executable content
```

O Frontend somente renderiza uma specification previamente validada.

---

# 32. Segurança da IA

Assumir:

```text
LLM = untrusted input
Frontend = untrusted input
Backend = authority
```

Proteger contra:

```text
prompt injection
data leakage
cross-user access
unauthorized tools
arbitrary SQL
arbitrary code execution
secret exposure
```

---

# 33. Prompts

Prompts importantes devem possuir versionamento.

Registrar:

```text
prompt id
version
purpose
schema
model requirements
security rules
```

Toda execução do Agent deve poder identificar a versão do prompt utilizada.

---

# 34. Retry e fallback

Retries devem ser limitados.

Nunca usar retry infinito.

Fallback deve respeitar:

```text
Tool Calling
Structured Output
schema compatibility
provider capabilities
```

Um fallback não pode remover uma garantia funcional necessária à operação.

---

# 35. Performance

Para APIs normais:

```text
target < 2 seconds
```

Operações pesadas devem utilizar processamento assíncrono quando necessário.

Evitar:

```text
queries repetidas
datasets gigantes
processamento síncrono pesado
```

---

# 36. Jobs assíncronos

Para processamento pesado:

```text
BullMQ
+
Redis
```

Jobs devem considerar:

```text
retry
idempotency
failure handling
status
reprocessing
```

---

# 37. Relatórios

Pipeline:

```text
Scheduler / Request
 ↓
BullMQ
 ↓
NestJS Worker
 ↓
FastAPI
 ↓
Pandas
 ↓
Metrics
 ↓
Charts
 ↓
AI Insights
 ↓
PDF
 ↓
Object Storage
 ↓
weekly_reports
```

Reprocessamento não deve gerar duplicidades.

---

# 38. Notificações

MVP:

```text
Push
FCM
```

Alerta padrão:

```text
24h antes do prazo
```

Não enviar alertas para tarefas:

```text
COMPLETED
CANCELLED
```

Respeitar `notifications_enabled`.

---

# 39. Datas

Timezone padrão:

```text
America/Sao_Paulo
```

Expressões como:

```text
hoje
amanhã
em 24 horas
```

devem considerar a timezone do usuário.

---

# 40. Web

Stack:

```text
React
TypeScript
```

Utilizar `DESIGN.md` como autoridade visual.

Operações persistentes:

```text
Web
 ↓
Backend API
```

Nunca:

```text
Web
 ↓
PostgreSQL
```

---

# 41. Mobile

Stack:

```text
React Native
TypeScript
```

Web e Mobile devem compartilhar:

```text
API
backend
regras de negócio
contratos
```

Implementar armazenamento seguro de sessão conforme a plataforma.

---

# 42. Testes

Toda feature relevante deve incluir testes adequados.

### Unit

```text
business rules
validators
calculations
analytics
authorization
```

### Integration

```text
API
Service
Prisma
PostgreSQL
```

### E2E

Cobrir os fluxos principais.

---

# 43. Testes de segurança

Testar explicitamente:

```text
cross-user access
authorization bypass
invalid Tool Calls
unauthorized Tools
prompt injection
data leakage
invalid Structured Output
arbitrary SQL attempts
executable content
```

---

# 44. Testes de IA

Testar:

```text
Tool Calling
Structured Output
fallback
timeout
retry
invalid response
missing data
invented data
invented metric
wrong chart type
incompatible dataset
chart validation
audit trail
```

---

# 45. Nunca burlar testes

Não:

```text
remover teste
skipar teste
desabilitar teste
reduzir cobertura artificialmente
alterar teste apenas para passar
```

Falhas devem ser corrigidas ou formalmente registradas.

---

# 46. Definition of Done

Uma task somente é `DONE` quando:

```text
código implementado
+
testes executados
+
lint
+
typecheck
+
build quando aplicável
+
acceptance criteria atendidos
+
verificação concluída
```

OpenSpec também deve estar atualizado quando a task fizer parte de uma mudança formal.

---

# 47. Estados das tasks

Usar:

```text
TODO
IN_PROGRESS
BLOCKED
VERIFYING
DONE
```

### TODO

Ainda não iniciada.

### IN_PROGRESS

Implementação em andamento.

### BLOCKED

Existe dependência ou decisão essencial ausente.

### VERIFYING

Implementação concluída e em validação.

### DONE

Existe evidência suficiente de que os critérios foram atendidos.

---

# 48. Bloqueios

Use `BLOCKED` quando:

- requisito essencial estiver indefinido;
- houver conflito entre fontes de verdade;
- faltar credencial necessária para uma integração real;
- existir decisão arquitetural que não possa ser inferida com segurança.

Registrar:

```text
blocker
impact
affected tasks
required decision
```

Não resolver bloqueios através de suposição.

---

# 49. Git

Preferir commits pequenos e coerentes.

Exemplos:

```text
feat(auth): implement refresh token rotation
fix(tasks): enforce ownership validation
test(analytics): add efficiency metrics coverage
feat(ai): add tool authorization pipeline
```

Evitar commits que misturam vários domínios sem necessidade.

---

# 50. Controle de escopo

Não misturar na mesma task:

```text
feature
+
refactor não relacionado
+
melhoria visual
+
infraestrutura
```

Se uma melhoria não for necessária para a task:

```text
deferred
```

e seguir.

---

# 51. Verificação independente

Para mudanças relevantes, realizar verificação independente.

Verificar:

```text
requirements
scenarios
implementation
tests
security
regressions
```

Não aceitar como evidência apenas:

```text
“implementado”
“funciona”
“build passou”
```

A evidência deve estar relacionada ao requisito.

---

# 52. Rastreamento de requisitos

Sempre que possível manter:

```text
Requirement
 ↓
OpenSpec
 ↓
TLC Task
 ↓
Code
 ↓
Test
 ↓
Verification Evidence
```

Deve ser possível responder:

```text
Por que este código existe?
Qual requisito originou?
Qual teste verifica?
Qual evidência prova?
```

---

# 53. Quando concluir uma mudança OpenSpec

Fluxo:

```text
Implementation
 ↓
Tests
 ↓
Verification
 ↓
Archive
 ↓
consolidação de mudança permanente
```

Atualizar `SPEC.md` quando a mudança representar uma nova decisão permanente.

---

# 54. Ordem preferencial de implementação

Usar dependências reais como autoridade.

Ordem inicial sugerida:

```text
Foundation
 ↓
Database / Prisma
 ↓
Auth
 ↓
Authorization
 ↓
Subjects
 ↓
Tasks
 ↓
Study Sessions
 ↓
Analytics
 ↓
Backend APIs
 ↓
Dashboard
 ↓
Web
 ↓
Mobile
 ↓
Notifications
 ↓
AI Foundation
 ↓
Tools
 ↓
Structured Output
 ↓
ChartSpecification
 ↓
Insights
 ↓
Reports
 ↓
Security Hardening
 ↓
CI/CD
 ↓
E2E
 ↓
Final Verification
```

Essa ordem pode ser alterada quando o estado real do repositório ou dependências justificarem.

---

# 55. Regra de finalização

Ao terminar uma task, registrar:

```text
STATUS
Implemented
Files changed
Tests
Verification
OpenSpec
Known limitations
Deferred
Blockers
```

Não declarar o MVP completo por ter terminado uma única task.

---

# 56. Princípio final

Priorizar nesta ordem:

```text
1. aderência à especificação
2. segurança
3. isolamento e autorização
4. simplicidade
5. testabilidade
6. rastreabilidade
7. performance
8. melhorias incrementais
```

Preferir:

```text
pequena implementação correta
```

a:

```text
grande implementação parcialmente correta
```

Preferir:

```text
decisão explícita
```

a:

```text
suposição
```

Preferir:

```text
evidência verificável
```

a:

```text
afirmação de conclusão
```