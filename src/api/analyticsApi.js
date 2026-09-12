import api from './client';

export const analyticsApi = {
  getSummary: () => api.get('/analytics/summary/'),
  getPrayers: (days = 30) => api.get('/analytics/prayers/', { params: { days } }),
  getHabits: () => api.get('/analytics/habits/'),
  getActivityTime: () => api.get('/analytics/activity-time/'),
  getHeatmap: () => api.get('/analytics/heatmap/'),
  getMissed: (params) => api.get('/missed/', { params }),
  getDailyQuote: (date) => api.get('/quotes/daily/', { params: { date } }),
};
