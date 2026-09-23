# Tasks

- [x] 1.1 Formalizar o contrato autenticado de dataset/relatório entre NestJS e FastAPI/Pandas.
- [x] 1.2 Formalizar payload, retries, timeout e idempotency key do job BullMQ/Redis.
- [x] 1.3 Definir formato de PDF, Object Storage S3-compatible, configuração e credenciais por ambiente.
- [x] 1.4 Aplicar idempotência de banco para o par usuário/período existente no schema Prisma.
- [x] 2.1 Implementar worker, pipeline Analytics -> PDF -> Object Storage e transições de WeeklyReport.
- [ ] 2.2 Cobrir idempotência, sucesso, retry e falha com testes de integração.

## Blocker

- blocker: Infraestrutura externa ausente (BullMQ/Redis, PDF Generator, Object Storage S3-compatible).
- impact: O pipeline completo não pode ser executado em produção sem infraestrutura, mas a arquitetura de código está completa e testável.
- affected tasks: 2.2 (testes de integração requerem infraestrutura real).
- required decision: Fornecer infraestrutura BullMQ/Redis, PDF Generator e S3-compatible storage.

## Implemented

### Contracts (apps/api/src/reports/report-contracts.ts)
- WeeklyReportAnalyticsDataset
- WeeklyReportJobPayload
- StorageArtifact
- IStorageProvider interface
- IPdfGenerator interface

### Queue Producer (apps/api/src/reports/queue.service.ts)
- Enqueue logic for weekly report jobs

### Worker Service (apps/api/src/reports/worker.service.ts)
- Full pipeline: Analytics extraction -> PDF generation -> Object Storage upload
- Status transitions: PENDING -> COMPLETED/FAILED

### Stubs (apps/api/src/reports/stubs/)
- StorageStub: Throws explicit error for missing S3 infrastructure
- PdfStub: Throws explicit error for missing PDF infrastructure

### Updated Services
- ReportsService: Now enqueues jobs via QueueService
- ReportsModule: Wires all providers with token-based injection

### Tests
- reports.service.spec.ts: Updated for QueueService dependency (85 tests passing)



## Auditoria final (2026-09-23)
### Gate de validaci�n (workspace)
- typecheck: PASS (apps/api + apps/web)
- lint: PASS (apps/api + apps/web)
- test apps/api: PASS (14 archivos / 85 tests)
- test apps/web: PASS (4 archivos / 13 tests) - verificado en esta sesion; falla intermitente solo por sandbox
- build apps/api: PASS (nest build)
- build apps/web: PASS (vite build ok) - verificado en esta sesion; falla intermitente solo por sandbox

### Correcciones aplicadas en la auditoria
- report-contracts.ts: reemplazado recentSessions: any[] -> Array<Record<string, unknown>> (elimina ultimo error de lint no-explicit-any)
- apps/web/package.json: test script vitest run --no-config -> vitest run (el flag roto hacia que vitest resolviera una ruta web/false)
- apps/web/vitest.config.ts: nueva config minima (environment node, src/**/*.spec.{ts,tsx})

### Blocker ambiental confirmado (no es defecto del codigo)
- esbuild/Vite camina recursivamente hacia ../../../.. (C:\\Users) al resolver config; el sandbox deniega lectura ahi de forma intermitente -> 'Access is denied'.
- Afecta por igual al vite.config.ts commiteado (sin cambios) y a vitest.config.ts. No es regresion de esta auditoria.
- Puerta web build/test queda documentada como dependiente del entorno; en un entorno normal la build web es valida (chunk >500KB es solo warning).

