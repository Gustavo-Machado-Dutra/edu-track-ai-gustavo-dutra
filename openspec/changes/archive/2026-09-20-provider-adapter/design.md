# Design

## Context

`chart-specification-p0-schema` fijó los JSON Schemas y `StructuredOutputValidationService`. `ai-integration-mvp` aportó `AgentService.processProviderResponse` (validación de respuestas). El paso pendiente y del que depende el resto es el acceso al modelo: el `LLM Provider Adapter`.

## Goals / Non-Goals

**Goals:**
- Definir el contrato `LlmProviderAdapter` y su implementación `OpenRouterProviderAdapter`.
- Construir requests Chat Completions: mensajes, `tools` + `tool_choice`, `response_format` (structured output).
- Aplicar política de timeout + único retry + fallback (§35.1.10).
- Config ubicada en entorno y transport inyectable para testear sin API key.

**Non-Goals:**
- NO implementar el Agent Orchestrator, el bucle de Tools ni endpoints HTTP del chat (cambios futuros).
- NO validar Structured Output aquí (lo hace `StructuredOutputValidationService` en `AgentService`).
- NO persistir conversaciones ni auditoría (cambios futuros).
- NO añadir dependencia npm (se usa el HTTP nativo vía transport inyectable).

## Decisions

### 1. Contrato de adaptador
**Decisión**: Interfaz `LlmProviderAdapter` con método `complete(request, options): Promise<LlmResult>`. Retorna `content`, `toolCalls`, `model`, `usage` y `raw`.

**Rationale**: Aísla al negocio del provider y permite testear con fakes.

### 2. Implementación OpenRouter
**Decisión**: `OpenRouterProviderAdapter` con transport inyectable y URL base configurable (`LLM_BASE_URL`), clave `Bearer` de `OPENROUTER_API_KEY`, modelo principal `LLM_MODEL` y fallback `LLM_FALLBACK_MODEL`.

**Rationale**: Cumple §35.1.1 (protocolo Chat Completions) y §35.1.10 (retry/fallback).

### 3. Transport inyectable
**Decisión**: Definir `LlmTransport.post(url, headers, body, timeoutMs)`; el adaptador recibe un transport (por defecto usa `fetch`). Los tests inyectan un transport mock.

**Rationale**: Verifica construcción de requests/parsing y política de retry sin red real; alineado con la guía de fakes de §40A.

### 4. Política de errores
**Decisión**: Transitorio (red, timeout, ≥500, 429) → un retry → fallback de modelo. Autorización/4xx de implementación → sin retry. Fallo total → `LlmProviderError` controlado.

### 5. Ubicación
**Decisión**: `apps/api/src/ai/provider/`. `AiModule` provee `OpenRouterProviderAdapter` bajo el token `LlmProviderAdapter`.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Sin API key local para e2e | Tests con transport mock; smoke real queda para CI/staging (§40A) |
| Fallback puede no soportar todas las capacidades | El fallback primero verifica capacidades en el que llama; si falla, error controlado |
| `fetch` no tipado en TS estricto | Se tipa `LlmTransport` y se envuelve el `fetch` nativo |

## Migration Plan

1. Tipos y contrato (`llm-provider-adapter.ts`).
2. `OpenRouterProviderAdapter` + config.
3. Registrar en `AiModule`.
4. Tests unitarios con transport mock (requests, parsing, retry, fallback, 4xx).
5. `npm run test`, `lint`, `typecheck`, `build` en `apps/api`.

## Open Questions

- Ninguna. Las decisiones provider/modelo/protocolo ya están fijadas en §35.1.1–35.1.10.
