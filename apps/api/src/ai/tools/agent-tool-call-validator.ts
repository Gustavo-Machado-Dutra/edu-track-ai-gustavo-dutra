import { Injectable } from "@nestjs/common";
import Ajv, { ErrorObject, ValidateFunction } from "ajv";
import { AgentToolRegistry } from "./agent-tool-registry";

export interface ToolCallValidationResult {
  valid: boolean;
  toolName: string;
  errors?: ErrorObject[];
}

@Injectable()
export class AgentToolCallValidator {
  private readonly ajv: Ajv;
  private readonly compiled = new Map<string, ValidateFunction>();

  constructor(private readonly registry: AgentToolRegistry) {
    this.ajv = new Ajv({ strict: false, allErrors: true, verbose: true });
    this.compileSchemas();
  }

  private compileSchemas() {
    for (const definition of this.registry.list()) {
      const validate = this.ajv.compile(definition.inputSchema);
      this.compiled.set(definition.name, validate);
    }
  }

  validate(name: string, args: unknown): ToolCallValidationResult {
    const definition = this.registry.get(name);
    if (!definition) {
      return {
        valid: false,
        toolName: name,
        errors: [
          {
            keyword: "tool-not-found",
            message: `Tool "${name}" is not registered/authorized`,
            params: { toolName: name },
            instancePath: "",
            schemaPath: "",
          },
        ],
      };
    }

    const validate = this.compiled.get(name);
    if (!validate) {
      return {
        valid: false,
        toolName: name,
        errors: [
          {
            keyword: "tool-schema-not-compiled",
            message: `Input schema for tool "${name}" is not compiled`,
            params: { toolName: name },
            instancePath: "",
            schemaPath: "",
          },
        ],
      };
    }

    const valid = validate(args);
    return {
      valid: valid as boolean,
      toolName: name,
      errors: valid ? undefined : validate.errors || undefined,
    };
  }
}

