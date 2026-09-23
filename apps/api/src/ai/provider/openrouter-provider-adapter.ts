import { Injectable } from "@nestjs/common";
import {
  LlmMessage,
  LlmProviderAdapter,
  LlmRequest,
  LlmResult,
  LlmTransport,
  LlmToolCall,
  LlmUsage,
} from "./llm-provider-adapter";
import { loadLlmProviderConfig, LlmProviderConfig } from "./llm-provider-config";
import { LlmProviderError } from "./llm-provider-error";
import { FetchLlmTransport } from "./fetch-llm-transport";

/**
 * Adaptador OpenRouter sobre la API OpenAI-compatible Chat Completions.
 * Implementa timeout + un único retry transitorio + fallback de modelo.
 */
@Injectable()
export class OpenRouterProviderAdapter implements LlmProviderAdapter {
  private readonly config: LlmProviderConfig;
  private readonly transport: LlmTransport;

  constructor(
    getConfig?: (key: string) => string | undefined,
    transport?: LlmTransport,
  ) {
    this.config = loadLlmProviderConfig(getConfig ?? (() => undefined));
    this.transport = transport ?? new FetchLlmTransport();
  }

  async complete(request: LlmRequest): Promise<LlmResult> {
    const apiKey = this.config.apiKey;
    if (!apiKey || apiKey.length === 0) {
      throw new LlmProviderError(
        "LLM API key is not configured",
        "missing-api-key",
        false,
      );
    }

    const models = [request.model, this.config.fallbackModel].filter(
      (model): model is string => Boolean(model && model.length > 0),
    );

    if (models.length === 0) {
      throw new LlmProviderError(
        "No LLM model configured",
        "missing-model",
        false,
      );
    }

    for (const model of models) {
      const result = await this.attemptWithRetry(model, request, apiKey);
      if (result) {
        return result;
      }
    }

    throw new LlmProviderError(
      "LLM request failed after retries and fallback",
      "llm-unavailable",
      true,
    );
  }

  private async attemptWithRetry(
    model: string,
    request: LlmRequest,
    apiKey: string,
  ): Promise<LlmResult | null> {
    for (let attempt = 1; attempt <= 2; attempt++) {
      const isLastAttempt = attempt === 2;
      try {
        return await this.sendOnce(model, request, apiKey);
      } catch (error) {
        const llmError = error instanceof LlmProviderError ? error : new LlmProviderError(
          (error as Error)?.message ?? "unknown LLM error",
          "unknown",
          true,
        );
        // Nada que retry/fallback puedan corregir (autorización o 4xx de implementación).
        if (!llmError.transient) {
          throw llmError;
        }
        if (isLastAttempt) {
          // Intentar con el siguiente modelo (fallback) o terminar en error controlado.
          continue;
        }
      }
    }
    return null;
  }

  private async sendOnce(
    model: string,
    request: LlmRequest,
    apiKey: string,
  ): Promise<LlmResult> {
    const messages: LlmMessage[] = request.messages;

    const body: Record<string, unknown> = {
      model,
      messages,
    };

    if (request.tools && request.tools.length > 0) {
      body["tools"] = request.tools;
      body["tool_choice"] = request.toolChoice ?? "auto";
    }

    if (request.responseFormat) {
      body["response_format"] = {
        type: "json_schema",
        json_schema: {
          name: request.responseFormat.name,
          strict: request.responseFormat.strict,
          schema: request.responseFormat.schema,
        },
      };
    }

    if (request.temperature !== undefined) {
      body["temperature"] = request.temperature;
    }
    if (request.maxTokens !== undefined) {
      body["max_tokens"] = request.maxTokens;
    }

    const url = `${this.config.baseUrl}/chat/completions`;
    const response = await this.transport.post(url, {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-Title": "EduTrack AI",
    }, body, this.config.timeoutMs);

    if (response.status < 200 || response.status >= 300) {
      throw new LlmProviderError(
        `LLM request failed with status ${response.status}`,
        "http-error",
        this.isTransientStatus(response.status),
        response.status,
      );
    }

    return this.parseResponse(response.body, model);
  }

  private isTransientStatus(status: number): boolean {
    return status === 408 || status === 429 || status >= 500;
  }

  private parseResponse(raw: unknown, model: string): LlmResult {
    const root = raw as {
      choices?: Array<{
        message?: {
          content?: string | null;
          tool_calls?: Array<{
            id?: string;
            type?: string;
            function?: { name?: string; arguments?: string };
          }>;
        };
      }>;
      usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
      };
    };

    const choice = root?.choices?.[0];
    const message = choice?.message;
    const content = message?.content ?? null;

    const toolCalls: LlmToolCall[] = [];
    if (message?.tool_calls) {
      for (const call of message.tool_calls) {
        let parsedArguments: Record<string, unknown> = {};
        if (call.function?.arguments) {
          try {
            parsedArguments = JSON.parse(call.function.arguments) as Record<string, unknown>;
          } catch {
            parsedArguments = {};
          }
        }
        toolCalls.push({
          id: call.id ?? "",
          name: call.function?.name ?? "unknown",
          arguments: parsedArguments,
        });
      }
    }

    const usage: LlmUsage = {
      inputTokens: root?.usage?.prompt_tokens,
      outputTokens: root?.usage?.completion_tokens,
    };

    return {
      content,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      model,
      usage: usage.inputTokens !== undefined || usage.outputTokens !== undefined ? usage : undefined,
      raw,
    };
  }
}
