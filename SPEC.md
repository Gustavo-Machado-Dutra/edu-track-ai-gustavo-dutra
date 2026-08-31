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

## 2. Escopo do MVP

O MVP possui um único perfil funcional: **Student/User**.

Cada usuário possui seus próprios:

- dados;
- disciplinas;
- tarefas;
- sessões de estudo;
- notificações;
- conversas com IA;
- insights;
- relatórios.

Nenhum usuário poderá acessar dados pertencentes a outro usuário.

RBAC poderá ser adicionado posteriormente caso seja necessário um perfil administrativo.

## 3. Protótipo Oficial de Frontend

O único protótipo oficial é:

https://stitch.withgoogle.com/projects/13596816261153646269

O protótipo orienta a composição das telas, estrutura da interface e fluxos de navegação.

Não utilizar outros projetos do Google Stitch como referência oficial.

As regras visuais, tokens, componentes, tipografia, cores, espaçamentos, responsividade e acessibilidade são definidas pelo **Cyber-Academic System** em `DESIGN.md`.

## 4. Arquitetura

```text
                         Usuário
                            │
                 ┌──────────┴──────────┐
                 │                     │
            React Web            React Native
                 │                     │
                 └──────────┬──────────┘
                            │ HTTPS
                            ▼
                    NestJS + Fastify
                       Backend API
                            │
          ┌─────────────────┼──────────────────┐
          │                 │                  │
          ▼                 ▼                  ▼
   Domain Services    Analytics Service    AI Agent
          │                 │                  │
          │                 ▼                  │
          │          Python Data Service       │
          │                 │                  │
          │              Pandas                │
          │                 │                  │
          └────────┬────────┴──────────────────┘
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

**Python/Pandas:** processamento analítico, preparação de datasets, séries temporais, agregações, comparação por dificuldade, preparação para IA e relatórios PDF.

**IA:** interpretação, insights, análises personalizadas, contextualização, recomendações e execução de ações autorizadas.

## 5. Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Web | React + TypeScript |
| Mobile | React Native + TypeScript |
| Runtime Backend | Node.js |
| Backend | NestJS |
| HTTP Adapter | Fastify |
| API | REST + JSON + HTTPS |
| Banco | PostgreSQL |
| ORM | Prisma |
| Analytics | Python + Pandas |
| API Python | FastAPI |
| IA | LLM Provider — A DEFINIR |
| API Docs | OpenAPI/Swagger |
| Versionamento | Git/GitHub |
| CI/CD | Pipeline automatizado |
| Design System | Cyber-Academic System |

Pandas é a ferramenta oficial de análise nesta versão.

## 6. Frontend Web

Tecnologia: **React + TypeScript**.

Responsabilidades:

- interface;
- navegação;
- gerenciamento de estado;
- comunicação com API;
- validação de formulários;
- sessão;
- mensagens de erro/sucesso;
- componentes do Design System;
- dashboards;
- tarefas;
- experiência de IA.

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

## 7. Mobile

Tecnologia: **React Native + TypeScript**.

Plataformas:

- Android;
- iOS.

Responsabilidades:

- telas;
- navegação;
- autenticação;
- API;
- estado;
- armazenamento seguro de sessão;
- conectividade;
- recursos nativos quando aplicável.

O Mobile utiliza o mesmo Backend e as mesmas regras de negócio do Web.

## 8. Backend

Tecnologia: **Node.js + NestJS + Fastify**.

Responsabilidades:

- APIs REST;
- autenticação;
- autorização;
- validação;
- regras de negócio;
- persistência;
- consultas;
- relacionamentos;
- integrações;
- logs;
- erros;
- documentação.

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

## 9. API

A API utiliza:

- REST;
- JSON;
- HTTPS;
- `/api/v1`.

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

## 10. Autenticação e Autorização

A aplicação deve possuir autenticação centralizada.

Alternativas consideradas:

- JWT;
- OAuth;
- serviço especializado.

O fluxo JWT é conceitualmente:

```text
Usuário
 ↓
POST /api/v1/auth/login
 ↓
Backend valida credenciais
 ↓
JWT
 ↓
Cliente armazena sessão
 ↓
