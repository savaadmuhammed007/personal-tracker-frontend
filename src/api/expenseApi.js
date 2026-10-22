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
  getSummaryAnalytics: (params) => {
    const queryParams = typeof params === 'string' ? { month: params } : (params || {});
    return api.get('/expenses/summary/', { params: queryParams });
  },

  // Credit Book System (Isolated Debit & Credit ledger)
  getCreditAccounts: () => api.get('/expenses/credit-accounts/'),
  createCreditAccount: (data) => api.post('/expenses/credit-accounts/', data),
  updateCreditAccount: (id, data) => api.patch(`/expenses/credit-accounts/${id}/`, data),
  deleteCreditAccount: (id) => api.delete(`/expenses/credit-accounts/${id}/`),
  getCreditAccountStatement: (id) => api.get(`/expenses/credit-accounts/${id}/statement/`),

  getCreditEntries: (params) => api.get('/expenses/credit-entries/', { params }),
  createCreditEntry: (data) => api.post('/expenses/credit-entries/', data),
  updateCreditEntry: (id, data) => api.patch(`/expenses/credit-entries/${id}/`, data),
  deleteCreditEntry: (id) => api.delete(`/expenses/credit-entries/${id}/`),
  toggleSettleCreditEntry: (id) => api.post(`/expenses/credit-entries/${id}/toggle-settle/`),

  getCreditSummary: () => api.get('/expenses/credit-summary/'),
};
