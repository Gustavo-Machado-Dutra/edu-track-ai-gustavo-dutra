import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import type { ApiResponse, WeeklyReport } from '../types';

export function useReports() {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: ApiResponse<WeeklyReport[]> = await apiRequest('/reports/weekly');
      if (response.error) {
        setError(response.error.message);
        return false;
      }
      setReports(response.data);
      return true;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Erro ao carregar relatórios');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateReport = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response: ApiResponse<WeeklyReport> = await apiRequest('/reports/weekly/generate', { method: 'POST' });
      if (response.error) {
        setError(response.error.message);
        return false;
      }
      setReports((current) => [response.data, ...current.filter((report) => report.id !== response.data.id)]);
      return true;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Erro ao gerar relatório');
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { reports, isLoading, isGenerating, error, refetch, generateReport };
}