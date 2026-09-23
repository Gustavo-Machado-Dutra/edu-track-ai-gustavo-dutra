# Design

## Context
`provider-adapter` (archived): LLM access via `LlmProviderAdapter` (Chat Completions, tools, structured output).
`structured-output-contracts` (archived): `StructuredOutputValidationService` validates `v1_*` schemas.
`agent-tool-calling` (archived): `AgentToolRegistry` + `AgentToolCallValidator` gate.
Missing: the orchestrator that wires these together into the execution loop.

## Goals / Non-Goals
**Goals:**
- `AgentOrchestratorService` implementing the full loop: LLM → Tool Call → Validation → Execution → Structured Output → Backend Validation.
- Authenticated HTTP endpoint `POST /api/ai/chat` in `AgentController`.
- Persist `AIConversation`, `AIMessage`, `AIToolExecution` via Prisma.
- Reuse existing domain services (`TasksService`) for tool execution.
- Max 3 tool iterations per request to prevent infinite loops.
- Error handling: tool validation failure stops loop; tool execution failure records error and continues.

**Non-Goals:**
- NO streaming responses (MVP uses blocking request/response).
- NO multi-turn conversation memory beyond current request (context passed in request).
- NO new Tool definitions (uses existing 5 task tools).
- NO FastAPI/Pandas integration in this change (future analytics tools).

## Decisions
### 1. Orchestrator Loop Structure
**Decision**: Single `execute(userId, message, conversationId?)` method that:
- Creates/loads `AIConversation`
- Appends user `AIMessage`
- Calls `AgentService.processProviderResponse` via Provider Adapter with tools
- If tool calls: validates each via `AgentToolCallValidator`, executes via domain service, records `AIToolExecution`, feeds results back to LLM (max 3 iterations)
- Validates final structured output via `StructuredOutputValidationService`
- Appends assistant `AIMessage` with structured content
- Returns `ProcessedAIResponse`

### 2. Tool Execution
**Decision**: Map tool names to `TasksService` methods:
- `create_task` → `TasksService.create(userId, dto)`
- `update_task` → `TasksService.update(id, userId, dto)`
- `complete_task` → `TasksService.complete(id, userId)`
- `get_task` → `TasksService.findByIdForUser(id, userId)`
- `list_tasks` → `TasksService.findAllByUser(userId, status?)`
Each execution creates `AIToolExecution` record (PENDING → SUCCESS/FAILED/REJECTED).

### 3. Conversation Context
**Decision**: Pass last N messages (e.g., 10) as context to LLM. For MVP, include full conversation history from `AIConversation.messages`.

### 4. HTTP Endpoint
**Decision**: `POST /api/ai/chat` with body `{ message: string, conversationId?: string }`. Returns `ProcessedAIResponse` with `conversationId`.

### 5. Error Handling
**Decision**: 
- Tool validation failure → record `AIToolExecution` with REJECTED, return error to LLM for retry
- Tool execution failure → record `AIToolExecution` with FAILED, include error in tool result for LLM
- LLM/Provider failure → return 502/504, no partial conversation state persisted
- Structured output validation failure → 400, conversation not advanced

## Risks / Trade-offs
| Risk | Mitigation |
|------|------------|
| Infinite tool loops | Hard limit of 3 tool iterations per request |
| Tool execution side effects | All writes go through domain services with ownership checks |
| Conversation growth | Prune old messages in future; MVP keeps full history |
| Provider latency | 30s timeout from Provider Adapter config |

## Migration Plan
1. Create `AgentOrchestratorService` with loop logic.
2. Create `AgentController` with `/api/ai/chat` endpoint.
3. Register in `AiModule`.
4. Unit tests: orchestrator loop, tool execution mapping, audit persistence.
5. Integration test: full request via mock transport.
6. Run `npm run test/lint/typecheck/build`.
7. Archive change.
