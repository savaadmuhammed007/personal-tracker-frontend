import api from './client';

export const timelineApi = {
  getTimeline: (date) => api.get('/timeline/', { params: { date } }),
};
