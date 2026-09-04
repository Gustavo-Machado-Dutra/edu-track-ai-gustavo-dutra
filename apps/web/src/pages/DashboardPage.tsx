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
  const overdueTasks = pendingTasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date());
  const openTasks = (dashboard?.tasks.byStatus.TODO ?? pendingTasks.length) + (dashboard?.tasks.byStatus.IN_PROGRESS ?? 0);

  const metrics = [
    { label: 'Tarefas abertas', value: String(openTasks), accent: 'primary' as const },
    { label: 'Tempo estudado', value: formatStudyTime(dashboard?.study.totalMinutes ?? 0), accent: 'secondary' as const },
    { label: 'Entregas crÃ­ticas', value: String(dashboard?.tasks.overdue ?? overdueTasks.length), accent: 'tertiary' as const },
  ];

  if (loadingTasks || loadingDashboard) {
    return (
      <main className="app-shell">
        <p className="loading-text">Carregando dashboard...</p>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">VisÃ£o geral acadÃªmica</p>
      </header>

      {dashboardError && <p className="error-message">{dashboardError}</p>}

      <section className="metrics-grid" aria-label="Indicadores acadÃªmicos">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="tasks-section" aria-label="Tarefas recentes">
        <h2>Tarefas recentes</h2>
        {pendingTasks.length === 0 ? (
          <p className="empty-state">Nenhuma tarefa pendente</p>
        ) : (
          <div className="tasks-grid">
            {pendingTasks.slice(0, 6).map((task) => (
              <TaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                description={task.description}
                subjectName={task.subject.name}
                dueDate={task.dueDate}
                priority={task.priority}
                status={task.status}
                onComplete={completeTask}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}



