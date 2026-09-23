# Tasks

## 1. Agent Orchestrator Service

- [ ] 1.1 Crear `apps/api/src/ai/orchestrator/agent-orchestrator.service.ts` con método `execute(userId, message, conversationId?)` que implementa el loop completo. Verificar: compila.
- [ ] 1.2 Implementar mapeo de tool names a `TasksService` methods y persistencia de `AIToolExecution`. Verificar: tools se ejecutan y registran auditoría.
- [ ] 1.3 Implementar límite de 3 iteraciones de tool calls y manejo de errores de validación/ejecución. Verificar: no bucles infinitos.

## 2. HTTP Endpoint

- [ ] 2.1 Crear `apps/api/src/ai/orchestrator/agent.controller.ts` con `POST /api/ai/chat` autenticado. Verificar: endpoint accesible y retorna `ProcessedAIResponse`.
- [ ] 2.2 Incluir `conversationId` en respuesta y soportar creación/carga de conversación. Verificar: conversación se persiste.

## 3. Module Wiring

- [ ] 3.1 Registrar `AgentOrchestratorService` y `AgentController` en `AiModule`. Verificar: módulo compila.

## 4. Tests

- [ ] 4.1 Tests unitarios de `AgentOrchestratorService`: loop con tool call válido, validación falla, ejecución falla, límite de iteraciones.
- [ ] 4.2 Tests de integración: request completo vía transport mock.
- [ ] 4.3 Tests de `AgentController`: autenticación, request/response, conversationId.

## 5. Verificación

- [ ] 5.1 Ejecutar `npm run test`, `npm run lint`, `npm run typecheck`, `npm run build` en `apps/api`. Verificar: cero errores.
