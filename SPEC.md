# EduTrack AI — Especificação Técnica

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
| IA                            | LLM Provider — A DEFINIR  |
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

## 17. Agente de IA

O Agente possui dois papéis:

### Inteligência analítica

* interpretar dados preparados;
* gerar insights;
* gerar análises personalizadas;
* contextualizar resultados;
* gerar recomendações.

### Assistente operacional

* compreender solicitações;
* consultar dados;
* executar ações autorizadas;
* criar tarefas;
* alterar tarefas quando autorizado;
* concluir tarefas quando autorizado.

Arquitetura:

```text
Usuário
  ↓
Web / Mobile
  ↓
AI Agent API
  ↓
Agent Orchestrator
  ├── Context Manager
  ├── LLM Provider Adapter
  ├── Analytics Tools
  ├── Task Tools
  └── Application Tools
  ↓
Validação / Autorização
  ↓
Domain Services
  ↓
Execução
  ↓
Resposta estruturada
```

O Agente não possui acesso direto ao PostgreSQL e não executa SQL arbitrário.

O LLM é acessado exclusivamente através de um **Provider Adapter**, mantendo a arquitetura independente do fornecedor.

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

O schema definitivo do Structured Output ainda precisa ser formalizado.

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

## 35.1 P0 — Obrigatório antes da implementação

### IA

* [x] Definir arquitetura provider-agnostic para LLM.
* [x] Definir utilização de Provider Adapter para desacoplar o Agent do provedor.
* [x] Definir que o Agent não acessa PostgreSQL diretamente.
* [x] Definir que o Agent utiliza exclusivamente Tools controladas pelo Backend.
* [x] Definir auditoria obrigatória das execuções de Tools.
* [x] Definir níveis de risco para Tools.
* [x] Definir que operações de leitura não exigem confirmação.
* [x] Definir que operações de escrita explicitamente solicitadas podem ser executadas após validação.
* [x] Definir que operações destrutivas exigem confirmação explícita.
* [x] Definir Structured Output como padrão para respostas estruturadas.
* [ ] Definir o schema definitivo do Structured Output.
* [ ] Definir o provider LLM inicial.
* [ ] Definir o modelo principal.
* [ ] Definir o modelo fallback.
* [ ] Definir a estratégia de prompts e versionamento.
* [ ] Definir limites iniciais de custo e uso do LLM.

### Autenticação

* [x] JWT como mecanismo principal de autenticação.
* [x] Access Token com curta duração.
* [x] Refresh Token para renovação de sessão.
* [x] Refresh Token revogável.
* [x] Argon2id para hash de senhas.
* [x] Backend como autoridade central de autenticação e autorização.
* [ ] Definir duração exata do Access Token.
* [ ] Definir duração exata do Refresh Token.
* [ ] Definir estratégia de rotação de Refresh Tokens.
* [ ] Definir política de encerramento/revogação de sessões.

### API

* [x] REST.
* [x] JSON.
* [x] HTTPS em produção.
* [x] Prefixo `/api/v1`.
* [x] OpenAPI/Swagger.
* [ ] Definir contratos definitivos dos endpoints do MVP.
* [ ] Definir paginação padrão.
* [ ] Definir padrão de filtros e ordenação.
* [ ] Definir formato definitivo de erros.
* [ ] Definir política de versionamento da API.

### Banco de Dados

* [x] PostgreSQL.
* [x] Prisma.
* [x] `schema.prisma` como fonte de verdade do modelo físico.
* [x] Migrations versionadas.
* [x] Foreign Keys.
* [x] Isolamento obrigatório entre usuários.
* [ ] Validar o `schema.prisma` final contra todos os requisitos do MVP.
* [ ] Definir política de backup e restauração.

### Analytics

* [x] Python.
* [x] FastAPI.
* [x] Pandas.
* [x] Métricas oficiais calculadas deterministicamente.
* [x] IA recebe dados estruturados e processados.
* [x] HTTP interno para operações analíticas síncronas.
* [x] Queue para operações analíticas pesadas ou assíncronas.
* [x] BullMQ para processamento assíncrono.
* [ ] Definir contratos entre NestJS e FastAPI.
* [ ] Definir schemas de entrada e saída do serviço Analytics.
* [ ] Definir timeout e política de retry entre serviços.
* [ ] Definir idempotência dos jobs analíticos.

### Infraestrutura

