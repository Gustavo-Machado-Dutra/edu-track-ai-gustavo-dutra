# Design

## Context

`chart-specification-p0-schema` ya definió y verificó:
- JSON Schemas versionados `v1_*` en `apps/api/src/ai/schemas/`.
- `StructuredOutputValidationService` basado en `ajv` con validación estricta (`strict`, `additionalProperties: false`).
- `AiModule` que exporta el servicio de validación.
- Tipos TypeScript en el frontend.

Este change agrega la capa de procesamiento de respuestas del proveedor.

## Goals / Non-Goals

**Goals:**
- Procesar una respuesta cruda del proveedor y producir una `ProcessedAIResponse` tipada (`text`, `analysis`, `action`).
- Validar toda respuesta estructurada contra su schema `v1_*` antes de entregarla.
- Manejar explícitamente fallo de validación (bad request), problema de configuración (schema inexistente) y fallback a texto.

**Non-Goals:**
- NO implementar el Provider Adapter ni llamadas reales a OpenRouter (change futuro).
- NO ejecutar SQL ni código proveniente del LLM.
- NO persistir conversaciones ni auditoría de ejecuciones (cambios futuros).

## Decisions

### 1. Ubicación del procesamiento
**Decisión**: `AgentService` en `apps/api/src/ai/agent.service.ts`, inyectado por constructor con `StructuredOutputValidationService`.

**Rationale**: La especificación exige que la lógica de procesamiento resida dentro de `AiModule`, desacoplada del provider.

### 2. Mapeo tipo → schema
**Decisión**: El discriminador `type` (top-level) selecciona el schema:
- `text` → `v1_agent-text-response`
- `analysis` → `v1_agent-analysis-response`
- `action` → `v1_agent-action-response`

**Rationale**: Los schemas de respuesta usan `const` en su campo `type`, por lo que el discriminador debe resolverse antes de validar.

### 3. Manejo de errores
**Decisión**:
- Contract failure → `BadRequestException` con mensaje `AI output failed contract validation` y errores estructurados.
- `schema-not-found` → `InternalServerErrorException` (error de configuración, no del cliente).

**Rationale**: Distingue fallo del cliente/payload respecto a un problema interno.

### 4. Fallback a texto
**Decisión**: Entradas no-JSON, JSON malformado, tipos no reconocidos u objeto vacío se convierten en respuesta `type: "text"` sin validar contra schema estructurado.

**Rationale**: El proveedor puede emitir texto libre; ese caso debe comportarse como respuesta textual segura, nunca como error de validación.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Discriminador `type` implícito | Schemas usan `const`; si el tipo no coincide, falla la validación o cae en fallback a texto |
| Validación duplica latencia | Reutiliza instancias compiladas ya cacheadas por el servicio de validación |
| `content` como `unknown` | Evita typing excesivo; los consumidores deben anotar el tipo procesado |

## Migration Plan

1. Implementar `AgentService.processProviderResponse`.
2. Escenarios de fallback y errores en los tests unitarios.
3. Registrar/exportar `AgentService` en `AiModule`.
4. Verificar con `npm run test`, `npm run lint`, `npm run typecheck`, `npm run build` en `apps/api`.

## Open Questions

- Ninguna. El comportamiento de respuesta y los contratos `v1_*` ya están definidos.
