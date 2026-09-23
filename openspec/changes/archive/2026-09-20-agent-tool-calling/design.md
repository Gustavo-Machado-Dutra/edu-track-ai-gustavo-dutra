# Design

## Context

`llm-provider-adapter` (archivado) construye requests con `tools` + `tool_choice` y parsea `tool_calls`. `ai-integration-mvp` valida respuestas estructuradas. Falta el gate que el Agent Orchestrator necesita para que el Backend sea la autoridad sobre qué Tools se pueden ejecutar y con qué argumentos (§35.1.2, §18).

## Goals / Non-Goals

**Goals:**
- `AgentToolRegistry` de Tools autorizadas con metadata y JSON Schema de entrada.
- `AgentToolCallValidator` que rechaza Tool inexistente/no autorizada y argumentos no conformes.
- Registrar Tools de tareas iniciales con schemas derivados de DTOs reales.
- Registrar ambos servicios en `AiModule`.

**Non-Goals:**
- NO ejecutar Tools ni llamar servicios de dominio (lo hará el orchestrator, futuro).
- NO persistir `ai_tool_executions` (futuro).
- NO implementar el bucle del Agent Orchestrator ni el endpoint HTTP.
- NO añadir dependencias npm (se reutiliza `ajv`).

## Decisions

### 1. Estructura del registro
**Decisión**: `AgentToolRegistry` con `ToolDefinition` tipado (`name`, `description`, `inputSchema`, `risk: "read" | "write"`). Expone `get(name)`, `has(name)`, `list()`.

### 2. Validación de argumentos
**Decisión**: `AgentToolCallValidator` usa `ajv` para compilar `inputSchema` de cada Tool y validar argumentos, devolviendo `{ valid, errors? }` determinístico.

### 3. Herramientas iniciales
**Decisión**: Registrar `create_task` (write), `update_task` (write), `complete_task` (write), `list_tasks` (read), `get_task` (read). Schemas derivados de `CreateTaskDto`/`UpdateTaskDto` y enums de `schema.prisma` (`TaskPriority`, `TaskStatus`, `TaskDifficulty`).

### 4. Gate de seguridad
**Decisión**: La validación primero confirma existencia/autorización y luego argumentos. Cualquier fallo impide la etapa de ejecución. El lock de autorización por usuario/ownership pertenece a la ejecución (futuro orchestrator), no a este gate.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Schemas podrían divergir de DTOs | Schemas derivados manualmente de DTOs/enums existentes; el orchestrator revalidará en ejecución |
| Registry crece | Nuevos Tools se agregan por registro; evolución requiere nueva spec/versión |
| `ajv` strict para argumentos | Se configura igual que el servicio de respuestas (strict, additionalProperties false) |

## Migration Plan

1. Tipos `ToolDefinition` + `AgentToolRegistry`.
2. `AgentToolCallValidator` con `ajv`.
3. Definir y registrar Tools de tareas.
4. Registrar ambos en `AiModule`.
5. Tests unitarios; `npm run test/lint/typecheck/build`.

## Open Questions

- La expansion del conjunto de Tools (métricas, dashboard, análisis) se resolverá en una spec futura que defina cada contrato; este gate es extensible.
