import { describe, it, expect, beforeEach, vi } from "vitest";
import { AgentService } from "./agent.service";
import { StructuredOutputValidationService } from "./structured-output-validation.service";

describe("AgentService", () => {
  let service: AgentService;
  let validationService: StructuredOutputValidationService;

  beforeEach(() => {
    validationService = new StructuredOutputValidationService();
    const serviceWithInit = validationService as StructuredOutputValidationService & { onModuleInit(): void };
    serviceWithInit.onModuleInit();
    service = new AgentService(validationService);
  });

  describe("processProviderResponse - valid structured responses", () => {
    it("should process valid AgentTextResponse", async () => {
      const rawResponse = JSON.stringify({
        type: "text",
        content: "Ol�! Como posso ajudar?",
        metadata: { agentExecutionId: "exec-123" },
      });

      const result = await service.processProviderResponse(rawResponse);

      expect(result.type).toBe("text");
      expect((result.content as Record<string, unknown>).type).toBe("text");
      expect((result.content as Record<string, unknown>).content).toBe("Ol�! Como posso ajudar?");
    });

    it("should process valid AgentAnalysisResponse without chart", async () => {
      const rawResponse = JSON.stringify({
        type: "analysis",
        analysis: "Seu tempo de estudo aumentou 20% esta semana.",
        metrics: { totalHours: 15, avgDaily: 2.1 },
        metadata: { agentExecutionId: "exec-456" },
      });

      const result = await service.processProviderResponse(rawResponse);

      expect(result.type).toBe("analysis");
      expect((result.content as Record<string, unknown>).type).toBe("analysis");
      expect((result.content as Record<string, unknown>).analysis).toBe("Seu tempo de estudo aumentou 20% esta semana.");
    });

    it("should process valid AgentAnalysisResponse with chart", async () => {
      const rawResponse = JSON.stringify({
        type: "analysis",
        analysis: "Evolu��o do tempo de estudo",
        metrics: { totalHours: 15 },
        chart: {
          type: "line",
          title: "Tempo de estudo por dia",
          xAxis: { field: "date", label: "Data" },
          yAxis: { field: "hours", label: "Horas" },
          series: [{ field: "hours", label: "Horas estudadas" }],
          data: [{ date: "2024-01-01", hours: 2 }],
          source: { tool: "get_study_metrics" },
          datasetVersion: "v1.0.0",
        },
      });

      const result = await service.processProviderResponse(rawResponse);

      expect(result.type).toBe("analysis");
      expect((result.content as Record<string, unknown>).chart).toBeDefined();
      expect(((result.content as Record<string, unknown>).chart as Record<string, unknown>).type).toBe("line");
    });

    it("should process valid AgentActionResponse", async () => {
      const rawResponse = JSON.stringify({
        type: "action",
        action: "create_task",
        result: { taskId: "abc-123", title: "Nova tarefa" },
        metadata: { agentExecutionId: "exec-789" },
      });

      const result = await service.processProviderResponse(rawResponse);

      expect(result.type).toBe("action");
      expect((result.content as Record<string, unknown>).action).toBe("create_task");
      expect(((result.content as Record<string, unknown>).result as Record<string, unknown>).taskId).toBe("abc-123");
    });
  });

  describe("processProviderResponse - validation failures", () => {
    it("should throw BadRequestException for invalid ChartSpecification (missing required field)", async () => {
      const rawResponse = JSON.stringify({
        type: "analysis",
        analysis: "Test",
        metrics: {},
        chart: {
          type: "line",
          title: "Test",
        },
      });

      await expect(service.processProviderResponse(rawResponse)).rejects.toThrow("AI output failed contract validation");
    });

    it("should throw BadRequestException for invalid chart type", async () => {
      const rawResponse = JSON.stringify({
        type: "analysis",
        analysis: "Test",
        metrics: {},
        chart: {
          type: "radar",
          title: "Test",
          xAxis: { field: "x", label: "X" },
          yAxis: { field: "y", label: "Y" },
          series: [{ field: "y", label: "Y" }],
          data: [{ x: 1, y: 2 }],
          source: { tool: "get_study_metrics" },
          datasetVersion: "v1.0.0",
        },
      });

      await expect(service.processProviderResponse(rawResponse)).rejects.toThrow("AI output failed contract validation");
    });

    it("should throw BadRequestException for invalid action type", async () => {
      const rawResponse = JSON.stringify({
        type: "action",
        action: "delete_user",
        result: {},
      });

      await expect(service.processProviderResponse(rawResponse)).rejects.toThrow("AI output failed contract validation");
    });
  });

  describe("processProviderResponse - fallback to text", () => {
    it("should fallback to text for non-JSON input", async () => {
      const rawResponse = "Esta � uma resposta textual simples sem JSON";

      const result = await service.processProviderResponse(rawResponse);

      expect(result.type).toBe("text");
      expect(result.content).toBe("Esta � uma resposta textual simples sem JSON");
    });

    it("should fallback to text for malformed JSON", async () => {
      const rawResponse = "{ invalid json }";

      const result = await service.processProviderResponse(rawResponse);

      expect(result.type).toBe("text");
      expect(result.content).toBe("{ invalid json }");
    });

    it("should fallback to text for unknown response type", async () => {
      const rawResponse = JSON.stringify({
        type: "unknown_type",
        someField: "value",
      });

      const result = await service.processProviderResponse(rawResponse);

      expect(result.type).toBe("text");
      expect(typeof result.content === "string" && result.content.includes("unknown_type")).toBe(true);
    });

    it("should fallback to text for empty object", async () => {
      const rawResponse = JSON.stringify({});

      const result = await service.processProviderResponse(rawResponse);

      expect(result.type).toBe("text");
    });
  });

  describe("processProviderResponse - schema not found", () => {
    it("should throw InternalServerErrorException when schema is not found", async () => {
      const emptyValidationService = {
        validate: vi.fn().mockReturnValue({
          valid: false,
          errors: [{ keyword: "schema-not-found", message: "Schema not found", params: {}, instancePath: "", schemaPath: "" }],
        }),
      };

      const testService = new AgentService(emptyValidationService as unknown as StructuredOutputValidationService);

      const rawResponse = JSON.stringify({
        type: "text",
        content: "test",
      });

      await expect(testService.processProviderResponse(rawResponse)).rejects.toThrow("AI Configuration Error");
    });
  });

  describe("processProviderResponse - object input (not string)", () => {
    it("should process object input directly", async () => {
      const rawResponse = {
        type: "text",
        content: "Resposta direta como objeto",
      };

      const result = await service.processProviderResponse(rawResponse);

      expect(result.type).toBe("text");
      expect((result.content as Record<string, unknown>).content).toBe("Resposta direta como objeto");
    });
  });

  describe('expected structured response type', () => {
    it('rejects unstructured text when analysis is required', async () => {
      await expect(
        service.processProviderResponse('plain text', 'analysis'),
      ).rejects.toThrow('structured analysis response');
    });

    it('rejects a structured response with the wrong expected type', async () => {
      await expect(
        service.processProviderResponse(
          JSON.stringify({ type: 'text', content: 'Hello' }),
          'analysis',
        ),
      ).rejects.toThrow('does not match the expected analysis response');
    });
  });

});
