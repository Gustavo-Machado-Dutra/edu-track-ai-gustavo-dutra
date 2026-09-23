import { Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StructuredOutputValidationService } from './structured-output-validation.service';
import { AgentService } from './agent.service';
import { AgentToolRegistry } from './tools/agent-tool-registry';
import { AgentToolCallValidator } from './tools/agent-tool-call-validator';
import { AgentOrchestratorService } from './orchestrator/agent-orchestrator.service';
import { AgentController } from './orchestrator/agent.controller';
import { LLM_PROVIDER_ADAPTER } from './provider/llm-provider-adapter';
import { OpenRouterProviderAdapter } from './provider/openrouter-provider-adapter';
import { AnalyticsModule } from '../analytics/analytics.module';
import { TasksModule } from '../tasks/tasks.module';

const llmProviderAdapter: Provider = {
  provide: LLM_PROVIDER_ADAPTER,
  useFactory: (configService: ConfigService) =>
    new OpenRouterProviderAdapter((key) => configService.get<string>(key)),
  inject: [ConfigService],
};

@Module({
  imports: [AnalyticsModule, TasksModule],
  controllers: [AgentController],
  providers: [
    StructuredOutputValidationService,
    AgentService,
    AgentToolRegistry,
    AgentToolCallValidator,
    AgentOrchestratorService,
    llmProviderAdapter,
  ],
  exports: [
    StructuredOutputValidationService,
    AgentService,
    AgentToolRegistry,
    AgentToolCallValidator,
    AgentOrchestratorService,
    LLM_PROVIDER_ADAPTER,
  ],
})
export class AiModule {}
