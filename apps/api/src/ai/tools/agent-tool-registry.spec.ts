import { describe, it, expect, beforeEach } from 'vitest';
import { AgentToolRegistry } from './agent-tool-registry';
import { ToolDefinition } from './tool-definition';

describe('AgentToolRegistry', () => {
  let registry: AgentToolRegistry;

  beforeEach(() => {
    registry = new AgentToolRegistry();
  });

  describe('has', () => {
    it('should return true for registered tool', () => {
      expect(registry.has('create_task')).toBe(true);
      expect(registry.has('update_task')).toBe(true);
      expect(registry.has('complete_task')).toBe(true);
      expect(registry.has('get_task')).toBe(true);
      expect(registry.has('list_tasks')).toBe(true);
      expect(registry.has('get_academic_performance')).toBe(true);
      expect(registry.has('get_study_trends')).toBe(true);
      expect(registry.has('get_general_dashboard')).toBe(true);
      expect(registry.get('create_task')?.risk).toBe('write');
    });

    it('should return false for unregistered tool', () => {
      expect(registry.has('non_existent_tool')).toBe(false);
    });
  });

  describe('get', () => {
    it('should return tool definition for registered tool', () => {
      const tool = registry.get('get_academic_performance');
      expect(tool).toBeDefined();
      expect(tool!.name).toBe('get_academic_performance');
      expect(tool!.risk).toBe('read');
      expect(tool!.inputSchema).toBeDefined();
      expect(tool!.inputSchema.type).toBe('object');
    });

    it('should return undefined for unregistered tool', () => {
      expect(registry.get('non_existent_tool')).toBeUndefined();
    });
  });

  describe('list', () => {
    it('should return all registered tools', () => {
      const tools = registry.list();
      expect(tools.length).toBe(8);
      const names = tools.map((t) => t.name).sort();
      expect(names).toEqual([
        'complete_task',
        'create_task',
        'get_academic_performance',
        'get_general_dashboard',
        'get_study_trends',
        'get_task',
        'list_tasks',
        'update_task',
      ]);
    });
  });

  describe('constructor with custom definitions', () => {
    it('should allow custom definitions to override defaults', () => {
      const customTool: ToolDefinition = {
        name: 'custom_tool',
        description: 'Custom tool',
        risk: 'read',
        inputSchema: { type: 'object', properties: {} },
      };
      const customRegistry = new AgentToolRegistry([customTool]);
      expect(customRegistry.has('custom_tool')).toBe(true);
      expect(customRegistry.get('custom_tool')!.risk).toBe('read');
      expect(customRegistry.list().length).toBe(1);
    });
  });
});