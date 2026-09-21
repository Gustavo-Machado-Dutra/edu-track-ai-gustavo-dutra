import { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import type { Page } from '../components/Sidebar';

type Props = { onNavigate: (page: Page) => void };

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function CalendarPage({ onNavigate }: Props) {
  const { tasks, isLoading, error } = useTasks();
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState(() => localDateKey(new Date()));
  const offset = (month.getDay() + 6) % 7;
  const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((offset + dayCount) / 7) * 7 }, (_, index) => index - offset + 1);
  const tasksByDay = new Map<string, typeof tasks>();
  for (const task of tasks) {
    if (!task.dueDate) continue;
    const key = task.dueDate.slice(0, 10);
    tasksByDay.set(key, [...(tasksByDay.get(key) ?? []), task]);
  }
  const selectedTasks = tasksByDay.get(selected) ?? [];
  const shiftMonth = (amount: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + amount, 1));

  return <main className="app-shell v2-page calendar-page">
    <header className="page-header"><div><p className="eyebrow">ORGANIZE SEU TEMPO</p><h1>Calendário</h1><p className="page-description">Veja os prazos das tarefas cadastradas.</p></div><button type="button" className="btn btn-primary" onClick={() => onNavigate('tasks')}>＋ Nova tarefa</button></header>
    {error && <p className="error-message" role="alert">{error}</p>}
    <section className="v2-panel calendar-panel" aria-label="Calendário de tarefas">
      <div className="calendar-month"><h2>{month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h2><div><button type="button" onClick={() => shiftMonth(-1)} aria-label="Mês anterior">‹</button><button type="button" onClick={() => shiftMonth(1)} aria-label="Próximo mês">›</button></div></div>
      <div className="calendar-grid">{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => <strong key={day}>{day}</strong>)}{cells.map((day, index) => {
        if (day < 1 || day > dayCount) return <span className="calendar-blank" key={`blank-${index}`} />;
        const key = localDateKey(new Date(month.getFullYear(), month.getMonth(), day));
        const count = tasksByDay.get(key)?.length ?? 0;
        return <button type="button" key={key} className={`calendar-day ${selected === key ? 'selected' : ''}`} onClick={() => setSelected(key)} aria-label={`${day} de ${month.toLocaleDateString('pt-BR', { month: 'long' })}, ${count} tarefas`}><span>{day}</span>{count > 0 && <i aria-hidden="true" />}</button>;
      })}</div>
    </section>
    <section className="v2-panel calendar-agenda"><h2>{new Date(`${selected}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</h2>{isLoading ? <p>Carregando tarefas...</p> : selectedTasks.length === 0 ? <p>Nenhuma tarefa com prazo neste dia.</p> : <ul>{selectedTasks.map((task) => <li key={task.id}><span className={task.status === 'COMPLETED' ? 'done' : ''}>{task.title}</span><small>{task.subject.name}</small></li>)}</ul>}</section>
  </main>;
}
