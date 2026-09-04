import { MetricCard } from '../components/MetricCard';
import { TaskCard } from '../components/TaskCard';
import { useDashboard } from '../hooks/useDashboard';
import { useTasks } from '../hooks/useTasks';

function formatStudyTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}min`;
}

export function DashboardPage() {
  const { dashboard, isLoading: loadingDashboard, error: dashboardError } = useDashboard();
  const { tasks, isLoading: loadingTasks, completeTask } = useTasks();
  const pendingTasks = tasks.filter((task) => task.status === 'TODO' || task.status === 'IN_PROGRESS');
  const overdueTasks = pendingTasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date());
  const openTasks = (dashboard?.tasks.byStatus.TODO ?? pendingTasks.length) + (dashboard?.tasks.byStatus.IN_PROGRESS ?? 0);
  const completionRate = dashboard?.tasks.completionRate ?? 0;
  const metrics = [
    { label: 'Tarefas abertas', value: String(openTasks), accent: 'primary' as const },
    { label: 'Tempo estudado', value: formatStudyTime(dashboard?.study.totalMinutes ?? 0), accent: 'secondary' as const },
    { label: 'Entregas críticas', value: String(dashboard?.tasks.overdue ?? overdueTasks.length), accent: 'tertiary' as const },
  ];

  if (loadingTasks || loadingDashboard) return <main className="app-shell"><p className="loading-text">Carregando dashboard...</p></main>;

  return (
    <main className="app-shell dashboard-page">
      <header className="dashboard-header">
        <p className="eyebrow">Painel de comando</p>
        <h1>Bem-vindo de volta</h1>
        <p className="dashboard-subtitle">Acompanhe sua trajetória acadêmica e mantenha o ritmo.</p>
      </header>
      {dashboardError && <p className="error-message">{dashboardError}</p>}

      <section className="dashboard-command-grid" aria-label="Resumo acadêmico">
        <article className="insight-panel">
          <div className="insight-copy">
            <p className="eyebrow insight-label">✦ Insight da IA</p>
            <h2>{completionRate >= 70 ? 'Ritmo de estudo consistente' : 'Hora de ajustar o ritmo'}</h2>
            <p>{completionRate >= 70 ? 'Seu progresso está avançando bem. Continue priorizando as próximas entregas para manter sua cadência.' : 'Organize blocos curtos de foco para avançar nas tarefas pendentes e evitar prazos apertados.'}</p>
            <span className="insight-action">Progresso atual: {completionRate}%</span>
          </div>
          <div className="insight-orbit" aria-hidden="true"><span>✦</span><span>↗</span><span>◌</span></div>
        </article>
        <aside className="activity-panel">
          <div className="section-heading"><h2>Resumo da semana</h2><span className="status-dot" /></div>
          <div className="activity-item"><span className="activity-icon">✓</span><p><strong>{dashboard?.study.sessionsCount ?? 0} sessões</strong><small>registradas até agora</small></p></div>
          <div className="activity-item"><span className="activity-icon secondary">◷</span><p><strong>{formatStudyTime(dashboard?.study.totalMinutes ?? 0)}</strong><small>de tempo de foco</small></p></div>
          <div className="activity-item"><span className="activity-icon tertiary">◉</span><p><strong>{dashboard?.subjectsCount ?? 0} disciplinas</strong><small>em acompanhamento</small></p></div>
        </aside>
      </section>

      <section className="metrics-grid" aria-label="Indicadores acadêmicos">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</section>
      <section className="tasks-section" aria-label="Tarefas recentes">
        <div className="section-heading"><div><p className="eyebrow">Próximos passos</p><h2>Tarefas em andamento</h2></div><span className="section-count">{pendingTasks.length} abertas</span></div>
        {pendingTasks.length === 0 ? <p className="empty-state">Nenhuma tarefa pendente</p> : <div className="tasks-grid">{pendingTasks.slice(0, 6).map((task) => <TaskCard key={task.id} id={task.id} title={task.title} description={task.description} subjectName={task.subject.name} dueDate={task.dueDate} priority={task.priority} status={task.status} onComplete={completeTask} />)}</div>}
      </section>
    </main>
  );
}
