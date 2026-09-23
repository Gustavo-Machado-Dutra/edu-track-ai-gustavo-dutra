import { Injectable, OnModuleInit } from "@nestjs/common";
import Ajv, { ValidateFunction, ErrorObject } from "ajv";
import * as fs from "fs";
import * as path from "path";

export interface ValidationResult {
  valid: boolean;
  errors?: ErrorObject[];
}

@Injectable()
export class StructuredOutputValidationService implements OnModuleInit {
  private readonly ajv: Ajv;
  private readonly validators: Map<string, ValidateFunction> = new Map();
  private readonly schemas: Map<string, Record<string, unknown>> = new Map();

  constructor() {
    this.ajv = new Ajv({
      strict: false,
      allErrors: true,
      verbose: true,
    });
  }

  onModuleInit() {
    this.loadSchemas();
  }

  private loadSchemas() {
    this.validators.clear();
    this.schemas.clear();
    const schemasDir = path.join(process.cwd(), "src", "ai", "schemas");
    const files = fs.readdirSync(schemasDir).filter((f) => f.endsWith(".json"));

    const schemaObjects = new Map<string, Record<string, unknown>>();
    
    for (const file of files) {
      const schemaPath = path.join(schemasDir, file);
      let schemaContent = fs.readFileSync(schemaPath, "utf-8");

      if (schemaContent.charCodeAt(0) === 0xfeff) {
        schemaContent = schemaContent.slice(1);
      }

      const schema = JSON.parse(schemaContent) as Record<string, unknown>;

      if (schema && typeof schema === "object" && "$schema" in schema) {
        delete schema["$schema"];
      }

      const schemaName = file.replace(".json", "");
      schemaObjects.set(schemaName, schema);
    }

    const chartSpec = schemaObjects.get("v1_chart-specification");
    if (chartSpec) {
      this.ajv.addSchema(chartSpec, "https://edutrack.ai/schemas/v1/chart-specification.json");
    }

    for (const [schemaName, schema] of schemaObjects.entries()) {
      const validate = this.ajv.compile(schema);
      this.validators.set(schemaName, validate);
      this.schemas.set(schemaName, schema);
    }
  }

  validate(schemaName: string, data: unknown): ValidationResult {
    const validate = this.validators.get(schemaName);

    if (!validate) {
      return {
        valid: false,
        errors: [
          {
            keyword: "schema-not-found",
            message: "Schema \"" + schemaName + "\" not found",
            params: { schemaName },
            instancePath: "",
            schemaPath: "",
          },
        ],
      };
    }

    const valid = validate(data);

    return {
      valid: valid as boolean,
      errors: validate.errors ?? undefined,
    };
  }


  getSchema(schemaName: string): Record<string, unknown> | undefined {
    return this.schemas.get(schemaName);
  }

  getAvailableSchemas(): string[] {
    return Array.from(this.validators.keys());
  }
}
