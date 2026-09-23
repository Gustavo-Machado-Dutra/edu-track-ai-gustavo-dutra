# Weekly Report Pipeline Specification

## Problem Statement

O Backend possui apenas o registro inicial de WeeklyReport em estado PENDING. O SPEC exige processamento assíncrono por BullMQ, Analytics/Pandas, PDF e Object Storage S3-compatible, mas os contratos de integração e a infraestrutura operacional ainda não estão definidos no repositório.

## Goals

- [x] Evitar duplicidade de solicitação para o mesmo usuário e período usando a chave composta existente no Prisma.
- [ ] Processar o relatório de forma assíncrona e rastreável.
- [ ] Publicar o PDF em Object Storage e marcar o registro como COMPLETED.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Escolher bucket, prefixo ou credenciais S3 | A configuração por ambiente não existe e não deve ser inventada. |
| Inventar contrato de PDF ou endpoint FastAPI | O SPEC exige contratos definidos antes da integração. |
| Substituir BullMQ por setTimeout ou processamento síncrono | Isso violaria a arquitetura oficial. |

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Idempotência | Usar a unique userId/periodStart/periodEnd do schema Prisma. | É o único contrato físico existente. | yes |
| Fila | BullMQ sobre Redis. | Definido em SPEC/context e Redis existe no docker-compose. | yes |
| Relatório interno | Contrato FastAPI/Pandas ainda deve ser formalizado. | Não há endpoint de report no serviço analytics atual. | no |
| Armazenamento | S3-compatible ainda sem configuração/credencial. | Não há variáveis ou adapter no repositório. | no |
| PDF | Formato, biblioteca e content type ainda não definidos. | Evita escolher uma implementação fora da especificação. | no |

**Open questions:** none untracked; the unresolved Analytics, job, PDF and S3 contracts are explicitly recorded as blockers and require an external decision.

## User Stories

### P1: Gerar Weekly Report oficial

**User Story**: As a Student, I want to request a weekly report so that I can receive a reliable PDF of my study progress.

**Why P1**: Relatórios fazem parte do MVP, mas o fluxo só é válido quando o artefato oficial é gerado e persistido.

**Acceptance Criteria**:

1. WHEN a user requests a new period THEN the Backend SHALL enqueue an asynchronous job without creating duplicate rows for the same user and period.
2. WHEN the worker completes Analytics, charts, AI insights, PDF and storage THEN the Backend SHALL persist storage_key, file_name and generated_at with status COMPLETED.
3. IF an integration contract or required configuration is missing THEN the implementation SHALL remain BLOCKED and SHALL NOT invent operational values.

**Independent Test**: The idempotency slice is verified by the ReportsService unit test; the full pipeline remains blocked until the listed contracts are supplied.

## Edge Cases

- IF the same period is requested concurrently THEN the compound database key SHALL prevent duplicate report rows.
- IF the PDF or storage step fails THEN the report SHALL not be marked COMPLETED.
- IF the internal Analytics contract is absent THEN no worker integration SHALL be implemented speculatively.

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| REPORT-01 | P1: Gerar Weekly Report oficial | Execute | Partially Verified |
| REPORT-02 | P1: Gerar Weekly Report oficial | Blocked | Blocked |
| REPORT-03 | P1: Gerar Weekly Report oficial | Blocked | Blocked |

**Coverage:** 3 total, 1 partially mapped to implemented tests, 2 blocked.

## Success Criteria

- [x] Repeated report generation uses the existing compound unique key and no duplicate create path.
- [ ] Queue, worker, Analytics/PDF and S3 integration are validated end-to-end.
