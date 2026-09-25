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
import { GoogleGeminiProviderAdapter } from './provider/google-gemini-provider-adapter';
import { loadLlmProviderConfig, LlmProviderConfig } from './provider/llm-provider-config';
import { AnalyticsModule } from '../analytics/analytics.module';
import { TasksModule } from '../tasks/tasks.module';

const llmProviderAdapter: Provider = {
  provide: LLM_PROVIDER_ADAPTER,
  useFactory: (configService: ConfigService) => {
    const getEnv = (key: string) => configService.get<string>(key);
    const config: LlmProviderConfig = loadLlmProviderConfig(getEnv);

    if (config.provider === 'google-gemini') {
      return new GoogleGeminiProviderAdapter();
    }

    return new OpenRouterProviderAdapter(getEnv);
  },
  inject: [ConfigService],
};

@Module({
  imports: [AnalyticsModule, TasksModule],
  controllers: [AgentController],
  providers: [
    StructuredOutputValidationService,
    AgentService,
    {
      provide: AgentToolRegistry,
      useFactory: () => new AgentToolRegistry(),
    },
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