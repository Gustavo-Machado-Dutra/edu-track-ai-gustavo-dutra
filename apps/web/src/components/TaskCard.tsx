import type { TaskPriority, TaskStatus } from '../types';

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  subjectName: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  onComplete?: (id: string) => void;
  onEdit?: () => void;
  onStatusChange?: (id: string, status: TaskStatus) => void;
  onHistory?: () => void;
  onDelete?: () => void;
  isUpdating?: boolean;
}

const priorityLabels: Record<TaskPriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

const statusLabels: Record<TaskStatus, string> = {
  TODO: 'Pendente',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
};

export function TaskCard({
  id,
  title,
  description,
  subjectName,
  dueDate,
  priority,
  status,
  onComplete,
  onEdit,
  onStatusChange,
  onHistory,
  onDelete,
  isUpdating = false,
}: TaskCardProps) {
  const isOverdue = Boolean(
    dueDate && new Date(dueDate) < new Date() && status !== 'COMPLETED',
  );
  const canChangeStatus = status !== 'COMPLETED' && status !== 'CANCELLED';

  return (
    <article className={`task-card ${isOverdue ? 'task-overdue' : ''}`}>
      <div className="task-card-header">
        <span className="task-subject-name">{subjectName}</span>
        <span className={`task-priority priority-${priority.toLowerCase()}`}>
          {priorityLabels[priority]}
        </span>
      </div>

      <h3 className="task-title">{title}</h3>

      {description && <p className="task-description">{description}</p>}

      {dueDate && (
        <time className="task-due" dateTime={dueDate}>
          Prazo: {new Date(dueDate).toLocaleDateString('pt-BR')}
        </time>
      )}

      <footer className="task-card-footer">
        <span className="task-status">{statusLabels[status]}</span>
        <div className="task-actions">
          {onHistory && (
            <button type="button" className="task-action-btn" onClick={onHistory} disabled={isUpdating}>
              Histórico
            </button>
          )}
          {onEdit && (
            <button type="button" className="task-action-btn" onClick={onEdit} disabled={isUpdating}>
              Editar
            </button>
          )}
          {onDelete && (
            <button type="button" className="task-action-btn task-action-danger" onClick={onDelete} disabled={isUpdating}>
              Excluir
            </button>
          )}
          {canChangeStatus && onStatusChange && status === 'TODO' && (
            <button type="button" className="task-action-btn" onClick={() => onStatusChange(id, 'IN_PROGRESS')} disabled={isUpdating}>
              Iniciar
            </button>
          )}
          {canChangeStatus && onComplete && (
            <button type="button" className="task-complete-btn" onClick={() => onComplete(id)} disabled={isUpdating} aria-label={`Marcar ${title} como concluída`}>
              ✓
            </button>
          )}
          {canChangeStatus && onStatusChange && (
            <button type="button" className="task-action-btn task-action-danger" onClick={() => onStatusChange(id, 'CANCELLED')} disabled={isUpdating}>
              Cancelar
            </button>
          )}
          {!canChangeStatus && onStatusChange && (
            <button type="button" className="task-action-btn" onClick={() => onStatusChange(id, 'TODO')} disabled={isUpdating}>
              Reabrir
            </button>
          )}
        </div>
      </footer>
    </article>
  );
}

