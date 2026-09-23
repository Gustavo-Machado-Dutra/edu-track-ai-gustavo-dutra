# Spec Delta

## Purpose

Define el Agent Orchestrator que coordina el loop completo: LLM → Tool Call → Validation → Execution → Structured Output → Backend Validation. Expone endpoint HTTP autenticado y persiste auditoría completa.

## ADDED Requirements

### Requirement: El sistema DEBE exponer un Agent Orchestrator que ejecuta el loop completo
El sistema DEBE implementar `AgentOrchestratorService` con método `execute(userId, message, conversationId?)` que coordina:
1. Carga/crea `AIConversation`
2. Persiste mensaje del usuario como `AIMessage`
3. Llama al LLM via Provider Adapter con tools registradas
4. Si hay tool calls: valida cada uno via `AgentToolCallValidator`
5. Ejecuta tools autorizadas via domain services (`TasksService`)
6. Persiste `AIToolExecution` (PENDING → SUCCESS/FAILED/REJECTED)
7. Alimenta resultados de vuelta al LLM (máximo 3 iteraciones)
8. Valida salida estructurada final via `StructuredOutputValidationService`
9. Persiste respuesta del asistente como `AIMessage`
10. Retorna `ProcessedAIResponse`

#### Scenario: Ejecución completa sin tool calls
- **WHEN** el LLM retorna respuesta estructurada directa (text/analysis/action)
- **THEN** el orchestrator valida la respuesta y la retorna
- **E** persiste conversación y mensajes

#### Scenario: Ejecución con tool calls válidos
- **WHEN** el LLM propone tool calls
- **THEN** el orchestrator valida cada tool call via `AgentToolCallValidator`
- **E** ejecuta tools via `TasksService`
- **E** persiste `AIToolExecution` con status SUCCESS
- **E** alimenta resultados al LLM para siguiente iteración
- **E** valida respuesta final y retorna

#### Scenario: Tool call rechazado por validación
- **WHEN** `AgentToolCallValidator` rechaza un tool call
- **THEN** el orchestrator persiste `AIToolExecution` con status REJECTED
- **E** incluye error en resultado del tool para que LLM reintente
- **E** continúa el loop (hasta 3 iteraciones)

#### Scenario: Tool execution falla
- **WHEN** `TasksService` lanza excepción durante ejecución
- **THEN** el orchestrator persiste `AIToolExecution` con status FAILED
- **E** incluye error en resultado del tool para que LLM maneje
- **E** continúa el loop

#### Scenario: Límite de iteraciones alcanzado
- **WHEN** se alcanza el máximo de 3 iteraciones de tool calls
- **THEN** el orchestrator fuerza respuesta final del LLM sin más tool calls
- **E** valida y retorna respuesta estructurada

### Requirement: El sistema DEBE exponer endpoint HTTP autenticado
El sistema DEBE implementar `AgentController` con `POST /api/ai/chat` que:
- Requiere autenticación JWT
- Acepta `{ message: string, conversationId?: string }`
- Retorna `{ conversationId: string, response: ProcessedAIResponse }`

#### Scenario: Chat request autenticado
- **WHEN** usuario autenticado envía mensaje
- **THEN** orchestrator ejecuta loop y retorna respuesta
- **E** incluye `conversationId` en respuesta

#### Scenario: Nueva conversación
- **WHEN** request no incluye `conversationId`
- **THEN** orchestrator crea nueva `AIConversation`
- **E** retorna `conversationId` generado

#### Scenario: Conversación existente
- **WHEN** request incluye `conversationId` válido del usuario
- **THEN** orchestrator carga conversación y añade mensajes
- **E** incluye historial como contexto para LLM

### Requirement: El sistema DEBE registrar orchestrator en AiModule
El sistema DEBE registrar `AgentOrchestratorService` y `AgentController` en `AiModule`.

#### Scenario: Orchestrator disponible desde AiModule
- **WHEN** un consumidor requiere `AgentOrchestratorService` desde `AiModule`
- **THEN** el servicio está disponible
- **E** puede ejecutar el loop completo