* [x] Monorepo.
* [x] pnpm.
* [x] Redis.
* [x] BullMQ.
* [x] Object Storage compatível com S3.
* [x] FCM para Push.
* [ ] Definir Cloud Provider.
* [ ] Definir provedor PostgreSQL.
* [ ] Definir provedor Redis.
* [ ] Definir provedor de Object Storage.
* [ ] Definir estratégia de deployment.
* [ ] Definir gerenciamento de secrets.
* [ ] Definir DNS.
* [ ] Definir CDN quando aplicável.

### Segurança

* [x] HTTPS em produção.
* [x] Secrets fora do versionamento.
* [x] Hash de senha com Argon2id.
* [x] Validação de entrada.
* [x] Rate limiting.
* [x] Autorização no Backend.
* [x] Minimização de dados enviados à IA.
* [x] Auditoria das Tools.
* [x] Proteção contra prompt injection.
* [x] Proteção contra data leakage.
* [ ] Definir política de retenção dos dados.
* [ ] Definir política de retenção de logs.
* [ ] Definir limites de rate limiting.

---

## 35.2 P1 — Obrigatório para conclusão do MVP

### Agent

* [ ] Implementar fluxo completo de execução do Agent.
* [ ] Implementar `create_task`.
* [ ] Implementar `list_tasks`.
* [ ] Implementar `get_task`.
* [ ] Implementar `update_task`.
* [ ] Implementar `complete_task`.
* [ ] Implementar `get_user_metrics`.
* [ ] Implementar `get_dashboard_data`.
* [ ] Implementar `generate_analysis`.
* [ ] Implementar confirmação de ações de alto risco.
* [ ] Implementar registro completo em `ai_tool_executions`.
* [ ] Implementar validação de Structured Output.
* [ ] Implementar tratamento de respostas inválidas do modelo.

**Regra:** nenhuma implementação do Agent deve começar enquanto as decisões P0 das quais ela depende permanecerem indefinidas.

### Dashboard

* [ ] Implementar KPIs oficiais.
* [ ] Implementar métricas por disciplina.
* [ ] Implementar métricas temporais.
* [ ] Implementar progresso por entregas.
* [ ] Implementar tempo total estudado.
* [ ] Implementar eficiência por dificuldade.
* [ ] Implementar gráficos definidos pelo Design System.
* [ ] Integrar Insights da IA ao Dashboard.

### Tarefas

* [ ] Implementar criação de tarefas.
* [ ] Implementar edição de tarefas.
* [ ] Implementar conclusão.
* [ ] Implementar reabertura.
* [ ] Implementar cancelamento.
* [ ] Implementar prioridades.
* [ ] Implementar dificuldades.
* [ ] Implementar tarefas com e sem prazo.
* [ ] Implementar histórico de alterações.
* [ ] Garantir isolamento de dados por usuário.

### Sessões de estudo

* [ ] Implementar criação de sessão.
* [ ] Implementar encerramento de sessão.
* [ ] Persistir `duration_seconds`.
* [ ] Permitir vínculo com tarefa ou somente disciplina.
* [ ] Utilizar sessões como fonte oficial das métricas de tempo estudado.

### Notificações

* [ ] Implementar registro de dispositivos.
* [ ] Integrar FCM.
* [ ] Implementar alerta de tarefa 24h antes do prazo.
* [ ] Respeitar `notifications_enabled`.
* [ ] Impedir notificações para tarefas concluídas ou canceladas.
* [ ] Registrar `notification_deliveries`.
* [ ] Implementar tratamento de falhas de entrega.

### Relatórios

* [ ] Implementar geração semanal.
* [ ] Implementar pipeline NestJS → FastAPI → Pandas.
* [ ] Implementar processamento assíncrono via BullMQ.
* [ ] Implementar geração de gráficos.
* [ ] Integrar insights da IA.
* [ ] Gerar PDF.
* [ ] Armazenar PDF em Object Storage.
* [ ] Persistir metadados em `weekly_reports`.
* [ ] Garantir unicidade por usuário e período.
* [ ] Garantir idempotência do processamento.

### Frontend Web

