# Proposal

## Why

The backend must process responses returned by the AI provider and guarantee that any structured output conforms to the versioned JSON Schemas defined in `chart-specification-p0-schema` before it reaches the frontend. Without this processing layer, invalid or non-conforming LLM output would bypass the backend contract validation that the SPEC mandates.

## What Changes

- Introduce `AgentService` in `apps/api/src/ai/agent.service.ts` exposing `processProviderResponse(rawResponse: unknown)`.
- Parse raw provider output (JSON string or object) and identify the intended response type (`text`, `analysis`, `action`).
- Validate structured responses through `StructuredOutputValidationService` against the matching `v1_*` schema.
- Throw `BadRequestException` on contract failure and `InternalServerErrorException` on missing schema (configuration error).
- Fall back to a text response for non-JSON, malformed, or unrecognized-type input.
- Register and export `AgentService` from `AiModule`.

## Capabilities

### New Capabilities
- `agent-response-processing`: Backend processing and validation of AI provider responses into typed structured outputs (`text`, `analysis`, `action`), with strict schema validation and safe text fallback for unstructured input.

### Modified Capabilities
- None.

## Impact

- Backend (NestJS): new `AgentService`, expanded `AiModule`; reuses `StructuredOutputValidationService` and the `v1_*` schemas.
- Tests: unit tests for valid/invalid structured responses, malformed JSON fallback, unknown-type fallback, and schema-not-found configuration error.
- No Prisma schema, migration, or external dependency changes.
- OpenSpec: this change records the response-processing step of the MVP Agent pipeline as a resolved capability.
