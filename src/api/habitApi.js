import api from './client';

export const habitApi = {
  getHabits: (params) => api.get('/habits/', { params }),
  createHabit: (data) => api.post('/habits/', data),
  updateHabit: (id, data) => api.patch(`/habits/${id}/`, data),
  deleteHabit: (id) => api.delete(`/habits/${id}/`),
  toggleHabit: (id, data) => api.post(`/habits/${id}/toggle/`, data || {}),
  logDetails: (id, data) => api.post(`/habits/${id}/log/`, data),
  getCompletions: (params) => api.get('/habits/completions/', { params }),
};
