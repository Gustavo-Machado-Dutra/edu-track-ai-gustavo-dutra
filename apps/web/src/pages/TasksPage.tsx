import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { TaskCard } from '../components/TaskCard';
import { useSubjects } from '../hooks/useSubjects';
import { useTasks } from '../hooks/useTasks';
import type { Task, TaskDifficulty, TaskHistory, TaskPriority, TaskStatus } from '../types';

const statusFilters: { value: TaskStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todas' },
  { value: 'TODO', label: 'Pendentes' },
  { value: 'IN_PROGRESS', label: 'Em andamento' },
  { value: 'COMPLETED', label: 'Concluídas' },
  { value: 'CANCELLED', label: 'Canceladas' },
];

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'URGENT', label: 'Urgente' },
];

const difficultyOptions: { value: TaskDifficulty; label: string }[] = [
  { value: 'EASY', label: 'Fácil' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HARD', label: 'Difícil' },
];

type TaskFormState = {
  subjectId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  dueDate: string;
  estimatedMinutes: string;
};

function emptyTaskForm(): TaskFormState {
  return {
    subjectId: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    difficulty: 'MEDIUM',
    dueDate: '',
    estimatedMinutes: '',
  };
}

function dateInputValue(value?: string) {
  return value ? new Date(value).toISOString().slice(0, 10) : '';
}

export function TasksPage() {
  const [filter, setFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [isCreating, setIsCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [historyTask, setHistoryTask] = useState<Task | null>(null);
  const [historyEntries, setHistoryEntries] = useState<TaskHistory[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [newTask, setNewTask] = useState<TaskFormState>(emptyTaskForm());
  const [editForm, setEditForm] = useState<TaskFormState>(emptyTaskForm());
  const { tasks, isLoading, error, refetch, createTask, updateTask, getTaskHistory, completeTask, deleteTask } = useTasks();
  const { subjects } = useSubjects();

  const filteredTasks = filter === 'ALL' ? tasks : tasks.filter((task) => task.status === filter);

  const resetCreateForm = () => {
    setNewTask(emptyTaskForm());
    setFormError('');
  };

  const openEdit = (task: Task) => {
    setIsCreating(false);
    setEditingTask(task);
    setEditForm({
      subjectId: task.subject.id,
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      difficulty: task.difficulty ?? 'MEDIUM',
      dueDate: dateInputValue(task.dueDate),
      estimatedMinutes: task.estimatedMinutes?.toString() ?? '',
    });
    setFormError('');
  };

  const closeEdit = () => {
    setEditingTask(null);
    setEditForm(emptyTaskForm());
    setFormError('');
  };

  const handleCreate = async () => {
    if (!newTask.subjectId || !newTask.title.trim()) {
      setFormError('Informe a disciplina e o título da tarefa.');
      return;
    }

    setIsSaving(true);
    setFormError('');
    const created = await createTask({
      subjectId: newTask.subjectId,
      title: newTask.title.trim(),
      description: newTask.description.trim() || undefined,
      priority: newTask.priority,
      difficulty: newTask.difficulty,
      dueDate: newTask.dueDate || undefined,
      estimatedMinutes: newTask.estimatedMinutes ? Number(newTask.estimatedMinutes) : undefined,
    });
    setIsSaving(false);

    if (created) {
      resetCreateForm();
      setIsCreating(false);
    }
  };

  const handleEdit = async () => {
    if (!editingTask || !editForm.title.trim()) {
      setFormError('Informe um título para a tarefa.');
      return;
    }

    setIsSaving(true);
    setFormError('');
    const updated = await updateTask(editingTask.id, {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      priority: editForm.priority,
      difficulty: editForm.difficulty,
      dueDate: editForm.dueDate || null,
      estimatedMinutes: editForm.estimatedMinutes ? Number(editForm.estimatedMinutes) : undefined,
    });
    setIsSaving(false);

    if (updated) closeEdit();
  };

  const handleHistory = async (task: Task) => {
    setHistoryTask(task);
    setIsHistoryLoading(true);
    const entries = await getTaskHistory(task.id);
    setHistoryEntries(entries ?? []);
    setIsHistoryLoading(false);
  };

  const formatHistoryStatus = (status?: TaskStatus) => {
    if (!status) return '—';
    return status === 'TODO' ? 'Pendente' : status === 'IN_PROGRESS' ? 'Em andamento' : status === 'COMPLETED' ? 'Concluída' : 'Cancelada';
  };

  const formatHistoryPriority = (priority?: TaskPriority) => {
    if (!priority) return '—';
    return priorityOptions.find((option) => option.value === priority)?.label ?? priority;
  };

  const formatHistoryDate = (date?: string) => date ? new Date(date).toLocaleDateString('pt-BR') : 'Sem prazo';
  const handleStatusChange = async (id: string, status: TaskStatus) => {
    if (status === 'CANCELLED' && !window.confirm('Cancelar esta tarefa?')) return;

    setUpdatingTaskId(id);
    await updateTask(id, { status });
    setUpdatingTaskId(null);
  };

  const handleComplete = async (id: string) => {
    setUpdatingTaskId(id);
    await completeTask(id);
    setUpdatingTaskId(null);
  };

  const handleDelete = async (task: Task) => {
    if (!window.confirm(`Excluir permanentemente a tarefa "${task.title}"? Esta ação não pode ser desfeita.`)) return;

    setUpdatingTaskId(task.id);
    const deleted = await deleteTask(task.id);
    setUpdatingTaskId(null);

    if (deleted) {
      if (editingTask?.id === task.id) closeEdit();
      if (historyTask?.id === task.id) {
        setHistoryTask(null);
        setHistoryEntries([]);
      }
    }
  };

  return (
    <main className="app-shell tasks-page">
      <header className="page-header">
        <h1>Tarefas</h1>
        <Button
          onClick={() => { closeEdit(); setIsCreating(true); }}
          disabled={isCreating || editingTask !== null || subjects.length === 0}
        >
          Nova tarefa
        </Button>
      </header>

      {subjects.length === 0 && !isLoading && (
        <p className="helper-message">Cadastre uma disciplina antes de criar tarefas.</p>
      )}

      {isCreating && (
        <Card className="create-task-card">
          <h2>Nova tarefa</h2>
          <div className="form-grid">
            <label className="select-field">
              <span>Disciplina</span>
              <select
                value={newTask.subjectId}
                onChange={(event) => setNewTask((task) => ({ ...task, subjectId: event.target.value }))}
              >
                <option value="">Selecione uma disciplina</option>
                {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
            </label>
            <Input
              label="Título"
              name="title"
              value={newTask.title}
              onChange={(event) => setNewTask((task) => ({ ...task, title: event.target.value }))}
              placeholder="Ex: Revisar capítulo 3"
            />
            <label className="text-area-field">
              <span>Descrição (opcional)</span>
              <textarea
                value={newTask.description}
                onChange={(event) => setNewTask((task) => ({ ...task, description: event.target.value }))}
                placeholder="Detalhes ou contexto para realizar a tarefa"
              />
            </label>
            <label className="select-field">
              <span>Prioridade</span>
              <select
                value={newTask.priority}
                onChange={(event) => setNewTask((task) => ({ ...task, priority: event.target.value as TaskPriority }))}
              >
                {priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="select-field">
              <span>Dificuldade</span>
              <select
                value={newTask.difficulty}
                onChange={(event) => setNewTask((task) => ({ ...task, difficulty: event.target.value as TaskDifficulty }))}
              >
                {difficultyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <Input
              label="Prazo (opcional)"
              name="dueDate"
              type="date"
              value={newTask.dueDate}
              onChange={(event) => setNewTask((task) => ({ ...task, dueDate: event.target.value }))}
            />
            <Input
              label="Estimativa em minutos"
              name="estimatedMinutes"
              type="number"
              min="1"
              value={newTask.estimatedMinutes}
              onChange={(event) => setNewTask((task) => ({ ...task, estimatedMinutes: event.target.value }))}
              placeholder="45"
            />
          </div>
          {formError && <p className="error-message">{formError}</p>}
          <div className="card-actions">
            <Button variant="ghost" onClick={() => { resetCreateForm(); setIsCreating(false); }}>Cancelar</Button>
            <Button onClick={handleCreate} isLoading={isSaving}>Salvar tarefa</Button>
          </div>
        </Card>
      )}

      {editingTask && (
        <Card className="create-task-card">
          <div className="edit-heading">
            <div>
              <p className="eyebrow">Atualização</p>
              <h2>Editar tarefa</h2>
            </div>
            <span className="task-subject-name">{editingTask.subject.name}</span>
          </div>
          <div className="form-grid">
            <Input
              label="Título"
              name="edit-title"
              value={editForm.title}
              onChange={(event) => setEditForm((task) => ({ ...task, title: event.target.value }))}
            />
            <label className="text-area-field">
              <span>Descrição (opcional)</span>
              <textarea
                value={editForm.description}
                onChange={(event) => setEditForm((task) => ({ ...task, description: event.target.value }))}
                placeholder="Detalhes ou contexto para realizar a tarefa"
              />
            </label>
            <Input
              label="Prazo (opcional)"
              name="edit-dueDate"
              type="date"
              value={editForm.dueDate}
              onChange={(event) => setEditForm((task) => ({ ...task, dueDate: event.target.value }))}
            />
            <label className="select-field">
              <span>Prioridade</span>
              <select
                value={editForm.priority}
                onChange={(event) => setEditForm((task) => ({ ...task, priority: event.target.value as TaskPriority }))}
              >
                {priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="select-field">
              <span>Dificuldade</span>
              <select
                value={editForm.difficulty}
                onChange={(event) => setEditForm((task) => ({ ...task, difficulty: event.target.value as TaskDifficulty }))}
              >
                {difficultyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <Input
              label="Estimativa em minutos"
              name="edit-estimatedMinutes"
              type="number"
              min="1"
              value={editForm.estimatedMinutes}
              onChange={(event) => setEditForm((task) => ({ ...task, estimatedMinutes: event.target.value }))}
            />
          </div>
          {formError && <p className="error-message">{formError}</p>}
          <div className="card-actions">
            <Button variant="ghost" onClick={closeEdit}>Cancelar</Button>
            <Button onClick={handleEdit} isLoading={isSaving}>Salvar alterações</Button>
          </div>
        </Card>
      )}

      <nav className="filters-nav" aria-label="Filtros de tarefas">
        {statusFilters.map((statusFilter) => (
          <button
            key={statusFilter.value}
            className={`filter-btn ${filter === statusFilter.value ? 'active' : ''}`}
            onClick={() => setFilter(statusFilter.value)}
          >
            {statusFilter.label}
          </button>
        ))}
      </nav>

      {error && <p className="error-message">{error}</p>}

      {isLoading ? (
        <p className="loading-text">Carregando tarefas...</p>
      ) : filteredTasks.length === 0 ? (
        <p className="empty-state">Nenhuma tarefa encontrada</p>
      ) : (
        <div className="tasks-list">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              id={task.id}
              title={task.title}
              description={task.description}
              subjectName={task.subject.name}
              dueDate={task.dueDate}
              priority={task.priority}
              status={task.status}
              onComplete={handleComplete}
              onEdit={() => openEdit(task)}
              onStatusChange={handleStatusChange}
              onHistory={() => handleHistory(task)}
              onDelete={() => handleDelete(task)}
              isUpdating={updatingTaskId === task.id}
            />
          ))}
        </div>
      )}


      {historyTask && (
        <Card className="task-history-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Auditoria</p>
              <h2>Histórico da tarefa</h2>
              <p className="history-task-title">{historyTask.title}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setHistoryTask(null)}>Fechar</Button>
          </div>
          {isHistoryLoading ? (
            <p className="loading-text">Carregando histórico...</p>
          ) : historyEntries.length === 0 ? (
            <p className="empty-state">Nenhuma alteração registrada</p>
          ) : (
            <div className="history-list">
              {historyEntries.map((entry) => (
                <article className="history-item" key={entry.id}>
                  <time dateTime={entry.changedAt}>{new Date(entry.changedAt).toLocaleString('pt-BR')}</time>
                  {entry.fromStatus || entry.toStatus ? <p>Status: {formatHistoryStatus(entry.fromStatus)} → {formatHistoryStatus(entry.toStatus)}</p> : null}
                  {entry.fromPriority || entry.toPriority ? <p>Prioridade: {formatHistoryPriority(entry.fromPriority)} → {formatHistoryPriority(entry.toPriority)}</p> : null}
                  {(entry.fromDueDate || entry.toDueDate || (!entry.fromStatus && !entry.toStatus && !entry.fromPriority && !entry.toPriority)) ? <p>Prazo: {formatHistoryDate(entry.fromDueDate)} → {formatHistoryDate(entry.toDueDate)}</p> : null}
                </article>
              ))}
            </div>
          )}
        </Card>
      )}
      <Button variant="ghost" onClick={() => refetch()}>Atualizar lista</Button>
    </main>
  );
}


