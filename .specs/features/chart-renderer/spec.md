# Chart Renderer Specification

## Problem Statement

O Copilot Web ja recebe respostas de analysis validadas pelo Backend, mas ainda nao exibe a ChartSpecification opcional. Isso impede que resultados de Analytics cheguem ao usuario como visualizacao e cria um gap entre o contrato estruturado e a interface.

## Goals

- [x] Renderizar no Web os onze tipos permitidos pelo contrato ChartSpecification.
- [x] Exibir somente campos declarados pela specification, sem executar conteudo do modelo.
- [x] Integrar a visualizacao a mensagens de analysis do Copilot.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Alterar o JSON Schema ou as Analytics Tools | O contrato e o Backend ja estao definidos e validados. |
| Calcular metricas no Frontend | Metricas oficiais permanecem responsabilidade do Backend/Analytics. |
| Biblioteca externa de graficos | SVG e HTML nativos atendem ao escopo atual sem nova dependencia. |

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Respostas recebidas pelo Web | O Backend ja validou a resposta antes do envio. | O contrato ChartSpecification exige validacao independente no Backend. | yes |
| Dados nao numericos em geometria | O renderer omite o ponto ou mostra estado vazio. | Evita geometria invalida sem inventar metricas. | yes |
| Campos arbitrarios em data | Somente xAxis, yAxis e series sao exibidos. | Cumpre o contrato e limita a superficie de dados. | yes |

**Open questions:** none - all resolved or logged above.

## User Stories

### P1: Visualizar analise com grafico MVP

**User Story**: As a Student, I want to see the chart returned with my analysis so that I can understand my academic data without interpreting raw JSON.

**Why P1**: A visualizacao e a parte visivel do contrato ChartSpecification e fecha o fluxo Analytics -> Agent -> Web.

**Acceptance Criteria**:

1. WHEN a valid analysis response contains a line, area, bar or comparison chart THEN the Web SHALL render an SVG with the declared title, axes, series and numeric data.
2. WHEN a valid analysis response contains a table, KPI or card chart THEN the Web SHALL render the declared rows or principal value.
3. WHEN a valid analysis response contains a pie, donut, scatter or heatmap chart THEN the Web SHALL render a corresponding safe visualization using only declared fields.
4. The Web SHALL render no executable content and SHALL NOT inject HTML from the ChartSpecification.

**Independent Test**: Render AgentChart with one fixture for each chart family and inspect the generated static markup.

## Edge Cases

- IF a row has a non-numeric value for a geometric measure THEN the Web SHALL omit that geometry and show the empty state when no valid measures remain.
- IF a row contains an undeclared field THEN the Web SHALL NOT include that field in the table, labels or legend.
- IF data is empty THEN the Web SHALL show a stable empty state instead of invalid SVG attributes.

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| CHART-01 | P1: Visualizar analise com grafico MVP | Execute | Verified |
| CHART-02 | P1: Visualizar analise com grafico MVP | Execute | Verified |
| CHART-03 | P1: Visualizar analise com grafico MVP | Execute | Verified |
| CHART-04 | P1: Visualizar analise com grafico MVP | Execute | Verified |

**Coverage:** 4 total, 4 mapped to tasks, 0 unmapped.

## Success Criteria

- [x] AgentChart renders all allowed ChartType values without new runtime dependencies.
- [x] AIAssistantPage inserts the chart only when normalizeAgentResponse returns chartSpec.
- [x] Unit tests pass for visual output, arbitrary fields and invalid numeric values.
