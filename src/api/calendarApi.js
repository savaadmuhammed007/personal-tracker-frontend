import api from './client';

export const calendarApi = {
  getMonth: (year, month) => api.get('/calendar/month/', { params: { year, month } }),
  getDayDetails: (date) => api.get('/calendar/day-details/', { params: { date } }),
};
