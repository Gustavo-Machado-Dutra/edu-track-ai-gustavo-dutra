# Design

Adicionar um componente React unico para renderizar ChartSpecification usando SVG e HTML nativos. O componente usa somente type, title, description, xAxis, yAxis, series, data, source e datasetVersion.

- KPI/card: valor principal da primeira serie.
- table: tabela com eixo X, eixo Y e series declaradas.
- line/area/bar/comparison/scatter/heatmap: SVG acessivel, com escalas derivadas dos dados declarados.
- pie/donut: SVG circular e legenda derivada da serie declarada.

Valores que nao possuem tipo primitivo ou numero finito nao sao usados para geometria. Nenhum HTML ou SVG recebido do modelo e injetado; todos os valores sao renderizados como texto ou atributos calculados pelo componente.
