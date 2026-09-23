# Tasks

## 1. Contrato del Adapter

- [x] 1.1 Crear `apps/api/src/ai/provider/llm-provider-adapter.ts` con tipos (`LlmMessage`, `LlmTool`, `StructuredOutputSpec`, `LlmRequest`, `LlmResult`, `LlmToolCall`) y la interfaz `LlmProviderAdapter`. Verificar: compila e importable.
- [x] 1.2 Definir `LlmTransport` (post con headers/timeout) y `LlmProviderError` tipado (transient vs config). Verificar: tipos disponibles.

## 2. Implementación OpenRouter

- [x] 2.1 Crear `apps/api/src/ai/provider/openrouter-provider-adapter.ts` que construye requests Chat Completions (messages, tools+tool_choice, response_format json_schema) y parsea la respuesta.
- [x] 2.2 Leer config de entorno: `LLM_PROVIDER`, `LLM_MODEL`, `LLM_FALLBACK_MODEL`, `LLM_BASE_URL`, `LLM_TIMEOUT_MS`, `OPENROUTER_API_KEY`.
- [x] 2.3 Aplicar política timeout + único retry transitorio + fallback de modelo; sin retry en 4xx de autorización; `LlmProviderError` en fallo total.
- [x] 2.4 Registrar `OpenRouterProviderAdapter` como `LlmProviderAdapter` en `AiModule`.

## 3. Tests

- [x] 3.1 Tests con transport mock: construcción de request (headers, messages, tools, response_format), parsing de respuesta y metadatos (model/usage).
- [x] 3.2 Tests de retry: error transitorio seguido de éxito (1 retry); 4xx sin retry; fallback a modelo alternativo; fallo total controlado.

## 4. Verificación

- [x] 4.1 Ejecutar `npm run test`, `npm run lint`, `npm run typecheck`, `npm run build` en `apps/api`. Verificar: cero errores.
