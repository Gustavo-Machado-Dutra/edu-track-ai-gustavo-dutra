/**
 * Tipos TypeScript derivados do JSON Schema v1_chart-specification.json
 * Fonte de verdade: apps/api/src/ai/schemas/v1_chart-specification.json
 * Não edite manualmente - sincronize com o schema JSON quando houver mudanças.
 */

export type ChartType =
  | "kpi"
  | "card"
  | "table"
  | "line"
  | "bar"
  | "area"
  | "donut"
  | "pie"
  | "scatter"
  | "comparison"
  | "heatmap";

export interface AxisConfig {
  field: string;
  label: string;
}

export interface SeriesConfig {
  field: string;
  label: string;
}

export interface ChartSource {
  tool: "get_dashboard_data" | "get_task_metrics" | "get_study_metrics";
}

export interface ChartSpecification {
  type: ChartType;
  title: string;
  description?: string;
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  series: SeriesConfig[];
  data: Record<string, unknown>[];
  filters?: Record<string, unknown>[];
  source: ChartSource;
  datasetVersion: string;
}
