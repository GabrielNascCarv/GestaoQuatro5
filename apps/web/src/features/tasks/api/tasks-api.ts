import { apiClient } from '../../../lib/api-client';
import type { Task, CreateTaskDto, UpdateTaskDto, TaskMetrics, WeeklyReport, WeeklyReportDetail } from '../types';

export const tasksApi = {
  create: async (data: CreateTaskDto): Promise<Task> => {
    const response = await apiClient.post<Task>('/tasks', data);
    return response.data;
  },

  list: async (): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>('/tasks');
    return response.data;
  },

  listByUser: async (userId: string): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>(`/tasks/user/${userId}`);
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

  getMetrics: async (): Promise<TaskMetrics> => {
    const response = await apiClient.get<TaskMetrics>('/tasks/metrics');
    return response.data;
  },

  closeWeek: async (): Promise<WeeklyReport> => {
    const response = await apiClient.post<WeeklyReport>('/tasks/close-week');
    return response.data;
  },

  listWeeklyReports: async (): Promise<WeeklyReport[]> => {
    const response = await apiClient.get<WeeklyReport[]>('/tasks/weekly-reports');
    return response.data;
  },

  getWeeklyReport: async (id: string): Promise<WeeklyReportDetail> => {
    const response = await apiClient.get<WeeklyReportDetail>(`/tasks/weekly-reports/${id}`);
    return response.data;
  },
};
