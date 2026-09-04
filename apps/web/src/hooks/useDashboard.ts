import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

type DashboardData = {
  tasks: {
    total: number;
    byStatus: {
      TODO: number;
      IN_PROGRESS: number;
      COMPLETED: number;
      CANCELLED: number;
    };
    overdue: number;
    completionRate: number;
  };
  study: {
    totalMinutes: number;
    totalHours: number;
    sessionsCount: number;
    averageSessionMinutes: number;
    bySubject: Record<string, number>;
  };
  subjectsCount: number;
  recentSessions: Array<{ id: string; durationSeconds?: number }>;
};

export function useDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest<DashboardData>('/analytics/dashboard');

      if (response.error) {
        setError(response.error.message);
      } else {
        setDashboard(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { dashboard, isLoading, error, refetch: fetchDashboard };
}
