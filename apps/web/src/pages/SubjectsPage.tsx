import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { useSubjects } from '../hooks/useSubjects';
import type { Subject } from '../types';

export function SubjectsPage() {
  const { subjects, isLoading, error, createSubject, updateSubject, deleteSubject } = useSubjects();
  const [isCreating, setIsCreating] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', professor: '' });
  const [editSubject, setEditSubject] = useState({ name: '', professor: '' });

  const handleCreate = async () => {
    if (!newSubject.name.trim()) return;

    const result = await createSubject({
      name: newSubject.name.trim(),
      professor: newSubject.professor.trim() || undefined,
    });

    if (result) {
      setNewSubject({ name: '', professor: '' });
      setIsCreating(false);
    }
  };

  const openEdit = (subject: Subject) => {
    setIsCreating(false);
    setEditingSubject(subject);
    setEditSubject({ name: subject.name, professor: subject.professor ?? '' });
  };

  const closeEdit = () => {
    setEditingSubject(null);
    setEditSubject({ name: '', professor: '' });
  };

  const handleUpdate = async () => {
    if (!editingSubject || !editSubject.name.trim()) return;

    setIsSaving(true);
    const updated = await updateSubject(editingSubject.id, {
      name: editSubject.name.trim(),
      professor: editSubject.professor.trim() || undefined,
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
        <h1>Disciplinas</h1>
        <Button onClick={() => { closeEdit(); setIsCreating(true); }} disabled={isCreating || editingSubject !== null}>
          Nova disciplina
        </Button>
      </header>

      {error && <p className="error-message">{error}</p>}

      {isCreating && (
        <Card className="create-subject-card">
          <h2>Nova disciplina</h2>
          <Input
            label="Nome"
            name="name"
            value={newSubject.name}
            onChange={(e) => setNewSubject((s) => ({ ...s, name: e.target.value }))}
            placeholder="Ex: Cálculo I"
          />
          <Input
            label="Professor (opcional)"
            name="professor"
            value={newSubject.professor}
            onChange={(e) => setNewSubject((s) => ({ ...s, professor: e.target.value }))}
            placeholder="Ex: Ana Silva"
          />
          <div className="card-actions">
            <Button variant="ghost" onClick={() => setIsCreating(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Salvar</Button>
          </div>
        </Card>
      )}

      {editingSubject && (
        <Card className="create-subject-card">
          <h2>Editar disciplina</h2>
          <Input
            label="Nome"
            name="edit-name"
            value={editSubject.name}
            onChange={(event) => setEditSubject((subject) => ({ ...subject, name: event.target.value }))}
            disabled={isSaving}
          />
          <Input
            label="Professor (opcional)"
            name="edit-professor"
            value={editSubject.professor}
            onChange={(event) => setEditSubject((subject) => ({ ...subject, professor: event.target.value }))}
            disabled={isSaving}
          />
          <div className="card-actions">
            <Button variant="ghost" onClick={closeEdit} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} isLoading={isSaving}>
              Salvar alterações
            </Button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <p className="loading-text">Carregando disciplinas...</p>
      ) : (
        <div className="subjects-grid">
          {subjects.map((subject) => (
            <Card key={subject.id} variant="outlined" padding="sm">
              <div className="subject-item">
                <div>
                  <h3>{subject.name}</h3>
                  {subject.professor && <span className="subject-code">{subject.professor}</span>}
                </div>
                <div className="subject-actions">
                  <button type="button" className="task-action-btn" onClick={() => openEdit(subject)} disabled={isSaving}>
                    Editar
                  </button>
                  <button type="button" className="task-action-btn task-action-danger" onClick={() => handleDelete(subject)} disabled={isSaving}>
                    Excluir
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && subjects.length === 0 && (
        <p className="empty-state">Nenhuma disciplina cadastrada</p>
      )}
    </main>
  );
}
