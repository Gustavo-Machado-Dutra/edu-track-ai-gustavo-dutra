/**
 * Configuración de runtime del LLM (la clave de API no se versiona).
 * - LLM_PROVIDER=openrouter | google-gemini
 * - LLM_MODEL=<modelo>
 * - LLM_FALLBACK_MODEL=openrouter/free
 * - LLM_BASE_URL=<opcional>
 * - LLM_TIMEOUT_MS=30000
 * - OPENROUTER_API_KEY=<secret> (proveedor openrouter)
 * - GOOGLE_API_KEY=<secret> (proveedor google-gemini)
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
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "qwen/qwen3-coder:free";
const DEFAULT_FALLBACK_MODEL = "openrouter/free";
const DEFAULT_TIMEOUT_MS = 30000;

export function loadLlmProviderConfig(get: (key: string) => string | undefined): LlmProviderConfig {
  const provider = get("LLM_PROVIDER") ?? "openrouter";
  const isGemini = provider === "google-gemini";
  const fallbackModel = get("LLM_FALLBACK_MODEL") ?? DEFAULT_FALLBACK_MODEL;
  const defaultBaseUrl = isGemini ? GEMINI_BASE_URL : DEFAULT_BASE_URL;

  return {
    provider,
    model: get("LLM_MODEL") ?? DEFAULT_MODEL,
    fallbackModel: fallbackModel.length > 0 ? fallbackModel : undefined,
    baseUrl: (get("LLM_BASE_URL") ?? defaultBaseUrl).replace(/\/+$/, ""),
    timeoutMs: Number(get("LLM_TIMEOUT_MS") ?? DEFAULT_TIMEOUT_MS),
    apiKey: get(isGemini ? "GOOGLE_API_KEY" : "OPENROUTER_API_KEY"),
  };
}