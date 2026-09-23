# Tasks

## 1. Registro de Tools

- [x] 1.1 Crear pps/api/src/ai/tools/tool-definition.ts con el tipo ToolDefinition (name, description, inputSchema, risk read/write). Verificar: compila.
- [x] 1.2 Crear pps/api/src/ai/tools/agent-tool-registry.ts con get/has/list y registrar Tools de tareas con schemas derivados de DTOs/enums. Verificar: registry lista Tools.

## 2. Validador de Tool Calls

- [x] 2.1 Crear pps/api/src/ai/tools/agent-tool-call-validator.ts que valida existencia/autorización y argumentos contra inputSchema con jv. Verificar: retorna { valid, errors? }.
- [x] 2.2 Registrar AgentToolRegistry y AgentToolCallValidator en AiModule. Verificar: módulo compila.

## 3. Tests

- [x] 3.1 Tests de registry: Tool registrada/inexistente y listado.
- [x] 3.2 Tests de validación: args válidos, campo obligatorio ausente, tipo incorrecto, enum inválido, tool inexistente.

## 4. Verificación

- [x] 4.1 Ejecutar 
pm run test, 
pm run lint, 
pm run typecheck, 
pm run build en pps/api. Verificar: cero errores.
