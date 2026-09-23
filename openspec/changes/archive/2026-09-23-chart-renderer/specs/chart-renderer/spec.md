# chart-renderer Specification

## ADDED Requirements

### Requirement: ChartSpecification validada deve ser renderizada no Web
O Copilot Web MUST renderizar uma ChartSpecification recebida em uma resposta de analysis usando somente propriedades definidas no contrato validado pelo Backend.

#### Scenario: resposta com grafico cartesiano
- WHEN uma resposta de analysis contem uma ChartSpecification do tipo line, area, bar ou comparison
- THEN o Web renderiza um SVG com titulo, eixos, series e dados da specification

#### Scenario: resposta com tabela ou KPI
- WHEN uma resposta de analysis contem uma ChartSpecification do tipo table, kpi ou card
- THEN o Web renderiza a tabela ou o valor principal usando os campos declarados

#### Scenario: resposta circular ou especial
- WHEN uma resposta de analysis contem uma ChartSpecification do tipo pie, donut, scatter ou heatmap
- THEN o Web renderiza a visualizacao correspondente sem executar conteudo fornecido pelo modelo

### Requirement: Renderer nao deve consumir formato bruto ou campos arbitrarios
O componente MUST NOT executar codigo, injetar HTML ou renderizar campos de dados que nao estejam referenciados por xAxis, yAxis ou series.

#### Scenario: dado com campo extra
- WHEN uma linha de data possui uma propriedade que nao esta referenciada na specification
- THEN o campo extra nao e exibido pelo renderer

#### Scenario: valor nao numerico
- WHEN um valor usado como coordenada ou medida nao e um numero finito
- THEN o renderer omite o ponto ou apresenta estado vazio sem produzir geometria invalida

### Requirement: Copilot deve exibir o grafico validado
O Web MUST inserir o renderer na mensagem do Agent apenas quando response.content for uma resposta de analysis com chart validado.

#### Scenario: resposta sem chart
- WHEN a resposta do Agent e text, action ou analysis sem chart
- THEN a mensagem exibe o conteudo textual sem um renderer de chart
