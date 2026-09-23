# Design

O fluxo alvo permanece o definido no SPEC:

Request/Scheduler -> BullMQ/Redis -> NestJS Worker -> FastAPI/Pandas -> Metrics/Charts/AI Insights -> PDF -> S3-compatible Object Storage -> weekly_reports.

A implementação só pode começar depois de formalizar:

1. contrato autenticado do endpoint FastAPI para dataset e relatório;
2. payload e resultado do job BullMQ, incluindo timeout, retry e idempotency key;
3. biblioteca/formato de PDF e contrato de fileName/contentType;
4. endpoint, bucket, prefixo e credenciais do Object Storage;
5. comportamento de falha e transições PROCESSING/COMPLETED/FAILED.

Sem essas decisões, criar adapters ou workers seria uma substituição especulativa da arquitetura.
