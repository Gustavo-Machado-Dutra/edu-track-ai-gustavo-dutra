# llm-provider-adapter Specification

## Purpose
Define el contrato provider-agnostic para acceder a modelos de lenguaje (`LlmProviderAdapter`) y la implementación inicial sobre el protocolo OpenAI-compatible Chat Completions de OpenRouter, incluyendo configuración, construcción de requests (mensajes, Tools, Structured Output), timeout, retry, fallback y manejo de errores.

## Requirements

### Requirement: El sistema DEBE acceder a modelos de lenguaje solo a través del Adapter
El sistema DEBE exponer un contrato único `LlmProviderAdapter` y NUNCA llamar directamente al SDK o API de un proveedor fuera de esta capa. Las reglas de negocio del Agent NO DEBEN depender de un proveedor específico.

#### Scenario: El Agent usa el Adapter
- **WHEN** el Agent necesita enviar mensajes a un modelo
- **THEN** la llamada se realiza exclusivamente mediante el contrato `LlmProviderAdapter`
- **E** el código de negocio no referencia el SDK del proveedor

#### Scenario: Reemplazo de proveedor sin cambio de negocio
- **WHEN** se desea usar otro proveedor compatible
- **THEN** se intercambia únicamente la implementación inyectada del Adapter
- **E** las reglas de negocio del Agent permanecen sin cambios

### Requirement: El sistema DEBE implementar el Adapter sobre Chat Completions de OpenRouter
El `OpenRouterProviderAdapter` DEBE construir y enviar requests al protocolo OpenAI-compatible Chat Completions (`POST {baseUrl}/chat/completions`), que es el contrato principal del MVP.

#### Scenario: Request de mensajes
- **WHEN** el Adapter envía mensajes
- **THEN** la request incluye `model`, `messages` y `Authorization: Bearer {apiKey}`
- **E** se usa la URL base configurada

#### Scenario: Solicitud Structured Output
- **WHEN** se pide Structured Output
- **THEN** la request incluye `response_format.type = "json_schema"` con `name`, `strict` y el JSON Schema
- **E** el schema NO permite propiedades adicionales salvo que el contrato lo indique

#### Scenario: Solicitud Tool Calling
- **WHEN** se proveen Tools
- **THEN** la request incluye `tools` en formato OpenAI-compatible y `tool_choice` (por defecto `"auto"`)
- **E** cada Tool expone `type`, `name`, `description` y JSON Schema de `parameters`

### Requirement: El sistema DEBE aplicar timeout y un único retry ante errores transitorios
El Adapter DEBE aplicar el timeout configurado (inicial 30000 ms) y, ante un error transitorio (red, timeout, 5xx, 429), realizar UN único retry. NO DEBE haber retry infinito.

#### Scenario: Error transitorio seguido de éxito
- **WHEN** el primer intento falla por error transitorio y el retry tiene éxito
- **THEN** el Adapter retorna la respuesta exitosa
- **E** registra que se usó un retry

#### Scenario: Error de autorización
- **WHEN** el proveedor retorna un error de autorización o schema inválido (4xx de implementación)
- **THEN** el Adapter NO reintenta automáticamente
- **E** propaga el error sin fallback de modelo

### Requirement: El sistema DEBE ejecutar fallback al modelo configurado
Cuando el modelo principal falla de forma transitoria tras el retry, el Adapter DEBE reintentar con el modelo de fallback configurado (`openrouter/free`). Si el fallback también falla, DEBE terminar con error controlado.

#### Scenario: Modelo principal falla y fallback tiene éxito
- **WHEN** el modelo principal falla de forma transitoria y el fallback responde correctamente
- **THEN** el Adapter retorna la respuesta del fallback
- **E** expone el modelo realmente utilizado

#### Scenario: Fallo total
- **WHEN** modelo principal y fallback fallan
- **THEN** el Adapter termina con un error controlado
- **E** NO devuelve una respuesta parcial como exitosa

### Requirement: El sistema DEBE exponer el modelo utilizado y metadatos de uso
El resultado del Adapter DEBE incluir el modelo realmente utilizado y, cuando estén disponibles, métricas de uso (input/output tokens). La versión de prompt es responsabilidad del llamador y se registra en la auditoría.

#### Scenario: Respuesta exitosa anotada
- **WHEN** el Adapter retorna una respuesta exitosa
- **THEN** el resultado incluye el modelo usado y el contenido (o Tool calls)
- **E** incluye usage cuando el proveedor lo reporta
