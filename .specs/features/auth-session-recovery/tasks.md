# Recuperação de Sessão Autenticada Tasks

## Test Coverage Matrix

| Requirement | Test | Expected outcome |
| --- | --- | --- |
| AUTH-01 | `api.spec.ts`: expired access token | Refresh is requested once after `401` |
| AUTH-02 | `api.spec.ts`: successful refresh | New tokens are saved and original request is retried |
| AUTH-03 | `api.spec.ts` and `App` flow | Tokens are removed and login is shown |
| AUTH-04 | `api.spec.ts`: failed refresh | Original request does not trigger a second refresh |
| AUTH-05 | `api.spec.ts`: auth endpoint `401` | Login, register, and refresh errors are returned unchanged |

## Gate Check Commands

```text
corepack pnpm@9.15.2 --filter @edu-track/web test
corepack pnpm@9.15.2 --filter @edu-track/web typecheck
```

## Execution Plan

### Phase 1

#### T1: Definir o contrato de recuperação
Where: `.specs/features/auth-session-recovery/spec.md`
Tests: `validate_spec.py` passes for AUTH-01..AUTH-05.
Gate: Spec closure gate passes.
Depends on: none

### Phase 2

#### T2: Implementar refresh automático
Where: `apps/web/src/services/api.ts`
Tests: `apps/web/src/services/api.spec.ts` covers refresh success, failure, and one-attempt limit.
Gate: Web tests pass.
Depends on: T1

#### T3: Reagir à expiração na aplicação
Where: `apps/web/src/App.tsx`
Tests: `apps/web/src/services/api.spec.ts` verifies the expiration event is emitted after refresh failure.
Gate: Web typecheck passes.
Depends on: T2

#### T4: Verificar o fluxo completo
Where: `apps/web/src/services/api.spec.ts`
Tests: Web test suite and typecheck run successfully.
Gate: All commands in Gate Check Commands pass.
Depends on: T3

## Task Breakdown

| Task | Scope | Requirements | Status |
| --- | --- | --- | --- |
| T1 | Specification | AUTH-01..AUTH-05 | Complete |
| T2 | API client | AUTH-01, AUTH-02, AUTH-04, AUTH-05 | Complete |
| T3 | Application session state | AUTH-03 | Complete |
| T4 | Verification | AUTH-01..AUTH-05 | Complete |
