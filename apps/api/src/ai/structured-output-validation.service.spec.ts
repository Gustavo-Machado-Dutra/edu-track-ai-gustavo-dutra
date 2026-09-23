import { describe, it, expect, beforeEach } from "vitest";
import { StructuredOutputValidationService } from "./structured-output-validation.service";

describe("StructuredOutputValidationService", () => {
  let service: StructuredOutputValidationService;

  beforeEach(() => {
    service = new StructuredOutputValidationService();
    const serviceWithInit = service as StructuredOutputValidationService & { onModuleInit(): void };
    serviceWithInit.onModuleInit();
  });

  describe("ChartSpecification validation", () => {
    it("should validate a complete valid ChartSpecification", () => {
      const validChartSpec = {
        type: "line",
        title: "Tempo de estudo por dia",
        description: "Evolucao do tempo estudado no periodo selecionado",
        xAxis: { field: "date", label: "Data" },
        yAxis: { field: "studyTime", label: "Tempo estudado" },
        series: [{ field: "studyTime", label: "Tempo estudado" }],
        data: [{ date: "2024-01-01", studyTime: 120 }],
        source: { tool: "get_study_metrics" },
        datasetVersion: "v1.0.0",
      };
      const result = service.validate("v1_chart-specification", validChartSpec);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it("should reject ChartSpecification with missing required fields", () => {
      const invalidChartSpec = {
        type: "line",
        title: "Tempo de estudo por dia",
      };
      const result = service.validate("v1_chart-specification", invalidChartSpec);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it("should reject ChartSpecification with invalid type enum", () => {
      const invalidChartSpec = {
        type: "invalid_type",
        title: "Teste",
        xAxis: { field: "date", label: "Data" },
        yAxis: { field: "studyTime", label: "Tempo estudado" },
        series: [{ field: "studyTime", label: "Tempo estudado" }],
        data: [{ date: "2024-01-01", studyTime: 120 }],
        source: { tool: "get_study_metrics" },
        datasetVersion: "v1.0.0",
      };
      const result = service.validate("v1_chart-specification", invalidChartSpec);
      expect(result.valid).toBe(false);
    });

    it("should reject ChartSpecification with invalid source tool", () => {
      const invalidChartSpec = {
        type: "line",
        title: "Teste",
        xAxis: { field: "date", label: "Data" },
        yAxis: { field: "studyTime", label: "Tempo estudado" },
        series: [{ field: "studyTime", label: "Tempo estudado" }],
        data: [{ date: "2024-01-01", studyTime: 120 }],
        source: { tool: "invalid_tool" },
        datasetVersion: "v1.0.0",
      };
      const result = service.validate("v1_chart-specification", invalidChartSpec);
      expect(result.valid).toBe(false);
    });

    it("should validate ChartSpecification with optional filters", () => {
      const validChartSpec = {
        type: "bar",
        title: "Tarefas por status",
        xAxis: { field: "status", label: "Status" },
        yAxis: { field: "count", label: "Quantidade" },
        series: [{ field: "count", label: "Quantidade" }],
        data: [{ status: "completed", count: 10 }],
        source: { tool: "get_task_metrics" },
        datasetVersion: "v1.0.0",
        filters: [{ field: "subject", value: "Math" }],
      };
      const result = service.validate("v1_chart-specification", validChartSpec);
      expect(result.valid).toBe(true);
    });
  });

  describe("AgentTextResponse validation", () => {
    it("should validate valid AgentTextResponse", () => {
      const validResponse = {
        type: "text",
        content: "Resposta textual do Agent",
        metadata: { agentExecutionId: "exec-123" },
      };
      const result = service.validate("v1_agent-text-response", validResponse);
      expect(result.valid).toBe(true);
    });

    it("should reject AgentTextResponse with invalid type", () => {
      const invalidResponse = {
        type: "analysis",
        content: "Resposta textual",
      };
      const result = service.validate("v1_agent-text-response", invalidResponse);
      expect(result.valid).toBe(false);
    });

    it("should reject AgentTextResponse missing content", () => {
      const invalidResponse = {
        type: "text",
      };
      const result = service.validate("v1_agent-text-response", invalidResponse);
      expect(result.valid).toBe(false);
    });
  });

  describe("AgentAnalysisResponse validation", () => {
    it("should validate valid AgentAnalysisResponse with chart", () => {
      const validResponse = {
        type: "analysis",
        analysis: "Analise do desempenho do aluno",
        metrics: { avgScore: 85, totalTasks: 20 },
        chart: {
          type: "line",
          title: "Evolucao das notas",
          xAxis: { field: "date", label: "Data" },
          yAxis: { field: "score", label: "Nota" },
          series: [{ field: "score", label: "Nota" }],
          data: [{ date: "2024-01-01", score: 85 }],
          source: { tool: "get_study_metrics" },
          datasetVersion: "v1.0.0",
        },
        metadata: { agentExecutionId: "exec-789" },
      };
      const result = service.validate("v1_agent-analysis-response", validResponse);
      expect(result.valid).toBe(true);
    });

    it("should validate AgentAnalysisResponse without chart", () => {
      const validResponse = {
        type: "analysis",
        analysis: "Analise sem grafico",
        metrics: { avgScore: 85 },
      };
      const result = service.validate("v1_agent-analysis-response", validResponse);
      expect(result.valid).toBe(true);
    });

    it("should reject AgentAnalysisResponse with invalid chart reference", () => {
      const invalidResponse = {
        type: "analysis",
        analysis: "Analise com grafico invalido",
        metrics: { avgScore: 85 },
        chart: {
          type: "invalid_chart_type",
          title: "Teste",
          xAxis: { field: "date", label: "Data" },
          yAxis: { field: "score", label: "Nota" },
          series: [{ field: "score", label: "Nota" }],
          data: [{ date: "2024-01-01", score: 85 }],
          source: { tool: "get_study_metrics" },
          datasetVersion: "v1.0.0",
        },
      };
      const result = service.validate("v1_agent-analysis-response", invalidResponse);
      expect(result.valid).toBe(false);
    });
  });

  describe("AgentActionResponse validation", () => {
    it("should validate valid AgentActionResponse", () => {
      const validResponse = {
        type: "action",
        action: "create_task",
        result: { taskId: "abc-123", title: "Nova tarefa" },
        metadata: { agentExecutionId: "exec-456" },
      };
      const result = service.validate("v1_agent-action-response", validResponse);
      expect(result.valid).toBe(true);
    });

    it("should reject AgentActionResponse with invalid action", () => {
      const invalidResponse = {
        action: "delete_user",
        result: {},
      };
      const result = service.validate("v1_agent-action-response", invalidResponse);
      expect(result.valid).toBe(false);
    });

    it("should reject AgentActionResponse missing required fields", () => {
      const invalidResponse = {
        type: "action",
        action: "create_task",
      };
      const result = service.validate("v1_agent-action-response", invalidResponse);
      expect(result.valid).toBe(false);
    });
  });

  describe("getAvailableSchemas", () => {
    it("should return list of loaded schemas", () => {
      const schemas = service.getAvailableSchemas();
      expect(schemas).toContain("v1_chart-specification");
      expect(schemas).toContain("v1_agent-text-response");
      expect(schemas).toContain("v1_agent-analysis-response");
      expect(schemas).toContain("v1_agent-action-response");
    });
  });

  describe("unknown schema", () => {
    it("should return error for unknown schema", () => {
      const result = service.validate("non-existent-schema", {});
      expect(result.errors).toBeDefined();
      expect(result.errors).not.toBeNull();
      const errors = result.errors ?? [];
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]!.keyword).toBe("schema-not-found");
    });
  });
});

