/**
 * Configuración de runtime del LLM (la chave de API no se versiona).
 * - LLM_PROVIDER=openrouter
 * - LLM_MODEL=qwen/qwen3-coder:free
 * - LLM_FALLBACK_MODEL=openrouter/free
 * - LLM_BASE_URL=https://openrouter.ai/api/v1
 * - LLM_TIMEOUT_MS=30000
 * - OPENROUTER_API_KEY=<secret>
 */

export interface LlmProviderConfig {
  provider: string;
  model: string;
  fallbackModel?: string;
  baseUrl: string;
  timeoutMs: number;
  apiKey?: string;
}

const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "qwen/qwen3-coder:free";
const DEFAULT_FALLBACK_MODEL = "openrouter/free";
const DEFAULT_TIMEOUT_MS = 30000;

export function loadLlmProviderConfig(get: (key: string) => string | undefined): LlmProviderConfig {
  const provider = get("LLM_PROVIDER") ?? "openrouter";
  const fallbackModel = get("LLM_FALLBACK_MODEL") ?? DEFAULT_FALLBACK_MODEL;

  return {
    provider,
    model: get("LLM_MODEL") ?? DEFAULT_MODEL,
    fallbackModel: fallbackModel.length > 0 ? fallbackModel : undefined,
    baseUrl: (get("LLM_BASE_URL") ?? DEFAULT_BASE_URL).replace(/\/+$/, ""),
    timeoutMs: Number(get("LLM_TIMEOUT_MS") ?? DEFAULT_TIMEOUT_MS),
    apiKey: get("OPENROUTER_API_KEY"),
  };
}
