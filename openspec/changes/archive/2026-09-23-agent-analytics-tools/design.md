# Design

O AgentToolRegistry e a fonte de autorizacao. O AgentToolCallValidator compila os schemas registrados com AJV e rejeita nomes desconhecidos, propriedades extras, tipos incorretos e enums invalidos.

O AgentOrchestratorService converte as definicoes internas para o contrato de Tool Calling do provider, valida cada chamada, usa userId recebido do controller, roteia para TasksService ou AnalyticsService, registra AIToolExecution e envia o resultado real como mensagem TOOL ao provider. O loop possui limite de tres iteracoes.

AIConversation e AIMessage registram a entrada do usuario, mensagens do assistant/tool e a resposta final. Falha de validacao da resposta final tambem gera auditoria FAILED.

O Copilot Web usa apiRequest('/ai/chat'), mantém conversationId e renderiza somente response.content validado pelo Backend; response.raw nao faz parte do contrato HTTP.


Para respostas produzidas apos uma Tool, o orchestrator envia response_format com o schema v1 de analysis ou action e passa o tipo esperado ao AgentService, que mantem a segunda validacao independente. A criacao de tarefas recebe o id da execucao PENDING e grava agentExecutionId; a auditoria e finalizada com SUCCESS ou FAILED.
