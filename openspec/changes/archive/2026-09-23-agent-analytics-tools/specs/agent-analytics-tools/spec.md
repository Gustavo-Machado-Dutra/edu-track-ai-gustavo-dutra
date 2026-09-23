# agent-analytics-tools Specification

## ADDED Requirements

### Requirement: Analytics Tools autorizadas
O sistema MUST registrar get_academic_performance, get_study_trends e get_general_dashboard como Tools read-only com schemas de objeto sem propriedades arbitrarias.

#### Scenario: chamada valida
- WHEN o provider envia uma dessas Tools com {}
- THEN o Backend valida e executa o metodo correspondente do AnalyticsService para o userId autenticado

#### Scenario: userId enviado pelo modelo
- WHEN os argumentos contem userId ou outra propriedade extra
- THEN o validator rejeita a chamada e nenhuma consulta Analytics e executada

### Requirement: resultado e auditoria
O orchestrator MUST persistir AIToolExecution SUCCESS ou FAILED e enviar ao provider o resultado produzido pelo Backend.

#### Scenario: execucao Analytics concluida
- WHEN uma Analytics Tool validada retorna um resultado
- THEN o Backend registra a execucao como SUCCESS e envia o resultado ao provider como mensagem TOOL

#### Scenario: execucao Analytics falha
- WHEN a validacao ou execucao da Analytics Tool falha
- THEN o Backend registra a execucao como FAILED e envia o erro controlado ao provider

### Requirement: limite seguro
O loop MUST parar apos tres iteracoes sem resposta final e rejeitar Tools inexistentes ou sem executor Backend.

#### Scenario: limite de iteracoes
- WHEN o provider solicita Tools em todas as tres iteracoes sem resposta final
- THEN o orchestrator encerra o loop com erro controlado

#### Scenario: Tool sem executor
- WHEN o provider solicita uma Tool inexistente ou sem executor Backend
- THEN o Backend rejeita a chamada e nao executa codigo arbitrario
