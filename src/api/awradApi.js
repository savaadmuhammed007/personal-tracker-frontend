import api from './client';

export const awradApi = {
  getAwrad: (params) => api.get('/awrad/', { params }),
  createAwrad: (data) => api.post('/awrad/', data),
  updateAwrad: (id, data) => api.patch(`/awrad/${id}/`, data),
  deleteAwrad: (id) => api.delete(`/awrad/${id}/`),
  increment: (id, data) => api.post(`/awrad/${id}/increment/`, data || { delta: 1 }),
  reset: (id, data) => api.post(`/awrad/${id}/reset/`, data || {}),
  setCount: (id, data) => api.post(`/awrad/${id}/set-count/`, data),
  getProgressHistory: (params) => api.get('/awrad/progress/', { params }),
};
