# EduTrack AI — Especificação Técnica

> Revisão orientada a runtime LLM: OpenRouter + Qwen3 Coder 480B A35B.
> Compatibilidade do modelo, Tool Calling e Structured Outputs verificada na documentação atual do OpenRouter em 20/09/2026. O comportamento do produto continua desacoplado do provider por meio do `LLM Provider Adapter`.

> Documento oficial de especificação do projeto.
>
> Este arquivo consolida a visão geral, requisitos, arquitetura, decisões técnicas e o modelo lógico de dados. O arquivo `schema.prisma` permanece separado e é a fonte de verdade do modelo físico Prisma/PostgreSQL. `DESIGN.md` permanece separado como fonte de verdade do Design System.

## 1. Visão Geral

O **EduTrack AI** é uma aplicação Web e Mobile para organização acadêmica. O sistema permite cadastrar disciplinas, registrar tarefas, acompanhar entregas, registrar sessões de estudo, visualizar métricas e receber análises personalizadas por IA.

O sistema também possui um Agente de IA integrado capaz de gerar insights e análises personalizadas, auxiliar o usuário e executar ações autorizadas, incluindo a criação de tarefas solicitadas pelo usuário.

### Princípios fundamentais

1. Frontend e Mobile não acessam diretamente o PostgreSQL.
2. A IA não acessa diretamente o PostgreSQL.
3. Regras de negócio e cálculos críticos são determinísticos.
4. Python/Pandas é responsável pelo processamento e preparação de dados analíticos.
5. A IA interpreta dados estruturados e gera insights, análises e recomendações.
6. Ações da IA passam por Tools controladas pelo Backend.
7. Ações realizadas pelo Agente são auditáveis.
8. Web e Mobile utilizam a mesma API e regras de negócio.
9. Dados enviados ao modelo devem respeitar minimização, autorização e privacidade.

> **Dados são calculados deterministicamente pelo sistema; IA interpreta os dados; Frontend apresenta os resultados.**

---

## 2. Escopo do MVP

O MVP possui um único perfil funcional: **Student/User**.

Cada usuário possui seus próprios:

* dados;
* disciplinas;
* tarefas;
* sessões de estudo;
* notificações;
* conversas com IA;
* insights;
* relatórios.

Nenhum usuário poderá acessar dados pertencentes a outro usuário.

RBAC poderá ser adicionado posteriormente caso seja necessário um perfil administrativo.

---

## 3. Protótipo Oficial de Frontend

O único protótipo oficial é:

`https://stitch.withgoogle.com/projects/13596816261153646269`

O protótipo orienta a composição das telas, estrutura da interface e fluxos de navegação.

Não utilizar outros projetos do Google Stitch como referência oficial.

As regras visuais, tokens, componentes, tipografia, cores, espaçamentos, responsividade e acessibilidade são definidas pelo **Cyber-Academic System** em `DESIGN.md`.

---

## 4. Arquitetura

```text
                         Usuário

             ┌────────────┴────────────┐
             │                         │
         React Web              React Native
             │                         │
             └────────────┬────────────┘
                          │ HTTPS
                          ▼
                   NestJS + Fastify
                     Backend API
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
   Domain Services   Analytics Service   AI Agent
          │               │                │
          │               ▼                │
          │        Python Data Service     │
          │               │                │
          │             Pandas             │
          │               │                │
          └───────────────┼────────────────┘
                          │
                          ▼
                     PostgreSQL
                          ▲
                        Prisma

AI Agent
   │
   ▼
LLM Provider
```

### Camadas

**Clientes:** interface, navegação, estado, comunicação com API, sessão e apresentação.

**Backend:** autenticação, autorização, validação, regras de negócio, persistência, consultas, integrações, logs e tratamento de erros.

**Analytics:** consultas analíticas, filtros, agregações, métricas, séries temporais, comparações, preparação/normalização e validação de datasets.

**Python/Pandas:** processamento analítico, preparação de datasets, séries temporais, agregações, comparação por dificuldade, preparação para IA e geração de relatórios PDF.

**IA:** interpretação, insights, análises personalizadas, contextualização, recomendações e execução de ações autorizadas.

O **Analytics Service não deve permitir acesso direto e irrestrito ao banco pela IA**. Os dados enviados ao serviço analítico devem respeitar os limites de autorização do usuário e os contratos internos definidos entre os serviços.

---

## 5. Stack Tecnológica

| Camada                        | Tecnologia                |
| ----------------------------- | ------------------------- |
| Web                           | React + TypeScript        |
| Mobile                        | React Native + TypeScript |
| Runtime Backend               | Node.js                   |
| Backend                       | NestJS                    |
| HTTP Adapter                  | Fastify                   |
| API                           | REST + JSON + HTTPS       |
| Banco                         | PostgreSQL                |
| ORM                           | Prisma                    |
| Analytics                     | Python + Pandas           |
| API Python                    | FastAPI                   |
| IA                            | OpenRouter + Qwen3 Coder 480B A35B (`qwen/qwen3-coder:free`) |
| API Docs                      | OpenAPI/Swagger           |
| Versionamento                 | Git/GitHub                |
| CI/CD                         | Pipeline automatizado     |
| Design System                 | Cyber-Academic System     |
| Cache/Infraestrutura auxiliar | Redis                     |
| Jobs                          | BullMQ                    |
| Push                          | Firebase Cloud Messaging  |
| Object Storage                | Compatível com S3         |

Pandas é a ferramenta oficial de análise nesta versão.

---

## 6. Frontend Web

Tecnologia: **React + TypeScript**.

Responsabilidades:

* interface;
* navegação;
* gerenciamento de estado;
* comunicação com API;
* validação de formulários;
* sessão;
* mensagens de erro/sucesso;
* componentes do Design System;
* dashboards;
* tarefas;
* experiência de IA.

Estrutura sugerida:

```text
src/

├── components/
├── pages/
├── layouts/
├── routes/
├── hooks/
├── services/
├── stores/
├── types/
├── utils/
├── assets/
└── App.tsx
```

Operações que envolvam dados persistidos devem utilizar as APIs do Backend.

---

## 7. Mobile

Tecnologia: **React Native + TypeScript**.

Plataformas:

* Android;
* iOS.

Responsabilidades:

* telas;
* navegação;
* autenticação;
* API;
* estado;
* armazenamento seguro de sessão;
* conectividade;
* recursos nativos quando aplicável.

O Mobile utiliza o mesmo Backend e as mesmas regras de negócio do Web.

---

## 8. Backend

Tecnologia: **Node.js + NestJS + Fastify**.

Responsabilidades:

* APIs REST;
* autenticação;
* autorização;
* validação;
* regras de negócio;
* persistência;
* consultas;
* relacionamentos;
* integrações;
* logs;
* erros;
* documentação.

Organização orientada a módulos/domínios.

```text
Controller
    ↓
Service
    ↓
Repository / ORM
    ↓
PostgreSQL
```

Estrutura sugerida:

```text
src/

├── modules/
│   ├── auth/
│   ├── users/
│   ├── subjects/
│   ├── tasks/
│   ├── study-sessions/
│   ├── analytics/
│   ├── dashboards/
│   ├── ai/
│   ├── insights/
│   ├── reports/
│   └── notifications/
├── database/
│   └── prisma/
├── common/
│   ├── guards/
│   ├── filters/
│   ├── interceptors/
│   ├── decorators/
│   └── pipes/
├── config/
├── app.module.ts
└── main.ts
```

---

## 9. API

A API utiliza:

* REST;
* JSON;
* HTTPS;
* `/api/v1`.

Recursos previstos:

```text
/api/v1/auth
/api/v1/users
/api/v1/subjects
/api/v1/tasks
/api/v1/study-sessions
/api/v1/analytics
/api/v1/insights
/api/v1/ai
/api/v1/reports
/api/v1/notifications
```

Os endpoints definitivos de cada módulo devem ser especificados antes da implementação.

### Resposta de sucesso

```json
{
  "data": {
    "id": "123",
    "name": "Exemplo"
  }
}
```

### Resposta de erro

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Recurso não encontrado"
  }
}
```

### Códigos HTTP

200, 201, 204, 400, 401, 403, 404, 409, 422, 429 e 500 conforme o significado definido na especificação.

A API deverá ser documentada com OpenAPI/Swagger.

---

## 10. Autenticação e Autorização

A aplicação utilizará **JWT como mecanismo principal de autenticação**.

OAuth e serviços externos de autenticação não fazem parte da arquitetura definida para o MVP.

O fluxo conceitual é:

```text
Usuário
  ↓
POST /api/v1/auth/login
  ↓
Backend valida credenciais
  ↓
Access Token + Refresh Token
  ↓
Cliente armazena sessão de forma segura
  ↓
