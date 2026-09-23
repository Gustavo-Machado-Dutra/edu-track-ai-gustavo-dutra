# Spec Delta

## Purpose

Define o contrato oficial `ChartSpecification` entre Agent/Backend e Frontend para visualizações dinâmicas geradas pelo Agent de IA, incluindo JSON Schema, tipos de gráfico permitidos, regras de validação e exemplos válidos/inválidos para teste.

## ADDED Requirements

### Requirement: ChartSpecification é o contrato único para gráficos do Agent
O sistema DEVE utilizar exclusivamente a estrutura `ChartSpecification` para toda comunicação de gráficos personalizados entre o Agent e o Frontend. Nenhum outro formato de especificação de gráfico será aceito ou processado.

#### Scenario: Agent retorna ChartSpecification válida
- **WHEN** o Agent produz uma resposta estruturada contendo visualização
- **THEN** a resposta CONTEM um objeto `ChartSpecification` válido conforme JSON Schema
- **E** o Backend valida o objeto antes de encaminhar ao Frontend
- **E** o Frontend renderiza o gráfico usando apenas propriedades definidas no schema

#### Scenario: Agent tenta retornar formato não padronizado
- **WHEN** o Agent produz resposta com estrutura de gráfico fora do contrato `ChartSpecification`
- **THEN** o Backend REJEITA a resposta como Structured Output inválido
- **E** a resposta NÃO é encaminhada ao Frontend

### Requirement: ChartSpecification contém campos obrigatórios e opcionais bem definidos
O contrato `ChartSpecification` DEVE incluir, no mínimo, os seguintes campos:
- `type` (string, obrigatório): tipo de gráfico
- `title` (string, obrigatório): título do gráfico
- `description` (string, opcional): descrição do gráfico
- `xAxis` (object, obrigatório): configuração do eixo X
- `yAxis` (object, obrigatório): configuração do eixo Y
- `series` (array, obrigatório): séries de dados
- `data` (array, obrigatório): dados para renderização
- `filters` (array, opcional): filtros aplicados
- `source` (object, obrigatório): origem dos dados (tool utilizada)
- `datasetVersion` (string, obrigatório): versão do dataset para rastreabilidade

#### Scenario: ChartSpecification com todos os campos preenchidos
- **WHEN** um objeto `ChartSpecification` contém todos os campos obrigatórios e opcionais
- **THEN** a validação JSON Schema PASSA
- **E** o Backend aceita como Structured Output válido

#### Scenario: ChartSpecification faltando campo obrigatório
- **WHEN** um objeto `ChartSpecification` omite `type`, `title`, `xAxis`, `yAxis`, `series`, `data`, `source` ou `datasetVersion`
- **THEN** a validação JSON Schema FALHA
- **E** o Backend REJEITA como Structured Output inválido

### Requirement: Tipos de gráfico permitidos são restritos a lista aprovada
O campo `type` DEVE aceitar exclusivamente os seguintes valores:
`kpi`, `card`, `table`, `line`, `bar`, `area`, `donut`, `pie`, `scatter`, `comparison`, `heatmap`.
Qualquer outro valor DEVE ser rejeitado pela validação.

#### Scenario: Tipo de gráfico permitido
- **WHEN** `type` é "line", "bar", "kpi", "card", "table", "area", "donut", "pie", "scatter", "comparison" ou "heatmap"
- **THEN** a validação PASSA

#### Scenario: Tipo de gráfico não permitido
- **WHEN** `type` é "radar", "gauge", "funnel", "treemap" ou qualquer valor fora da lista aprovada
- **THEN** a validação FALHA
- **E** o Backend REJEITA como Structured Output inválido

### Requirement: xAxis e yAxis seguem estrutura padronizada
Os campos `xAxis` e `yAxis` DEVEM ser objetos contendo obrigatoriamente:
- `field` (string): nome do campo nos dados
- `label` (string): rótulo para exibição

#### Scenario: xAxis com estrutura válida
- **WHEN** `xAxis` contém `field` e `label` como strings não-vazias
- **THEN** a validação PASSA

