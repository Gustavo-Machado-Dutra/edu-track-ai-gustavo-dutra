import { LlmHttpResponse, LlmTransport } from "./llm-provider-adapter";

/**
 * Transporte por defecto basado en el fetch nativo.
 * Se puede inyectar un mock en los tests.
 */
export class FetchLlmTransport implements LlmTransport {
  async post(
    url: string,
    headers: Record<string, string>,
    body: unknown,
    timeoutMs: number,
  ): Promise<LlmHttpResponse> {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });

    const text = await response.text();
    let parsedBody: unknown = null;
    if (text) {
      try {
        parsedBody = JSON.parse(text);
      } catch {
        parsedBody = text;
      }
    }

    return {
      status: response.status,
      body: parsedBody,
    };
  }
}
