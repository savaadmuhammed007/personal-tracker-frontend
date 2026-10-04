import api from './client';

export const expenseApi = {
  // Accounts
  getAccounts: () => api.get('/expenses/accounts/'),
  createAccount: (data) => api.post('/expenses/accounts/', data),
  updateAccount: (id, data) => api.patch(`/expenses/accounts/${id}/`, data),
  deleteAccount: (id) => api.delete(`/expenses/accounts/${id}/`),
  setOpeningBalance: (id, data) => api.post(`/expenses/accounts/${id}/set-opening-balance/`, data),
  setDefaultAccount: (id) => api.post(`/expenses/accounts/${id}/set-default/`),
  getAccountStatement: (id, params) => api.get(`/expenses/accounts/${id}/statement/`, { params }),

  // Transactions
  getTransactions: (params) => api.get('/expenses/transactions/', { params }),
  createTransaction: (data) => api.post('/expenses/transactions/', data),
  updateTransaction: (id, data) => api.patch(`/expenses/transactions/${id}/`, data),
  deleteTransaction: (id) => api.delete(`/expenses/transactions/${id}/`),

  // Reports & Analytics
  getDailyReport: (date) => api.get('/expenses/daily-report/', { params: { date } }),
  getSummaryAnalytics: (params) => api.get('/expenses/summary/', { params }),
};
