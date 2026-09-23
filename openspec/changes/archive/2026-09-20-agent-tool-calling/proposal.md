# Proposal

## Why

The SPEC requires that Tool Calling be validated by the Backend: the LLM proposes tool calls, but every call must pass a backend gate before any domain execution. The Agent Orchestrator cannot be built until this gate exists. Today the repo has the provider adapter (which sends tools + `tool_choice`) and validation of *responses*, but no registry of authorized Tools nor a validator that enforces existence, authorization and argument conformance for proposed tool calls.

## What Changes

- Introduce a `AgentToolRegistry` of authorized Tools, each with `name`, `description`, `inputSchema` (JSON Schema), and read/write risk classification.
- Implement `AgentToolCallValidator` that, given a proposed tool call (name + arguments), returns a deterministic result rejecting: unknown tools, unauthorized tool names, and argument objects that do not conform to the tool input JSON Schema.
- Register the initial task-oriented Tools with input schemas derived from the existing request DTOs (e.g. `create_task`, `update_task`, `complete_task`, `list_tasks`, `get_task`).
- Register the gate services in `AiModule` so the future Agent Orchestrator can consume them.

## Capabilities

### New Capabilities
- `agent-tool-calling`: Backend registry and validation gate for Tool Calling, enforcing tool existence, authorization and JSON Schema argument conformance before any domain execution.

### Modified Capabilities
- None.

## Impact

- Backend (NestJS): new `apps/api/src/ai/tools/` module with registry, validator, tool definitions and tests; wired into `AiModule`.
- No Prisma schema/migration changes (this change does NOT execute tools or persist executions).
- No new npm dependency (reuses `ajv`).
- OpenSpec: records the backend Tool-Calling validation gate; execution and the orchestrator loop remain future changes.