Requests autenticadas
```

Autenticação e autorização são responsabilidades distintas.

O sistema deve garantir isolamento entre usuários.

### Access Token

* possui curta duração;
* é utilizado para autenticar requisições;
* sua duração exata ainda deve ser definida.

### Refresh Token

* é utilizado para renovação da sessão;
* deve ser revogável;
* deve possuir duração definida;
* deve utilizar estratégia de rotação;
* deve permitir encerramento/revogação da sessão.

---

## 11. Modelo de Dados

O banco principal é **PostgreSQL**.

O modelo físico está no arquivo separado `schema.prisma`.

Entidades:

```text
users
subjects
academic_tasks
study_sessions
task_history
push_devices
notification_deliveries
ai_conversations
ai_messages
ai_tool_executions
insights
weekly_reports
```

O `schema.prisma` contém os campos, tipos, enums, relações, índices e mapeamentos físicos oficiais.

### User

Campos definidos:

* `id`;
* `name`;
* `email`;
* `password_hash`;
* `timezone`;
* `notifications_enabled`;
* `created_at`;
* `updated_at`.

Timezone padrão: `America/Sao_Paulo`.

### Subject

Campos:

* `id`;
* `user_id`;
* `name`;
* `professor`;
* `workload_hours`;
* `description`;
* `start_date`;
* `end_date`;
* `archived_at`;
* `created_at`;
* `updated_at`.

Regras:

1. pertence a exatamente um usuário;
2. usuário pode possuir várias disciplinas;
3. pode possuir várias tarefas;
4. pode possuir várias sessões de estudo;
5. disciplina arquivada deixa de ser ativa;
6. exclusão remove tarefas e sessões associadas por cascade, conforme o schema.

### AcademicTask

Campos:

* `id`;
* `user_id`;
* `subject_id`;
* `title`;
* `description`;
* `status`;
* `priority`;
* `difficulty`;
* `due_date`;
* `estimated_minutes`;
* `completed_at`;
* `created_by`;
* `agent_execution_id`;
* `created_at`;
* `updated_at`.

Status:

```text
TODO
IN_PROGRESS
COMPLETED
CANCELLED
```

Prioridade:

```text
LOW
MEDIUM
HIGH
URGENT
```

Dificuldade:

```text
EASY
MEDIUM
HARD
```

Origem:

```text
USER
AGENT
SYSTEM
```

Regras:

1. pertence a um usuário;
2. pertence a uma disciplina;
3. não pode ser acessada por outro usuário;
4. concluída recebe `completed_at`;
5. reaberta volta a status diferente de `COMPLETED`;
6. alterações relevantes são registradas em `task_history`;
7. tarefa criada pela IA registra `created_by = AGENT`;
8. quando aplicável registra `agent_execution_id`;
9. ações destrutivas do Agente exigem confirmação.

`agent_execution_id`, quando utilizado, deve identificar a execução da Tool responsável pela ação e manter consistência com o modelo de auditoria definido em `ai_tool_executions`.

### StudySession

Campos:

* `id`;
* `user_id`;
* `subject_id`;
* `task_id`;
* `started_at`;
* `ended_at`;
* `duration_seconds`;
* `created_at`.

Pode estar vinculada a uma tarefa ou somente a uma disciplina.

É a fonte principal das métricas de tempo estudado.

### TaskHistory

Registra alterações relevantes, incluindo:

* status;
* prioridade;
* prazo;
* usuário;
* tarefa;
* timestamp.

É utilizado para auditoria e análises futuras.

### PushDevice

Representa dispositivo de Push:

* `id`;
* `user_id`;
* `provider`;
* `token`;
* `platform`;
* `active`;
* `created_at`;
* `updated_at`.

Token é único.

### NotificationDelivery

Registra entregas:

* `id`;
* `user_id`;
* `task_id`;
* `device_id`;
* `type`;
* `status`;
* `scheduled_at`;
* `sent_at`;
* `error_message`;
* `created_at`.

Tipo inicial:

```text
TASK_DUE_24H
```

Status:

```text
PENDING
SENT
FAILED
CANCELLED
```

### AIConversation

Conversa do usuário com o Agente:

* `id`;
* `user_id`;
* `title`;
* `created_at`;
* `updated_at`.

Possui mensagens e execuções de ferramentas.

### AIMessage

Papéis:

```text
USER
ASSISTANT
TOOL
SYSTEM
```

Campos:

* `id`;
* `conversation_id`;
* `role`;
* `content`;
* `created_at`.

Mensagens com `role = TOOL` devem representar resultados de execução de Tools e manter rastreabilidade com a execução correspondente quando o fluxo exigir.

### AIToolExecution

Auditoria de Tools:

* `id`;
* `user_id`;
* `conversation_id`;
* `intent`;
* `tool_name`;
* `input_json`;
* `output_json`;
* `status`;
* `model`;
* `prompt_version`;
* `created_at`;
* `completed_at`.

Status:

```text
PENDING
SUCCESS
FAILED
REJECTED
```

Cada execução deve possuir identificação única e ser associável ao recurso afetado quando aplicável.

### Insight

Campos:

* `id`;
* `user_id`;
* `type`;
* `title`;
* `description`;
* `confidence`;
* `period_start`;
* `period_end`;
* `metrics_json`;
* `dataset_version`;
* `model`;
* `prompt_version`;
* `status`;
* `created_at`;
* `expires_at`.

Tipos:

```text
TREND
COMPARISON
ATTENTION
RECOMMENDATION
ANOMALY
SUMMARY
```

Status:

```text
ACTIVE
EXPIRED
DISMISSED
```

### WeeklyReport

Campos:

* `id`;
* `user_id`;
* `period_start`;
* `period_end`;
* `status`;
* `storage_key`;
* `file_name`;
* `generated_at`;
* `created_at`.

Status:

```text
PENDING
PROCESSING
COMPLETED
FAILED
```

Existe unicidade por usuário e período.

---

## 12. Relacionamentos

```text
User
 │
 ├── Subject
 │      │
 │      ├── AcademicTask
 │      │       ├── StudySession
 │      │       ├── TaskHistory
 │      │       └── NotificationDelivery
 │      └── StudySession
 │
 ├── PushDevice
 │      └── NotificationDelivery
 │
 ├── AIConversation
 │      ├── AIMessage
 │      └── AIToolExecution
 │               └── AcademicTask
 │
 ├── Insight
 └── WeeklyReport
```

Foreign keys garantem integridade referencial.

Migrations devem ser versionadas com Prisma.

---

## 13. Progresso Acadêmico

O sistema não utiliza uma única porcentagem arbitrária.

### Progresso por Entregas

```text
delivery_progress =
tarefas_concluídas / tarefas_totais × 100
```

### Eficiência por Dificuldade

Utiliza:

```text
difficulty
+
study_sessions
+
duration_seconds
```

Tarefas de dificuldades diferentes não devem ser tratadas como equivalentes.

`delivery_progress` e `efficiency` são métricas distintas inicialmente.

Não criar média composta sem definição formal dos pesos.

---

## 14. Métricas Oficiais

### Geral

* total de disciplinas ativas;
* total de tarefas;
* tarefas concluídas;
* tarefas pendentes;
* tarefas atrasadas;
* progresso por entregas;
* tempo total estudado.

### Por disciplina

* tarefas totais;
* tarefas concluídas;
* tarefas pendentes;
* tarefas atrasadas;
* progresso por entregas;
* tempo estudado;
* evolução de eficiência por dificuldade.

### Temporais

* tempo estudado por dia;
* tarefas concluídas por dia;
* tarefas atrasadas por período;
* evolução semanal do progresso;
* evolução da eficiência em tarefas de mesma dificuldade.

Nenhuma métrica adicional deve ser criada sem especificação.

---

## 15. Dashboards

Estrutura conceitual:

```text
KPIs
  ↓
Gráficos
  ↓
Progresso por disciplina
  ↓
Atividades
  ↓
Insights da IA
```

Visualizações possíveis:

* KPI;
* Card;
* tabela;
* linha;
* barras;
* área;
* donut/pie;
* dispersão;
* comparação;
* heatmap.

A escolha deve considerar o tipo de informação.

Não utilizar gráficos apenas por estética.

Os cálculos são realizados pelo Backend/Analytics Service.

Componentes reutilizáveis previstos:

```text
LineChart
BarChart
PieChart
AreaChart
KPI
DataTable
```

---

## 16. Analytics e Pandas

Arquitetura:

```text
NestJS
  ↓
Analytics Service
  ↓
FastAPI
  ↓
Pandas
  ↓
Dataset estruturado
  ↓
Dashboard / AI
```

Responsabilidades do Python:

* processamento analítico;
* agregações;
* séries temporais;
* comparação por dificuldade;
* preparação para IA;
* geração de relatórios PDF.

O serviço Python não deverá expor o PostgreSQL diretamente à internet.

O serviço Python deve receber apenas os dados necessários para a operação solicitada.

O acesso aos dados deve respeitar o escopo do usuário autenticado e os contratos internos definidos pelo Backend.

Deverá:

* receber somente dados necessários;
* possuir autenticação/autorização entre serviços;
* registrar logs;
* controlar versões de pipelines;
* tratar falhas;
* permitir reprocessamento;
* possuir contratos versionados de entrada e saída.

### Comunicação NestJS ↔ FastAPI

A arquitetura definida utiliza:

* **HTTP interno** para operações analíticas síncronas;
* **BullMQ + Redis** para operações pesadas ou assíncronas.

Operações síncronas devem possuir timeout definido.

Operações assíncronas devem possuir política de retry e idempotência.

Os contratos de entrada e saída entre NestJS e FastAPI ainda devem ser formalizados.

---

## 17.1 Integração do Agente de IA

O Agente de IA deve ser integrado ao Backend por meio de uma arquitetura provider-agnostic, utilizando o `LLM Provider Adapter`.

O Agente não deve possuir acesso direto ao PostgreSQL, não deve executar SQL arbitrário e não deve realizar cálculos analíticos diretamente.

A responsabilidade do LLM é interpretar a intenção do usuário, selecionar Tools apropriadas, interpretar dados estruturados e produzir respostas estruturadas.

A responsabilidade de cálculo, agregação, filtragem, ordenação e preparação dos dados permanece no Backend/Analytics Service.

### Fluxo de execução

```text
Usuário
  ↓
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
Tool Selection
  ↓
Backend Tool
  ↓
Domain Service / Analytics Service
  ↓
FastAPI
  ↓
Pandas
  ↓
Dataset estruturado
  ↓
Agent Orchestrator
  ↓
LLM
  ↓
Structured Output
  ↓
Backend Validation
  ↓
