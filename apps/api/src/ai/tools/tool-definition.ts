/**
 * Definición de una Tool autorizada del Agent.
 * `inputSchema` es un JSON Schema de entrada; el Backend valida argumentos contra él.
 */
export type ToolRisk = "read" | "write";

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  risk: ToolRisk;
}
