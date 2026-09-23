/**
 * Contrato provider-agnostic para acceder a modelos de lenguaje.
 * El Agent nunca depende del SDK de un proveedor fuera de esta capa.
 */

/** Token de inyección NestJS para el adaptador LLM. */
export const LLM_PROVIDER_ADAPTER = Symbol("LLM_PROVIDER_ADAPTER");

export type LlmRole = "system" | "user" | "assistant" | "tool";

export interface LlmMessage {
  role: LlmRole;
  content: string | null;
  name?: string;
  tool_call_id?: string;
  tool_calls?: LlmToolCall[];
}

export interface LlmToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface LlmTool {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters: Record<string, unknown>;
  };
}

export interface StructuredOutputSpec {
  name: string;
  strict: boolean;
  schema: Record<string, unknown>;
}

export interface LlmRequest {
  model: string;
  messages: LlmMessage[];
  tools?: LlmTool[];
  toolChoice?: string | "auto" | "none" | "required";
  responseFormat?: StructuredOutputSpec;
  temperature?: number;
  maxTokens?: number;
}

export interface LlmUsage {
  inputTokens?: number;
  outputTokens?: number;
}

export interface LlmResult {
  content: string | null;
  toolCalls?: LlmToolCall[];
  model: string;
  usage?: LlmUsage;
  raw: unknown;
}

/**
 * Transporte HTTP inyectable para poder testear sin red real.
 */
export interface LlmTransport {
  post(
    url: string,
    headers: Record<string, string>,
    body: unknown,
    timeoutMs: number,
  ): Promise<LlmHttpResponse>;
}

export interface LlmHttpResponse {
  status: number;
  body: unknown;
}

export interface LlmProviderAdapter {
  complete(request: LlmRequest): Promise<LlmResult>;
}