#### Scenario: xAxis faltando campo obrigatório
- **WHEN** `xAxis` omite `field` ou `label`
- **THEN** a validação FALHA

### Requirement: Series segue estrutura padronizada
O campo `series` DEVE ser um array de objetos, cada um contendo obrigatoriamente:
- `field` (string): nome do campo nos dados
- `label` (string): rótulo para exibição

#### Scenario: Series com estrutura válida
- **WHEN** `series` é array com objetos contendo `field` e `label`
- **THEN** a validação PASSA

#### Scenario: Series array vazio
- **WHEN** `series` é array vazio
- **THEN** a validação FALHA (pelo menos uma série é obrigatória)

### Requirement: Source identifica a Tool que produziu os dados
O campo `source` DEVE ser um objeto contendo obrigatoriamente:
- `tool` (string): nome da Tool autorizada que gerou o dataset (ex: "get_dashboard_data", "get_task_metrics", "get_study_metrics")

#### Scenario: Source com tool válida
- **WHEN** `source.tool` é uma Tool conhecida e autorizada
- **THEN** a validação PASSA

#### Scenario: Source com tool desconhecida
- **WHEN** `source.tool` não corresponde a nenhuma Tool autorizada
- **THEN** a validação FALHA

### Requirement: DatasetVersion é obrigatório para rastreabilidade
O campo `datasetVersion` DEVE ser uma string não-vazia que identifica a versão do dataset utilizado, permitindo rastreabilidade e reprodutibilidade.

#### Scenario: DatasetVersion presente
- **WHEN** `datasetVersion` é string não-vazia
- **THEN** a validação PASSA

#### Scenario: DatasetVersion ausente ou vazia
- **WHEN** `datasetVersion` é omitida, nula ou string vazia
- **THEN** a validação FALHA

### Requirement: Validação JSON Schema usa strict mode e additionalProperties false
A validação de Structured Output no Backend DEVE utilizar JSON Schema com:
- `strict: true` (quando suportado pela rota da API)
- `additionalProperties: false` (quando compatível com o contrato)
para garantir que apenas propriedades definidas no schema são aceitas.

#### Scenario: Validação com strict mode
- **WHEN** o Backend valida uma resposta do Agent
- **THEN** a validação usa schema com `strict: true` e `additionalProperties: false`
- **E** propriedades extras na resposta CAUSAM falha de validação

### Requirement: Validação dupla - LLM e Backend
O sistema DEVE realizar validação em duas camadas:
1. Nível LLM: `response_format` com JSON Schema (quando suportado)
2. Nível Backend: validação independente e obrigatória antes de encaminhar ao Frontend

#### Scenario: Resposta passa validação LLM mas falha no Backend
- **WHEN** o LLM retorna objeto que passa na validação da API mas falha na validação independente do Backend
- **THEN** o Backend REJEITA a resposta
- **E** a resposta NÃO é encaminhada ao Frontend
- **E** erro é registrado para auditoria

#### Scenario: Resposta passa em ambas validações
- **WHEN** o objeto passa na validação LLM e na validação independente do Backend
- **THEN** a resposta é encaminhada ao Frontend como Structured Output válido

### Requirement: Frontend nunca confia na saída bruta do LLM
O Frontend DEVE consumir apenas respostas que passaram pela validação do Backend. O Frontend NÃO DEVE processar, interpretar ou renderizar saída bruta do LLM sem validação prévia.

#### Scenario: Frontend recebe resposta validada
- **WHEN** o Frontend recebe resposta do endpoint do Agent
- **THEN** a resposta já passou pela validação do Backend
- **E** o Frontend renderiza usando apenas propriedades definidas no schema

### Requirement: JSON Schema versionado como contrato de implementação
Os schemas formais de Structured Output (incluindo `ChartSpecification`) DEVEM ser mantidos como contratos versionados de implementação, validados pelo Backend antes do uso.

#### Scenario: Schema versionado disponível
- **WHEN** o Backend valida Structured Output
- **THEN** utiliza schema com versão explícita
- **E** alterações comportamentais geram nova versão do schema