Requests autenticadas
```

Autenticação e autorização são responsabilidades distintas.

O sistema deve garantir isolamento entre usuários.

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

- `id`;
- `name`;
- `email`;
- `password_hash`;
- `timezone`;
- `notifications_enabled`;
- `created_at`;
- `updated_at`.

Timezone padrão: `America/Sao_Paulo`.

### Subject

Campos:

- `id`;
- `user_id`;
- `name`;
- `professor`;
- `workload_hours`;
- `description`;
- `start_date`;
- `end_date`;
- `archived_at`;
- `created_at`;
- `updated_at`.

Regras:

1. pertence a exatamente um usuário;
2. usuário pode possuir várias disciplinas;
3. pode possuir várias tarefas;
4. pode possuir várias sessões de estudo;
5. disciplina arquivada deixa de ser ativa;
6. exclusão remove tarefas e sessões associadas por cascade, conforme o schema.

### AcademicTask

Campos:

- `id`;
- `user_id`;
- `subject_id`;
- `title`;
- `description`;
- `status`;
- `priority`;
- `difficulty`;
- `due_date`;
- `estimated_minutes`;
- `completed_at`;
- `created_by`;
- `agent_execution_id`;
- `created_at`;
- `updated_at`.

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

### StudySession

Campos:

- `id`;
- `user_id`;
- `subject_id`;
- `task_id`;
- `started_at`;
- `ended_at`;
- `duration_seconds`;
- `created_at`.

Pode estar vinculada a uma tarefa ou somente a uma disciplina. É a fonte principal das métricas de tempo estudado.

### TaskHistory

Registra alterações relevantes, incluindo:

- status;
- prioridade;
- prazo;
- usuário;
- tarefa;
- timestamp.

É utilizado para auditoria e análises futuras.

### PushDevice

Representa dispositivo de Push:

- `id`;
- `user_id`;
- `provider`;
- `token`;
- `platform`;
- `active`;
- `created_at`;
- `updated_at`.

Token é único.

### NotificationDelivery

Registra entregas:

- `id`;
- `user_id`;
- `task_id`;
- `device_id`;
- `type`;
- `status`;
- `scheduled_at`;
- `sent_at`;
- `error_message`;
- `created_at`.

Tipo inicial: `TASK_DUE_24H`.

Status: `PENDING`, `SENT`, `FAILED`, `CANCELLED`.

### AIConversation

Conversa do usuário com o Agente:

- `id`;
- `user_id`;
- `title`;
- `created_at`;
- `updated_at`.

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

- `id`;
- `conversation_id`;
- `role`;
- `content`;
- `created_at`.

### AIToolExecution

Auditoria de Tools:

- `id`;
- `user_id`;
- `conversation_id`;
- `intent`;
- `tool_name`;
- `input_json`;
- `output_json`;
- `status`;
- `model`;
- `prompt_version`;
- `created_at`;
- `completed_at`.

Status:

```text
PENDING
SUCCESS
FAILED
REJECTED
```

### Insight

Campos:

- `id`;
- `user_id`;
- `type`;
- `title`;
- `description`;
- `confidence`;
- `period_start`;
- `period_end`;
- `metrics_json`;
- `dataset_version`;
- `model`;
- `prompt_version`;
- `status`;
- `created_at`;
- `expires_at`.

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

- `id`;
- `user_id`;
- `period_start`;
- `period_end`;
- `status`;
- `storage_key`;
- `file_name`;
- `generated_at`;
- `created_at`.

Status:

```text
PENDING
PROCESSING
COMPLETED
FAILED
```

Existe unicidade por usuário e período.

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
 │                  └── AcademicTask
 │
 ├── Insight
 └── WeeklyReport
```

Foreign keys garantem integridade referencial. Migrations devem ser versionadas com Prisma.

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

`delivery_progress` e `efficiency` são métricas distintas inicialmente. Não criar média composta sem definição formal dos pesos.

## 14. Métricas Oficiais

### Geral

- total de disciplinas ativas;
- total de tarefas;
- tarefas concluídas;
- tarefas pendentes;
- tarefas atrasadas;
- progresso por entregas;
- tempo total estudado.

### Por disciplina

- tarefas totais;
- tarefas concluídas;
- tarefas pendentes;
- tarefas atrasadas;
- progresso por entregas;
- tempo estudado;
- evolução de eficiência por dificuldade.

### Temporais

- tempo estudado por dia;
- tarefas concluídas por dia;
- tarefas atrasadas por período;
- evolução semanal do progresso;
- evolução da eficiência em tarefas de mesma dificuldade.

Nenhuma métrica adicional deve ser criada sem especificação.

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

