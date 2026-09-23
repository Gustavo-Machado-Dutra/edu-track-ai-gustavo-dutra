# agent-response-processing Specification

## Purpose
Define el comportamiento del procesamiento de respuestas del proveedor de IA en el Backend (`AgentService`), incluyendo identificación del tipo de respuesta, validación estricta contra los schemas versionados `v1_*`, manejo de errores de configuración y fallback seguro a texto para entradas no estructuradas.

## Requirements

### Requirement: El sistema DEBE procesar respuestas del proveedor de IA
El sistema DEBE aceptar la salida cruda del proveedor (string JSON o objeto) y procesarla para determinar el tipo de respuesta estructurada.

#### Scenario: Entrada JSON string válida
- **WHEN** el sistema recibe una respuesta del proveedor como string JSON con `type` `text`, `analysis` o `action`
- **THEN** el sistema parsea la entrada
- **E** identifica el tipo de respuesta correspondiente

#### Scenario: Entrada como objeto
- **WHEN** el sistema recibe una respuesta del proveedor como objeto con `type` reconocido
- **THEN** el sistema la procesa directamente
- **E** identifica el tipo de respuesta correspondiente

### Requirement: El sistema DEBE validar respuestas estructuradas contra el schema correspondiente
El sistema DEBE seleccionar el schema `v1_*` según el tipo de respuesta y validar la respuesta estructurada mediante `StructuredOutputValidationService` antes de entregarla.

#### Scenario: Respuesta estructurada válida
- **WHEN** la respuesta estructurada cumple el schema `v1_*` correspondiente
- **THEN** el sistema la retorna como respuesta procesada válida

#### Scenario: Respuesta estructurada inválida
- **WHEN** la respuesta estructurada no cumple el schema `v1_*` correspondiente
- **THEN** el sistema lanza `BadRequestException`
- **E** la respuesta inválida NO es entregada

### Requirement: El sistema DEBE lanzar error de configuración ante schema inexistente
El sistema DEBE tratar un `schema-not-found` del validador como un error interno de configuración y lanzar `InternalServerErrorException`.

#### Scenario: Schema no registrado
- **WHEN** el validador reporta `schema-not-found` para el schema seleccionado
- **THEN** el sistema lanza `InternalServerErrorException`
- **E** el error indica que es un problema de configuración de IA

### Requirement: El sistema DEBE hacer fallback a texto en entradas no estructuradas
El sistema DEBE devolver una respuesta de tipo `text` cuando la entrada no es JSON válido, no tiene un `type` reconocido o es un objeto vacío.

#### Scenario: JSON malformado
- **WHEN** la entrada es un string que no es JSON válido
- **THEN** el sistema la trata como respuesta de texto
- **E** el contenido de la respuesta es el texto original

#### Scenario: Tipo de respuesta desconocido
- **WHEN** la entrada es JSON con un `type` no reconocido
- **THEN** el sistema la trata como respuesta de texto
- **E** la respuesta no es validada contra schema estructurado

#### Scenario: Objeto vacío
- **WHEN** la entrada es un objeto JSON vacío
- **THEN** el sistema la trata como respuesta de texto
- **E** no se lanza error de validación

### Requirement: El sistema DEBE exponer el procesamiento desde AiModule
El sistema DEBE registrar `AgentService` como proveedor en `AiModule` y exportarlo para que otros módulos puedan usarlo.

#### Scenario: AgentService disponible desde AiModule
- **WHEN** un consumidor requiere `AgentService` desde `AiModule`
- **THEN** el servicio está disponible
- **E** puede llamar a `processProviderResponse`
