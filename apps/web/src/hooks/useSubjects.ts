import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../services/api';
import type { Subject, ApiResponse } from '../types';

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data: ApiResponse<Subject[]> = await apiRequest('/subjects');

      if (data.error) {
        setError(data.error.message);
      } else {
        setSubjects(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar disciplinas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSubject = useCallback(async (subject: { name: string; professor?: string; workloadHours?: number; description?: string; startDate?: string; endDate?: string }) => {
    try {
      const data: ApiResponse<Subject> = await apiRequest('/subjects', {
        method: 'POST',
        body: JSON.stringify(subject),
      });

      if (!data.error) {
        setSubjects((prev) => [...prev, data.data]);
      } else {
        setError(data.error.message);
      }

      return data.error ? null : data.data;
    } catch {
      setError('Erro ao criar disciplina');
      return null;
    }
  }, []);

  const updateSubject = useCallback(async (id: string, subject: { name: string; professor?: string; workloadHours?: number; description?: string; startDate?: string | null; endDate?: string | null }) => {
    try {
      const data: ApiResponse<Subject> = await apiRequest(`/subjects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(subject),
      });

      if (data.error) {
        setError(data.error.message);
        return null;
      }

      setSubjects((current) => current.map((item) => (item.id === id ? data.data : item)));
      return data.data;
    } catch {
      setError('Erro ao atualizar disciplina');
      return null;
    }
  }, []);

  const deleteSubject = useCallback(async (id: string) => {
    try {
      const data: ApiResponse<{ id: string; deleted: boolean }> = await apiRequest(`/subjects/${id}`, {
        method: 'DELETE',
      });

      if (data.error) {
        setError(data.error.message);
        return false;
      }

      setSubjects((current) => current.filter((subject) => subject.id !== id));
      return true;
    } catch {
      setError('Erro ao excluir disciplina');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  return { subjects, isLoading, error, refetch: fetchSubjects, createSubject, updateSubject, deleteSubject };
}
