# Proposal

Implementar o pipeline assíncrono de Weekly Report definido no SPEC: fila BullMQ/Redis, worker NestJS, preparação de métricas via Analytics/FastAPI/Pandas, composição de gráficos e insights, geração de PDF, upload em Object Storage compatível com S3 e persistência em weekly_reports.

## Estado atual comprovado

ReportsService apenas cria/lista registros PENDING. O repositório não possui BullMQ no package do API, endpoint interno de relatório no serviço Python, contrato de PDF ou configuração S3-compatible. A implementação segura está bloqueada até essas interfaces e credenciais/configurações serem definidas.

## Non-goals

- Inventar formato de PDF, contrato interno de dados, bucket ou política de credenciais.
- Substituir o pipeline assíncrono por processamento síncrono ou armazenamento local.
