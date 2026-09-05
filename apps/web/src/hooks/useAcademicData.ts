import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import type { ApiResponse, StudySession, Subject, Task } from '../types';

export interface AcademicData {
  subjects: Subject[];
  tasks: Task[];
  sessions: StudySession[];
}

export function useAcademicData() {
  const [data, setData] = useState<AcademicData>({ subjects: [], tasks: [], sessions: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [subjectsResponse, tasksResponse, sessionsResponse] = await Promise.all([
        apiRequest<Subject[]>('/subjects'),
        apiRequest<Task[]>('/tasks'),
        apiRequest<StudySession[]>('/study-sessions'),
      ]);
      const responseError = subjectsResponse.error || tasksResponse.error || sessionsResponse.error;

      if (responseError) {
        setError(responseError.message);
        return false;
      }

      setData({ subjects: subjectsResponse.data, tasks: tasksResponse.data, sessions: sessionsResponse.data });
      return true;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Erro ao carregar dados acadêmicos');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...data, isLoading, error, refetch };
}

export type AcademicDataResponse = ApiResponse<AcademicData>;