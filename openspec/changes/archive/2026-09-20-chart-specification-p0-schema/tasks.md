��# Tasks

## 1. JSON Schema Files (Backend)

- [x] 1.1 Criar diret�rio `apps/api/src/ai/schemas/` e adicionar `v1_chart-specification.json` com JSON Schema completo do ChartSpecification (type enum, xAxis, yAxis, series, data, filters, source, datasetVersion, strict: true, additionalProperties: false). Verificar: arquivo existe e � JSON v�lido.
- [x] 1.2 Criar `v1_agent-text-response.json` para respostas textuais simples do Agent. Verificar: arquivo existe e � JSON v�lido.
- [x] 1.3 Criar `v1_agent-analysis-response.json` para respostas com an�lise + m�tricas + ChartSpecification opcional. Verificar: arquivo existe e � JSON v�lido.
- [x] 1.4 Criar `v1_agent-action-response.json` para respostas de confirma��o de execu��o de Tool. Verificar: arquivo existe e � JSON v�lido.

## 2. Valida��o JSON Schema no Backend

- [x] 2.1 Adicionar depend�ncia `ajv` e `@types/ajv` no `apps/api/package.json` e instalar. Verificar: `pnpm install` succeeds e depend�ncias aparecem no lockfile.
- [x] 2.2 Criar `StructuredOutputValidationService` em `apps/api/src/ai/structured-output-validation.service.ts` que carrega schemas compilados com AJV e exp�e m�todo `validate(schemaName: string, data: unknown): ValidationResult`. Verificar: servi�o compila e carrega schemas sem erro.
- [x] 2.3 Criar testes unit�rios para `StructuredOutputValidationService` em `apps/api/src/ai/structured-output-validation.service.spec.ts` cobrindo: ChartSpecification v�lida, ChartSpecification inv�lida (falta campo obrigat�rio, tipo de gr�fico n�o permitido, source.tool desconhecido), valida��o de strict/additionalProperties. Verificar: `pnpm test` passa todos os testes.

## 3. M�dulo AI no Backend

- [x] 3.1 Criar `AiModule` em `apps/api/src/ai/ai.module.ts` exportando `StructuredOutputValidationService`. Verificar: m�dulo compila e pode ser importado.
- [x] 3.2 Registrar `AiModule` no `AppModule`. Verificar: aplica��o inicia sem erro.

## 4. Tipos TypeScript no Frontend

- [x] 4.1 Criar `apps/web/src/types/chart-specification.ts` com tipos TypeScript derivados do JSON Schema (ChartSpecification, XAxis, YAxis, Series, Source, ChartType enum). Verificar: `pnpm typecheck` passa no web.
- [x] 4.2 Criar `apps/web/src/types/agent-responses.ts` com tipos para AgentTextResponse, AgentAnalysisResponse, AgentActionResponse. Verificar: `pnpm typecheck` passa.
- [x] 4.3 Atualizar `AIAssistantPage.tsx` para importar e usar os novos tipos (prepara��o para integra��o real). Verificar: `pnpm typecheck` passa e build web compila.

## 5. Valida��o e Documenta��o

- [x] 5.1 Executar suite completa de testes do backend (`pnpm test` no api). Verificar: todos os testes passam.
- [x] 5.2 Executar lint e typecheck do projeto (`pnpm lint && pnpm typecheck`). Verificar: zero erros.
- [x] 5.3 Validar change com `openspec validate --change "chart-specification-p0-schema"`. Verificar: valida��o passa sem erros.

## 6. Arquivamento da Mudan�a

- [x] 6.1 Executar `openspec archive --change "chart-specification-p0-schema"`. Verificar: change arquivado com sucesso, specs movidos para `openspec/specs/`.
