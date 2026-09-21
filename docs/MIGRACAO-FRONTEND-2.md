# Integração do visual EduTrack 2.0

Comparação feita entre `Gustavo-Machado-Dutra/edu-track-ai-gustavo-dutra` (`7a32129`, 05/09/2026) e `Wtvitin/Edutrack---version-2.0` (`029bfab`, 11/09/2026). Esta branch substitui a identidade visual e a navegação do frontend original por uma adaptação do 2.0, mantendo os contratos reais de API. Não copia o runtime Next nem o estado de demonstração.

## Inventário

| Área | Projeto original | Front 2.0 |
| --- | --- | --- |
| Execução | Monorepo pnpm; `apps/web` em React 19, TypeScript e Vite 6 | Aplicação isolada em React 19, Next 16 com Vinext/Vite 8 e Cloudflare/Wrangler |
| Servidor e dados | `apps/api` NestJS/Fastify; Prisma, PostgreSQL e Redis; `apps/analytics` FastAPI/Pandas | `db/` e `drizzle/` contêm infraestrutura D1 do starter, desativada para o produto; dados da demonstração em `localStorage` |
| Dependências visuais | React e CSS próprio; componentes em `apps/web/src/components` | Tailwind 4, Shadcn/Radix, Lucide, Recharts, Sonner, Zod, React Hook Form, date-fns etc. |
| Rotas | Estado de página em `apps/web/src/App.tsx`; dashboard, tarefas, disciplinas, sessões, IA, relatórios e configurações | `app/page.tsx` e `app/[...slug]/page.tsx`; `/`, `/tarefas`, `/disciplinas`, `/disciplinas/:id`, `/calendario`, `/sessoes`, `/progresso`, `/agente`, `/perfil`, `/configuracoes`, `/ajuda` e páginas públicas |
| Autenticação | `services/api.ts`: login/cadastro, access e refresh JWT, renovação após 401; `LoginPage.tsx` usa a API real | `public-pages.tsx`: formulários de demonstração sem autenticação real |
| Estado | `hooks/` fazem chamadas a `/api/v1` via proxy Vite ou `VITE_API_URL` | `components/edutrack/app.tsx` usa `seedData()` e `edutrack-demo-v1`; timer usa `edutrack-timer-v1` |

## O que portar e o que preservar

| Origem 2.0 | Destino original | Decisão |
| --- | --- | --- |
| `app/globals.css` | `apps/web/src/styles/` | Portar paleta, tipografia, espaçamento e padrões de componentes em CSS adaptado e com escopo. Não copiar o arquivo inteiro: depende de Tailwind e usa seletores globais que afetariam telas atuais. |
| `components/edutrack/app.tsx` | `App.tsx`, `components/AppLayout.tsx`, `components/Sidebar.tsx` | Portar apenas marca, navegação, cabeçalho e composição visual. Manter a guarda de autenticação e o tratamento de sessão expirada do original. |
| `components/edutrack/views.tsx` | `pages/` | Recriar as telas com os hooks existentes. `tarefas`, `disciplinas`, `sessoes` e `configuracoes` têm equivalentes na API; calendário e progresso exigem adaptação a dados reais; agente é prévia sem serviço conversacional. |
| `components/edutrack/forms.tsx` | Formulários em `pages/` | Portar aparência e acessibilidade; manter validações e payloads do original. Na API original, tarefa requer `subjectId`, tem quatro status e quatro prioridades; sessão usa timestamps e `durationSeconds`. |
| `components/edutrack/public-pages.tsx` | `pages/LoginPage.tsx` | Portar apresentação e aparência das telas de acesso, mantendo `login()` e `register()` reais. Recuperação e verificação de e-mail não têm endpoints no original e não devem fingir sucesso. |
| `components/ui/` | Componentes específicos em `apps/web/src/components/` | Copiar apenas os componentes efetivamente usados por telas portadas, após avaliar dependências e licenças. Não importar a biblioteca toda. |
| `lib/edutrack.ts`, `lib/edutrack-schema.ts` | Nenhum | Não substituir `types/index.ts`, `hooks/` ou `services/api.ts`. Os tipos e dados 2.0 representam a demonstração local. Apenas funções puras de formatação podem ser adaptadas. |
| `app/`, `db/`, `drizzle/`, `build/`, `scripts/`, `next.config.ts`, `vite.config.ts`, `package.json` | Nenhum | Não copiar. Mantêm runtime, roteamento, banco e scripts do projeto 2.0, incompatíveis com o monorepo original. |

Preservar integralmente `apps/api/`, `apps/analytics/`, `prisma/`, `schema.prisma`, `.env.example`, `docker-compose.yml`, `apps/web/src/services/api.ts`, `apps/web/src/hooks/`, `apps/web/src/types/`, a configuração do Vite e os manifestos/lockfile até que uma dependência visual seja realmente necessária.

## Contratos e lacunas

- Original: `/api/v1/auth/{login,register,refresh}`, `/users/me`, `/users/me/settings`, `/subjects`, `/tasks`, `/tasks/:id/complete`, `/study-sessions`, `/study-sessions/:id/end`, `/analytics/dashboard`, `/reports/weekly`. Todos passam pelo cliente autenticado existente.
- O dashboard 2.0 calcula números a partir de dados locais; nesta branch, o novo dashboard usa `useDashboard()` e `useTasks()` e mantém a conclusão real de tarefa.
- `calendar` pode filtrar tarefas reais por `dueDate`, sem endpoint novo. O painel de progresso deve usar `/analytics/dashboard` e, onde necessário, `/analytics/metrics/*`; conferir períodos e formato antes de portar gráficos.
- O timer 2.0 precisa ser adaptado aos fluxos reais `createSession` e `endSession`, incluindo restauração após recarga. Não persistir registros paralelos em `localStorage`.
- A API atual não oferece conversa com agente, recuperação de senha nem verificação de e-mail. Manter essas telas como indisponíveis ou prévias claras até haver contratos implementados, sem alterar o backend nesta migração.
- A navegação original era apenas estado local. Esta branch sincroniza as páginas com URLs client-side. A hospedagem precisa devolver `index.html` para rotas internas acessadas diretamente.

## Sequência segura

1. Feito nesta branch: shell escuro, conteúdo claro, tipografia e paleta do 2.0; dashboard conectado à API; aparência do login real; telas originais de CRUD com o novo tema; calendário e progresso construídos sobre tarefas e métricas reais; URLs client-side para cada área.
2. Feito: eliminar botões sem ação de configurações e relatórios e deixar claro que relatórios entram na fila e o assistente atual não chama um modelo de IA.
3. Antes de publicar, executar uma verificação manual com PostgreSQL, Redis e API: cadastro, login, refresh, logout, CRUD de disciplinas/tarefas, sessões, calendário, métricas, navegação móvel e erros de rede. Não foi possível validar esses fluxos contra um backend ativo neste ambiente.
4. Revisar detalhes visuais lado a lado com o 2.0 e, se necessário, portar componentes específicos de `components/ui/` individualmente. O CSS foi adaptado para Vite sem adicionar dependências.
5. Conferir o fallback das URLs client-side na hospedagem escolhida. A navegação funciona no Vite, mas a infraestrutura de publicação deve devolver `index.html` para rotas como `/tarefas`.

Para reverter, use a branch principal do projeto original. Esta branch altera apenas `apps/web/` e este documento.
