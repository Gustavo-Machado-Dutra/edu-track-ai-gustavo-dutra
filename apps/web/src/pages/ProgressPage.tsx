import { useDashboard } from '../hooks/useDashboard';
import { useTasks } from '../hooks/useTasks';
import { useSubjects } from '../hooks/useSubjects';

export function ProgressPage() {
  const { dashboard, isLoading: loadingDashboard, error: dashboardError } = useDashboard();
  const { tasks, isLoading: loadingTasks, error: tasksError } = useTasks();
  const { subjects, error: subjectsError } = useSubjects();
  const isLoading = loadingDashboard || loadingTasks;
  const completed = tasks.filter((task) => task.status === 'COMPLETED').length;

  return <main className="app-shell v2-page progress-page">
    <header className="page-header"><div><p className="eyebrow">CADA PASSO CONTA</p><h1>Meu progresso</h1><p className="page-description">Acompanhe o que foi registrado nos seus estudos.</p></div></header>
    {(dashboardError || tasksError || subjectsError) && <p className="error-message" role="alert">{dashboardError || tasksError || subjectsError}</p>}
    <section className="progress-metrics" aria-label="Métricas de progresso">
      <article className="v2-panel"><span>Tarefas concluídas</span><strong>{isLoading ? '…' : completed}</strong><small>de {tasks.length} cadastradas</small></article>
      <article className="v2-panel"><span>Tempo de estudo</span><strong>{loadingDashboard ? '…' : `${Math.floor((dashboard?.study.totalMinutes ?? 0) / 60)}h ${String((dashboard?.study.totalMinutes ?? 0) % 60).padStart(2, '0')}min`}</strong><small>{dashboard?.study.sessionsCount ?? 0} sessões registradas</small></article>
      <article className="v2-panel"><span>Taxa de conclusão</span><strong>{loadingDashboard ? '…' : `${dashboard?.tasks.completionRate ?? 0}%`}</strong><small>das tarefas cadastradas</small></article>
    </section>
    <section className="v2-panel progress-subjects"><h2>Por disciplina</h2>{subjects.length === 0 ? <p>Nenhuma disciplina cadastrada.</p> : <div>{subjects.map((subject) => { const related = tasks.filter((task) => task.subject.id === subject.id); const done = related.filter((task) => task.status === 'COMPLETED').length; const percent = related.length ? Math.round(done / related.length * 100) : 0; return <article key={subject.id}><div><strong>{subject.name}</strong><span>{done} de {related.length} tarefas · {percent}%</span></div><div className="progress-track" role="progressbar" aria-label={`Progresso em ${subject.name}`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percent}%` }} /></div></article>; })}</div>}</section>
  </main>;
}
