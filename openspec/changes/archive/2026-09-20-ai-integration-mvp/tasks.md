# Tasks

## 1. Implementation of AgentService
- [x] 1.1 Create apps/api/src/ai/agent.service.ts implementing AgentService.
- [x] 1.2 Implement processProviderResponse(rawResponse: any) method that:
    - Parses raw input into JSON.
    - Identifies the response type (text, analysis, action).
    - Validates against the corresponding schema using StructuredOutputValidationService.
    - Throws a ValidationException (or similar NestJS exception) on contract failure.
- [x] 1.3 Implement a fallback mechanism for non-structured text responses.

## 2. Module Integration
- [x] 2.1 Register AgentService in apps/api/src/ai/ai.module.ts as a provider and export it.

## 3. Verification
- [x] 3.1 Create unit tests in apps/api/src/ai/agent.service.spec.ts covering:
    - Successful processing of structured responses (Text, Analysis, Action).
    - Detection and handling of invalid structured responses (ValidationException).
    - Handling of malformed JSON input.
    - Fallback to text response for unstructured input.
- [x] 3.2 Run npm run typecheck and npm run build to ensure no regressions.
