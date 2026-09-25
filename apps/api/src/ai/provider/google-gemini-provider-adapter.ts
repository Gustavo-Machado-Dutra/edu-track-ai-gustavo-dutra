import { Injectable } from '@nestjs/common';
import {
  LlmMessage,
  LlmProviderAdapter,
  LlmRequest,
  LlmResult,
  LlmToolCall,
  LlmUsage,
} from './llm-provider-adapter';
import { loadLlmProviderConfig, LlmProviderConfig } from './llm-provider-config';
import { LlmProviderError } from './llm-provider-error';
import { FetchLlmTransport } from './fetch-llm-transport';

@Injectable()
export class GoogleGeminiProviderAdapter implements LlmProviderAdapter {
  private readonly transport = new FetchLlmTransport();
  private readonly config: LlmProviderConfig = loadLlmProviderConfig(
    (key: string) => process.env[key],
  );

  async complete(request: LlmRequest): Promise<LlmResult> {
    const { model, messages, tools, toolChoice, responseFormat } = request;

    let contents = this.convertMessagesToGeminiFormat(messages);

    if (responseFormat && !tools) {
      contents = [
        {
          role: 'user',
          parts: [
            {
              text:
                'Return ONLY a valid JSON object that matches this JSON schema exactly.\n' +
                'JSON schema:\n' +
                JSON.stringify(responseFormat.schema),
            },
          ],
        },
        ...contents,
      ];
    }

    const geminiTools = tools ? this.convertToolsToGeminiFormat(tools) : undefined;
    const toolConfig = toolChoice
      ? this.convertToolChoiceToGeminiConfig(toolChoice)
      : undefined;

    if (!this.config.apiKey) {
      throw new LlmProviderError('Missing GOOGLE_API_KEY', 'missing-api-key', false);
    }

    const url =
      this.config.baseUrl + '/' + model + ':generateContent?key=' + this.config.apiKey;

    const body = {
      contents,
      tools: geminiTools,
      toolConfig,
      generationConfig: {
        temperature: request.temperature ?? 0.7,
        maxOutputTokens: request.maxTokens ?? 8192,
        responseMimeType: !tools && responseFormat ? 'application/json' : undefined,
      },
    };

    let attempt = 0;
    const maxAttempts = 2;

    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        const response = await this.transport.post(
          url,
          { 'Content-Type': 'application/json' },
          body,
          this.config.timeoutMs,
        );

        if (response.status >= 400) {
          const errorBody = response.body as Record<string, unknown>;
          const errorMessage =
            ((errorBody?.error as Record<string, unknown> | undefined)?.message as
              | string
              | undefined) ??
            'Unknown error';

          if (response.status === 429 || response.status >= 500) {
            if (attempt < maxAttempts) {
              await this.sleep(1000 * attempt);
              continue;
            }
          }

          throw new LlmProviderError(
            'Gemini API error: ' + errorMessage,
            'http-error',
            true,
            response.status,
          );
        }

        return this.parseGeminiResponse(response.body, model);
      } catch (error) {
        const llmError =
          error instanceof LlmProviderError
            ? error
            : new LlmProviderError(
                (error as Error)?.message ?? 'unknown LLM error',
                'unknown',
                true,
              );

        if (!llmError.transient || attempt >= maxAttempts) {
          throw llmError;
        }

        await this.sleep(1000 * attempt);
      }
    }

    throw new LlmProviderError('LLM request failed after retries', 'unknown', true);
  }

  private convertMessagesToGeminiFormat(messages: LlmMessage[]): Array<{
    role: string;
    parts: Array<{
      text?: string;
      functionCall?: { name: string; args: Record<string, unknown> };
      functionResponse?: { name: string; response: Record<string, unknown> };
    }>;
  }> {
    const contents: Array<{
      role: string;
      parts: Array<{
        text?: string;
        functionCall?: { name: string; args: Record<string, unknown> };
        functionResponse?: { name: string; response: Record<string, unknown> };
      }>;
    }> = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        contents.push({
          role: 'user',
          parts: [{ text: 'System: ' + (msg.content ?? '') }],
        });
      } else if (msg.role === 'user') {
        contents.push({
          role: 'user',
          parts: [{ text: msg.content ?? '' }],
        });
      } else if (msg.role === 'assistant') {
        const parts: Array<{
          text?: string;
          functionCall?: { name: string; args: Record<string, unknown> };
        }> = [];

        if (msg.content) {
          parts.push({ text: msg.content });
        }

        if (msg.tool_calls?.length) {
          for (const tc of msg.tool_calls) {
            parts.push({
              functionCall: {
                name: tc.name,
                args: tc.arguments,
              },
            });
          }
        }

        if (parts.length > 0) {
          contents.push({
            role: 'model',
            parts,
          });
        }
      } else if (msg.role === 'tool') {
        contents.push({
          role: 'user',
          parts: [
            {
              functionResponse: {
                name: msg.name ?? 'unknown',
                response: { result: msg.content ?? '' },
              },
            },
          ],
        });
      }
    }

    return contents;
  }

  private sanitizeGeminiJsonSchema(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((v) => this.sanitizeGeminiJsonSchema(v));
    }

    if (value && typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>)
        .filter(([key]) => key !== 'additionalProperties')
        .map(([key, v]) => {
          if (key === 'type' && Array.isArray(v)) {
            const nonNull = (v as unknown[]).filter((t) => t !== 'null' && t !== null);
            const first = nonNull[0];
            return [key, typeof first === 'string' ? first : 'string'] as const;
          }

          return [key, this.sanitizeGeminiJsonSchema(v)] as const;
        });

      return Object.fromEntries(entries);
    }

    return value;
  }

  private convertToolsToGeminiFormat(tools: Array<{ type: 'function'; function: { name: string; description?: string; parameters: Record<string, unknown> } }>): Array<{ functionDeclarations: Array<{ name: string; description: string; parameters: Record<string, unknown> }> }> {
    return [
      {
        functionDeclarations: tools.map((tool) => ({
          name: tool.function.name,
          description: tool.function.description ?? '',
          parameters: this.sanitizeGeminiJsonSchema(tool.function.parameters) as Record<string, unknown>,
        })),
      },
    ];
  }

  private convertToolChoiceToGeminiConfig(
    toolChoice: string | 'auto' | 'none' | 'required',
  ): { functionCallingConfig: { mode: string; allowedFunctionNames?: string[] } } {
    switch (toolChoice) {
      case 'auto':
        return { functionCallingConfig: { mode: 'AUTO' } };
      case 'none':
        return { functionCallingConfig: { mode: 'NONE' } };
      case 'required':
        return { functionCallingConfig: { mode: 'ANY' } };
      default:
        return {
          functionCallingConfig: {
            mode: 'ANY',
            allowedFunctionNames: [toolChoice],
          },
        };
    }
  }

  private parseGeminiResponse(body: unknown, model: string): LlmResult {
    const response = body as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
            functionCall?: { name: string; args: Record<string, unknown> };
          }>;
        };
      }>;
      usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
      };
    };

    const candidate = response.candidates?.[0];
    if (!candidate?.content?.parts?.length) {
      throw new LlmProviderError('Empty response from Gemini', 'empty-response', true);
    }

    let content: string | null = null;
    const toolCalls: LlmToolCall[] = [];

    for (const part of candidate.content.parts) {
      if (part.text) {
        content = (content ?? '') + part.text;
      } else if (part.functionCall) {
        toolCalls.push({
          id: 'call_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9),
          name: part.functionCall.name,
          arguments: part.functionCall.args,
        });
      }
    }

    const usage: LlmUsage = {
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
    };

    return {
      content,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      model,
      usage:
        usage.inputTokens !== undefined || usage.outputTokens !== undefined
          ? usage
          : undefined,
      raw: body,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
