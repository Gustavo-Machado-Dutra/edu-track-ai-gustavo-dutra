# Proposal

## Why

O Agent precisa consultar Analytics e executar Tools autorizadas sem permitir que o modelo escolha o usuario ou acesse o banco.

## What Changes

- Registrar Tools de tarefas e Analytics com JSON Schemas estritos.
- Executar Tools exclusivamente por servicos NestJS e pelo contexto autenticado.
- Persistir mensagens e auditorias de execucao.
- Integrar o Copilot Web ao endpoint autenticado do Agent.

## Non-goals

- Nao criar metricas novas no AnalyticsService.
- Nao permitir acesso direto do LLM ao Prisma.
- Nao expor a resposta bruta do provider ao Frontend.
