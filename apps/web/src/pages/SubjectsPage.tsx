import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { SubjectCard } from '../components/SubjectCard';
import { useSubjects } from '../hooks/useSubjects';
import { useTasks } from '../hooks/useTasks';
import type { Subject } from '../types';

export function SubjectsPage() {
  const { subjects, isLoading, error, createSubject, updateSubject, deleteSubject } = useSubjects();
  const { tasks, isLoading: isLoadingTasks } = useTasks();
  const [isCreating, setIsCreating] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', professor: '', workloadHours: '', description: '', startDate: '', endDate: '' });
  const [editSubject, setEditSubject] = useState({ name: '', professor: '', workloadHours: '', description: '', startDate: '', endDate: '' });
  const [formError, setFormError] = useState('');

  const handleCreate = async () => {
    if (!newSubject.name.trim()) {
      setFormError('Informe o nome da disciplina.');
      return;
    }

    if (newSubject.startDate && newSubject.endDate && newSubject.endDate < newSubject.startDate) {
      setFormError('A data final deve ser posterior à data inicial.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    const result = await createSubject({
      name: newSubject.name.trim(),
      professor: newSubject.professor.trim() || undefined,
      workloadHours: newSubject.workloadHours ? Number(newSubject.workloadHours) : undefined,
      description: newSubject.description.trim() || undefined,
      startDate: newSubject.startDate || undefined,
      endDate: newSubject.endDate || undefined,
    });
    setIsSaving(false);

    if (result) {
      setNewSubject({ name: '', professor: '', workloadHours: '', description: '', startDate: '', endDate: '' });
      setFormError('');
      setIsCreating(false);
    }
  };

  const openEdit = (subject: Subject) => {
    setIsCreating(false);
    setEditingSubject(subject);
    setEditSubject({ name: subject.name, professor: subject.professor ?? '', workloadHours: subject.workloadHours ?? '', description: subject.description ?? '', startDate: subject.startDate?.slice(0, 10) ?? '', endDate: subject.endDate?.slice(0, 10) ?? '' });
  };

  const closeEdit = () => {
    setEditingSubject(null);
    setEditSubject({ name: '', professor: '', workloadHours: '', description: '', startDate: '', endDate: '' });
    setFormError('');
  };

  const handleUpdate = async () => {
    if (!editingSubject || !editSubject.name.trim()) {
      setFormError('Informe o nome da disciplina.');
      return;
    }

    if (editSubject.startDate && editSubject.endDate && editSubject.endDate < editSubject.startDate) {
      setFormError('A data final deve ser posterior à data inicial.');
      return;
    }

    setIsSaving(true);
    setFormError('');
    const updated = await updateSubject(editingSubject.id, {
      name: editSubject.name.trim(),
      professor: editSubject.professor.trim() || undefined,
      workloadHours: editSubject.workloadHours ? Number(editSubject.workloadHours) : undefined,
      description: editSubject.description.trim() || undefined,
      startDate: editSubject.startDate || null,
      endDate: editSubject.endDate || null,
    });
    setIsSaving(false);

    if (updated) closeEdit();
  };

  const handleDelete = async (subject: Subject) => {
    const confirmed = window.confirm(
      `Excluir a disciplina "${subject.name}"? Todas as tarefas e sessões associadas também serão removidas. Esta ação não pode ser desfeita.`,
    );
    if (!confirmed) return;

    setIsSaving(true);
    const deleted = await deleteSubject(subject.id);
    setIsSaving(false);

    if (deleted && editingSubject?.id === subject.id) closeEdit();
  };

  return (
    <main className="app-shell subjects-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Mapa acadêmico</p>
          <h1>Disciplinas</h1>
          <p className="page-description">Tenha uma visão clara de cada frente da sua jornada.</p>
        </div>
        <div className="page-header-actions">
          <span className="section-count">{subjects.length} {subjects.length === 1 ? 'ativa' : 'ativas'}</span>
          <Button onClick={() => { closeEdit(); setIsCreating(true); }} disabled={isCreating || editingSubject !== null}>
          <span aria-hidden="true">＋</span> Nova disciplina
          </Button>
        </div>
      </header>

      {error && <p className="error-message">{error}</p>}

      {isCreating && (
        <Card className="create-subject-card">
          <div className="form-card-heading"><div><p className="eyebrow">Novo registro</p><h2>Nova disciplina</h2></div><span className="form-card-step">01 / 01</span></div>
          <div className="form-grid">
            <Input label="Nome" name="name" value={newSubject.name} onChange={(e) => setNewSubject((s) => ({ ...s, name: e.target.value }))} placeholder="Ex: Cálculo I" />
            <Input label="Professor (opcional)" name="professor" value={newSubject.professor} onChange={(e) => setNewSubject((s) => ({ ...s, professor: e.target.value }))} placeholder="Ex: Ana Silva" />
            <Input label="Carga horária (h)" name="workloadHours" type="number" min="0" step="0.5" value={newSubject.workloadHours} onChange={(e) => setNewSubject((s) => ({ ...s, workloadHours: e.target.value }))} placeholder="60" />
            <Input label="Início (opcional)" name="startDate" type="date" value={newSubject.startDate} onChange={(e) => setNewSubject((s) => ({ ...s, startDate: e.target.value }))} />
            <Input label="Fim (opcional)" name="endDate" type="date" value={newSubject.endDate} onChange={(e) => setNewSubject((s) => ({ ...s, endDate: e.target.value }))} />
            <label className="text-area-field"><span>Descrição (opcional)</span><textarea value={newSubject.description} onChange={(e) => setNewSubject((s) => ({ ...s, description: e.target.value }))} placeholder="Contexto ou objetivo da disciplina" /></label>
          </div>
          <div className="card-actions">
            <Button variant="ghost" onClick={() => setIsCreating(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Salvar</Button>
          </div>
          {formError && <p className="error-message">{formError}</p>}
        </Card>
      )}

      {editingSubject && (
        <Card className="create-subject-card">
          <div className="form-card-heading"><div><p className="eyebrow">Atualização</p><h2>Editar disciplina</h2></div><span className="form-card-step">EDITAR</span></div>
          <div className="form-grid">
            <Input label="Nome" name="edit-name" value={editSubject.name} onChange={(event) => setEditSubject((subject) => ({ ...subject, name: event.target.value }))} disabled={isSaving} />
            <Input label="Professor (opcional)" name="edit-professor" value={editSubject.professor} onChange={(event) => setEditSubject((subject) => ({ ...subject, professor: event.target.value }))} disabled={isSaving} />
            <Input label="Carga horária (h)" name="edit-workloadHours" type="number" min="0" step="0.5" value={editSubject.workloadHours} onChange={(event) => setEditSubject((subject) => ({ ...subject, workloadHours: event.target.value }))} disabled={isSaving} />
            <Input label="Início (opcional)" name="edit-startDate" type="date" value={editSubject.startDate} onChange={(event) => setEditSubject((subject) => ({ ...subject, startDate: event.target.value }))} disabled={isSaving} />
            <Input label="Fim (opcional)" name="edit-endDate" type="date" value={editSubject.endDate} onChange={(event) => setEditSubject((subject) => ({ ...subject, endDate: event.target.value }))} disabled={isSaving} />
            <label className="text-area-field"><span>Descrição (opcional)</span><textarea value={editSubject.description} onChange={(event) => setEditSubject((subject) => ({ ...subject, description: event.target.value }))} disabled={isSaving} /></label>
          </div>
          <div className="card-actions">
            <Button variant="ghost" onClick={closeEdit} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} isLoading={isSaving}>
              Salvar alterações
            </Button>
          </div>
          {formError && <p className="error-message">{formError}</p>}
        </Card>
      )}

      {isLoading || isLoadingTasks ? (
        <p className="loading-text">Carregando disciplinas...</p>
      ) : subjects.length === 0 ? (
        <Card className="empty-subjects-card" padding="lg">
          <div className="empty-subjects-icon" aria-hidden="true">＋</div>
          <div>
            <p className="eyebrow">Primeiro passo</p>
            <h2>Seu mapa acadêmico começa aqui.</h2>
            <p>Cadastre uma disciplina para organizar tarefas e acompanhar seu progresso em um só lugar.</p>
          </div>
          <Button onClick={() => { closeEdit(); setIsCreating(true); }}>Cadastrar disciplina</Button>
        </Card>
      ) : (
        <div className="subjects-grid">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              tasks={tasks.filter((task) => task.subject.id === subject.id)}
              isSaving={isSaving}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

    </main>
  );
}
