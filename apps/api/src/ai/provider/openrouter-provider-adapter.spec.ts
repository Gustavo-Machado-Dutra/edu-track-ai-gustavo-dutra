import { describe, it, expect, beforeEach } from "vitest";
import { OpenRouterProviderAdapter } from "./openrouter-provider-adapter";
import { LlmHttpResponse, LlmTransport } from "./llm-provider-adapter";
import { LlmProviderError } from "./llm-provider-error";

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

function makeConfig(overrides: Record<string, string> = {}) {
  const defaults: Record<string, string> = {
    LLM_PROVIDER: "openrouter",
    LLM_MODEL: "qwen/qwen3-coder:free",
    LLM_FALLBACK_MODEL: "openrouter/free",
    LLM_BASE_URL: "https://openrouter.ai/api/v1",
    LLM_TIMEOUT_MS: "30000",
    OPENROUTER_API_KEY: "test-key",
  };
  const merged = { ...defaults, ...overrides };
  return (key: string) => merged[key];
}

const okResponse: LlmHttpResponse = {
  status: 200,
  body: {
    choices: [{ message: { content: "Hola" } }],
    usage: { prompt_tokens: 10, completion_tokens: 5 },
  },
};

describe("OpenRouterProviderAdapter", () => {
  let transport: MockTransport;
  let adapter: OpenRouterProviderAdapter;

  beforeEach(() => {
    transport = new MockTransport();
    adapter = new OpenRouterProviderAdapter(makeConfig(), transport);
  });

  describe("request building", () => {
    it("uses base URL, bearer auth and messages", async () => {
      transport.responses.push(okResponse);
      const result = await adapter.complete({
        model: "qwen/qwen3-coder:free",
        messages: [{ role: "system", content: "you are a tutor" }, { role: "user", content: "hola" }],
      });

      expect(result.content).toBe("Hola");
      expect(result.model).toBe("qwen/qwen3-coder:free");
      const call = transport.calls[0] as Record<string, unknown>;
      const headers = call.headers as Record<string, string>;
      const body = call.body as Record<string, unknown>;
      expect(headers["Authorization"]).toBe("Bearer test-key");
      expect((call.url as string).endsWith("/chat/completions")).toBe(true);
      expect((body.messages as unknown[]).length).toBe(2);
    });

    it("builds tools + tool_choice auto", async () => {
      transport.responses.push(okResponse);
      await adapter.complete({
        model: "m",
        messages: [{ role: "user", content: "x" }],
        toolChoice: "auto",
        tools: [{
          type: "function",
          function: { name: "get_task", description: "d", parameters: { type: "object", properties: {} } },
        }],
      });
      const body = (transport.calls[0] as Record<string, unknown>).body as Record<string, unknown>;
      expect((body.tools as unknown[]).length).toBe(1);
      expect(body.tool_choice).toBe("auto");
    });

    it("builds response_format json_schema", async () => {
      transport.responses.push(okResponse);
      await adapter.complete({
        model: "m",
        messages: [{ role: "user", content: "x" }],
        responseFormat: { name: "agent_final_output", strict: true, schema: { type: "object" } },
      });
      const body = (transport.calls[0] as Record<string, unknown>).body as Record<string, unknown>;
      expect((body.response_format as Record<string, unknown>).type).toBe("json_schema");
    });

    it("parses tool_calls from the response", async () => {
      transport.responses.push({
        status: 200,
        body: {
          choices: [{ message: { content: null, tool_calls: [{ id: "call_1", function: { name: "get_task", arguments: "{\"taskId\":\"abc\"}" } }] } }],
        },
      });
      const result = await adapter.complete({ model: "m", messages: [{ role: "user", content: "x" }] });
      expect(result.toolCalls).toBeDefined();
      expect((result.toolCalls as unknown[])[0]).toMatchObject({ name: "get_task" });
    });

    it("exposes usage metadata", async () => {
      transport.responses.push(okResponse);
      const result = await adapter.complete({ model: "m", messages: [{ role: "user", content: "x" }] });
      expect(result.usage?.inputTokens).toBe(10);
      expect(result.usage?.outputTokens).toBe(5);
    });
  });

  describe("retry", () => {
    it("retries once on a transient error and succeeds", async () => {
      transport.responses.push(new Error("timeout"));
      transport.responses.push(okResponse);
      const result = await adapter.complete({ model: "m", messages: [] });
      expect(result.content).toBe("Hola");
      expect(transport.calls.length).toBe(2);
    });

    it("does not retry on 4xx authorization errors", async () => {
      transport.responses.push({ status: 401, body: { error: "unauthorized" } });
      await expect(adapter.complete({ model: "m", messages: [] })).rejects.toBeInstanceOf(LlmProviderError);
      expect(transport.calls.length).toBe(1);
    });
  });

  describe("fallback", () => {
    it("falls back to the configured model on persistent transient error", async () => {
      transport.responses.push(new Error("timeout"));
      transport.responses.push(new Error("timeout"));
      transport.responses.push(okResponse);
      const result = await adapter.complete({ model: "qwen/qwen3-coder:free", messages: [] });
      expect(result.content).toBe("Hola");
      const models = transport.calls.map((c) => (c.body as Record<string, unknown>).model);
      expect(models[0]).toBe("qwen/qwen3-coder:free");
      expect(models[1]).toBe("qwen/qwen3-coder:free"); // retry del principal
      expect(models[2]).toBe("openrouter/free"); // fallback
    });

    it("throws controlled error when fallback also fails", async () => {
      transport.responses.push(new Error("timeout"));
      transport.responses.push(new Error("timeout"));
      transport.responses.push(new Error("timeout"));
      transport.responses.push(new Error("timeout"));
      await expect(adapter.complete({ model: "m", messages: [] })).rejects.toBeInstanceOf(LlmProviderError);
    });
  });

  describe("config", () => {
    it("throws controlled error when API key is missing", async () => {
      const noKeyAdapter = new OpenRouterProviderAdapter(makeConfig({ OPENROUTER_API_KEY: "" }), transport);
      await expect(noKeyAdapter.complete({ model: "m", messages: [] })).rejects.toBeInstanceOf(LlmProviderError);
      expect(transport.calls.length).toBe(0);
    });
  });
});
