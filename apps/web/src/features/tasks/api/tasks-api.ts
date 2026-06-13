import { apiClient } from '../../../lib/api-client';
import type { Task, CreateTaskDto, UpdateTaskDto } from '../types';

export const tasksApi = {
  create: async (data: CreateTaskDto): Promise<Task> => {
    const response = await apiClient.post<Task>('/tasks', data);
    return response.data;
  },

  list: async (): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>('/tasks');
    return response.data;
  },

  getById: async (id: string): Promise<Task> => {
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateTaskDto): Promise<Task> => {
    const response = await apiClient.patch<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};
