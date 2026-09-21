import { useDashboard } from '../hooks/useDashboard';
import { useTasks } from '../hooks/useTasks';
import { getStoredUser } from '../services/api';
import type { Page } from '../components/Sidebar';

type Props = { onNavigate: (page: Page) => void };

function formatMinutes(value: number) {
  const minutes = Math.max(0, Math.round(value));
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}min`;
}

function dueLabel(value?: string) {
  if (!value) return 'Sem prazo';
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function DashboardV2Page({ onNavigate }: Props) {
  const { dashboard, isLoading: dashboardLoading, error: dashboardError } = useDashboard();
  const { tasks, isLoading: tasksLoading, error: tasksError, completeTask } = useTasks();
  const user = getStoredUser<{ name?: string }>();
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'estudante';
  const pending = tasks
    .filter((task) => task.status === 'TODO' || task.status === 'IN_PROGRESS')
    .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
  const openCount = dashboard
    ? dashboard.tasks.byStatus.TODO + dashboard.tasks.byStatus.IN_PROGRESS
    : pending.length;
  const completionRate = dashboard?.tasks.completionRate ?? 0;

  return (
    <main className="dashboard-v2">
      <header className="dashboard-v2-heading">
        <div>
          <span className="dashboard-v2-eyebrow">SEU ESPAÇO DE ESTUDOS</span>
          <h1>Seu próximo passo começa aqui<span>.</span></h1>
          <p>Olá, {firstName}. Vamos encontrar o seu foco de hoje?</p>
        </div>
        <button type="button" className="dashboard-v2-primary" onClick={() => onNavigate('tasks')}>＋ Nova tarefa</button>
      </header>

      {(dashboardError || tasksError) && <p className="dashboard-v2-error" role="alert">{dashboardError || tasksError}</p>}

      <section className="dashboard-v2-metrics" aria-label="Resumo acadêmico">
        <article className="dashboard-v2-panel dashboard-v2-metric">
          <span>Tarefas em aberto</span>
          <strong>{dashboardLoading || tasksLoading ? '…' : openCount}</strong>
          <small>Próximos passos para organizar</small>
        </article>
        <article className="dashboard-v2-panel dashboard-v2-metric">
          <span>Tempo estudado</span>
          <strong>{dashboardLoading ? '…' : formatMinutes(dashboard?.study.totalMinutes ?? 0)}</strong>
          <small>Registrado nas sessões</small>
        </article>
        <article className="dashboard-v2-panel dashboard-v2-metric">
          <span>Progresso das tarefas</span>
          <strong>{dashboardLoading ? '…' : `${completionRate}%`}</strong>
          <small>Conclusão das tarefas cadastradas</small>
        </article>
      </section>

      <div className="dashboard-v2-grid">
        <section className="dashboard-v2-panel dashboard-v2-tasks" aria-labelledby="dashboard-v2-tasks-title">
          <div className="dashboard-v2-section-heading">
            <h2 id="dashboard-v2-tasks-title">Próximas tarefas</h2>
            <button type="button" onClick={() => onNavigate('tasks')}>Ver todas →</button>
          </div>
          {tasksLoading ? <p>Carregando tarefas...</p> : pending.length === 0 ? <p>Nenhuma tarefa pendente.</p> : (
            <ul>
              {pending.slice(0, 5).map((task) => (
                <li key={task.id}>
                  <button
                    type="button"
                    className="dashboard-v2-check"
                    aria-label={`Concluir ${task.title}`}
                    onClick={() => void completeTask(task.id)}
                  >✓</button>
                  <div><strong>{task.title}</strong><small>{task.subject.name} · {dueLabel(task.dueDate)}</small></div>
                  {(task.priority === 'HIGH' || task.priority === 'URGENT') && <span className="dashboard-v2-priority">Prioridade</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
        <aside className="dashboard-v2-focus">
          <span>✦ CADA SESSÃO CONTA</span>
          <h2>Um pouco hoje.<br />Um novo amanhã.</h2>
          <p>Registre seu tempo de estudo e acompanhe o ritmo que está construindo.</p>
          <button type="button" onClick={() => onNavigate('sessions')}>Ir para sessões →</button>
        </aside>
      </div>
    </main>
  );
}
