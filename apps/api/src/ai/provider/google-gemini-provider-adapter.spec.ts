import { describe, it, expect, beforeEach } from 'vitest';
import { GoogleGeminiProviderAdapter } from './google-gemini-provider-adapter';
import { LlmHttpResponse, LlmTransport } from './llm-provider-adapter';
import { LlmProviderError } from './llm-provider-error';

class MockTransport implements LlmTransport {
  responses: Array<LlmHttpResponse | Error> = [];
  calls: Array<Record<string, unknown>> = [];

  async post(url: string, headers: Record<string, string>, body: unknown, timeoutMs: number): Promise<LlmHttpResponse> {
    const next = this.responses.shift();
    this.calls.push({ url, headers, body, timeoutMs });
    if (next instanceof Error) {
      throw next;
    }
    return next as LlmHttpResponse;
  }
}

const okResponse: LlmHttpResponse = {
  status: 200,
  body: {
    candidates: [{ content: { parts: [{ text: 'Hola Gemini' }] } }],
    usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 },
  },
};

const okResponseWithFunctionCall: LlmHttpResponse = {
  status: 200,
  body: {
    candidates: [{
      content: {
        parts: [{
          functionCall: { name: 'get_weather', args: { location: 'Madrid' } }
        }]
      }
    }],
    usageMetadata: { promptTokenCount: 15, candidatesTokenCount: 8 },
  },
};

describe('GoogleGeminiProviderAdapter', () => {
  let transport: MockTransport;
  let adapter: GoogleGeminiProviderAdapter;

  beforeEach(() => {
    transport = new MockTransport();
    process.env.LLM_PROVIDER = 'google-gemini';
    process.env.GOOGLE_API_KEY = 'test-google-api-key';
    adapter = new GoogleGeminiProviderAdapter();
    (adapter as unknown as { transport: MockTransport }).transport = transport;
  });

  describe('request building', () => {
    it('uses base URL, query param API key and messages', async () => {
      transport.responses.push(okResponse);
      const result = await adapter.complete({
        model: 'gemini-1.5-flash',
        messages: [{ role: 'user', content: 'test' }],
      });

      expect(result.content).toBe('Hola Gemini');
      const call = transport.calls[0];
      expect(call?.url).toContain('generateContent');
      expect(call?.url).toContain('key=');
      expect(call?.body).toHaveProperty('contents');
    });

    it('handles tool choice: none', async () => {
      transport.responses.push(okResponse);
      await adapter.complete({
        model: 'gemini-1.5-flash',
        messages: [{ role: 'user', content: 'test' }],
        toolChoice: 'none',
      });
      const body = transport.calls[0]?.body as { toolConfig?: unknown } | undefined;
      expect(body?.toolConfig).toEqual({
        functionCallingConfig: { mode: 'NONE' },
      });
    });

    it('handles tool choice: required', async () => {
      transport.responses.push(okResponse);
      await adapter.complete({
        model: 'gemini-1.5-flash',
        messages: [{ role: 'user', content: 'test' }],
        toolChoice: 'required',
      });
      const body = transport.calls[0]?.body as { toolConfig?: unknown } | undefined;
      expect(body?.toolConfig).toEqual({
        functionCallingConfig: { mode: 'ANY' },
      });
    });

    it('handles tool choice: specific tool', async () => {
      transport.responses.push(okResponse);
      await adapter.complete({
        model: 'gemini-1.5-flash',
        messages: [{ role: 'user', content: 'test' }],
        toolChoice: 'get_weather',
      });
      const body = transport.calls[0]?.body as { toolConfig?: unknown } | undefined;
      expect(body?.toolConfig).toEqual({
        functionCallingConfig: { mode: 'ANY', allowedFunctionNames: ['get_weather'] },
      });
    });
  });

  describe('response parsing', () => {
    it('parses text response correctly', async () => {
      transport.responses.push(okResponse);
      const result = await adapter.complete({
        model: 'gemini-1.5-flash',
        messages: [{ role: 'user', content: 'test' }],
      });

      expect(result.content).toBe('Hola Gemini');
      expect(result.model).toBe('gemini-1.5-flash');
      expect(result.usage?.inputTokens).toBe(10);
      expect(result.usage?.outputTokens).toBe(5);
      expect(result.toolCalls).toBeUndefined();
    });

    it('parses function call response correctly', async () => {
      transport.responses.push(okResponseWithFunctionCall);
      const result = await adapter.complete({
        model: 'gemini-1.5-flash',
        messages: [{ role: 'user', content: 'weather in Madrid' }],
      });

      expect(result.toolCalls).toBeDefined();
      expect(result.toolCalls?.length).toBe(1);
      expect(result.toolCalls?.[0]?.name).toBe('get_weather');
      expect(result.toolCalls?.[0]?.arguments).toEqual({ location: 'Madrid' });
    });

    it('throws on empty response', async () => {
      const emptyResponse: LlmHttpResponse = {
        status: 200,
        body: { candidates: [{ content: { parts: [] } }] },
      };
      transport.responses.push(emptyResponse);

      await expect(adapter.complete({
        model: 'gemini-1.5-flash',
        messages: [{ role: 'user', content: 'test' }],
      })).rejects.toThrow(LlmProviderError);
    });
  });

  describe('error handling', () => {
    it('throws on 401 unauthorized', async () => {
      transport.responses.push({ status: 401, body: { error: 'unauthorized' } });

      await expect(adapter.complete({
        model: 'gemini-1.5-flash',
        messages: [{ role: 'user', content: 'test' }],
      })).rejects.toThrow(LlmProviderError);
    });

    it('retries on 500 then throws', async () => {
      transport.responses.push({ status: 500, body: { error: 'internal error' } });
      transport.responses.push({ status: 500, body: { error: 'internal error' } });

      await expect(adapter.complete({
        model: 'gemini-1.5-flash',
        messages: [{ role: 'user', content: 'test' }],
      })).rejects.toThrow(LlmProviderError);
    });

    it('retries on 429 then succeeds', async () => {
      transport.responses.push({ status: 429, body: { error: 'rate limited' } });
      transport.responses.push(okResponse);

      const result = await adapter.complete({
        model: 'gemini-1.5-flash',
        messages: [{ role: 'user', content: 'test' }],
      });

      expect(result.content).toBe('Hola Gemini');
      expect(transport.calls.length).toBe(2);
    });
  });
});
