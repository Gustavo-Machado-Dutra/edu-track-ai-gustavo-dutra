import { Injectable } from '@nestjs/common';
import { ToolDefinition } from './tool-definition';

const UUID_PATTERN = '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$';
const TASK_STATUS_VALUES = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const TASK_PRIORITY_VALUES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const TASK_DIFFICULTY_VALUES = ['EASY', 'MEDIUM', 'HARD'];

@Injectable()
export class AgentToolRegistry {
  private readonly tools = new Map<string, ToolDefinition>();

  constructor(customDefinitions?: ToolDefinition[]) {
    if (customDefinitions && customDefinitions.length > 0) {
      for (const definition of customDefinitions) {
        this.register(definition);
      }
    } else {
      this.registerDefaults();
    }
  }

  private registerDefaults(): void {
    this.register({
      name: 'create_task',
      description: 'Create an academic task for the authenticated user',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        required: ['subjectId', 'title'],
        properties: {
          subjectId: { type: 'string', pattern: UUID_PATTERN },
          title: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string' },
          priority: { type: 'string', enum: TASK_PRIORITY_VALUES },
          difficulty: { type: 'string', enum: TASK_DIFFICULTY_VALUES },
          dueDate: { type: 'string' },
          estimatedMinutes: { type: 'integer', minimum: 1 },
        },
      },
      risk: 'write',
    });
    this.register({
      name: 'update_task',
      description: 'Update an academic task owned by the authenticated user',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        required: ['taskId'],
        properties: {
          taskId: { type: 'string', pattern: UUID_PATTERN },
          subjectId: { type: 'string', pattern: UUID_PATTERN },
          title: { type: 'string', maxLength: 200 },
          description: { type: 'string' },
          priority: { type: 'string', enum: TASK_PRIORITY_VALUES },
          difficulty: { type: 'string', enum: TASK_DIFFICULTY_VALUES },
          status: { type: 'string', enum: TASK_STATUS_VALUES },
          dueDate: { type: ['string', 'null'] },
          estimatedMinutes: { type: 'integer', minimum: 1 },
        },
      },
      risk: 'write',
    });
    this.register({
      name: 'complete_task',
      description: 'Complete an academic task owned by the authenticated user',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        required: ['taskId'],
        properties: {
          taskId: { type: 'string', pattern: UUID_PATTERN },
        },
      },
      risk: 'write',
    });
    this.register({
      name: 'get_task',
      description: 'Get one academic task owned by the authenticated user',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        required: ['taskId'],
        properties: {
          taskId: { type: 'string', pattern: UUID_PATTERN },
        },
      },
      risk: 'read',
    });
    this.register({
      name: 'list_tasks',
      description: 'List academic tasks for the authenticated user, optionally filtered by status',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          status: { type: 'string', enum: TASK_STATUS_VALUES },
        },
      },
      risk: 'read',
    });
    this.register({
      name: 'get_academic_performance',
      description: 'Get academic performance metrics for the authenticated user',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      risk: 'read',
    });
    this.register({
      name: 'get_study_trends',
      description: 'Get study time metrics and subject distribution for the authenticated user',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      risk: 'read',
    });
    this.register({
      name: 'get_general_dashboard',
      description: 'Get dashboard aggregates and recent study sessions for the authenticated user',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      risk: 'read',
    });
  }

  register(definition: ToolDefinition): void {
    this.tools.set(definition.name, definition);
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  list(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }
}