- KPI;
- Card;
- tabela;
- linha;
- barras;
- área;
- donut/pie;
- dispersão;
- comparação;
- heatmap.

A escolha deve considerar o tipo de informação. Não utilizar gráficos apenas por estética.

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

- processamento analítico;
- agregações;
- séries temporais;
- comparação por dificuldade;
- preparação para IA;
- geração de relatórios PDF.

O serviço Python não deverá expor o PostgreSQL diretamente à internet.

Deverá:

- receber somente dados necessários;
- possuir autenticação/autorização entre serviços;
- registrar logs;
- controlar versões de pipelines;
- tratar falhas;
- permitir reprocessamento.

A comunicação NestJS ↔ Python ainda precisa de decisão definitiva.

Opções consideradas:

- API HTTP interna;
- fila;
- jobs agendados;
- combinação síncrona/assíncrona.

## 17. Agente de IA

O Agente possui dois papéis:

### Inteligência analítica

- interpretar dados preparados;
- gerar insights;
- gerar análises personalizadas;
- contextualizar resultados;
- gerar recomendações.

### Assistente operacional

- compreender solicitações;
- consultar dados;
- executar ações autorizadas;
- criar tarefas;
- alterar tarefas quando autorizado;
- concluir tarefas quando autorizado.

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
 ├── LLM Provider
 ├── Analytics Tools
 ├── Task Tools
 └── Application Tools
 ↓
Validação / Autorização
 ↓
Execução
 ↓
Resposta estruturada
```

O Agente não possui acesso direto ao PostgreSQL e não executa SQL arbitrário.

## 18. Tools do Agente

Tools conceituais iniciais:

```text
create_task
list_tasks
update_task
complete_task
get_user_metrics
get_dashboard_data
generate_analysis
```

A lista definitiva poderá ser expandida por novas especificações.

### Criação de tarefas

Quando o usuário solicitar explicitamente uma ou mais tarefas:

1. interpretar a solicitação;
2. identificar título, descrição, prioridade, prazo e demais campos disponíveis;
3. pedir esclarecimento somente se faltar informação obrigatória que não possa ser inferida com segurança;
4. validar permissões;
5. chamar a Tool;
6. persistir pelo Backend;
7. confirmar ao usuário.

Criação explícita de tarefa é ação de baixo risco após validação.

Ações destrutivas, irreversíveis ou que afetem dados importantes exigem confirmação explícita.

## 19. Auditoria da IA

Toda execução deve ser rastreável.

Quando aplicável:

- usuário;
- conversa;
- intenção;
- ferramenta;
- parâmetros;
- resultado;
- recurso criado/alterado;
- modelo;
- versão do prompt;
- status;
- timestamps.

## 20. Insights e Structured Output

A IA recebe dados estruturados e previamente processados.

O Backend/Analytics calcula:

- totais;
- médias;
- percentuais;
- variações;
- rankings;
- agregações;
- períodos;
- indicadores críticos.

A IA realiza principalmente:

- interpretação;
- sumarização;
- contextualização;
- explicação;
- identificação de padrões;
- recomendações quando permitido.

Sempre que possível, respostas devem utilizar Structured Output.

O Backend valida a resposta antes de disponibilizá-la.

O schema definitivo do Structured Output ainda precisa ser formalizado.

## 21. Confiabilidade da IA

Regras:

1. enviar dados estruturados;
2. limitar contexto;
3. instruir o modelo a não inventar métricas;
4. basear afirmações nos dados recebidos;
5. validar respostas quando possível;
6. não permitir números inventados;
7. identificar informações inferidas.

Sem dados suficientes:

```text
Não há dados suficientes para gerar este insight.
```

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

Fluxo:

```text
Scheduler / Request
 ↓
NestJS
 ↓
Python Analytics
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

Relatórios são persistidos em `weekly_reports`.

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

## 24. Datas

Timezone padrão:

```text
America/Sao_Paulo
```

Timestamps aplicáveis devem utilizar timezone.

Expressões como “hoje”, “amanhã” e “em 24 horas” devem considerar a timezone do usuário.

## 25. Design System

O Design System oficial é o **Cyber-Academic System**, definido em `DESIGN.md`.

Características:

- Visionary;
- Analytical;
- Empowering;
- Futuristic Glassmorphism;
- estética de “mission control”;
- profundidade por translucidez;
- sinalização neon controlada;
- organização orientada a dados.

