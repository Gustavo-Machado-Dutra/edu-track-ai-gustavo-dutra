import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../services/api';
import type { StudySession, ApiResponse } from '../types';

export interface CreateStudySessionInput {
  subjectId: string;
  taskId?: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
}

export function useStudySessions() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data: ApiResponse<StudySession[]> = await apiRequest('/study-sessions');

      if (data.error) {
        setError(data.error.message);
      } else {
        setSessions(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar sessões');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSession = useCallback(async (session: CreateStudySessionInput) => {
    try {
      const data: ApiResponse<StudySession> = await apiRequest('/study-sessions', {
        method: 'POST',
        body: JSON.stringify(session),
      });

      if (data.error) {
        setError(data.error.message);
        return null;
      }

      await fetchSessions();
      return data.data;
    } catch {
      setError('Erro ao registrar sessão');
      return null;
    }
  }, [fetchSessions]);

  const endSession = useCallback(async (id: string) => {
    try {
      const data: ApiResponse<StudySession> = await apiRequest(`/study-sessions/${id}/end`, {
        method: 'POST',
      });

      if (data.error) {
        setError(data.error.message);
        return null;
      }

      await fetchSessions();
      return data.data;
    } catch {
      setError('Erro ao encerrar sessão');
      return null;
    }
  }, [fetchSessions]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, isLoading, error, refetch: fetchSessions, createSession, endSession };
}
