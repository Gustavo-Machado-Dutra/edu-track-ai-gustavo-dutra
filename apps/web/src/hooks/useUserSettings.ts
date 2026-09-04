import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import type { ApiResponse, User } from '../types';

export function useUserSettings() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ApiResponse<User> = await apiRequest('/users/me');
      if (response.error) {
        setError(response.error.message);
      } else {
        setUser(response.data);
      }
    } catch {
      setError('Erro ao carregar preferências.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateNotifications = useCallback(async (notificationsEnabled: boolean) => {
    setIsSaving(true);
    setError(null);

    try {
      const response: ApiResponse<User> = await apiRequest('/users/me/settings', {
        method: 'PATCH',
        body: JSON.stringify({ notificationsEnabled }),
      });

      if (response.error) {
        setError(response.error.message);
        return false;
      }

      setUser(response.data);
      return true;
    } catch {
      setError('Erro ao atualizar preferências.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, isLoading, isSaving, error, updateNotifications };
}
