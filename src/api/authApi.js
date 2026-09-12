import api from './client';

export const authApi = {
  login: (username, password) => api.post('/auth/login/', { username, password }),
  register: (data) => api.post('/auth/register/', data),
  getMe: () => api.get('/auth/me/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  exportData: () => api.get('/auth/export/'),
  resetData: () => api.post('/auth/reset/'),
};
