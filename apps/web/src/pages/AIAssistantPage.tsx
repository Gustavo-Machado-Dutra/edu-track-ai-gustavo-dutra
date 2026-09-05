import { useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useDashboard } from '../hooks/useDashboard';
import { useSubjects } from '../hooks/useSubjects';
import { useTasks } from '../hooks/useTasks';
import type { Task } from '../types';

type Message = {
  id: number;
  role: 'assistant' | 'user';
  content: string;
  metadata?: string;
};

function formatStudyTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}min`;
}

function getSuggestedResponse(prompt: string, tasks: Task[], subjectsCount: number, totalMinutes: number) {
  const normalizedPrompt = prompt.toLocaleLowerCase('pt-BR');
  const openTasks = tasks.filter((task) => task.status === 'TODO' || task.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter((task) => task.status === 'COMPLETED');
  const overdueTasks = openTasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date());

  if (normalizedPrompt.includes('tarefa') || normalizedPrompt.includes('pend')) {
    if (openTasks.length === 0) return 'Você não tem tarefas pendentes no momento. Posso ajudar a planejar uma nova frente de estudo.';
    const firstTask = openTasks[0];
    if (!firstTask) return 'Você não tem tarefas pendentes no momento. Posso ajudar a planejar uma nova frente de estudo.';
    return `Você tem ${openTasks.length} tarefa${openTasks.length === 1 ? '' : 's'} em aberto. A próxima recomendação é “${firstTask.title}”, de ${firstTask.subject.name}.`;
  }

  if (normalizedPrompt.includes('progresso') || normalizedPrompt.includes('desempenho')) {
    const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
    return `Seu progresso por entregas está em ${completionRate}%, com ${completedTasks.length} tarefa${completedTasks.length === 1 ? '' : 's'} concluída${completedTasks.length === 1 ? '' : 's'} de ${tasks.length}.`;
  }

  if (normalizedPrompt.includes('tempo') || normalizedPrompt.includes('estudo') || normalizedPrompt.includes('foco')) {
    return `Você já registrou ${formatStudyTime(totalMinutes)} de estudo. ${totalMinutes > 0 ? 'Mantenha blocos regulares de foco para consolidar esse ritmo.' : 'Comece com um bloco curto de 25 minutos para ativar seu ritmo.'}`;
  }

  if (normalizedPrompt.includes('atras') || normalizedPrompt.includes('urgente')) {
    const firstOverdueTask = overdueTasks[0];
    return overdueTasks.length > 0
      ? firstOverdueTask
        ? `Encontrei ${overdueTasks.length} entrega${overdueTasks.length === 1 ? '' : 's'} atrasada${overdueTasks.length === 1 ? '' : 's'}. Recomendo priorizar “${firstOverdueTask.title}” antes de iniciar uma nova tarefa.`
        : 'Não há entregas atrasadas identificadas. Seu radar acadêmico está limpo neste momento.'
      : 'Não há entregas atrasadas identificadas. Seu radar acadêmico está limpo neste momento.';
  }

  return `Posso analisar suas tarefas, progresso e foco. No momento, acompanho ${subjectsCount} disciplina${subjectsCount === 1 ? '' : 's'} e ${openTasks.length} tarefa${openTasks.length === 1 ? '' : 's'} em aberto. Pergunte, por exemplo: “quais tarefas devo priorizar?”`;
}

export function AIAssistantPage() {
  const { tasks, isLoading: isLoadingTasks } = useTasks();
  const { subjects, isLoading: isLoadingSubjects } = useSubjects();
  const { dashboard, isLoading: isLoadingDashboard } = useDashboard();
  const [prompt, setPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
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

  const sendMessage = (value = prompt) => {
    const trimmedPrompt = value.trim();
    if (!trimmedPrompt || isThinking || isLoadingContext) return;

    const userMessage: Message = { id: Date.now(), role: 'user', content: trimmedPrompt };
    setMessages((current) => [...current, userMessage]);
    setPrompt('');
    setIsThinking(true);

    window.setTimeout(() => {
      setMessages((current) => [...current, {
        id: Date.now() + 1,
        role: 'assistant',
        content: getSuggestedResponse(trimmedPrompt, tasks, subjects.length, dashboard?.study.totalMinutes ?? 0),
        metadata: 'ANÁLISE BASEADA NOS SEUS DADOS',
      }]);
      setIsThinking(false);
    }, 450);
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
          <div className="ai-hero-orbit" aria-hidden="true"><span>✦</span><i /><i /></div>
          <div className="ai-hero-copy">
            <p className="eyebrow">Central de comando</p>
            <h2>Clareza para o próximo passo.</h2>
            <p>Use o contexto da sua rotina acadêmica para descobrir prioridades, entender seu ritmo e agir com intenção.</p>
          </div>
          <div className="ai-capabilities">
            <span><b>◌</b> Analisar progresso</span>
            <span><b>⌁</b> Priorizar tarefas</span>
            <span><b>＋</b> Planejar seu foco</span>
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
          <div className="ai-chat-identity"><span className="ai-avatar" aria-hidden="true">✦</span><div><strong>EduTrack Copilot</strong><small>Seu assistente operacional e analítico</small></div></div>
          <span className="ai-session-label">SESSÃO ATUAL</span>
        </div>
        <div className="ai-messages" aria-live="polite">
          {messages.map((message) => (
            <article className={`ai-message ai-message-${message.role}`} key={message.id}>
              {message.role === 'assistant' && <span className="ai-message-avatar" aria-hidden="true">✦</span>}
              <div className="ai-message-body"><p>{message.content}</p>{message.metadata && <small>{message.metadata}</small>}</div>
            </article>
          ))}
          {isThinking && <article className="ai-message ai-message-assistant"><span className="ai-message-avatar" aria-hidden="true">✦</span><div className="ai-message-body ai-thinking"><span /><span /><span /></div></article>}
        </div>
        <div className="ai-quick-prompts" aria-label="Sugestões de perguntas">
          {quickPrompts.map((quickPrompt) => <button type="button" key={quickPrompt} onClick={() => sendMessage(quickPrompt)} disabled={isThinking || isLoadingContext}>{quickPrompt}</button>)}
        </div>
        <form className="ai-composer" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
          <input value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Pergunte algo sobre sua jornada acadêmica..." disabled={isThinking || isLoadingContext} aria-label="Mensagem para a IA" />
          <Button type="submit" size="sm" isLoading={isThinking} disabled={!prompt.trim() || isLoadingContext} aria-label="Enviar mensagem"><span aria-hidden="true">↑</span></Button>
        </form>
        <p className="ai-disclaimer">A IA interpreta seus dados disponíveis. Confirme informações importantes antes de tomar decisões.</p>
      </section>
    </main>
  );
}