Web / Mobile
```

O fluxo deve respeitar:

1. autenticação do usuário;
2. isolamento do contexto entre usuários;
3. identificação da intenção;
4. seleção de Tool autorizada;
5. validação dos parâmetros;
6. execução da Tool;
7. auditoria da execução;
8. processamento determinístico dos dados;
9. geração da resposta estruturada;
10. validação do Structured Output;
11. entrega da resposta ao cliente.

Nenhuma etapa do fluxo poderá permitir que o LLM contorne as regras de autorização do Backend.

---

## 17.2 Provider Adapter

O Agent deve acessar modelos de linguagem exclusivamente através de uma abstração de Provider Adapter.

O Adapter deve permitir:

- seleção do provider;
- seleção do modelo;
- envio de mensagens;
- execução de Tool Calling;
- Structured Output;
- tratamento de erros;
- timeout;
- retry quando aplicável;
- fallback de modelo quando configurado;
- registro do modelo utilizado;
- registro da versão do prompt.

A implementação do Agent não deve depender diretamente do SDK de um fornecedor específico.

A troca do provider ou modelo não deve exigir alterações nas regras de negócio do Agent.

---

## 17.3 Modelo de linguagem

O modelo principal deve ser selecionado considerando prioritariamente:

- Tool Calling confiável;
- Structured Output;
- capacidade de seguir schemas;
- capacidade de interpretar dados estruturados;
- capacidade de raciocínio;
- latência;
- custo;
- disponibilidade;
- limites de uso.

Não será utilizado um modelo especializado exclusivamente em geração de gráficos.

A geração de gráficos será realizada por meio da combinação de:

```text
LLM
  ↓
Intenção de visualização
  ↓
Dataset estruturado
  ↓
Chart Specification
  ↓
Componente de gráfico
```

O modelo deve decidir **qual visualização é adequada**, mas não deve gerar código JavaScript, SQL, HTML ou código arbitrário para renderizar o gráfico.

As decisões de provider e modelo do MVP estão definidas na seção 35.1.1. Limites operacionais e prompts permanecem configuráveis/versionados conforme as subseções correspondentes.

---

## 17.4 Gráficos personalizados pelo Agent

O Agent poderá gerar visualizações personalizadas com base na solicitação do usuário.

Exemplos:

```text
"Mostre meu tempo de estudo por disciplina."

"Compare minhas tarefas concluídas e atrasadas nas últimas semanas."

"Crie um gráfico mostrando minha evolução de estudos."

"Quero comparar meu desempenho entre as disciplinas."

"Mostre quais disciplinas possuem maior volume de tarefas."
```

O Agent deverá interpretar a solicitação e determinar:

- intenção analítica;
- métrica;
- dimensão;
- período;
- filtros;
- agrupamento;
- tipo de visualização adequado;
- título;
- séries;
- configuração necessária para apresentação.

Os dados utilizados pelo gráfico deverão ser obtidos exclusivamente através das Tools e serviços autorizados.

O Agent não poderá inventar dados para completar um gráfico.

---

## 17.5 Chart Specification

A comunicação entre o Agent e o Frontend para gráficos personalizados deverá utilizar uma estrutura de dados padronizada denominada `ChartSpecification`.

A especificação deverá conter, no mínimo:

```text
ChartSpecification
├── type
├── title
├── description
├── xAxis
├── yAxis
├── series
├── data
├── filters
├── source
└── datasetVersion
```

### Tipos de gráfico permitidos

```text
kpi
card
table
line
bar
area
donut
pie
scatter
comparison
heatmap
```

A lista deve permanecer compatível com os tipos de visualização definidos pelo Dashboard do projeto.

### Exemplo conceitual

```json
{
  "type": "line",
  "title": "Tempo de estudo por dia",
  "description": "Evolução do tempo estudado no período selecionado",
  "xAxis": {
    "field": "date",
    "label": "Data"
  },
  "yAxis": {
    "field": "studyTime",
    "label": "Tempo estudado"
  },
  "series": [
    {
      "field": "studyTime",
      "label": "Tempo estudado"
    }
  ],
  "data": [],
  "filters": [],
  "source": {
    "tool": "get_dashboard_data"
  },
  "datasetVersion": "..."
}
```

O exemplo é conceitual. O schema definitivo deverá ser formalizado e validado antes da implementação.

---

## 17.6 Responsabilidade do Backend/Analytics

O Backend/Analytics Service é responsável por:

- buscar os dados autorizados;
- aplicar filtros;
- calcular métricas;
- realizar agregações;
- preparar séries temporais;
- realizar agrupamentos;
- validar consistência dos dados;
- fornecer datasets estruturados;
- fornecer a versão do dataset;
- garantir isolamento dos dados do usuário.

O uso de Pandas permanece restrito ao processamento analítico definido pelo projeto.

O Agent não deverá executar os cálculos diretamente.

A regra fundamental é:

```text
Dados → calculados deterministicamente pelo sistema
IA → interpreta os dados
Frontend → apresenta os resultados
```

Nenhuma métrica adicional poderá ser criada pelo Agent sem que exista definição formal correspondente no `SPEC.md`. O projeto já estabelece que nenhuma métrica adicional deve ser criada sem especificação.

---

## 17.7 Seleção automática do tipo de gráfico

O Agent poderá selecionar automaticamente o tipo de gráfico mais apropriado para a intenção do usuário.

A seleção deverá considerar:

| Tipo de informação           | Visualização preferencial |
| ---------------------------- | ------------------------- |
| Evolução temporal            | line / area               |
| Comparação entre categorias  | bar                       |
| Distribuição proporcional    | donut / pie               |
| Relação entre duas variáveis | scatter                   |
| Indicador único              | KPI / card                |
| Dados tabulares              | table                     |
| Comparação estruturada       | comparison                |
| Intensidade por dimensões    | heatmap                   |

A escolha deve priorizar adequação semântica dos dados e legibilidade, e não estética.

O Agent não poderá solicitar um tipo de gráfico incompatível com o dataset.

Exemplo:

```text
Dataset temporal
→ line / area

Dataset categórico
→ bar

Dataset proporcional
→ donut / pie

Dataset de duas variáveis quantitativas
→ scatter
```

---

## 17.8 Renderização dos gráficos

A renderização dos gráficos será responsabilidade do Frontend Web e Mobile.

O Frontend deverá utilizar componentes reutilizáveis definidos pela arquitetura:

```text
LineChart
BarChart
PieChart
AreaChart
KPI
DataTable
```

Os componentes deverão interpretar uma `ChartSpecification` validada.

O LLM não deverá gerar componentes React, React Native ou código de visualização em tempo de execução.

O Frontend não poderá executar código recebido do modelo.

A renderização deverá utilizar somente tipos, propriedades e campos previamente permitidos pelo sistema.

---

## 17.9 Validação da Chart Specification

Toda `ChartSpecification` produzida pelo Agent deverá ser validada pelo Backend antes de ser enviada ao Frontend.

A validação deverá verificar:

- schema;
- tipo de gráfico permitido;
- existência das séries;
- existência dos campos utilizados;
- compatibilidade entre dataset e gráfico;
- tipos dos valores;
- quantidade máxima de dados;
- filtros autorizados;
- origem do dataset;
- versão do dataset;
- ausência de código executável;
- ausência de campos desconhecidos quando o schema exigir strict mode.

Caso a resposta não seja válida:

```text
1. rejeitar a resposta;
2. registrar o erro;
3. tentar corrigir/reprocessar quando permitido;
4. caso não seja possível, retornar resposta segura ao usuário.
```

O Frontend jamais deverá confiar diretamente em uma resposta não validada do LLM.

---

## 17.10 Limitação de dados para gráficos

Para evitar datasets excessivamente grandes:

- o Backend deverá limitar a quantidade de dados;
- agregações deverão ocorrer antes do envio ao Agent quando aplicável;
- séries temporais deverão possuir granularidade adequada ao período;
- dados desnecessários não deverão ser enviados ao LLM;
- operações pesadas deverão utilizar o processamento assíncrono definido pela arquitetura.

O projeto já determina evitar datasets gigantes e utilizar processamento assíncrono quando necessário.

---

## 17.11 Segurança dos gráficos gerados pela IA

A geração de gráficos deverá seguir as mesmas regras de segurança do Agent.

O modelo não poderá:

- executar SQL;
- executar código;
- acessar PostgreSQL;
- acessar dados de outro usuário;
- criar métricas arbitrárias;
- modificar dados sem Tool autorizada;
- inserir scripts na resposta;
- definir componentes arbitrários;
- gerar URLs ou recursos externos para execução de código.

Somente propriedades previamente definidas pelo `ChartSpecification` poderão ser utilizadas.

A proteção contra prompt injection, data leakage, isolamento de contexto e validação do Structured Output permanece obrigatória.

---

## 17.12 Integração com as Tools existentes

A geração de gráficos deverá utilizar prioritariamente as Tools analíticas existentes.

Tools relacionadas:

```text
get_user_metrics
get_dashboard_data
generate_analysis
```

Essas Tools deverão fornecer dados suficientes para os casos de uso definidos pelo Dashboard e pelo Agent.

As Tools continuam obedecendo às regras gerais de schema de entrada, schema de saída, risco, permissões, autorização e tratamento de erros.

---

## 17.13 Persistência e auditoria

Toda execução do Agent relacionada à geração de gráficos deverá ser rastreável.

Quando aplicável, deverão ser registrados:

- usuário;
- conversa;
- intenção;
- Tool utilizada;
- parâmetros;
- dataset utilizado;
- versão do dataset;
- tipo de gráfico solicitado;
- Chart Specification produzida;
- modelo;
- versão do prompt;
- status;
- erro de validação, quando existente;
- timestamps.

As execuções de Tools deverão continuar sendo registradas em `ai_tool_executions`.

---

## 17.14 Structured Output

O Structured Output será obrigatório para respostas que contenham:

- Chart Specification;
- dados estruturados para apresentação;
- Tool Calls quando suportados pelo provider;
- resultados estruturados de análise;
- metadados necessários para renderização.

O Backend deverá validar todas as respostas antes de disponibilizá-las ao cliente.

O schema definitivo deverá ser formalizado como decisão P0 antes da implementação do Agent. Atualmente o `SPEC.md` reconhece essa definição como pendente.

---

## 18. Tools do Agente

Tools conceituais iniciais:

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

* nome;
* descrição;
* schema de entrada;
* schema de saída;
* nível de risco;
* permissões necessárias;
* regras de autorização;
* comportamento em caso de erro.

A lista definitiva poderá ser expandida por novas especificações.

### Criação de tarefas

Quando o usuário solicitar explicitamente uma ou mais tarefas:

1. interpretar a solicitação;
2. identificar título, descrição, prioridade, prazo e demais campos disponíveis;
3. pedir esclarecimento somente se faltar informação obrigatória que não possa ser inferida com segurança;
4. validar permissões;
5. chamar a Tool;
6. persistir pelo Backend;
7. registrar a execução da Tool;
8. confirmar ao usuário.

Criação explícita de tarefa é ação de baixo risco após validação.

Ações destrutivas, irreversíveis ou que afetem dados importantes exigem confirmação explícita.

---

## 19. Auditoria da IA

Toda execução deve ser rastreável.

Quando aplicável:

* usuário;
* conversa;
* intenção;
* ferramenta;
* parâmetros;
* resultado;
* recurso criado/alterado;
* identificador do recurso afetado;
* modelo;
* versão do prompt;
* status;
* timestamps.

A execução deve ser registrada em `ai_tool_executions`.

Quando uma Tool alterar um recurso persistente, a execução deve poder ser relacionada ao recurso alterado.

---

## 20. Insights e Structured Output

A IA recebe dados estruturados e previamente processados.

O Backend/Analytics calcula:

* totais;
* médias;
* percentuais;
* variações;
* rankings;
* agregações;
* períodos;
* indicadores críticos.

A IA realiza principalmente:

* interpretação;
* sumarização;
* contextualização;
* explicação;
* identificação de padrões;
* recomendações quando permitido.

Sempre que possível, respostas devem utilizar Structured Output.

O Backend valida a resposta antes de disponibilizá-la.

Os schemas formais de Structured Output devem ser mantidos como contratos versionados de implementação e validados pelo Backend antes do uso.

---

## 21. Confiabilidade da IA

Regras:

1. enviar dados estruturados;
2. limitar contexto;
3. instruir o modelo a não inventar métricas;
4. basear afirmações nos dados recebidos;
5. validar respostas quando possível;
6. não permitir números inventados;
7. identificar informações inferidas;
8. rejeitar respostas que não estejam de acordo com o schema quando Structured Output for obrigatório.

Sem dados suficientes:

```text
Não há dados suficientes para gerar este insight.
```

---

## 22. Relatórios Semanais

Conteúdo oficial:

1. Resumo;
2. Tarefas concluídas;
3. Tarefas atrasadas;
4. Tempo estudado;
5. Progresso por disciplina;
6. Eficiência por dificuldade;
7. Gráficos;
8. Insights da IA.

### Fluxo assíncrono

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
Métricas
  ↓
Gráficos
  ↓
IA — Insights
  ↓
PDF
  ↓
Object Storage
  ↓
weekly_reports
```

