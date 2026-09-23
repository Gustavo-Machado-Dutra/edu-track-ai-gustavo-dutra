# Proposal

## Why

The SPEC specifies that the Agent must access language models exclusively through an `LLM Provider Adapter` (§17.2, §35.1.1). Every downstream component — `AgentService`, Tool Calling, Agent Orchestrator and the OpenRouter integration — depends on this adapter existing. Without it the MVP cannot make a model call, apply retry/fallback, or log model/prompt usage.

## What Changes

- Introduce the `LlmProviderAdapter` abstraction (the only allowed way for the Agent to reach an LLM).
- Implement `OpenRouterProviderAdapter` over the OpenAI-compatible Chat Completions API (`POST /chat/completions`), which is the MVP protocol decision (§35.1.1).
- Add runtime config (provider, model, fallback model, base URL, timeout, API key) from environment.
- Support Tool Calling (`tools` + `tool_choice`) and Structured Output (`response_format.type = json_schema`) in request building.
- Apply the SPEC timeout + single-retry + fallback policy for transient errors and no retry for auth/4xx errors (§35.1.10).
- Make the HTTP transport injectable so behavior is unit-testable without a live key (mocked HTTP), consistent with the SPEC smoke-test fake/stub guidance (§40A).

## Capabilities

### New Capabilities
- `llm-provider-adapter`: The provider-agnostic abstraction plus the OpenRouter Chat Completions implementation, covering config, request building (messages, tools, structured output), timeout, retry, fallback and error handling.

### Modified Capabilities
- None.

## Impact

- Backend (NestJS): new `apps/api/src/ai/provider/` module with interface, OpenRouter implementation, config and tests; registers the adapter as a provider in `AiModule`.
- No Prisma schema/migration changes (no persistence in this change).
- No new npm dependency (uses the built-in HTTP client via an injectable transport).
- OpenSpec: records the provider-agnostic adapter step of the MVP AI pipeline; the Agent Orchestrator and the real endpoint remain future changes.
