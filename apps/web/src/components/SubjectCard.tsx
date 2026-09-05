import { Card } from './Card';
import type { Subject, Task } from '../types';

interface SubjectCardProps {
  subject: Subject;
  tasks: Task[];
  isSaving: boolean;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}

function getProgress(tasks: Task[]) {
  if (tasks.length === 0) return 0;
  return Math.round((tasks.filter((task) => task.status === 'COMPLETED').length / tasks.length) * 100);
}

  function formatPeriod(startDate?: string, endDate?: string) {
    if (!startDate && !endDate) return null;
    const formatDate = (date: string) => new Date(`${date.slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    if (startDate && endDate) return `${formatDate(startDate)} – ${formatDate(endDate)}`;
    return startDate ? `desde ${formatDate(startDate)}` : `até ${formatDate(endDate as string)}`;
  }

export function SubjectCard({ subject, tasks, isSaving, onEdit, onDelete }: SubjectCardProps) {
  const progress = getProgress(tasks);
  const circumference = 2 * Math.PI * 27;
  const completedTasks = tasks.filter((task) => task.status === 'COMPLETED').length;

  return (
    <Card variant="outlined" padding="sm" className="subject-card">
      <article className="subject-item">
        <div className="subject-card-topline">
          <span className="subject-badge">DISCIPLINA</span>
          <div className="subject-progress" aria-label={`${progress}% de tarefas concluídas`}>
            <svg viewBox="0 0 64 64" role="img" aria-hidden="true">
              <circle className="subject-progress-track" cx="32" cy="32" r="27" />
              <circle
                className="subject-progress-value"
                cx="32"
                cy="32"
                r="27"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (circumference * progress) / 100}
              />
            </svg>
            <strong>{progress}%</strong>
          </div>
        </div>

        <div className="subject-card-content">
          <h3>{subject.name}</h3>
          {subject.professor && <p className="subject-meta"><span aria-hidden="true">◈</span>{subject.professor}</p>}
          {subject.description && <p className="subject-description">{subject.description}</p>}
          {subject.workloadHours && <span className="subject-workload">{subject.workloadHours}h de carga prevista</span>}
          {formatPeriod(subject.startDate, subject.endDate) && <span className="subject-period">{formatPeriod(subject.startDate, subject.endDate)}</span>}
        </div>

        <div className="subject-card-footer">
          <span className="subject-task-count">{completedTasks}/{tasks.length} tarefas concluídas</span>
          <div className="subject-actions">
            <button type="button" className="task-action-btn" onClick={() => onEdit(subject)} disabled={isSaving}>Editar</button>
            <button type="button" className="task-action-btn task-action-danger" onClick={() => onDelete(subject)} disabled={isSaving}>Excluir</button>
          </div>
        </div>
      </article>
    </Card>
  );
}