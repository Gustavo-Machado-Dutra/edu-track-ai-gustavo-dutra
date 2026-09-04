import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../services/api';
import type { Task, ApiResponse, TaskDifficulty, TaskHistory, TaskPriority, TaskStatus } from '../types';

export interface CreateTaskInput {
  subjectId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  difficulty?: TaskDifficulty;
  dueDate?: string | null;
  estimatedMinutes?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  difficulty?: TaskDifficulty;
  status?: TaskStatus;
  dueDate?: string | null;
  estimatedMinutes?: number;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (status?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = status ? `/tasks?status=${status}` : '/tasks';
      const data: ApiResponse<Task[]> = await apiRequest(url);

      if (data.error) {
        setError(data.error.message);
      } else {
        setTasks(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTask = useCallback(async (task: CreateTaskInput) => {
    try {
      const data: ApiResponse<Task> = await apiRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify(task),
      });

      if (data.error) {
        setError(data.error.message);
        return false;
      }

      await fetchTasks();
      return true;
    } catch {
      setError('Erro ao criar tarefa');
      return false;
    }
  }, [fetchTasks]);

  const updateTask = useCallback(async (id: string, task: UpdateTaskInput) => {
    try {
      const data: ApiResponse<Task> = await apiRequest(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(task),
      });

      if (data.error) {
        setError(data.error.message);
        return false;
      }

      await fetchTasks();
      return true;
    } catch {
      setError('Erro ao atualizar tarefa');
      return false;
    }
  }, [fetchTasks]);

  const getTaskHistory = useCallback(async (id: string) => {
    try {
      const data: ApiResponse<TaskHistory[]> = await apiRequest(`/tasks/${id}/history`);

      if (data.error) {
        setError(data.error.message);
        return null;
      }

      return data.data;
    } catch {
      setError('Erro ao carregar histórico da tarefa');
      return null;
    }
  }, []);

  const completeTask = useCallback(async (id: string) => {
    try {
      const data: ApiResponse<Task> = await apiRequest(`/tasks/${id}/complete`, {
        method: 'POST',
      });

      if (data.error) {
        setError(data.error.message);
        return false;
      }

      await fetchTasks();
      return true;
    } catch {
      setError('Erro ao concluir tarefa');
      return false;
    }
  }, [fetchTasks]);

  const deleteTask = useCallback(async (id: string) => {
    try {
      const data: ApiResponse<{ id: string; deleted: boolean }> = await apiRequest(`/tasks/${id}`, {
        method: 'DELETE',
      });

      if (data.error) {
        setError(data.error.message);
        return false;
      }

      await fetchTasks();
      return true;
    } catch {
      setError('Erro ao excluir tarefa');
      return false;
    }
  }, [fetchTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, isLoading, error, refetch: fetchTasks, createTask, updateTask, getTaskHistory, completeTask, deleteTask };
}


