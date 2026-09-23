# Spec Delta

## Purpose

Define el registro de Tools autorizadas del Agent y el gate de validación de Tool Calling en el Backend: existencia, autorización y conformidad de argumentos contra el JSON Schema de entrada de cada Tool. NO ejecuta Tools por sí mismo.

## ADDED Requirements

### Requirement: El sistema DEBE mantener un registro de Tools autorizadas
El sistema DEBE exponer `AgentToolRegistry` que permita registrar y consultar Tools, cada una con `name`, `description`, `inputSchema` (JSON Schema) y clasificación de riesgo de lectura/escritura.

#### Scenario: Consultar Tool registrada
- **WHEN** se consulta una Tool que fue registrada
- **THEN** el registro la retorna con sus metadatos y schema de entrada

#### Scenario: Consultar Tool inexistente
- **WHEN** se consulta una Tool no registrada
- **THEN** el registro indica que la Tool no existe

### Requirement: El sistema DEBE registrar las Tools iniciales de tareas
El sistema DEBE registrar las Tools de tareas (`create_task`, `update_task`, `complete_task`, `list_tasks`, `get_task`) con schemas de entrada derivados de los DTOs de dominio existentes.

#### Scenario: Herramientas de tareas disponibles
- **WHEN** el Agent lista las Tools disponibles
- **THEN** las Tools de tareas están registradas
- **E** cada una expone su schema de entrada

### Requirement: El sistema DEBE validar la existencia y autorización de una Tool call
El `AgentToolCallValidator` DEBE rechazar una Tool call cuyo nombre no exista o no esté autorizado en el registro.

#### Scenario: Tool call con nombre válido
- **WHEN** el nombre de la Tool está registrado
- **THEN** la validación continúa a la etapa de argumentos

#### Scenario: Tool call con nombre inválido
- **WHEN** el nombre de la Tool no está registrado
- **THEN** la validación falla con error de tool inexistente/no autorizada
- **E** NO se intenta ninguna ejecución

### Requirement: El sistema DEBE validar los argumentos contra el JSON Schema de entrada
El `AgentToolCallValidator` DEBE validar los argumentos propuestos contra el `inputSchema` de la Tool y DEVOLVER un resultado determinístico (válido/inválido con errores estructurados).

#### Scenario: Argumentos conformes
- **WHEN** los argumentos cumplen el JSON Schema de entrada de la Tool
- **THEN** la validación pasa

#### Scenario: Argumentos no conformes
- **WHEN** los argumentos no cumplen el schema (campo obligatorio ausente, tipo incorrecto, enum inválido)
- **THEN** la validación falla
- **E** se reportan errores estructurados de validación

### Requirement: El sistema DEBE exponer el gate desde AiModule
El sistema DEBE registrar `AgentToolRegistry` y `AgentToolCallValidator` en `AiModule` para que el Agent Orchestrator pueda consumirlos.

#### Scenario: Gate disponible desde AiModule
- **WHEN** un consumidor requiere el validador de Tool calls desde `AiModule`
- **THEN** el validador y el registro están disponibles
- **E** pueden validar una Tool call propuesta
