import { beforeEach, describe, expect, it } from 'vitest';
import { AgentToolCallValidator } from './agent-tool-call-validator';
import { AgentToolRegistry } from './agent-tool-registry';

describe('AgentToolCallValidator', () => {
  let validator: AgentToolCallValidator;

  beforeEach(() => {
    validator = new AgentToolCallValidator(new AgentToolRegistry());
  });

  it('rejects an unknown tool', () => {
    const result = validator.validate('non_existent_tool', {});

    expect(result.valid).toBe(false);
    expect(result.toolName).toBe('non_existent_tool');
    expect(result.errors?.[0]?.keyword).toBe('tool-not-found');
  });

  it('accepts analytics tools with their defined empty argument object', () => {
    expect(validator.validate('get_academic_performance', {}).valid).toBe(true);
    expect(validator.validate('get_study_trends', {}).valid).toBe(true);
    expect(validator.validate('get_general_dashboard', {}).valid).toBe(true);
  });

  it('rejects arbitrary arguments for analytics tools', () => {
    const result = validator.validate('get_academic_performance', {
      userId: 'another-user',
    });

    expect(result.valid).toBe(false);
    expect(result.errors?.map((error) => error.keyword)).toContain('additionalProperties');
  });

  it('rejects non-object analytics arguments', () => {
    const result = validator.validate('get_study_trends', []);

    expect(result.valid).toBe(false);
    expect(result.errors?.map((error) => error.keyword)).toContain('type');
  });

  it('accepts list_tasks without a status filter', () => {
    expect(validator.validate('list_tasks', {}).valid).toBe(true);
  });

  it('accepts a valid list_tasks status filter', () => {
    expect(validator.validate('list_tasks', { status: 'TODO' }).valid).toBe(true);
  });

  it('rejects an invalid list_tasks status filter', () => {
    const result = validator.validate('list_tasks', { status: 'OPEN' });

    expect(result.valid).toBe(false);
    expect(result.errors?.map((error) => error.keyword)).toContain('enum');
  });

  it('rejects arbitrary list_tasks arguments', () => {
    const result = validator.validate('list_tasks', { userId: 'another-user' });

    expect(result.valid).toBe(false);
    expect(result.errors?.map((error) => error.keyword)).toContain('additionalProperties');
  });
  it('accepts valid create_task arguments', () => {
    const result = validator.validate('create_task', {
      subjectId: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Study algorithms',
      priority: 'HIGH',
      difficulty: 'MEDIUM',
      estimatedMinutes: 60,
    });

    expect(result.valid).toBe(true);
  });

  it('rejects create_task arguments without the required subject or title', () => {
    const missingSubject = validator.validate('create_task', { title: 'Study' });
    const missingTitle = validator.validate('create_task', {
      subjectId: '123e4567-e89b-12d3-a456-426614174000',
    });

    expect(missingSubject.valid).toBe(false);
    expect(missingTitle.valid).toBe(false);
  });

  it('rejects invalid update_task status and arguments outside the schema', () => {
    const invalidStatus = validator.validate('update_task', {
      taskId: '123e4567-e89b-12d3-a456-426614174000',
      status: 'OPEN',
    });
    const arbitraryArgument = validator.validate('update_task', {
      taskId: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'another-user',
    });

    expect(invalidStatus.valid).toBe(false);
    expect(arbitraryArgument.valid).toBe(false);
  });

  it('requires a valid task id for task lookup and completion tools', () => {
    expect(validator.validate('get_task', {}).valid).toBe(false);
    expect(validator.validate('complete_task', { taskId: 'not-a-uuid' }).valid).toBe(false);
    expect(
      validator.validate('get_task', {
        taskId: '123e4567-e89b-12d3-a456-426614174000',
      }).valid,
    ).toBe(true);
  });

});
