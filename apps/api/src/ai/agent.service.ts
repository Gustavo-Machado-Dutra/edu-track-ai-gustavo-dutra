import { Injectable, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { StructuredOutputValidationService } from "./structured-output-validation.service";

export type AgentResponseType = 'text' | 'analysis' | 'action';

export interface ProcessedAIResponse {
  type: AgentResponseType;
  content: unknown;
  raw: unknown;
}

@Injectable()
export class AgentService {
  constructor(private readonly validationService: StructuredOutputValidationService) {}

  async processProviderResponse(
    rawResponse: unknown,
    expectedType?: AgentResponseType,
  ): Promise<ProcessedAIResponse> {
    let data: unknown;
    try {
      data = typeof rawResponse === "string" ? JSON.parse(rawResponse) : rawResponse;
    } catch {
      if (expectedType) {
        throw new BadRequestException('AI output must be a structured ' + expectedType + ' response');
      }
      return {
        type: "text",
        content: typeof rawResponse === "string" ? rawResponse : JSON.stringify(rawResponse),
        raw: rawResponse,
      };
    }
    const type = (data as Record<string, unknown>)?.type as string | undefined;
    let schemaName = "";
    switch (type) {
      case "text":
        schemaName = "v1_agent-text-response";
        break;
      case "analysis":
        schemaName = "v1_agent-analysis-response";
        break;
      case "action":
        schemaName = "v1_agent-action-response";
        break;
      default:
        if (expectedType) {
          throw new BadRequestException('AI output must be a structured ' + expectedType + ' response');
        }
        return {
          type: "text",
          content: typeof data === "string" ? data : JSON.stringify(data),
          raw: rawResponse,
        };
    }
    if (expectedType && type !== expectedType) {
      throw new BadRequestException('AI output type does not match the expected ' + expectedType + ' response');
    }

    const result = this.validationService.validate(schemaName, data);
    if (!result.valid) {
      const isConfigError = result.errors?.some((e) => e.keyword === "schema-not-found");
      if (isConfigError) {
        throw new InternalServerErrorException(`AI Configuration Error: ${schemaName} not found`);
      }
      throw new BadRequestException({
        message: "AI output failed contract validation",
        errors: result.errors,
      });
    }
    return {
      type: type as AgentResponseType,
      content: data,
      raw: rawResponse,
    };
  }
}
