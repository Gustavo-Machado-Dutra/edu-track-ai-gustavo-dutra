/**
 * Tipos TypeScript derivados dos JSON Schemas de resposta do Agent
 * Fonte de verdade: apps/api/src/ai/schemas/v1_agent-*.json
 * Não edite manualmente - sincronize com os schemas JSON quando houver mudanças.
 */

import { ChartSpecification } from "./chart-specification";

export interface AgentTextResponse {
  type: "text";
  content: string;
  metadata?: Record<string, unknown>;
}

export interface AgentAnalysisResponse {
  type: "analysis";
  analysis: string;
  metrics: Record<string, unknown>;
  chart?: ChartSpecification;
  metadata?: Record<string, unknown>;
}

export type AgentActionType = "create_task" | "update_task" | "complete_task" | "create_subject";

export interface AgentActionResponse {
  type: "action";
  action: AgentActionType;
  result: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export type AgentStructuredResponse = AgentTextResponse | AgentAnalysisResponse | AgentActionResponse;
