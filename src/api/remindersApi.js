import api from './client';

export const remindersApi = {
  getReminders: () => api.get('/reminders/'),
  createReminder: (data) => api.post('/reminders/', data),
  updateReminder: (id, data) => api.patch(`/reminders/${id}/`, data),
  deleteReminder: (id) => api.delete(`/reminders/${id}/`),
  toggleReminder: (id) => api.post(`/reminders/${id}/toggle/`),
  subscribePush: (data) => api.post('/reminders/push-subscribe/', data),
};
