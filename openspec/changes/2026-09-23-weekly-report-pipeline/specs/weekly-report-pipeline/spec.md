# weekly-report-pipeline Specification

## ADDED Requirements

### Requirement: Weekly Report deve usar processamento assíncrono e idempotente
O sistema MUST processar a geração de Weekly Report por BullMQ/Redis e MUST evitar duplicidade para o mesmo usuário e período.

#### Scenario: solicitação de período ainda não processado
- WHEN o usuário solicita um Weekly Report para um período sem execução existente
- THEN o Backend cria ou reutiliza o registro weekly_reports e enfileira uma execução assíncrona rastreável

#### Scenario: solicitação repetida
- WHEN o usuário solicita novamente o mesmo período
- THEN o Backend não cria um segundo relatório para o mesmo usuário e período

### Requirement: Pipeline deve produzir e armazenar o artefato oficial
O worker MUST consumir o dataset definido pelo contrato Analytics, gerar o PDF oficial e armazená-lo em Object Storage compatível com S3 antes de marcar o relatório como COMPLETED.

#### Scenario: processamento concluído
- WHEN Analytics, gráficos, insights, PDF e Object Storage concluem sem erro
- THEN weekly_reports recebe storage_key, file_name, generated_at e status COMPLETED

#### Scenario: falha em etapa do pipeline
- WHEN uma etapa do pipeline falha
- THEN weekly_reports registra status FAILED sem publicar um artefato incompleto

### Requirement: Contratos de integração devem estar definidos antes do worker
O sistema MUST possuir contratos versionados para payload Analytics, job BullMQ, PDF e Object Storage antes da implementação do worker.

#### Scenario: contrato ausente
- WHEN uma integração necessária não possui endpoint, schema, configuração ou credencial definidos
- THEN a implementação permanece BLOCKED e não inventa valores operacionais
