# TLC Specification: Agent Analytics Tools

## Objective
Integrar Tools de Analytics ao Agent sem ampliar contratos do AnalyticsService.

## Acceptance Criteria
- As tres Tools sao registradas como read-only com schema estrito.
- O validator bloqueia Tools desconhecidas e argumentos extras.
- O orchestrator usa apenas o userId autenticado.
- Cada Tool chama o metodo real do AnalyticsService e devolve o resultado ao provider.
- A execucao e persistida em AIToolExecution.
- O fluxo possui limite de tres iteracoes.
- O endpoint Web usa a resposta validada do Backend e nao recebe raw do LLM.