Tipografia:

- Sora → headings;
- Inter → corpo;
- JetBrains Mono → métricas, timestamps e metadados.

Layout:

- unidade base: 4px;
- Desktop: 12 colunas;
- Tablet: 8 colunas;
- Mobile: coluna única.

Breakpoints:

- Desktop: 1440px+;
- Tablet: 768px–1439px;
- Mobile: abaixo de 767px.

O `DESIGN.md` é a fonte detalhada dos tokens, cores, componentes, estados e regras de acessibilidade.

## 26. Performance

Objetivo inicial:

```text
API < 2 segundos
```

quando não envolver processamento pesado.

Práticas:

- evitar dados desnecessários;
- paginação quando aplicável;
- agregações no Backend;
- evitar consultas repetidas;
- índices;
- considerar cache;
- evitar datasets gigantes;
- processamento assíncrono quando necessário.

## 27. Segurança

### Backend

- HTTPS em produção;
- validação de entrada;
- não confiar no cliente;
- secrets em variáveis de ambiente;
- não versionar senhas/tokens;
- rate limiting;
- hash seguro;
- autorização;
- evitar exposição de dados sensíveis;
- logs de autenticação.

### Banco

- credenciais seguras;
- usuário específico;
- backups;
- migrations;
- índices;
- controle de acesso.

### IA

- nunca enviar credenciais;
- minimização;
- autorização de Tools;
- auditoria;
- proteção contra prompt injection;
- proteção contra vazamento.

## 28. LGPD e Privacidade

Aplicar:

- minimização;
- finalidade definida;
- controle de acesso;
- proteção de credenciais;
- política de retenção;
- controle dos dados enviados à IA.

## 29. Ambientes

```text
Development
 ↓
Staging
 ↓
Production
```

Cada ambiente deve possuir configurações e banco independentes.

## 30. Testes

### Unitários

- regras de negócio;
- funções;
- cálculos analíticos.

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

- autorização;
- Tools da IA;
- progresso;
- métricas de tempo;
- notificações de 24h;
- relatórios.

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

## 34. Decisões Já Definidas

- EduTrack AI como projeto.
- React + TypeScript para Web.
- React Native + TypeScript para Mobile.
- Node.js + NestJS + Fastify no Backend.
- PostgreSQL.
- Prisma.
- Python + Pandas.
- FastAPI para o serviço Python.
- REST + JSON + HTTPS.
- `/api/v1`.
- OpenAPI/Swagger.
- Cyber-Academic System.
- Protótipo Stitch `13596816261153646269`.
- Timezone padrão `America/Sao_Paulo`.
- Notificações automáticas somente Push.
- Alerta automático 24h antes do prazo.
- Sessões de estudo.
- Histórico de tarefas.
- Dificuldade das tarefas.
- Persistência de insights.
- Persistência de conversas da IA.
- Auditoria das Tools.
- Persistência de relatórios semanais.
- Métricas iniciais.
- Separação entre progresso e eficiência.
- IA não acessa banco diretamente.
- Cálculos críticos são determinísticos.
- Agente pode criar tarefas solicitadas explicitamente, após validação.

## 35. Pendências

### Produto

- [ ] Recorrência de tarefas.
- [ ] Regras para tarefas sem prazo.
- [ ] Regra para reabertura.
- [ ] Notas/frequência nas disciplinas.
- [ ] Pesos de eventual indicador composto.
- [ ] Critérios de aceite detalhados.
- [ ] Mapa definitivo de telas Web.
- [ ] Mapa definitivo de telas Mobile.

### Autenticação

- [ ] OAuth.
- [ ] MFA.
- [ ] Verificação de e-mail.
- [ ] Refresh token.
- [ ] Política de sessões.
- [ ] Armazenamento definitivo de sessão.

### IA

- [ ] Provedor de LLM.
- [ ] Modelo principal.
- [ ] Modelo fallback.
- [ ] Framework/orquestrador.
- [ ] Estratégia de prompts.
- [ ] Versionamento de prompts.
- [ ] Structured Output definitivo.
- [ ] Avaliação do Agente.
- [ ] Limite de contexto/tokens.
- [ ] Limite de custo.
- [ ] Fallback.
- [ ] Confirmação por Tool.
- [ ] Lista oficial de Tools.
- [ ] Autorização por Tool.
- [ ] Memória.
- [ ] Histórico detalhado.
- [ ] Rate limiting.
- [ ] Observabilidade.
- [ ] Política de privacidade do provedor.