A geração de relatórios deve ser tratada como operação assíncrona.

O sistema deve permitir reprocessamento seguro de um relatório sem gerar duplicidades para o mesmo usuário e período.

Relatórios são persistidos em `weekly_reports`.

---

## 23. Notificações

Somente Push para alertas automáticos no escopo atual.

```text
Tarefa com prazo
  ↓
24h antes
  ↓
notifications_enabled?
  ↓
Push
  ↓
Registrar delivery
```

Tarefas concluídas ou canceladas não devem gerar alerta.

O usuário pode desativar notificações.

Não haverá notificações automáticas por e-mail no escopo atual.

---

## 24. Datas

Timezone padrão:

```text
America/Sao_Paulo
```

Timestamps aplicáveis devem utilizar timezone.

Expressões como “hoje”, “amanhã” e “em 24 horas” devem considerar a timezone do usuário.

---

## 25. Design System

O Design System oficial é o **Cyber-Academic System**, definido em `DESIGN.md`.

Características:

* Visionary;
* Analytical;
* Empowering;
* Futuristic Glassmorphism;
* estética de “mission control”;
* profundidade por translucidez;
* sinalização neon controlada;
* organização orientada a dados.

Tipografia:

* Sora → headings;
* Inter → corpo;
* JetBrains Mono → métricas, timestamps e metadados.

Layout:

* unidade base: 4px;
* Desktop: 12 colunas;
* Tablet: 8 colunas;
* Mobile: coluna única.

Breakpoints:

* Desktop: 1440px+;
* Tablet: 768px–1439px;
* Mobile: abaixo de 767px.

O `DESIGN.md` é a fonte detalhada dos tokens, cores, componentes, estados e regras de acessibilidade.

---

## 26. Performance

Objetivo inicial:

```text
API < 2 segundos
```

quando não envolver processamento pesado.

Práticas:

* evitar dados desnecessários;
* paginação quando aplicável;
* agregações no Backend;
* evitar consultas repetidas;
* índices;
* considerar cache;
* evitar datasets gigantes;
* processamento assíncrono quando necessário.

Operações de processamento pesado não devem bloquear requisições síncronas desnecessariamente.

---

## 27. Segurança

### Backend

* HTTPS em produção;
* validação de entrada;
* não confiar no cliente;
* secrets em variáveis de ambiente;
* não versionar senhas/tokens;
* rate limiting;
* hash seguro;
* autorização;
* evitar exposição de dados sensíveis;
* logs de autenticação.

### Banco

* credenciais seguras;
* usuário específico;
* backups;
* migrations;
* índices;
* controle de acesso.

### IA

* nunca enviar credenciais;
* minimização;
* autorização de Tools;
* auditoria;
* proteção contra prompt injection;
* proteção contra vazamento;
* validação de Structured Output;
* isolamento do contexto entre usuários.

---

## 28. LGPD e Privacidade

Aplicar:

* minimização;
* finalidade definida;
* controle de acesso;
* proteção de credenciais;
* política de retenção;
* controle dos dados enviados à IA.

As políticas específicas de retenção ainda devem ser formalizadas antes da conclusão do MVP.

---

## 29. Ambientes

```text
Development
  ↓
Staging
  ↓
Production
```

Cada ambiente deve possuir configurações e banco independentes.

---

## 30. Testes

### Unitários

* regras de negócio;
* funções;
* cálculos analíticos.

### Integração

```text
API
  ↓
Service
  ↓
Prisma
  ↓
PostgreSQL
```

### E2E

```text
Login
  ↓
Dashboard
  ↓
Criar disciplina
  ↓
Criar tarefa
  ↓
Registrar estudo
  ↓
Concluir tarefa
  ↓
Atualizar dashboard
```

Também devem existir testes para:

* autorização;
* Tools da IA;
* progresso;
* métricas de tempo;
* notificações de 24h;
* relatórios;
* isolamento entre usuários;
* confirmação de ações de risco;
* respostas inválidas do LLM.

Adicionar testes para:

- interpretação de intenção para gráficos;
- seleção correta de tipo de gráfico;
- compatibilidade entre dataset e gráfico;
- validação de `ChartSpecification`;
- rejeição de tipos de gráfico não permitidos;
- rejeição de código executável produzido pelo LLM;
- rejeição de dados inventados;
- isolamento de dados entre usuários;
- Tool Calling;
- Structured Output;
- respostas inválidas do LLM;
- fallback de modelo;
- limites de dataset;
- gráficos sem dados suficientes;
- gráficos com filtros;
- gráficos temporais;
- gráficos comparativos;
- renderização da `ChartSpecification` no Web;
- renderização da `ChartSpecification` no Mobile;
- auditoria da geração de gráficos.

---

## 31. CI/CD

```text
Developer
  ↓
Git
  ↓
Pull Request
  ↓
Lint
  ↓
Type Check
  ↓
Tests
  ↓
Build
  ↓
Deploy Staging
  ↓
Homologação
  ↓
Production
```

Nenhum código deve ir para produção sem as verificações automatizadas definidas.

---

## 32. Git

Estrutura:

```text
main
└── production

develop
├── feature/*
├── fix/*
└── refactor/*
```

Pull Requests devem ser utilizados para revisão.

A branch de produção deve possuir proteção contra alterações diretas.

---

## 33. OpenSpec

Novas funcionalidades:

```text
Proposal
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
```

Funcionalidades de IA/Analytics devem incluir validação específica da IA e do Dashboard quando aplicável.

Mudanças que alterem requisitos permanentes devem ser consolidadas posteriormente no `SPEC.md`.

Uma mudança OpenSpec representa o **delta** necessário em relação ao estado atual e não deve duplicar integralmente este documento.

---

# 34. Decisões Já Definidas

## Produto

* EduTrack AI é uma aplicação Web e Mobile para organização acadêmica.
* O MVP possui o perfil funcional Student/User.
* Cada usuário possui isolamento completo dos próprios dados.
* RBAC administrativo fica para versão futura.
* O MVP contempla disciplinas, tarefas, sessões de estudo, métricas, notificações, insights, conversas e relatórios.
* Tarefas podem existir sem prazo.
* Criação explícita de tarefas pelo Agent é permitida após validação.
* Ações destrutivas do Agent exigem confirmação explícita.
* Recorrência de tarefas fica fora do MVP inicial.
* Notas e frequência ficam fora do MVP inicial.

## Frontend

* Web utiliza React + TypeScript.
* Mobile utiliza React Native + TypeScript.
* Web e Mobile utilizam a mesma API.
* Web e Mobile utilizam as mesmas regras de negócio.
* Clientes não acessam PostgreSQL diretamente.
* O protótipo oficial é o projeto Stitch `13596816261153646269`.

## Backend

* Runtime: Node.js.
* Framework: NestJS.
* HTTP Adapter: Fastify.
* API: REST.
* Formato: JSON.
* Transporte: HTTPS.
* Prefixo: `/api/v1`.
* Documentação: OpenAPI/Swagger.
* Organização orientada a módulos/domínios.
* Regras de negócio pertencem ao Backend/Domain Services.
* Persistência utiliza Prisma.
* Prisma é o ORM oficial.

