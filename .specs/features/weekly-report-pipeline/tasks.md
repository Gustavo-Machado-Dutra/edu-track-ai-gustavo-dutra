# Weekly Report Pipeline Tasks

## Test Coverage Matrix

> Generated from AGENTS.md, IMPLEMENTATION.md, SPEC.md, schema.prisma, apps/api/package.json and the existing API test patterns.

| Code Layer | Required Test Type | Evidence |
| --- | --- | --- |
| ReportsService idempotency | Unit | apps/api/src/reports/reports.service.spec.ts covers the Prisma compound upsert. |
| BullMQ worker and external adapters | Integration | Blocked: queue, PDF, Analytics report and S3 contracts are absent. |

## Gate Check Commands

- Quick: npm.cmd run typecheck and npm.cmd run lint in apps/api.
- Full: npm.cmd run test and npm.cmd run build in apps/api.
- Workspace: npm.cmd run typecheck, npm.cmd run lint, npm.cmd run test, npm.cmd run build at repository root.

## Execution Plan

1. Keep the database idempotency slice verified.
2. Define the missing contracts and environment configuration.
3. Implement BullMQ worker and the Analytics -> PDF -> Object Storage pipeline.
4. Add integration tests and rerun all gates.

## Task Breakdown

### T1: Make report creation idempotent

**What**: Use the existing Prisma compound unique key in ReportsService generation.
**Where**: apps/api/src/reports/reports.service.ts
**Depends on**: None
**Reuses**: schema.prisma WeeklyReport unique constraint.
**Requirement**: REPORT-01

**Done when**:

- [x] generateWeeklyReport uses upsert with userId_periodStart_periodEnd.
- [x] API tests assert the compound key and PENDING creation state.
- [x] API typecheck, lint, test and build pass.

**Tests**: unit
**Gate**: full

---

### T2: Define missing report integration contracts

**What**: Define the authenticated Analytics report payload, BullMQ job, retry/timeout policy, PDF contract and S3-compatible configuration.
**Where**: openspec/changes/2026-09-23-weekly-report-pipeline/specs/weekly-report-pipeline/spec.md
**Depends on**: T1
**Reuses**: SPEC.md and context.md.
**Requirement**: REPORT-02, REPORT-03

**Done when**:

- [ ] All required contracts and environment names are approved and versioned.
- [ ] No TBD integration decision remains.

**Tests**: contract review
**Gate**: blocked

---

### T3: Implement asynchronous report worker

**What**: Implement BullMQ/Redis worker for Analytics, charts, AI insights, PDF and S3 storage.
**Where**: apps/api/src/reports/reports.worker.ts
**Depends on**: T2
**Reuses**: ReportsService and WeeklyReport Prisma model.
**Requirement**: REPORT-02, REPORT-03

**Done when**:

- [ ] The worker executes only the approved contracts.
- [ ] Status transitions and retries are persisted.
- [ ] Integration tests pass against the configured dependencies.

**Tests**: integration
**Gate**: full

---

### T4: Validate full pipeline

**What**: Execute the full report pipeline tests and all project gates.
**Where**: .specs/features/weekly-report-pipeline/validation.md
**Depends on**: T3
**Reuses**: npm.cmd scripts and API/analytics test infrastructure.
**Requirement**: REPORT-01, REPORT-02, REPORT-03

**Done when**:

- [ ] API and workspace gates pass with the worker enabled.
- [ ] A completed report has storage_key, file_name and generated_at.

**Tests**: integration
**Gate**: full

## Phase Execution Map


```
T1 -> T2
T2 -> T3
T3 -> T4
```

## Blocker

- blocker: report integration contracts and S3/PDF configuration are absent.
- impact: T2, T3 and T4 cannot be implemented or validated without inventing architecture.
- required decision: define the contracts/configuration listed in SPEC.md and context.md.
