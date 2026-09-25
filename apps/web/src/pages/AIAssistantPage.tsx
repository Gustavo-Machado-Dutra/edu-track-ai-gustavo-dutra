import { useMemo, useState } from 'react';
import { chatWithAgent, ApiClientError, type AgentChatResponse } from '../services/api';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { AgentChart } from '../components/AgentChart';
import { useDashboard } from '../hooks/useDashboard';
import { useSubjects } from '../hooks/useSubjects';
import { useTasks } from '../hooks/useTasks';
import type { AgentStructuredResponse } from '../types/agent-responses';
import type { ChartSpecification } from '../types/chart-specification';

type Message = {
  id: number;
  role: 'assistant' | 'user';
  content: string;
  metadata?: string;
  structuredData?: AgentStructuredResponse;
  chartSpec?: ChartSpecification;
};

function formatStudyTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}min`;
}

function normalizeAgentResponse(response: AgentChatResponse['response']): {
  content: string;
  structuredData?: AgentStructuredResponse;
  chartSpec?: ChartSpecification;
  metadata?: string;
} {
  if (typeof response.content === 'string') {
    return { content: response.content };
  }

  if (!response.content || typeof response.content !== 'object') {
    return { content: 'A resposta da IA não possui conteúdo exibível.' };
  }

  const structured = response.content as AgentStructuredResponse;
  if (response.type === 'text' && structured.type === 'text') {
    return {
      content: structured.content,
      structuredData: structured,
      metadata: 'RESPOSTA VALIDADA PELO BACKEND',
    };
  }

  if (response.type === 'analysis' && structured.type === 'analysis') {
    const metrics = Object.entries(structured.metrics)
      .map(([key, value]) => key + ': ' + (typeof value === 'string' ? value : JSON.stringify(value)))
      .join(' · ');
    return {
      content: metrics ? structured.analysis + ' ' + metrics : structured.analysis,
      structuredData: structured,
      chartSpec: structured.chart,
      metadata: 'ANÁLISE VALIDADA PELO BACKEND',
    };
  }

  if (response.type === 'action' && structured.type === 'action') {
    return {
      content: 'Ação ' + structured.action + ' executada com sucesso.',
      structuredData: structured,
      metadata: 'AÇÃO VALIDADA PELO BACKEND',
    };
  }

  return { content: 'A resposta da IA não corresponde a um contrato conhecido.' };
}

function formatAgentErrorMessage(error: unknown, responseError?: { statusCode?: number; code?: string; message?: string }): {
  content: string;
  metadata: string;
} {
  const statusCode = responseError?.statusCode ?? (error instanceof ApiClientError ? error.statusCode : undefined);
  const code = responseError?.code ?? (error instanceof ApiClientError ? error.code : undefined);
  const rawMessage = (responseError?.message ?? (error instanceof Error ? error.message : String(error))).toLowerCase();

  if (statusCode === 429 || code === 'PROVIDER_QUOTA' || rawMessage.includes('quota') || rawMessage.includes('rate limit')) {
    return {
      content: 'Temporariamente não foi possível consultar o assistente porque o limite de uso do provedor foi atingido. Tente novamente mais tarde.',
      metadata: 'LIMITE DE USO ATINGIDO (QUOTA)',
    };
  }

  if (statusCode === 503 || statusCode === 502 || code === 'PROVIDER_UNAVAILABLE') {
    return {
      content: 'O provedor de inteligência artificial está temporariamente indisponível. Tente novamente em alguns instantes.',
      metadata: 'PROVEDOR DE IA INDISPONÍVEL',
    };
  }

  if (statusCode === 401 || statusCode === 403 || code === 'UNAUTHORIZED' || code === 'PROVIDER_AUTH_ERROR') {
    return {
      content: 'Sua sessão expirou ou você não tem permissão para realizar esta operação. Faça login novamente.',
      metadata: 'AUTENTICAÇÃO NECESSÁRIA',
    };
  }

  if (statusCode === 400 || code === 'PROVIDER_BAD_REQUEST') {
    return {
      content: 'A mensagem enviada não pôde ser processada pelo assistente. Verifique os dados e tente novamente.',
      metadata: 'SOLICITAÇÃO INVÁLIDA',
    };
  }

  if (statusCode === 504 || code === 'PROVIDER_TIMEOUT') {
    return {
      content: 'O tempo limite para resposta do assistente foi excedido. Tente novamente em instantes.',
      metadata: 'TEMPO LIMITE EXCEDIDO',
    };
  }

  if (code === 'NETWORK_ERROR' || rawMessage.includes('conectar') || rawMessage.includes('failed to fetch')) {
    return {
      content: 'Não foi possível conectar ao servidor. Confirme que a API está em execução.',
      metadata: 'SERVIDOR INDISPONÍVEL',
    };
  }

  return {
    content: responseError?.message || (error instanceof Error ? error.message : 'Ocorreu um erro ao processar sua solicitação no servidor.'),
    metadata: 'ERRO AO PROCESSAR',
  };
}

export function AIAssistantPage() {
  const { tasks, isLoading: isLoadingTasks } = useTasks();
  const { subjects, isLoading: isLoadingSubjects } = useSubjects();
  const { dashboard, isLoading: isLoadingDashboard } = useDashboard();
  const [prompt, setPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: 'Olá! Sou seu copiloto acadêmico. Posso analisar seu progresso, encontrar prioridades e ajudar a organizar o próximo passo da sua missão.',
      metadata: 'ASSISTENTE ONLINE · CONTEXTO LOCAL',
    },
  ]);

  const quickPrompts = ['O que devo priorizar?', 'Como está meu progresso?', 'Quanto tempo estudei?'];
  const isLoadingContext = isLoadingTasks || isLoadingSubjects || isLoadingDashboard;
  const activeTasks = useMemo(() => tasks.filter((task) => task.status === 'TODO' || task.status === 'IN_PROGRESS'), [tasks]);

  const sendMessage = async (value = prompt) => {
    const trimmedPrompt = value.trim();
    if (!trimmedPrompt || isThinking) return;

    const userMessage: Message = { id: Date.now(), role: 'user', content: trimmedPrompt };
    setMessages((current) => [...current, userMessage]);
    setPrompt('');
    setIsThinking(true);

    try {
      const response = await chatWithAgent(trimmedPrompt, conversationId);
      if (response.error) {
        const errorInfo = formatAgentErrorMessage(null, response.error);
        setMessages((current) => [
          ...current,
          {
            id: Date.now() + 1,
            role: 'assistant',
            content: errorInfo.content,
            metadata: errorInfo.metadata,
          },
        ]);
        return;
      }

      setConversationId(response.data.conversationId);
      const normalized = normalizeAgentResponse(response.data.response);
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: normalized.content,
          metadata: normalized.metadata ?? 'RESPOSTA GERADA PELO AGENT',
          structuredData: normalized.structuredData,
          chartSpec: normalized.chartSpec,
        },
      ]);
    } catch (error) {
      const errorInfo = formatAgentErrorMessage(error);
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: errorInfo.content,
          metadata: errorInfo.metadata,
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <main className="app-shell ai-page">
      <header className="page-header ai-page-header">
        <div>
          <p className="eyebrow">Inteligência acadêmica</p>
          <h1>Seu copiloto de estudos.</h1>
          <p className="page-description">Pergunte, analise e transforme dados em próximos passos claros.</p>
        </div>
        <span className={`ai-live-status ${isLoadingContext ? 'ai-live-status-loading' : ''}`}><i /> {isLoadingContext ? 'SINCRONIZANDO DADOS' : 'IA ONLINE'}</span>
      </header>

      <section className="ai-overview-grid" aria-label="Resumo do assistente">
        <Card className="ai-hero-card" padding="lg">
          <div className="ai-hero-orbit" aria-hidden="true"><span>?</span><i /><i /></div>
          <div className="ai-hero-copy">
            <p className="eyebrow">Central de comando</p>
            <h2>Clareza para o próximo passo.</h2>
            <p>Use o contexto da sua rotina acadêmica para descobrir prioridades, entender seu ritmo e agir com intenção.</p>
          </div>
          <div className="ai-capabilities">
            <span><b>?</b> Analisar progresso</span>
            <span><b>?</b> Priorizar tarefas</span>
            <span><b>+</b> Planejar seu foco</span>
          </div>
        </Card>
        <Card className="ai-context-card" padding="md">
          <div className="section-heading"><div><p className="eyebrow">Contexto ativo</p><h2>Seu sistema agora</h2></div><span className="status-dot" /></div>
          <div className="ai-context-stats">
            <div><strong>{subjects.length}</strong><span>disciplinas</span></div>
            <div><strong>{activeTasks.length}</strong><span>tarefas abertas</span></div>
            <div><strong>{formatStudyTime(dashboard?.study.totalMinutes ?? 0)}</strong><span>tempo de foco</span></div>
          </div>
          <p className="ai-context-note">A IA utiliza apenas dados autorizados da sua conta para construir esta conversa.</p>
        </Card>
      </section>

      <section className="ai-chat-card" aria-label="Conversa com o assistente">
        <div className="ai-chat-header">
          <div className="ai-chat-identity"><span className="ai-avatar" aria-hidden="true">?</span><div><strong>EduTrack Copilot</strong><small>Seu assistente operacional e analítico</small></div></div>
          <span className="ai-session-label">SESSÃO ATUAL</span>
        </div>
        <div className="ai-messages" aria-live="polite">
          {messages.map((message) => (
            <article className={`ai-message ai-message-${message.role}`} key={message.id}>
              {message.role === 'assistant' && <span className="ai-message-avatar" aria-hidden="true">?</span>}
              <div className="ai-message-body"><p>{message.content}</p>{message.chartSpec && <AgentChart spec={message.chartSpec} />}{message.metadata && <small>{message.metadata}</small>}</div>
            </article>
          ))}
          {isThinking && <article className="ai-message ai-message-assistant"><span className="ai-message-avatar" aria-hidden="true">?</span><div className="ai-message-body ai-thinking"><span /><span /><span /></div></article>}
        </div>
        <div className="ai-quick-prompts" aria-label="Sugestões de perguntas">
          {quickPrompts.map((quickPrompt) => <button type="button" key={quickPrompt} onClick={() => void sendMessage(quickPrompt)} disabled={isThinking}>{quickPrompt}</button>)}
        </div>
        <form className="ai-composer" onSubmit={(event) => { event.preventDefault(); void sendMessage(); }}>
          <input value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Pergunte algo sobre sua jornada acadêmica..." disabled={isThinking} aria-label="Mensagem para a IA" />
          <Button type="submit" size="sm" isLoading={isThinking} disabled={!prompt.trim() || isThinking} aria-label="Enviar mensagem"><span aria-hidden="true">?</span></Button>
        </form>
        <p className="ai-disclaimer">A IA interpreta seus dados disponíveis. Confirme informações importantes antes de tomar decisões.</p>
      </section>
    </main>
  );
}