## Banco de Dados

* PostgreSQL é o banco principal.
* `schema.prisma` é a fonte de verdade do modelo físico.
* Migrations são versionadas pelo Prisma.
* Foreign Keys garantem integridade referencial.
* O isolamento entre usuários é obrigatório.
* A IA não acessa PostgreSQL diretamente.

## Analytics

* Python é utilizado para processamento analítico.
* Pandas é a biblioteca oficial de processamento de dados.
* FastAPI é utilizado como serviço Python.
* O serviço Python não possui exposição direta do PostgreSQL à internet.
* Dados analíticos são processados antes de serem enviados à IA.
* Métricas críticas são calculadas deterministicamente.
* A IA não calcula métricas oficiais.
* `delivery_progress` e `efficiency` são métricas distintas.
* HTTP interno é utilizado para operações analíticas síncronas.
* BullMQ + Redis são utilizados para operações analíticas pesadas ou assíncronas.
* Previsão e detecção avançada de anomalias ficam fora do MVP inicial.

## IA

* O Agent não acessa PostgreSQL diretamente.
* O Agent não executa SQL arbitrário.
* O Agent utiliza Tools controladas pelo Backend.
* Tools executam através dos Domain Services.
* Toda execução de Tool é auditável.
* Tools possuem níveis de risco.
* Operações de leitura não exigem confirmação.
* Operações de escrita explicitamente solicitadas podem ser executadas após validação.
* Operações destrutivas exigem confirmação explícita.
* Structured Output é utilizado sempre que aplicável.
* Respostas estruturadas são validadas pelo Backend.
* A arquitetura de LLM é provider-agnostic.
* O acesso ao LLM ocorre através de Provider Adapter.
* Memória semântica/vector database não faz parte do MVP inicial.
* O histórico de conversas é persistido.

## Tools do MVP

* `create_task`
* `list_tasks`
* `get_task`
* `update_task`
* `complete_task`
* `get_user_metrics`
* `get_dashboard_data`
* `generate_analysis`

## Autenticação

* JWT será utilizado como mecanismo principal.
* OAuth e provedores externos de autenticação não fazem parte do MVP.
* Access Token possui curta duração.
* Refresh Token será utilizado para renovação da sessão.
* Refresh Tokens devem ser revogáveis.
* Argon2id será utilizado para hash de senhas.
* Web deve utilizar armazenamento seguro de sessão.
* Mobile deve utilizar armazenamento seguro nativo.
* A duração exata dos tokens ainda precisa ser definida.
* A estratégia de rotação dos Refresh Tokens ainda precisa ser definida.

## Tarefas

* Uma tarefa pertence a exatamente um usuário.
* Uma tarefa pertence a uma disciplina.
* Tarefas possuem status.
* Tarefas possuem prioridade.
* Tarefas possuem dificuldade.
* Tarefas podem possuir prazo.
* Tarefas concluídas possuem `completed_at`.
* Reabertura remove o estado `COMPLETED`.
* Alterações relevantes são registradas no histórico.
* Tarefas criadas pelo Agent possuem `created_by = AGENT`.
* Quando aplicável, tarefas criadas pelo Agent registram `agent_execution_id`.

## Notificações

* O MVP utiliza Push.
* Não haverá notificações automáticas por e-mail no MVP.
* O alerta padrão ocorre 24 horas antes do prazo.
* Tarefas concluídas ou canceladas não devem gerar alertas.
* O usuário pode desativar notificações.
* FCM é o provedor Push definido para o MVP.

## Relatórios

* Relatórios semanais são persistidos.
* O conteúdo oficial inclui métricas, gráficos e insights da IA.
* Relatórios são gerados através do pipeline Analytics → IA → PDF.
* A geração ocorre de forma assíncrona.
* PDFs são armazenados em Object Storage compatível com S3.
* Metadados são persistidos em `weekly_reports`.
* Existe unicidade por usuário e período.

## Design

* Cyber-Academic System é o Design System oficial.
* `DESIGN.md` é a fonte de verdade do Design System.
* Sora é utilizada para headings.
* Inter é utilizada para corpo.
* JetBrains Mono é utilizada para métricas/metadados.
* Unidade base: 4px.
* Desktop: 12 colunas.
* Tablet: 8 colunas.
* Mobile: coluna única.

## Segurança

* HTTPS é obrigatório em produção.
* Secrets não devem ser versionados.
* Senhas devem utilizar Argon2id.
* APIs devem validar entradas.
* Backend não confia em dados fornecidos pelo cliente.
* Rate limiting deve existir.
* A IA deve utilizar minimização de dados.
* Prompt injection deve ser tratado.
* Data leakage deve ser tratado.
* Tools devem possuir autorização.
* Execuções do Agent devem ser auditáveis.

## Processo

* TLC Spec-Driven Development é o processo principal.
* OpenSpec é utilizado para gerenciamento formal de mudanças.
* Novos requisitos permanentes devem ser consolidados no `SPEC.md`.
* `schema.prisma` permanece separado.
* `DESIGN.md` permanece separado.
* `context.md` contém contexto operacional e convenções para agentes.
* O estado de implementação não deve ser inferido do `SPEC.md`.

## Infraestrutura e Arquitetura

* pnpm como gerenciador de pacotes.
* Monorepo como estrutura do projeto.
* React + TypeScript para Web.
* React Native + TypeScript para Mobile.
* NestJS + Fastify para Backend.
* PostgreSQL como banco principal.
* Prisma como ORM.
* Python + FastAPI + Pandas para Analytics.
* JWT + Refresh Token para autenticação.
* Argon2id para hash de senhas.
* Redis para infraestrutura auxiliar.
* BullMQ para processamento assíncrono.
* HTTP interno para operações analíticas síncronas.
* Queue para operações analíticas pesadas/assíncronas.
* FCM como provedor Push.
* Object Storage compatível com S3.
* Arquitetura de LLM desacoplada por Provider Adapter.

---

# 35. Definições e Pendências

As pendências do projeto são classificadas por prioridade de implementação.

* **P0 — Obrigatório:** decisões necessárias para iniciar ou estruturar corretamente o desenvolvimento do MVP.
* **P1 — Obrigatório para o MVP:** decisões necessárias para concluir os principais fluxos e funcionalidades do MVP.
* **P2 — Descartado:** funcionalidades e decisões consideradas avançadas demais para o escopo atual e que não serão implementadas nesta versão do projeto.

Nenhuma pendência P0 ou P1 deve permanecer indefinida quando sua implementação for iniciada.

# 35.1 P0 — Decisões obrigatórias antes da implementação

As decisões abaixo estão formalmente definidas para o EduTrack AI.

Uma decisão marcada como `[x]` representa uma decisão de arquitetura/produto já aprovada para esta versão do projeto.

---

## 35.1.1 IA

### Provider LLM

* [x] O provider LLM inicial será a **OpenRouter**.
* [x] O acesso será realizado exclusivamente através do `LLM Provider Adapter`.
* [x] A implementação do Agent não poderá depender diretamente de um SDK de provider fora da camada do `LLM Provider Adapter`.
* [x] O Adapter deverá permitir substituição futura do provider sem alteração das regras de negócio do Agent.
* [x] Para o MVP com Qwen3 Coder, o protocolo principal será a **OpenAI-compatible Chat Completions API** do OpenRouter.
* [x] Endpoint principal:

```text
POST https://openrouter.ai/api/v1/chat/completions
```

A implementação do MVP **não deverá depender da Responses API como contrato principal do Agent**, pois o fluxo oficial de Tool Calling e Structured Outputs utilizado pelo MVP será padronizado sobre Chat Completions no OpenRouter.

A Responses API do OpenRouter existe e poderá ser suportada futuramente pelo Adapter, mas não é requisito do MVP.

### Configuração de runtime

```env
LLM_PROVIDER=openrouter
LLM_MODEL=qwen/qwen3-coder:free
LLM_FALLBACK_MODEL=openrouter/free
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_TIMEOUT_MS=30000
LLM_MAX_CONTEXT_TOKENS=<configured-at-runtime>
```

A chave deverá existir somente em variável de ambiente ou mecanismo seguro de secrets:

```env
OPENROUTER_API_KEY=<secret>
```

Nunca armazenar a chave no frontend, no código-fonte, no Git, no `SPEC.md`, no `context.md` ou em imagens Docker.

O Adapter deverá permitir configuração de:

```text
model
timeout
tool_choice
response_format
provider routing
retry
fallback
```

### Modelo principal

* [x] O modelo principal do MVP será **Qwen3 Coder 480B A35B**.
* [x] Slug OpenRouter:

```text
qwen/qwen3-coder:free
```

* [x] Modelo upstream correspondente:

```text
Qwen3-Coder-480B-A35B-Instruct
```

O modelo possui arquitetura MoE com 480B parâmetros totais e aproximadamente 35B ativos por forward pass. O catálogo atual do OpenRouter identifica o modelo `qwen/qwen3-coder:free` como uma variante gratuita e orientada a tarefas de coding/agentic coding, incluindo function calling/tool use e Structured Outputs.

O modelo será utilizado para:

* conversação;
* interpretação de intenção;
* Tool Calling;
* Structured Output;
* seleção de visualizações;
* interpretação de datasets;
* geração de insights;
* recomendações permitidas.

### Capacidades obrigatórias do modelo

O runtime deve tratar como pré-requisitos:

```text
tools
function/tool calling
response_format = json_schema
structured outputs
```

O Backend não deverá assumir essas capacidades somente a partir do nome do modelo.

Antes de habilitar uma rota operacional, o Adapter/health check deverá verificar ou confirmar que o endpoint efetivo suporta os parâmetros necessários.

### Context Window

