# EduTrack AI

Aplicação web para organização acadêmica, acompanhamento de tarefas, registro de sessões de estudo e métricas de desempenho.

## Estrutura

```text
apps/
  api/        NestJS + Fastify + Prisma
  analytics/  FastAPI + Pandas
  web/        React + Vite + TypeScript
prisma/       Migrations e schema
schema.prisma Schema Prisma (raiz)
```

## Desenvolvimento

1. Copie `.env.example` para `.env` e ajuste os valores locais.
2. Suba PostgreSQL e Redis com `docker compose up -d` (PostgreSQL publicado em `localhost:5433` para evitar conflito com instalações locais).
3. Instale dependências Node com `pnpm install`.
4. Gere o Prisma Client com `pnpm prisma:generate`.
5. Aplique migrations com `pnpm prisma:migrate`.
6. Rode API e Web com `pnpm dev`.
7. Rode Analytics com `pnpm dev:analytics`.

## Endpoints disponíveis

- **API:** `http://localhost:3333/api/v1`
- **Swagger:** `http://localhost:3333/api/docs`
- **Web:** `http://localhost:5173`
- **Analytics:** `http://localhost:8000`

## Funcionalidades implementadas

### Autenticação
- Cadastro de usuário com hash Argon2id
- Login com JWT (Access Token + Refresh Token)
- Renovação de sessão via Refresh Token
- Isolamento de dados por usuário

### Disciplinas
- Criar disciplina com nome, professor, carga horária, descrição e período
- Listar disciplinas do usuário
- Editar disciplina
- Excluir disciplina (remove tarefas e sessões associadas via cascade)

### Tarefas
- Criar tarefa vinculada a disciplina
- Título, descrição, prioridade, dificuldade, prazo e estimativa
- Status: TODO, IN_PROGRESS, COMPLETED, CANCELLED
- Filtros por status (incluindo "Todas")
- Editar tarefa
- Excluir tarefa
- Iniciar, concluir, cancelar e reabrir tarefas
- Histórico de alterações (status, prioridade, prazo)

### Sessões de estudo
- Registrar sessão passada com disciplina, tarefa opcional, início e duração
- Iniciar sessão agora (sem duração pré-definida)
- Encerrar sessão ativa (calcula duração automaticamente)
- Persistência de `duration_seconds` como fonte oficial de métricas
- Listar sessões ativas e concluídas

### Dashboard
- Métricas: tarefas abertas, tempo estudado total, entregas críticas
- Lista de tarefas pendentes recentes
- Ação rápida de conclusão

### Configurações
- Alternar preferência de notificações (ativa/desativa)
- Edição de perfil do usuário

## Arquitetura

- **Monorepo** com pnpm workspaces
- **Backend:** NestJS + Fastify + Prisma + PostgreSQL + Redis
- **Frontend:** React 19 + Vite + TypeScript
- **Analytics:** FastAPI + Pandas (estrutura base)
- **Banco:** PostgreSQL 16 via Docker (porta 5433)
- **Cache/Queue:** Redis via Docker (porta 6379)

## Testes

### API (NestJS)
```bash
cd apps/api
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

### Web (React)
```bash
cd apps/web
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

### Analytics (FastAPI)
```bash
cd apps/analytics
python -m pytest
```

## Conta de demonstração

- **E-mail:** `demo@edutrack.local`
- **Senha:** `Demo1234!`

## Pendências P0 e P1

Funcionalidades que dependem de decisões arquiteturais ainda não definidas:

- **Agent/IA:** provider LLM, modelo, Structured Output schema, Tools, prompts, custos
- **Notificações Push:** integração com FCM, worker de alertas 24h
- **Relatórios semanais:** pipeline assíncrono Analytics → IA → PDF → S3
- **Insights da IA:** geração, persistência e exibição
- **API definitiva:** paginação, filtros avançados, ordenação, contratos finais
- **Infraestrutura:** cloud provider, deployment, DNS, CDN, secrets, backup

Consulte `SPEC.md` seções 35.1 e 35.2 para detalhes completos.

## Estrutura de código

### Backend (apps/api/src)
- `auth/` — Autenticação JWT e Argon2id
- `users/` — Perfil e preferências
- `subjects/` — CRUD de disciplinas
- `tasks/` — CRUD de tarefas + histórico
- `study-sessions/` — Registro e encerramento de sessões
- `insights/` — Estrutura para insights da IA
- `notifications/` — Estrutura para notificações push
- `reports/` — Estrutura para relatórios semanais
- `analytics/` — Integração com serviço Analytics
- `health/` — Health check
- `prisma/` — Prisma Service
- `common/` — Filtros e interceptors globais

### Frontend (apps/web/src)
- `pages/` — LoginPage, DashboardPage, TasksPage, SubjectsPage, StudySessionsPage, SettingsPage
- `components/` — Button, Card, Input, TaskCard, MetricCard
- `hooks/` — useTasks, useSubjects, useStudySessions, useDashboard, useUserSettings
- `services/` — api.ts (client HTTP, autenticação, sessão)
- `types/` — Tipos TypeScript compartilhados
- `styles/` — global.css

### Analytics (apps/analytics)
- `app/` — FastAPI endpoints
- `tests/` — Testes unitários

## Referências

- **SPEC.md:** Especificação técnica completa
- **context.md:** Contexto arquitetural e decisões
- **DESIGN.md:** Identidade visual e componentes
- **schema.prisma:** Modelo físico do banco de dados