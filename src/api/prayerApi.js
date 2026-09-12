import api from './client';

export const prayerApi = {
  getToday: (date) => api.get('/prayers/today/', { params: { date } }),
  togglePrayer: (data) => api.post('/prayers/toggle/', data),
  getTimes: (date) => api.get('/prayers/times/', { params: { date } }),
  getHistory: (params) => api.get('/prayers/history/', { params }),
};