O Adapter não deverá codificar uma capacidade máxima fixa do modelo como regra de negócio.

O OpenRouter atualmente anuncia capacidade de contexto ampla para a variante `qwen/qwen3-coder:free`, enquanto o próprio modelo Qwen3-Coder possui limite de contexto definido por variante/serving. O sistema deverá utilizar:

```text
LLM_MAX_CONTEXT_TOKENS
```

como limite de aplicação.

Esse limite deverá permanecer:

* configurável por ambiente;
* inferior ou igual ao limite efetivo da rota;
* compatível com o fallback configurado.

O Context Manager deverá truncar/compactar o contexto quando necessário, preservando:

```text
system instructions
+
regras de segurança
+
mensagem atual
+
turnos recentes relevantes
+
resultados das Tools atuais
```

### Modelo fallback

* [x] O fallback de aplicação será **OpenRouter Free Router**:

```text
openrouter/free
```

O `openrouter/free` é um roteador de modelos gratuitos. Ele poderá selecionar modelos diferentes entre requisições e, segundo a documentação atual do OpenRouter, filtra modelos conforme capacidades exigidas pela solicitação, incluindo tool calling e structured outputs.

O fallback deverá ser utilizado somente quando:

* a chamada ao modelo principal terminar com erro transitório;
* timeout;
* indisponibilidade;
* erro temporário de capacidade;
* ou política operacional explicitamente configurada.

Antes de utilizar o fallback, o Adapter deverá exigir as capacidades necessárias para a operação.

Para operações estruturadas:

```text
tools → obrigatoriamente suportado
response_format/json_schema → obrigatoriamente suportado
```

Quando o fallback não puder garantir as capacidades necessárias, o sistema deverá retornar falha segura.

### Provider routing e privacidade

As requisições deverão utilizar as capacidades de provider routing do OpenRouter de forma configurável.

Quando a política de privacidade exigir:

```text
data_collection = deny
zdr = true
```

essas restrições deverão ser aplicadas no bloco `provider`.

Quando tais restrições impossibilitarem uma rota compatível, o sistema deverá falhar de forma segura em vez de relaxar silenciosamente a política de privacidade.

### Política de seleção

```text
Operação normal
       ↓
qwen/qwen3-coder:free
       ↓
OpenRouter realiza routing/failover entre providers disponíveis para o modelo
       ↓
erro terminal?
       ├── não → resposta
       │
       └── sim
             ↓
        retry único do Backend
             ↓
        ainda falhou?
             ↓
        openrouter/free
             ↓
        capability check
             ↓
        resposta
             ↓
        falha → resposta segura
```

O aplicativo não deverá assumir que o fallback é semanticamente equivalente ao Qwen3 Coder.

O modelo nunca será escolhido diretamente pelo usuário.

## 35.1.2 Tool Calling

* [x] O Agent utilizará **function/tool calling padronizado pelo OpenRouter**.
* [x] Cada Tool possuirá JSON Schema de entrada.
* [x] O Backend continuará sendo a autoridade final sobre autorização.
* [x] O LLM nunca poderá executar uma Tool diretamente sem passar pelo Backend.
* [x] Os argumentos produzidos pelo LLM serão validados pelo Backend antes da execução.
* [x] Tool Calls inválidos serão rejeitados.
* [x] Tools inexistentes ou não autorizadas serão rejeitadas.
* [x] O modelo não terá acesso a SQL arbitrário.
* [x] O MVP deverá preferir `tool_choice = auto`, salvo quando uma operação específica exigir outro comportamento.
* [x] O sistema deverá ser capaz de executar Tools de forma sequencial no loop do Agent.
* [x] `parallel_tool_calls` não será requisito do MVP.

O formato de Tools enviado ao OpenRouter deverá seguir o contrato OpenAI-compatible:

```json
{
  "type": "function",
  "function": {
    "name": "get_task",
    "description": "Obtém uma tarefa pertencente ao usuário autenticado.",
    "parameters": {
      "type": "object",
      "properties": {
        "taskId": {
          "type": "string"
        }
      },
      "required": ["taskId"],
      "additionalProperties": false
    }
  }
}
```

O Backend deverá validar a estrutura recebida e os argumentos antes da execução.

Fluxo:

```text
LLM
 ↓
Tool Call
 ↓
JSON Schema Validation
 ↓
Authorization
 ↓
Ownership Validation
 ↓
Domain Service
 ↓
Tool Result
 ↓
LLM
```

### Particularidade do Qwen3 Coder

O modelo Qwen3-Coder possui mecanismos próprios de tool calling quando servido diretamente com runtimes como vLLM, mas o MVP não executará o modelo diretamente.

Quando servido via OpenRouter, o Adapter deverá utilizar o protocolo padronizado do OpenRouter e não depender de parser, token especial ou formato interno específico do Qwen.

Isso preserva o desacoplamento do provider.

## 35.1.3 Structured Output

* [x] Structured Output será obrigatório para respostas estruturadas do Agent.
* [x] O formato será JSON Schema.
* [x] O schema deverá utilizar `strict: true` quando suportado pela rota.
* [x] O schema deverá utilizar `additionalProperties: false` quando compatível com o contrato.
* [x] O Backend realizará uma segunda validação independente.
* [x] Respostas inválidas não serão encaminhadas ao Frontend.
* [x] JSON livre não será utilizado quando existir schema formal.
* [x] O Frontend nunca confiará diretamente na saída bruta do LLM.

Para Chat Completions no OpenRouter, o Adapter deverá utilizar conceitualmente:

```json
{
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "agent_final_output",
      "strict": true,
      "schema": {}
    }
  }
}
```

### Separação entre Tool Calling e Structured Output

Tool Calling e Structured Output são mecanismos distintos:

```text
Tool Calling
→ `tools` + `tool_choice`

Structured Output
→ `response_format.type = json_schema`
```

Não assumir que a presença de Tools transforma automaticamente a resposta final em `AgentResponse`.

O Agent poderá executar uma ou mais Tools e somente após a conclusão do loop produzir o output estruturado final exigido pela operação.

### Tipos que utilizarão Structured Output

```text
ChartSpecification
AnalysisResult
InsightResult
AgentFinalOutput
```

As execuções de Tools utilizarão JSON Schema próprio de Tool Calling.

## 35.1.4 Schema definitivo do Agent Response

A resposta interna do Agent será composta por:

```text
AgentResponse
├── message
├── intent
├── status
├── tools
├── charts
├── insights
└── metadata
```

### Campos

```text
message
    texto final apresentado ao usuário

intent
    intenção identificada pelo Agent

status
    completed
    needs_clarification
    failed
    no_data

tools
    Tools executadas durante a operação

charts
    ChartSpecification[]

insights
    Insight[]

metadata
    model
    promptVersion
    executionId
```

O campo `charts` será opcional.

O Agent não deverá produzir `charts` quando não houver dados suficientes.

---

## 35.1.5 ChartSpecification

`ChartSpecification` será o contrato oficial entre Backend/Agent e Frontend para visualizações dinâmicas.

Schema conceitual obrigatório:

```text
ChartSpecification
├── schemaVersion
├── type
├── title
├── description
├── xAxis
├── yAxis
├── series
├── data
├── filters
├── source
└── datasetVersion
```

### schemaVersion

Formato:

```text
major.minor
```

Exemplo:

```text
1.0
```

Alterações incompatíveis deverão incrementar o `major`.

Alterações compatíveis deverão incrementar o `minor`.

### Tipos permitidos

```text
kpi
card
table
line
bar
area
donut
pie
scatter
comparison
heatmap
```

O LLM somente poderá selecionar valores pertencentes a essa enumeração.

---

## 35.1.6 Regras para geração de gráficos

* [x] O LLM não gera código de gráfico.
* [x] O LLM não gera JavaScript.
* [x] O LLM não gera React.
* [x] O LLM não gera SQL.
* [x] O LLM não executa Python.
* [x] O LLM não calcula métricas oficiais.
* [x] O LLM seleciona a visualização.
* [x] O Backend/Analytics calcula os dados.
* [x] O Frontend renderiza o resultado.

Fluxo oficial:

```text
Usuário
 ↓
LLM interpreta intenção
 ↓
Tool
 ↓
Backend
 ↓
FastAPI
 ↓
Pandas
 ↓
Dataset determinístico
 ↓
LLM escolhe visualização
 ↓
ChartSpecification
 ↓
Backend Validation
 ↓
Frontend
 ↓
Chart Component
```

---

## 35.1.7 Limite de datasets

Limite inicial para resposta analítica síncrona:

```text
500 pontos por série
20 séries por gráfico
10.000 células totais por dataset
```

Caso o dataset ultrapasse esses limites:

1. o Backend deverá agregar;
2. reduzir a granularidade;
3. paginar quando aplicável;
4. ou transformar a operação em processamento assíncrono.

O LLM não deverá receber datasets desnecessariamente grandes.

---

## 35.1.8 Estratégia de prompts

Os prompts serão versionados no repositório.

Estrutura:

```text
prompts/
└── agent/
    ├── system/
    │   └── v1.0.0
    ├── analysis/
    │   └── v1.0.0
    ├── chart/
    │   └── v1.0.0
    └── task/
        └── v1.0.0
```

Cada prompt possuirá:

```text
promptId
version
purpose
modelRequirements
systemInstructions
outputSchema
securityRules
createdAt
```

A versão utilizada deverá ser registrada em:

```text
ai_tool_executions
insights
ai_messages
```

### Regras


### Regras adicionais para Qwen3 Coder

Os prompts devem ser escritos de forma explícita e determinística, evitando instruções implícitas que dependam de interpretação livre.

Para operações com Tools:

```text
1. explicar a intenção permitida;
2. listar Tools disponíveis;
3. indicar quando uma Tool deve ou não ser usada;
4. proibir invenção de argumentos;
5. exigir uso somente dos campos do schema;
6. instruir que a Tool não deve ser declarada como executada antes do resultado real;
7. instruir que dados retornados por Tools são a única fonte factual para métricas e recursos persistentes.
```

