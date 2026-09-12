import api from './client';

export const taskApi = {
  getTasks: (params) => api.get('/tasks/', { params }),
  createTask: (data) => api.post('/tasks/', data),
  updateTask: (id, data) => api.patch(`/tasks/${id}/`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}/`),
  toggleTask: (id) => api.post(`/tasks/${id}/toggle/`),
};