* [ ] Implementar autenticação.
* [ ] Implementar navegação principal.
* [ ] Implementar disciplinas.
* [ ] Implementar tarefas.
* [ ] Implementar sessões de estudo.
* [ ] Implementar Dashboard.
* [ ] Implementar notificações.
* [ ] Implementar relatórios.
* [ ] Implementar interface do Agent.
* [ ] Aplicar integralmente o `DESIGN.md`.
* [ ] Integrar o protótipo oficial do Stitch como referência de composição.

### Mobile

* [ ] Implementar autenticação.
* [ ] Implementar navegação.
* [ ] Implementar disciplinas.
* [ ] Implementar tarefas.
* [ ] Implementar sessões de estudo.
* [ ] Implementar Dashboard.
* [ ] Implementar Push Notifications.
* [ ] Implementar interface do Agent.
* [ ] Implementar armazenamento seguro da sessão.

### Testes

* [ ] Testes unitários das regras de negócio.
* [ ] Testes dos cálculos analíticos.
* [ ] Testes de integração API → Service → Prisma → PostgreSQL.
* [ ] Testes de autorização.
* [ ] Testes E2E do fluxo principal.
* [ ] Testes das Tools da IA.
* [ ] Testes de confirmação de ações.
* [ ] Testes de notificações.
* [ ] Testes de geração de relatórios.
* [ ] Testes de isolamento entre usuários.
* [ ] Testes de respostas inválidas do LLM.

### CI/CD

* [ ] Lint automatizado.
* [ ] Type Check automatizado.
* [ ] Testes automatizados.
* [ ] Build automatizado.
* [ ] Deploy de Staging.
* [ ] Processo de homologação.
* [ ] Deploy de Production.
* [ ] Proteção da branch de produção.

---

## 35.3 P2 — Descartado do projeto atual

Os itens classificados como P2 foram removidos do escopo atual do EduTrack AI.

Não devem ser implementados durante o desenvolvimento do MVP.

Entre os itens descartados estão:

* Memória semântica;
* Vector Database;
* RAG avançado;
* Previsão acadêmica;
* Machine Learning preditivo;
* Detecção avançada de anomalias;
* Modelos próprios de Machine Learning;
* Personalização avançada baseada em histórico de longo prazo;
* Arquiteturas multi-agent;
* Fine-tuning de modelos;
* Sistemas avançados de recomendação;
* Processamento analítico distribuído;
* Outras funcionalidades avançadas que não sejam necessárias para os fluxos definidos no MVP.

Esses recursos somente poderão retornar ao escopo mediante uma nova decisão de produto e uma mudança formalizada pelo OpenSpec.

---

## 35.4 Regra de resolução das pendências

Uma pendência P0 deve ser resolvida antes da implementação da funcionalidade que depende dela.

Uma pendência P1 deve ser resolvida antes da conclusão do MVP.

Quando uma pendência for decidida:

1. registrar a decisão em `SPEC.md`;
2. remover a marcação de pendência;
3. atualizar as seções afetadas;
4. atualizar `schema.prisma` quando houver impacto no modelo de dados;
5. atualizar `DESIGN.md` quando houver impacto visual;
6. criar uma mudança OpenSpec quando a decisão representar alteração formal do produto.

Nenhuma decisão P2 deve ser implementada como parte do MVP.

---

# 36. Conflitos e Pontos a Esclarecer

1. `NestJS + Fastify` é a stack definida do Backend.
2. Prisma é o ORM definido.
3. JWT é o mecanismo principal de autenticação do MVP.
4. OAuth e serviços externos de autenticação não fazem parte do MVP.
5. Os endpoints listados são recursos previstos e não contratos definitivos.
6. A lista de Tools é inicial e poderá evoluir mediante especificação.
7. O Structured Output ainda precisa de schema formal.
8. Os contratos NestJS ↔ FastAPI ainda precisam ser formalizados.
9. O provedor/modelo de IA ainda não foi decidido.
10. Os provedores de infraestrutura ainda não foram decididos.
11. O único protótipo oficial é o Stitch `13596816261153646269`.
12. O `schema.prisma` deve permanecer separado e representa o modelo físico oficial.
13. O estado de implementação não pode ser inferido do `SPEC.md`.
14. `agent_execution_id` deve manter rastreabilidade com a execução da Tool responsável pela alteração.
15. Mensagens `TOOL` devem ser rastreáveis às execuções correspondentes quando aplicável.
16. A geração de relatórios deve utilizar processamento assíncrono.
17. Nenhuma implementação dependente de decisão P0 deve começar antes da resolução dessa decisão.

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