O prompt não deverá assumir que o modelo possui acesso ao código do Backend, ao banco ou à infraestrutura.

O prompt deverá instruir o modelo a tratar conteúdo fornecido pelo usuário como dado não confiável.

* [x] Prompts não serão armazenados apenas no código de forma anônima.
* [x] Alterações comportamentais deverão gerar nova versão.
* [x] O Agent não poderá alterar seu próprio system prompt.
* [x] Conteúdo enviado pelo usuário será tratado como dado não confiável.
* [x] Instruções do usuário não poderão sobrescrever regras do system prompt.
* [x] Tool descriptions deverão possuir instruções claras de uso.
* [x] Prompts deverão ser testáveis isoladamente.

---

## 35.1.9 Context Manager

O Context Manager será responsável por construir o contexto enviado ao LLM.

O contexto deverá conter somente:

```text
system prompt
+
regras do Agent
+
mensagens necessárias da conversa
+
dados retornados pelas Tools
+
estado operacional necessário
```

Não deverão ser enviados:

* senha;
* token;
* refresh token;
* credenciais;
* dados de outros usuários;
* dados não necessários para a solicitação;
* conteúdo completo do banco;
* SQL;
* secrets.

O contexto deverá respeitar minimização de dados.

---

## 35.1.10 Retry e fallback

### LLM

Timeout inicial:

```text
30 segundos
```

Política:

```text
1ª tentativa
    ↓
erro transitório?
    ↓
retry único
    ↓
erro?
    ↓
fallback
    ↓
falha?
    ↓
resposta segura
```

Não haverá retry infinito.

Não haverá retry automático para erros de autorização ou schema obviamente inválido por erro de implementação.

### Structured Output inválido

Quando a resposta violar o schema:

```text
LLM
 ↓
Validation
 ↓
INVALID
 ↓
retry corretivo
 ↓
Validation
 ↓
INVALID
 ↓
fallback/reprocessamento
 ↓
Validation
 ↓
FAIL
 ↓
mensagem segura
```

Máximo inicial:

```text
2 tentativas de geração
```

---

## 35.1.11 Limites iniciais de uso do LLM

Limites iniciais por usuário:

```text
20 requisições de Agent por minuto
200 requisições de Agent por dia
```

Esses são limites da aplicação e não substituem os limites de conta, provider ou modelo do OpenRouter. Limites globais deverão ser configuráveis por ambiente.

O sistema deverá registrar:

```text
userId
requestId
model
inputTokens
outputTokens
latency
status
estimatedCost
```

O limite deverá ser aplicado no Backend, e não pelo Frontend.

Os valores poderão ser ajustados posteriormente através de mudança formal.

---

# 35.1.12 Analytics — contratos NestJS ↔ FastAPI

A comunicação entre NestJS e FastAPI utilizará contratos versionados.

Base:

```text
/api/internal/v1/analytics
```

As rotas internas não serão expostas publicamente.

Formato de sucesso:

```json
{
  "data": {}
}
```

Formato de erro:

```json
{
  "error": {
    "code": "ANALYTICS_ERROR",
    "message": "..."
  }
}
```

Toda operação possuirá:

```text
requestId
userScope
operation
schemaVersion
```

---

## 35.1.13 Contrato de entrada Analytics

Estrutura conceitual:

```text
AnalyticsRequest
├── schemaVersion
├── requestId
├── userId
├── operation
├── filters
├── groupBy
├── metrics
├── period
└── options
```

O `userId` deverá ser fornecido pelo Backend.

O FastAPI não poderá confiar em um `userId` fornecido diretamente pelo cliente.

Operações permitidas deverão ser enumeradas.

Não será permitido enviar SQL arbitrário.

---

## 35.1.14 Contrato de saída Analytics

Estrutura:

```text
AnalyticsResponse
├── schemaVersion
├── requestId
├── datasetVersion
├── generatedAt
├── metrics
├── dimensions
├── series
└── data
```

O resultado deverá possuir versão identificável.

O Agent utilizará `datasetVersion` para rastreabilidade.

---

## 35.1.15 Timeout Analytics

Operações síncronas:

```text
10 segundos
```

Após o timeout:

```text
NestJS
 ↓
timeout
 ↓
retorno controlado
```

Operações que excedam a capacidade síncrona deverão utilizar:

```text
BullMQ + Redis
```

Jobs assíncronos:

```text
PENDING
PROCESSING
COMPLETED
FAILED
```

---

## 35.1.16 Retry Analytics

Operações síncronas:

```text
máximo de 1 retry
```

Somente para erros transitórios.

Não realizar retry para:

* erro de validação;
* autorização;
* dados inválidos;
* operação inexistente.

Jobs assíncronos:

```text
3 tentativas
backoff exponencial
```

---

## 35.1.17 Idempotência

Toda operação assíncrona deverá possuir `idempotencyKey`.

Formato conceitual:

```text
userId
+
operation
+
period
+
requestHash
```

A mesma operação lógica não deverá gerar processamento duplicado.

Jobs concluídos não deverão ser executados novamente sem nova chave de idempotência.

---

# 35.1.18 Infraestrutura

## Cloud Provider

* [x] AWS será o Cloud Provider inicial.

Região principal:

```text
sa-east-1
```

São Paulo será a região primária de produção.

---

## PostgreSQL

* [x] Amazon RDS PostgreSQL.

Responsabilidades:

* persistência principal;
* backups;
* migrations;
* índices;
* alta disponibilidade conforme ambiente.

O Prisma continuará sendo o ORM.

---

## Redis

* [x] Amazon ElastiCache for Redis.

Uso:

* BullMQ;
* filas;
* locks;
* dados temporários;
* mecanismos de rate limiting quando aplicável.

Redis não será utilizado como banco principal do domínio.

---

## Object Storage

* [x] Amazon S3.

Uso:

* PDFs;
* relatórios;
* arquivos gerados;
* artefatos necessários ao sistema.

Buckets deverão ser privados por padrão.

---

## Deployment

* [x] AWS ECS Fargate.

Serviços:

```text
Web
Backend NestJS
Analytics FastAPI
Workers BullMQ
```

O Frontend Web poderá utilizar estratégia de hospedagem estática/CDN conforme a arquitetura de deployment definida para o ambiente.

---

## Secrets

* [x] AWS Secrets Manager.

Secrets não deverão ser armazenados:

* no Git;
* no código;
* no frontend;
* em imagens Docker;
* no SPEC.md;
* no context.md.

---

## DNS

* [x] Amazon Route 53.

---

## CDN

* [x] CloudFront quando aplicável.

Uso prioritário:

* frontend web;
* assets estáticos;
* distribuição de conteúdo público permitido.

Não utilizar CDN para dados privados da aplicação sem controle explícito de cache.

---

## Logs

* [x] Amazon CloudWatch.

Logs deverão possuir:

```text
timestamp
environment
service
requestId
userId quando permitido
severity
event
errorCode
```

Secrets e dados sensíveis não deverão ser registrados.

---

# 35.1.19 Retenção de dados

A política inicial do MVP será:

| Dados | Retenção |
|---|---:|
| Conversas IA | 180 dias |
| Mensagens IA | 180 dias |
| Execuções de Tools | 365 dias |
| Logs de aplicação | 30 dias |
| Logs de segurança | 180 dias |
| Jobs processados | 30 dias |
| Relatórios semanais | 365 dias |

Dados acadêmicos do usuário não serão excluídos automaticamente somente por decurso de prazo operacional.

A exclusão de dados pessoais deverá seguir a política de privacidade e os mecanismos de exclusão definidos pela aplicação.

Os períodos de retenção deverão ser configuráveis por ambiente quando tecnicamente aplicável.

---

# 35.1.20 Rate Limiting

Limites iniciais:

```text
API geral:
100 requests/minuto por usuário

AI Agent:
20 requests/minuto por usuário

Login:
10 tentativas/15 minutos por usuário/IP

OTP:
5 tentativas por código

Endpoints internos:
somente comunicação autenticada entre serviços
```

O Backend será responsável pelo rate limiting.

O Frontend não poderá ser utilizado como mecanismo de proteção.

Limites específicos poderão ser definidos por endpoint quando necessário.

---

# 35.1.21 Segurança entre NestJS e FastAPI

A comunicação interna deverá utilizar:

```text
HTTPS/TLS
+
autenticação de serviço
+
allowlist de rede
+
validação de schema
+
requestId
```

O FastAPI não será publicamente acessível.

Somente o Backend autorizado poderá solicitar operações analíticas.

---

# 35.1.22 Segurança do Agent

O Agent deverá operar sob o princípio:

```text
LLM = componente não confiável
Backend = autoridade
Database = domínio protegido
Tools = interface controlada
```

O LLM não possui autoridade própria.

Toda alteração de dados deverá passar pelas regras do Backend.

Toda Tool deverá validar:

```text
autenticação
autorização
ownership
input
business rules
risk level
```

---

# 35.1.23 Decisão sobre memória, RAG e Vector Database

Não serão utilizados no MVP:

```text
Vector Database
RAG avançado
memória semântica
embeddings
multi-agent
fine-tuning
ML preditivo
```

O Agent utilizará:

```text
conversa recente necessária
+
dados estruturados das Tools
+
contexto operacional mínimo
```

A introdução de memória semântica ou RAG deverá ser uma mudança formal futura via OpenSpec.

---

# 35.1.24 Critérios de confiabilidade do Agent

O Agent deverá:

1. nunca inventar métricas;
2. nunca inventar dados;
3. nunca inventar resultados de Tools;
4. nunca afirmar que executou uma ação que não foi executada;
5. distinguir dados de inferências;
6. informar ausência de dados;
7. utilizar Structured Output quando aplicável;
8. validar Tool Calls;
9. validar respostas estruturadas;
10. respeitar o escopo do usuário.

