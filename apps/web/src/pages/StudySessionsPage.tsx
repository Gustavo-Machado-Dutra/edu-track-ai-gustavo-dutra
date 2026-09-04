import { useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { useStudySessions } from '../hooks/useStudySessions';
import { useSubjects } from '../hooks/useSubjects';
import { useTasks } from '../hooks/useTasks';

function getLocalDateTime() {
  const now = new Date();
  const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localNow.toISOString().slice(0, 16);
}

type SessionMode = 'record' | 'start';

export function StudySessionsPage() {
  const { sessions, isLoading, error, refetch, createSession, endSession } = useStudySessions();
  const { subjects } = useSubjects();
  const { tasks } = useTasks();
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [endingSessionId, setEndingSessionId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [sessionMode, setSessionMode] = useState<SessionMode>('record');
  const [newSession, setNewSession] = useState({
    subjectId: '',
    taskId: '',
    startedAt: getLocalDateTime(),
    durationMinutes: '30',
  });

  const availableTasks = useMemo(
    () => tasks.filter((task) => task.subject.id === newSession.subjectId && task.status !== 'CANCELLED'),
    [newSession.subjectId, tasks],
  );
  const activeSessions = sessions.filter((session) => !session.endedAt);
  const completedSessions = sessions.filter((session) => session.endedAt);

  const resetForm = () => {
    setNewSession({
      subjectId: '',
      taskId: '',
      startedAt: getLocalDateTime(),
      durationMinutes: '30',
    });
    setFormError('');
  };

  const handleCreate = async () => {
    const durationMinutes = Number(newSession.durationMinutes);

    if (!newSession.subjectId) {
      setFormError('Informe a disciplina.');
      return;
    }

    if (sessionMode === 'record' && (!newSession.startedAt || !durationMinutes || durationMinutes < 1)) {
      setFormError('Informe a disciplina, o início e uma duração válida.');
      return;
    }

    setIsSaving(true);
    setFormError('');
    const created = await createSession({
      subjectId: newSession.subjectId,
      taskId: newSession.taskId || undefined,
      startedAt: sessionMode === 'start' ? new Date().toISOString() : new Date(newSession.startedAt).toISOString(),
      durationSeconds: sessionMode === 'record' ? durationMinutes * 60 : undefined,
    });
    setIsSaving(false);

    if (created) {
      resetForm();
      setIsCreating(false);
    }
  };

  const handleEnd = async (id: string) => {
    setEndingSessionId(id);
    await endSession(id);
    setEndingSessionId(null);
  };

  return (
    <main className="app-shell sessions-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Foco e consistência</p>
          <h1>Sessões de estudo</h1>
        </div>
        <Button onClick={() => { resetForm(); setSessionMode('record'); setIsCreating(true); }} disabled={isCreating || subjects.length === 0}>
          Registrar sessão
        </Button>
      </header>

      {subjects.length === 0 && !isLoading && (
        <p className="helper-message">Cadastre uma disciplina antes de registrar sessões.</p>
      )}

      {isCreating && (
        <Card className="create-session-card">
          <div className="session-mode" aria-label="Tipo de sessão">
            <button
              type="button"
              className={sessionMode === 'record' ? 'active' : ''}
              onClick={() => setSessionMode('record')}
              disabled={isSaving}
            >
              Registrar manualmente
            </button>
            <button
              type="button"
              className={sessionMode === 'start' ? 'active' : ''}
              onClick={() => setSessionMode('start')}
              disabled={isSaving}
            >
              Iniciar agora
            </button>
          </div>
          <h2>{sessionMode === 'start' ? 'Iniciar sessão de estudo' : 'Registrar sessão'}</h2>
          <div className="form-grid">
            <label className="select-field">
              <span>Disciplina</span>
              <select
                value={newSession.subjectId}
                onChange={(event) => setNewSession((session) => ({ ...session, subjectId: event.target.value, taskId: '' }))}
              >
                <option value="">Selecione uma disciplina</option>
                {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
            </label>
            <label className="select-field">
              <span>Tarefa (opcional)</span>
              <select
                value={newSession.taskId}
                onChange={(event) => setNewSession((session) => ({ ...session, taskId: event.target.value }))}
                disabled={!newSession.subjectId}
              >
                <option value="">Somente a disciplina</option>
                {availableTasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
              </select>
            </label>
            {sessionMode === 'record' && (
              <>
                <Input
                  label="Início"
                  name="startedAt"
                  type="datetime-local"
                  value={newSession.startedAt}
                  onChange={(event) => setNewSession((session) => ({ ...session, startedAt: event.target.value }))}
                />
                <Input
                  label="Duração em minutos"
                  name="durationMinutes"
                  type="number"
                  min="1"
                  value={newSession.durationMinutes}
                  onChange={(event) => setNewSession((session) => ({ ...session, durationMinutes: event.target.value }))}
                />
              </>
            )}
          </div>
          {formError && <p className="error-message">{formError}</p>}
          <div className="card-actions">
            <Button variant="ghost" onClick={() => { resetForm(); setIsCreating(false); }}>Cancelar</Button>
            <Button onClick={handleCreate} isLoading={isSaving}>{sessionMode === 'start' ? 'Iniciar sessão' : 'Salvar sessão'}</Button>
          </div>
        </Card>
      )}

      {error && <p className="error-message">{error}</p>}

      {activeSessions.length > 0 && (
        <section className="sessions-section" aria-label="Sessões em andamento">
          <h2>Sessões em andamento</h2>
          <div className="sessions-list">
            {activeSessions.map((session) => (
              <Card key={session.id} variant="outlined" padding="sm">
                <article className="session-item">
                  <div>
                    <h3>{session.subject.name}</h3>
                    {session.task && <p>{session.task.title}</p>}
                  </div>
                  <div className="session-meta">
                    <strong className="session-active-label">Em andamento</strong>
                    <Button size="sm" onClick={() => handleEnd(session.id)} isLoading={endingSessionId === session.id}>
                      Encerrar agora
                    </Button>
                  </div>
                </article>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="sessions-section" aria-label="Histórico de sessões">
        <div className="section-heading">
          <h2>Histórico recente</h2>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>Atualizar</Button>
        </div>

        {isLoading ? (
          <p className="loading-text">Carregando sessões...</p>
        ) : completedSessions.length === 0 ? (
          <p className="empty-state">Nenhuma sessão registrada</p>
        ) : (
          <div className="sessions-list">
            {completedSessions.map((session) => (
              <Card key={session.id} variant="outlined" padding="sm">
                <article className="session-item">
                  <div>
                    <h3>{session.subject.name}</h3>
                    {session.task && <p>{session.task.title}</p>}
                  </div>
                  <div className="session-meta">
                    <strong>{Math.round((session.durationSeconds ?? 0) / 60)} min</strong>
                    <time dateTime={session.startedAt}>
                      {new Date(session.startedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </time>
                  </div>
                </article>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