### Analytics/Pandas

- [ ] Comunicação NestJS ↔ FastAPI.
- [ ] Modelo de execução Python.
- [ ] Versão do Python.
- [ ] Versão do Pandas.
- [ ] Contrato dos datasets.
- [ ] Operações síncronas/assíncronas.
- [ ] Jobs agendados.
- [ ] Cache.
- [ ] Algoritmo definitivo de eficiência.
- [ ] Janela mínima de comparação.
- [ ] Tratamento de outliers.
- [ ] Previsão de conclusão.
- [ ] Regras de anomalias.
- [ ] Data Warehouse/Data Lake futuro.

### Tarefas

- [ ] Recorrência.
- [ ] Tarefas sem prazo.
- [ ] Reabertura.
- [ ] Permissões de criação/alteração/exclusão.
- [ ] Regras completas de histórico.

### Notificações

- [ ] Provedor Push.
- [ ] Templates.
- [ ] Retry.
- [ ] Horário permitido.
- [ ] Política de timezone após alteração.

### Relatórios

- [ ] Biblioteca de PDF.
- [ ] Biblioteca de gráficos Python.
- [ ] Object Storage.
- [ ] Retenção dos PDFs.
- [ ] Geração automática semanal vs. sob demanda.

### Infraestrutura

- [ ] Cloud provider.
- [ ] Hospedagem Web.
- [ ] Hospedagem NestJS.
- [ ] Hospedagem FastAPI.
- [ ] PostgreSQL gerenciado.
- [ ] Redis.
- [ ] Queue/Message Broker.
- [ ] Object Storage.
- [ ] DNS.
- [ ] CDN.
- [ ] TLS/HTTPS.
- [ ] Secrets Manager.
- [ ] Autoscaling.

### Observabilidade

- [ ] Logs.
- [ ] Monitoramento de erros.
- [ ] APM/tracing.
- [ ] Métricas da API.
- [ ] Métricas Python/Pandas.
- [ ] Métricas do Agente.
- [ ] Custos de IA.
- [ ] Alertas.
- [ ] Correlation ID/Trace ID.

### Segurança/LGPD

- [ ] Retenção.
- [ ] Exclusão de conta.
- [ ] Exportação de dados.
- [ ] Consentimento.
- [ ] Política de privacidade.
- [ ] Retenção de conversas.
- [ ] Mascaramento/anonimização.
- [ ] Proteções contra prompt injection.
- [ ] Backup.
- [ ] Disaster recovery.

### Qualidade

- [ ] Testes do pipeline Pandas.
- [ ] Testes das Tools.
- [ ] Testes de prompts/LLM.
- [ ] Testes de autorização.
- [ ] Testes contra prompt injection.
- [ ] Testes de vazamento.
- [ ] Testes de carga/performance.
- [ ] Testes de PDF.

## 36. Conflitos e Pontos a Esclarecer

1. Documentação anterior apresentava NestJS/Fastify como alternativas; a versão consolidada trata **NestJS + Fastify** como stack definida.
2. Drizzle foi considerado anteriormente, mas **Prisma** é a decisão atual.
3. JWT aparece como fluxo de autenticação, mas OAuth/serviço especializado ainda não foram descartados; autenticação definitiva precisa ser formalizada.
4. Endpoints listados como exemplos não são contratos definitivos.
5. O estado de implementação não pode ser inferido da especificação.
6. A lista de Tools ainda é inicial.
7. O Structured Output ainda precisa de schema formal.
8. A comunicação NestJS ↔ FastAPI ainda não está decidida.
9. O provedor/modelo de IA ainda não está decidido.
10. O único protótipo oficial é o Stitch `13596816261153646269`.
11. O `schema.prisma` deve permanecer separado; esta especificação não substitui seus detalhes físicos.

## 37. Regra para Futuras Alterações

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
10. atualizar `schema.prisma` quando uma alteração aprovada modificar o modelo físico.

## 38. Fontes de Verdade

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
```

Em caso de alteração do modelo de dados, o `schema.prisma` deve ser atualizado de forma consistente com esta especificação.

---

## 39. Princípio Final

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
Backend
  ↓
Domain Service
  ↓
PostgreSQL
```

A IA não substitui o banco, o Backend, as regras de negócio, os cálculos determinísticos ou a autorização.