Quando não houver dados suficientes:

```text
Não há dados suficientes para gerar este resultado.
```

---

# 35.1.25 Decisão final de arquitetura

A arquitetura oficial do Agent no MVP será:

```text
                    ┌──────────────────┐
                    │     Web/Mobile   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   AI Agent API   │
                    │     NestJS       │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Agent Orchestrator│
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        Context Manager  Tool Registry  Provider Adapter
                                             │
                                             ▼
                                      Qwen3 Coder 480B A35B (`qwen/qwen3-coder:free`)
                                             │
                                      fallback Luna
                                             │
                                             ▼
                                      Structured Output
              │              │
              ▼              ▼
       Task Tools      Analytics Tools
                             │
                             ▼
                         FastAPI
                             │
                           Pandas
                             │
                             ▼
                     Dataset determinístico
                             │
                             ▼
                      ChartSpecification
                             │
                             ▼
                      Backend Validation
                             │
                             ▼
                         Web/Mobile
                             │
                             ▼
                       Chart Renderer
```

Essa arquitetura mantém a separação definida no projeto:

```text
Backend/Analytics
    ↓
calcula

IA
    ↓
interpreta

Frontend
    ↓
apresenta
```

Nenhuma camada poderá assumir responsabilidade pertencente à outra.

---

# 36. Pontos ainda sujeitos à especificação

1. `NestJS + Fastify` é a stack definida do Backend.
2. Prisma é o ORM definido.
3. JWT é o mecanismo principal de autenticação do MVP.
4. OAuth e serviços externos de autenticação não fazem parte do MVP.
5. Os endpoints listados são recursos previstos e devem possuir contratos definitivos antes da implementação de cada módulo.
6. A lista de Tools é inicial e poderá evoluir mediante OpenSpec.
7. Os contratos detalhados das Tools poderão evoluir por capability, mantendo validação estrita.
8. A duração exata dos tokens e a estratégia final de rotação devem permanecer formalizadas antes da implementação da autenticação.
9. Os limites operacionais do LLM são configuráveis e podem ser ajustados mediante mudança formal.
10. A política de retenção permanece sujeita às regras de privacidade da aplicação.
11. O único protótipo oficial é o Stitch `13596816261153646269`.
12. O `schema.prisma` deve permanecer separado e representa o modelo físico oficial.
13. O estado de implementação não pode ser inferido do `SPEC.md`.
14. `agent_execution_id` deve manter rastreabilidade com a execução da Tool responsável pela alteração.
15. Mensagens `TOOL` devem ser rastreáveis às execuções correspondentes quando aplicável.
16. A geração de relatórios deve utilizar processamento assíncrono.
17. Nenhuma implementação dependente de decisão P0 deve começar antes da resolução dessa decisão.
18. O provider do MVP é OpenRouter e o modelo principal é `qwen/qwen3-coder:free`.
19. O fallback de aplicação é `openrouter/free`, sujeito a capability check para a operação solicitada.
20. O Adapter utilizará Chat Completions do OpenRouter como contrato principal do MVP.
21. Responses API do OpenRouter não é requisito do MVP.
22. O AgentResponse final é montado/validado pelo Backend; o LLM não pode declarar execução de Tool como fato.

---

# 37. Regra para Futuras Alterações

Antes de modificar o projeto:

1. consultar este `SPEC.md`;
2. consultar `schema.prisma` para alterações de dados;
3. consultar `DESIGN.md` para UI/UX;
4. verificar o estado real do código;
5. procurar componentes/módulos/serviços existentes;
6. não inventar requisitos, endpoints, métricas ou schemas;
7. não escolher decisões marcadas como `A DEFINIR`;
8. respeitar as restrições arquiteturais;
9. formalizar novas decisões na especificação;
10. atualizar `schema.prisma` quando uma alteração aprovada modificar o modelo físico;
11. atualizar `DESIGN.md` quando uma alteração aprovada modificar o Design System;
12. utilizar OpenSpec para alterações formais de comportamento ou requisitos;
13. não considerar uma funcionalidade implementada apenas porque ela aparece como definida no `SPEC.md`.

---

# 38. Fontes de Verdade

```text
SPEC.md
  ├── requisitos
  ├── arquitetura
  ├── regras de negócio
  ├── decisões
  └── pendências

schema.prisma
  ├── modelos Prisma
  ├── tipos
  ├── enums
  ├── relações
  ├── índices
  └── constraints

DESIGN.md
  ├── Design System
  ├── tokens
  ├── cores
  ├── tipografia
  ├── componentes
  ├── responsividade
  └── acessibilidade

Protótipo Stitch
  ├── composição das telas
  └── fluxos de frontend

context.md
  ├── contexto operacional
  ├── convenções
  ├── estrutura do projeto
  ├── instruções para agentes
  └── regras de trabalho
```

Em caso de alteração do modelo de dados, o `schema.prisma` deve ser atualizado de forma consistente com esta especificação.

O protótipo Stitch orienta composição e fluxos de frontend, mas não substitui o `DESIGN.md` como fonte de verdade visual.

O `context.md` não substitui o `SPEC.md`, `schema.prisma` ou `DESIGN.md`. Ele serve como contexto operacional para agentes e ferramentas de desenvolvimento.

---

# 39. Princípio Final

```text
DADOS
  ↓
PostgreSQL
  ↓
Prisma
  ↓
Backend / Analytics
  ↓
Dados estruturados
  ├──→ Dashboard
  └──→ IA
          ↓
       Insights
          ↓
      Web / Mobile
```

Para ações do Agente:

```text
Usuário
  ↓
AI Agent
  ↓
Tool
  ↓
Autorização
  ↓
Backend
  ↓
Domain Service
  ↓
PostgreSQL
```

A IA não substitui o banco, o Backend, as regras de negócio, os cálculos determinísticos ou a autorização.

---

# 40A. Verificação específica do runtime Qwen3 Coder

Antes de considerar o Agent pronto para produção, o CI/ambiente de staging deve possuir um smoke test do provider que valide:

```text
1. autenticação OpenRouter;
2. modelo `qwen/qwen3-coder:free` disponível;
3. Tool Calling funcional;
4. argumentos compatíveis com JSON Schema;
5. Structured Output com `response_format.type = json_schema`;
6. validação `strict` quando suportada;
7. fallback `openrouter/free` compatível com Tool Calling;
8. fallback `openrouter/free` compatível com Structured Output;
9. timeout e retry;
10. registro de modelo/promptVersion;
11. falha segura quando nenhuma rota suportar as capacidades exigidas.
```

O smoke test não deve executar operações destrutivas reais. Para Tools mutáveis, utilizar Tool fake/stub ou ambiente de teste.

# 40. Governança da Especificação

Este documento é a fonte de verdade dos requisitos permanentes do produto.

O projeto utiliza **TLC Spec-Driven Development** como processo principal de desenvolvimento e **OpenSpec** para gerenciamento formal de mudanças.

### Responsabilidades

* `SPEC.md`: requisitos funcionais, regras de negócio, comportamento esperado, arquitetura e decisões permanentes do produto.
* `DESIGN.md`: Design System, tokens, componentes, regras visuais, responsividade e acessibilidade.
* `context.md`: contexto operacional, convenções e instruções para agentes.
* `schema.prisma`: modelo de dados persistente, incluindo modelos, tipos, enums, relações, índices e constraints.
* `openspec/`: mudanças em desenvolvimento e seus artefatos associados.

Uma mudança OpenSpec não deve duplicar integralmente o conteúdo deste documento.

Ela deve registrar somente o delta necessário em relação ao estado atual do projeto.

Quando uma mudança concluída introduzir um novo requisito permanente, o conhecimento permanente deve ser consolidado neste documento.

O estado de implementação deve ser verificado no código e nos artefatos do projeto, e nunca inferido apenas a partir deste documento.

---

# 41. Regra de Precedência entre Fontes

Quando houver divergência entre os artefatos, aplicar a seguinte regra:

1. **Requisitos e comportamento do produto:** `SPEC.md`;
2. **Modelo físico de dados:** `schema.prisma`;
3. **Design System e regras visuais:** `DESIGN.md`;
4. **Composição e fluxo visual de telas:** Protótipo Stitch;
5. **Contexto operacional e instruções para agentes:** `context.md`;
6. **Mudanças em desenvolvimento:** `openspec/`.

Nenhum agente deve resolver uma divergência inventando uma decisão.

Quando houver conflito real entre fontes de verdade, a implementação deve ser interrompida para que a decisão seja formalizada e os documentos afetados sejam atualizados.

---

# 42. Regra sobre Estado de Implementação

O `SPEC.md` define **o que o sistema deve fazer**, e não **o que já foi implementado**.

O estado de implementação deve ser determinado através da análise do:

* código-fonte;
* migrations;
* `schema.prisma`;
* testes;
* configurações;
* infraestrutura;
* artefatos OpenSpec;
* pipelines de CI/CD.

Uma funcionalidade marcada como decisão definida não deve ser considerada implementada automaticamente.

Da mesma forma, uma funcionalidade presente no código mas ausente do `SPEC.md` não deve ser considerada parte oficial do produto até que sua existência seja validada e, quando necessário, formalizada.

---

# 43. Princípio de Não-Invenção

Agentes e desenvolvedores devem evitar assumir informações não definidas.

Não devem ser inventados:

* requisitos;
* endpoints;
* campos;
* métricas;
* regras de negócio;
* schemas;
* Tools;
* permissões;
* provedores;
* modelos de IA;
* fluxos;
* componentes;
* integrações.

Quando uma informação for necessária para implementar corretamente uma funcionalidade e não estiver definida nas fontes de verdade, a implementação deve:

1. identificar a lacuna;
2. registrar a pendência;
3. propor uma decisão quando apropriado;
4. formalizar a decisão através do processo TLC/OpenSpec;
5. somente então implementar a alteração dependente dessa decisão.
