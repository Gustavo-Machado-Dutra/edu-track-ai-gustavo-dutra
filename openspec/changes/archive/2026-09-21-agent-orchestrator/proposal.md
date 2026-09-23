# Proposal

## Why

The SPEC defines an Agent Orchestrator that coordinates the full LLM → Tool Call → Validation → Execution → Structured Output → Backend Validation loop (§17.1). The infrastructure pieces are in place: Provider Adapter (archivado), Structured Output Validation (archivado), and Tool Calling Gate (archivado). What is missing is the orchestrator that wires them together, executes the loop, and exposes an authenticated HTTP endpoint.

## What Changes

- Create `AgentOrchestratorService` that implements the orchestration loop:
  1. Receive user message + context
  2. Call LLM via Provider Adapter with registered tools
  3. Validate any tool calls via `AgentToolCallValidator`
  4. Execute authorized tools via domain services (TasksService)
  5. Persist `AIToolExecution` audit records
  6. Feed tool results back to LLM
  7. Validate final structured output via `StructuredOutputValidationService`
  8. Return processed response
- Create `AgentController` with authenticated endpoint `/api/ai/chat`
- Wire `AgentOrchestratorService` in `AiModule`
- Use existing Prisma models: `AIConversation`, `AIMessage`, `AIToolExecution`

## Capabilities

### New Capabilities
- `agent-orchestrator`: Full LLM → Tool → Execution → Structured Output loop with backend validation gates, authenticated HTTP endpoint, and audit persistence.

### Modified Capabilities
- `ai-integration-mvp` (archivado): extended with real HTTP endpoint and orchestration loop.

## Impact

- Backend (NestJS): new `apps/api/src/ai/orchestrator/` module with service, controller, and tests; updated `AiModule`.
- Prisma: uses existing `AIConversation`, `AIMessage`, `AIToolExecution` models (no migration needed).
- No new npm dependencies (reuses existing `ajv`, Prisma client).
- OpenSpec: records the orchestration loop and HTTP endpoint; previous archived changes remain as-is.
