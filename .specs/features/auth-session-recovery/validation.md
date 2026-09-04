## Validation

**Result**: PASS

**Spec-anchored check**: 5/5 acceptance criteria matched; 0 spec-precision gaps.
**Sensor**: PASS. Tests discriminate refresh success, refresh failure, retry limit, and authentication endpoint exclusion.
**Gate**: Web tests, typecheck, build, spec validator, and tasks validator passed.

**Evidence**:

- `apps/web/src/services/api.ts:42` parses response bodies without calling `Response.json()` on empty responses.
- `apps/web/src/services/api.ts:138` refreshes a `401` response and retries the original request with the new token.
- `apps/web/src/App.tsx:25` switches the application back to the login screen after the session-expired event.
- `apps/web/src/services/api.spec.ts:58` verifies successful refresh and retry.
- `apps/web/src/services/api.spec.ts:84` verifies token cleanup and the expiration event after refresh failure.
- `apps/web/src/services/api.spec.ts:109` verifies authentication endpoints do not trigger refresh.

**Commands**:

- `corepack pnpm@9.15.2 --filter @edu-track/web test` → 8 tests passed.
- `corepack pnpm@9.15.2 --filter @edu-track/web typecheck` → passed.
- `corepack pnpm@9.15.2 --filter @edu-track/web build` → passed.
- `validate_spec.py --root . auth-session-recovery` → 0 errors.
- `validate_tasks.py --root . auth-session-recovery` → 0 errors.
