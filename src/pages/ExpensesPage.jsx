import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Wallet,
  Smartphone,
  Building2,
  CreditCard,
  PiggyBank,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  Trash2,
  Edit2,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  BarChart3,
  Landmark,
  Coins,
  RefreshCw,
  Utensils,
  ShoppingCart,
  Fuel,
  Zap,
  ShoppingBag,
  HeartHandshake,
  HeartPulse,
  Home,
  GraduationCap,
  Coffee,
  Sparkles,
  MoreHorizontal,
  Briefcase,
  Store,
  Laptop,
  Gift,
  PlusCircle,
  Tag,
  CheckCircle2,
  FileSpreadsheet,
  Star,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { expenseApi } from '../api/expenseApi';
import { useNotification } from '../context/NotificationContext';
import { useDayWatch } from '../context/DayWatchContext';
import { getLocalDateString, getDailyCache, setDailyCache } from '../utils/dateUtils';
import { formatCurrency, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../data/expenseCategories';
import { TransactionModal } from '../components/modals/TransactionModal';
import { OpeningBalanceModal } from '../components/modals/OpeningBalanceModal';
import { AccountFormModal } from '../components/modals/AccountFormModal';
import { AccountStatementModal } from '../components/modals/AccountStatementModal';
import { ExpenseAnalyticsView } from '../components/expenses/ExpenseAnalyticsView';

const CACHE_ACCOUNTS_KEY = 'cached_expense_accounts';
const CACHE_DAILY_PREFIX = 'cached_daily_report_';
const CACHE_ANALYTICS_PREFIX = 'cached_expense_analytics_';

const ICON_MAP = {
  Utensils,
  ShoppingCart,
  Fuel,
  Zap,
  ShoppingBag,
  HeartHandshake,
  HeartPulse,
  Home,
  GraduationCap,
  Coffee,
  Sparkles,
  MoreHorizontal,
  Briefcase,
  Store,
  Laptop,
  TrendingUp,
  Gift,
  PlusCircle,
  ArrowRightLeft,
  Wallet,
  Smartphone,
  CreditCard,
  Building2,
  PiggyBank,
};

export const ExpensesPage = () => {
  const { showToast } = useNotification();
  const { todayDate } = useDayWatch();

  // Active View Tab: 'daily' | 'accounts' | 'analytics' | 'ledger'
  const [activeTab, setActiveTab] = useState('daily');

  // Selected Date for Daily Report (defaults to today)
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());
  const isSelectedDateToday = selectedDate === getLocalDateString();

  // Selected Month for Analytics (defaults to current month YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });

  // Data states initialized from instant local cache (0ms perceived lag)
  const [accounts, setAccounts] = useState(() => getDailyCache(CACHE_ACCOUNTS_KEY, []));
  const [dailyReport, setDailyReport] = useState(() => getDailyCache(`${CACHE_DAILY_PREFIX}${selectedDate}`, null, selectedDate));
  const [analyticsData, setAnalyticsData] = useState(() => getDailyCache(`${CACHE_ANALYTICS_PREFIX}${selectedMonth}`, null));
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(() => !accounts.length && !dailyReport);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filters for ledger / transactions
  const [selectedAccountFilter, setSelectedAccountFilter] = useState('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState('expense');
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [isOpeningBalanceModalOpen, setIsOpeningBalanceModalOpen] = useState(false);
  const [openingBalanceAccount, setOpeningBalanceAccount] = useState(null);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [selectedStatementAccount, setSelectedStatementAccount] = useState(null);

  // Fetch Accounts & Daily Report with silent background update
  const loadDailyData = useCallback(async () => {
    try {
      const [accRes, repRes] = await Promise.all([
        expenseApi.getAccounts(),
        expenseApi.getDailyReport(selectedDate),
      ]);
      const accList = Array.isArray(accRes.data) ? accRes.data : accRes.data?.results || [];
      setAccounts(accList);
      setDailyReport(repRes.data);

      setDailyCache(CACHE_ACCOUNTS_KEY, accList);
      if (repRes.data) {
        setDailyCache(`${CACHE_DAILY_PREFIX}${selectedDate}`, repRes.data, selectedDate);
      }
    } catch (err) {
      console.error('Failed to load daily expense data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Fetch Monthly Analytics with silent background update
  const loadAnalyticsData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await expenseApi.getSummaryAnalytics({ month: selectedMonth });
      setAnalyticsData(res.data);
      if (res.data) {
        setDailyCache(`${CACHE_ANALYTICS_PREFIX}${selectedMonth}`, res.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  // Fetch Ledger Transactions
  const loadLedgerTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedAccountFilter !== 'all') params.account = selectedAccountFilter;
      if (selectedTypeFilter !== 'all') params.type = selectedTypeFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await expenseApi.getTransactions(params);
      const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setAllTransactions(list);
    } catch (err) {
      console.error('Failed to load ledger:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedAccountFilter, selectedTypeFilter, searchQuery]);

  // Effects
  useEffect(() => {
    if (activeTab === 'daily' || activeTab === 'accounts') {
      loadDailyData();
    }
  }, [activeTab, loadDailyData, refreshKey]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalyticsData();
    } else if (activeTab === 'ledger') {
      loadLedgerTransactions();
    }
  }, [activeTab, loadAnalyticsData, loadLedgerTransactions, refreshKey]);

  const handleRefresh = (optimisticTx, isSilentServerSync = false) => {
    if (optimisticTx && !isSilentServerSync) {
      const numAmt = parseFloat(optimisticTx.amount) || 0;
      // 1. Instant Account Balance Update
      setAccounts((prevAccounts) => {
        return prevAccounts.map((acc) => {
          if (optimisticTx.transaction_type === 'expense' && acc.id === optimisticTx.account) {
            return {
              ...acc,
              current_balance: (acc.current_balance || 0) - numAmt,
              total_expense: (acc.total_expense || 0) + numAmt,
            };
          }
          if (optimisticTx.transaction_type === 'income' && acc.id === optimisticTx.account) {
            return {
              ...acc,
              current_balance: (acc.current_balance || 0) + numAmt,
              total_income: (acc.total_income || 0) + numAmt,
            };
          }
          if (optimisticTx.transaction_type === 'transfer') {
            if (acc.id === optimisticTx.account) {
              return { ...acc, current_balance: (acc.current_balance || 0) - numAmt };
            }
            if (acc.id === optimisticTx.to_account) {
              return { ...acc, current_balance: (acc.current_balance || 0) + numAmt };
            }
          }
          return acc;
        });
      });

      // 2. Instant Daily Report Update
      if (optimisticTx.date === selectedDate) {
        setDailyReport((prevRep) => {
          if (!prevRep) return prevRep;
          const currentTxs = prevRep.today_transactions || [];
          const tempTx = {
            id: optimisticTx.id || `temp-${Date.now()}`,
            ...optimisticTx,
            account_name: accounts.find((a) => a.id === optimisticTx.account)?.name || 'Account',
          };
          const isExp = optimisticTx.transaction_type === 'expense';
          const isInc = optimisticTx.transaction_type === 'income';
          const newInc = isInc ? (prevRep.total_income || 0) + numAmt : (prevRep.total_income || 0);
          const newExp = isExp ? (prevRep.total_expense || 0) + numAmt : (prevRep.total_expense || 0);
          return {
            ...prevRep,
            total_income: newInc,
            total_expense: newExp,
            net_flow: newInc - newExp,
            today_transactions: [tempTx, ...currentTxs],
          };
        });
      }
    }

    if (activeTab === 'analytics') {
      loadAnalyticsData(true);
    }
    setRefreshKey((k) => k + 1);
  };

  // Date Navigation Helpers
  const shiftDate = (days) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  const jumpToToday = () => {
    setSelectedDate(getLocalDateString());
  };

  // Open Quick Transaction Modal
  const openNewTransaction = (type = 'expense') => {
    setEditingTransaction(null);
    setTxModalType(type);
    setIsTxModalOpen(true);
  };

  const openEditTransaction = (tx) => {
    setEditingTransaction(tx);
    setTxModalType(tx.transaction_type);
    setIsTxModalOpen(true);
  };

  // Delete Transaction
  const handleDeleteTransaction = async (tx) => {
    if (!window.confirm(`Delete ${tx.category} transaction of ₹${tx.amount}?`)) return;
    try {
      await expenseApi.deleteTransaction(tx.id);
      showToast('Deleted', 'Transaction removed successfully');
      handleRefresh();
    } catch (err) {
      showToast('Error', 'Failed to delete transaction', 'error');
    }
  };

  // Open Set Opening Balance Modal
  const handleOpenSetOpeningBalance = (account = null) => {
    setOpeningBalanceAccount(account || accounts[0] || null);
    setIsOpeningBalanceModalOpen(true);
  };

  // Open Account Statement Modal
  const handleOpenAccountStatement = (account) => {
    setSelectedStatementAccount(account);
    setIsStatementModalOpen(true);
  };

  // Set Default Account
  const handleSetDefaultAccount = async (account) => {
    try {
      await expenseApi.setDefaultAccount(account.id);
      showToast('Default Account', `✓ ${account.name} is now your default payment account.`);
      handleRefresh();
    } catch (err) {
      showToast('Error', 'Failed to set default account', 'error');
    }
  };

  // Delete / Archive Account
  const handleDeleteAccount = async (account) => {
    const confirmMsg = `Remove "${account.name}"? If it has transactions, it will be safely archived to preserve historical reports.`;
    if (!window.confirm(confirmMsg)) return;
    try {
      const res = await expenseApi.deleteAccount(account.id);
      showToast('Account Removed', res.data?.message || `Account ${account.name} removed.`);
      handleRefresh();
    } catch (err) {
      showToast('Error', 'Failed to remove account', 'error');
    }
  };

  // Filtered daily transactions
  const displayedDailyTransactions = useMemo(() => {
    if (!dailyReport?.transactions) return [];
    if (selectedAccountFilter === 'all') return dailyReport.transactions;
    return dailyReport.transactions.filter(
      (tx) =>
        String(tx.account) === String(selectedAccountFilter) ||
        String(tx.to_account) === String(selectedAccountFilter)
    );
  }, [dailyReport, selectedAccountFilter]);

  // Total Net Worth across all active accounts
  const totalNetWorth = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + (Number(acc.current_balance) || 0), 0);
  }, [accounts]);

  // Liquidity distribution calculations per account
  const liquiditySegments = useMemo(() => {
    if (!totalNetWorth || totalNetWorth <= 0 || accounts.length === 0) return [];
    return accounts
      .map((acc) => {
        const bal = Math.max(0, Number(acc.current_balance) || 0);
        const pct = Math.round((bal / totalNetWorth) * 100);
        return {
          id: acc.id,
          name: acc.name,
          color: acc.color || '#088ac1',
          balance: bal,
          percentage: pct,
          account: acc,
        };
      })
      .filter((s) => s.balance > 0);
  }, [accounts, totalNetWorth]);

  // Export Daily Report to CSV
  const handleExportCSV = () => {
    if (!dailyReport?.transactions || dailyReport.transactions.length === 0) {
      showToast('No Data', 'No transactions to export for this day', 'info');
      return;
    }

    const headers = ['Date', 'Time', 'Type', 'Amount (INR)', 'Account', 'To Account', 'Category', 'Notes', 'Payment Method'];
    const rows = dailyReport.transactions.map((t) => [
      t.date,
      t.time || '',
      t.transaction_type.toUpperCase(),
      t.amount,
      `"${t.account_name || ''}"`,
      `"${t.to_account_name || ''}"`,
      `"${t.category || ''}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      t.payment_method || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Expense_Report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported', 'Daily CSV report downloaded');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-32 sm:pb-16 animate-fade-in">
      {/* Top Header & Main Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-[#088ac1] to-[#1eb4eb] text-white shadow-md shadow-[#088ac1]/30">
              <Wallet className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Expense & Accounts Manager
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily reports, multi-account UPI & cash tracking, and live balance flow.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs (Daily Report | Accounts | Monthly Analytics | Ledger) */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-white/10 self-start sm:self-auto overflow-x-auto max-w-full scrollbar-none shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
              activeTab === 'daily'
                ? 'bg-white dark:bg-slate-700 text-[#088ac1] dark:text-[#3dc3f3] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Daily Report
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('accounts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
              activeTab === 'accounts'
                ? 'bg-white dark:bg-slate-700 text-[#088ac1] dark:text-[#3dc3f3] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Accounts ({accounts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-slate-700 text-[#088ac1] dark:text-[#3dc3f3] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
              activeTab === 'ledger'
                ? 'bg-white dark:bg-slate-700 text-[#088ac1] dark:text-[#3dc3f3] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Ledger
          </button>
        </div>
      </div>

      {/* Hero Liquidity Carousel & Multi-Segment Distribution Bar */}
      {activeTab !== 'accounts' && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-[#088ac1] dark:text-[#3dc3f3]" />
                Portfolio Liquidity & Balances
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#e1f3fd] dark:bg-[#088ac1]/20 text-[#076e9d] dark:text-[#3dc3f3]">
                Net Worth: {formatCurrency(totalNetWorth)}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('accounts')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/10 transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <Layers className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                <span>Manage</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenSetOpeningBalance(null)}
                className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/10 transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <Landmark className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                <span>Opening</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingAccount(null);
                  setIsAccountModalOpen(true);
                }}
                className="p-1 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
                title="Add Custom Account"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Account Cards: Smooth horizontal snap scroll on mobile, responsive grid on desktop */}
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 scrollbar-none sm:grid sm:grid-cols-2 lg:grid-cols-4 items-stretch">
            {/* Card 1: Total Liquid Net Worth */}
            <div className="min-w-[260px] xs:min-w-[280px] snap-center shrink-0 sm:min-w-0 sm:shrink p-4 sm:p-4.5 rounded-3xl bg-gradient-to-br from-[#088ac1] via-[#076e9d] to-[#0a3147] text-white shadow-lg shadow-[#088ac1]/25 flex flex-col justify-between min-h-[148px] sm:min-h-[154px] h-full relative overflow-hidden group select-none">
              <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/15 rounded-full blur-2xl group-hover:scale-125 transition-transform pointer-events-none" />
              <div className="flex items-center justify-between mb-2 min-w-0">
                <span className="text-[11px] font-semibold text-white/80 tracking-wide uppercase flex items-center gap-1.5 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                  <span className="truncate">Total Net Worth</span>
                </span>
                <span className="p-1.5 rounded-xl bg-white/10 text-white backdrop-blur-xs shrink-0">
                  <Coins className="w-4 h-4" />
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white drop-shadow-xs truncate">
                  {formatCurrency(totalNetWorth)}
                </div>

                {/* Micro segment distribution visualizer */}
                {liquiditySegments.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-white/15">
                    <div className="h-1.5 w-full rounded-full bg-black/20 overflow-hidden flex gap-0.5">
                      {liquiditySegments.map((seg) => (
                        <div
                          key={seg.id}
                          style={{
                            width: `${seg.percentage}%`,
                            backgroundColor: seg.color || '#3dc3f3',
                          }}
                          className="h-full first:rounded-l-full last:rounded-r-full"
                          title={`${seg.name}: ${seg.percentage}%`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-white/80 mt-1">
                      <span className="truncate">{accounts.length} Accounts</span>
                      <span className="font-semibold text-cyan-200 shrink-0">100% Reconciled</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Individual Accounts Cards: Cash, Kotak UPI, Canara UPI, etc. */}
            {accounts.map((acc) => {
              const IconComp =
                acc.account_type === 'cash'
                  ? Wallet
                  : acc.account_type === 'upi'
                  ? Smartphone
                  : acc.account_type === 'credit_card'
                  ? CreditCard
                  : acc.account_type === 'savings'
                  ? PiggyBank
                  : Building2;

              const isSelectedFilter = selectedAccountFilter === String(acc.id);

              return (
                <div
                  key={acc.id}
                  onClick={() => handleOpenAccountStatement(acc)}
                  className={`min-w-[260px] xs:min-w-[280px] snap-center shrink-0 sm:min-w-0 sm:shrink p-4 sm:p-4.5 rounded-3xl bg-white dark:bg-[#0b1822] border transition-all cursor-pointer relative group flex flex-col justify-between min-h-[148px] sm:min-h-[154px] h-full select-none active:scale-[0.98] ${
                    isSelectedFilter
                      ? 'border-[#088ac1] ring-2 ring-[#088ac1]/30 dark:ring-[#3dc3f3]/30 shadow-md'
                      : 'border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 min-w-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="p-2.5 rounded-2xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: `${acc.color}18`,
                          color: acc.color,
                        }}
                      >
                        <IconComp className="w-4 h-4" />
                      </span>
                      <div className="min-w-0 truncate">
                        <div className="flex items-center gap-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {acc.name}
                          </h4>
                          {acc.is_default && (
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">
                          {acc.bank_name || acc.account_type.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAccountStatement(acc);
                      }}
                      className="p-1.5 rounded-xl opacity-80 hover:opacity-100 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer shrink-0"
                      title="View Details & Statement"
                    >
                      <Layers className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="min-w-0">
                    <div className="text-lg sm:text-xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight truncate">
                      {formatCurrency(acc.current_balance)}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 pt-1.5 border-t border-slate-100 dark:border-white/5 min-w-0">
                      <span className="truncate">Opening: {formatCurrency(acc.opening_balance || 0)}</span>
                      <span className="text-[#088ac1] dark:text-[#3dc3f3] font-bold group-hover:underline flex items-center gap-0.5 shrink-0">
                        Statement <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 1: DAILY REPORT VIEW */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          {/* Date Selector Banner & Quick Action Buttons */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#0b1822] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Date Navigator */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => shiftDate(-1)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer active:scale-95"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10">
                <Calendar className="w-4 h-4 text-[#088ac1] dark:text-[#3dc3f3]" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs sm:text-sm font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => shiftDate(1)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer active:scale-95"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {!isSelectedDateToday && (
                <button
                  type="button"
                  onClick={jumpToToday}
                  className="px-2.5 py-1 text-xs font-bold rounded-xl bg-[#e1f3fd] dark:bg-[#088ac1]/20 text-[#076e9d] dark:text-[#3dc3f3] hover:bg-[#bce8fb] transition-colors cursor-pointer active:scale-95"
                >
                  Today
                </button>
              )}
            </div>

            {/* Quick Actions (Add Expense, Add Income, Transfer) */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => openNewTransaction('expense')}
                className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20 transition-all cursor-pointer active:scale-95"
              >
                <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                <span>- Expense</span>
              </button>

              <button
                type="button"
                onClick={() => openNewTransaction('income')}
                className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
              >
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                <span>+ Income</span>
              </button>

              <button
                type="button"
                onClick={() => openNewTransaction('transfer')}
                className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/20 transition-all cursor-pointer active:scale-95"
              >
                <ArrowRightLeft className="w-4 h-4 stroke-[2.5]" />
                <span>⇄ Transfer</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/10 transition-colors cursor-pointer"
                title="Export Day Report to CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Daily Financial Pipeline Visual Bento (Opening ➔ Credits ➔ Debits ➔ Net ➔ Closing) */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* 1. Day Opening Balance */}
            <div className="p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-[#0b1822] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between hover:border-cyan-500/40 transition-colors min-w-0">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
                <Landmark className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>Opening Base</span>
              </span>
              <div className="mt-2 min-w-0">
                <div className="text-base sm:text-xl font-extrabold font-mono text-slate-900 dark:text-white truncate">
                  {formatCurrency(dailyReport?.opening_balance ?? 0)}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">Start of day</p>
              </div>
            </div>

            {/* 2. Today's Total Income */}
            <div className="p-3.5 sm:p-4 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 shadow-xs flex flex-col justify-between min-w-0">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>+ Credits In</span>
              </span>
              <div className="mt-2 min-w-0">
                <div className="text-base sm:text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 truncate">
                  +{formatCurrency(dailyReport?.total_income ?? 0)}
                </div>
                <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 mt-0.5 truncate">
                  Income today
                </p>
              </div>
            </div>

            {/* 3. Today's Total Expense */}
            <div className="p-3.5 sm:p-4 rounded-3xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 shadow-xs flex flex-col justify-between min-w-0">
              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
                <TrendingDown className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>- Debits Out</span>
              </span>
              <div className="mt-2 min-w-0">
                <div className="text-base sm:text-xl font-extrabold font-mono text-rose-600 dark:text-rose-400 truncate">
                  -{formatCurrency(dailyReport?.total_expense ?? 0)}
                </div>
                <p className="text-[10px] text-rose-600/70 dark:text-rose-400/70 mt-0.5 truncate">
                  Expenses today
                </p>
              </div>
            </div>

            {/* 4. Net Flow */}
            <div className="p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-[#0b1822] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between min-w-0">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
                <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Net Daily Flow</span>
              </span>
              <div className="mt-2 min-w-0">
                <div
                  className={`text-base sm:text-xl font-extrabold font-mono truncate ${
                    (dailyReport?.net_flow || 0) >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {(dailyReport?.net_flow || 0) >= 0 ? '+' : ''}
                  {formatCurrency(dailyReport?.net_flow ?? 0)}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {(dailyReport?.net_flow || 0) >= 0 ? '✓ Daily Surplus' : '⚠ Daily Deficit'}
                </p>
              </div>
            </div>

            {/* 5. Closing Balance */}
            <div className="col-span-2 md:col-span-1 p-3.5 sm:p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-[#071924] dark:from-[#088ac1]/30 dark:via-[#0c3146]/50 dark:to-[#0b1822] text-white border border-slate-700/80 dark:border-[#088ac1]/40 shadow-sm flex flex-col justify-between min-w-0">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 truncate">
                <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Closing Balance</span>
              </span>
              <div className="mt-2 min-w-0">
                <div className="text-base sm:text-xl font-extrabold font-mono text-white truncate">
                  {formatCurrency(dailyReport?.closing_balance ?? 0)}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">End of {dailyReport?.day_name || 'day'}</p>
              </div>
            </div>
          </div>

          {/* Daily Breakdown by Account & Category Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Transaction Timeline / Feed */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Daily Transactions Ledger
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {displayedDailyTransactions.length}
                  </span>
                </div>

                {/* Account Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto max-w-xs scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setSelectedAccountFilter('all')}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                      selectedAccountFilter === 'all'
                        ? 'bg-[#088ac1] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    All
                  </button>
                  {accounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setSelectedAccountFilter(String(acc.id))}
                      className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer truncate max-w-[90px] ${
                        selectedAccountFilter === String(acc.id)
                          ? 'bg-[#088ac1] text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                      }`}
                    >
                      {acc.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transactions List */}
              {displayedDailyTransactions.length === 0 ? (
                <div className="p-8 rounded-3xl bg-white dark:bg-[#0b1822] border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mx-auto">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      No transactions recorded for {dailyReport?.formatted_date || selectedDate}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                      Add your daily groceries, meals, petrol bills, UPI transfers, or salary credits.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => openNewTransaction('expense')}
                      className="py-2 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      Add Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => openNewTransaction('income')}
                      className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Add Income
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {displayedDailyTransactions.map((tx) => {
                    const isExpense = tx.transaction_type === 'expense';
                    const isIncome = tx.transaction_type === 'income';
                    const isTransfer = tx.transaction_type === 'transfer';
                    const IconComponent =
                      ICON_MAP[tx.category_icon] ||
                      (isExpense ? ArrowDownLeft : isIncome ? ArrowUpRight : ArrowRightLeft);

                    return (
                      <div
                        key={tx.id}
                        className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0b1822] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                              isExpense
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                                : isIncome
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                                : 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400'
                            }`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </span>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                {tx.category}
                              </h4>
                              {/* Account Tag */}
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {isTransfer
                                  ? `${tx.account_name} ➔ ${tx.to_account_name}`
                                  : tx.account_name}
                              </span>
                              {tx.payment_method && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-md font-mono bg-slate-50 dark:bg-white/5 text-slate-400 border border-slate-200/40 dark:border-white/5">
                                  {tx.payment_method}
                                </span>
                              )}
                            </div>

                            {tx.notes && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {tx.notes}
                              </p>
                            )}

                            {tx.time && (
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {tx.time.slice(0, 5)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center gap-2 shrink-0 text-right">
                          <div>
                            <div
                              className={`text-sm sm:text-base font-extrabold font-mono ${
                                isExpense
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : isIncome
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-sky-600 dark:text-sky-400'
                              }`}
                            >
                              {isExpense ? '-' : isIncome ? '+' : '⇄'}
                              {formatCurrency(tx.amount)}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => openEditTransaction(tx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Edit Transaction"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTransaction(tx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Delete Transaction"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Col: Account Flow & Category Highlights */}
            <div className="space-y-4">
              {/* Daily Account Summaries */}
              <div className="p-4 rounded-3xl bg-white dark:bg-[#0b1822] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Day Account Reconciliation
                  </h4>
                  <button
                    type="button"
                    onClick={() => setActiveTab('accounts')}
                    className="text-[10px] font-bold text-[#088ac1] dark:text-[#3dc3f3] hover:underline cursor-pointer"
                  >
                    Manage
                  </button>
                </div>

                <div className="space-y-2.5">
                  {dailyReport?.accounts?.map((acc) => (
                    <div
                      key={acc.id}
                      onClick={() => handleOpenAccountStatement(acc)}
                      className="p-2.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 space-y-1 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {acc.name}
                        </span>
                        <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                          {formatCurrency(acc.closing_balance)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>Open: {formatCurrency(acc.opening_balance || 0)}</span>
                        <span
                          className={
                            acc.net_flow > 0
                              ? 'text-emerald-500 font-bold'
                              : acc.net_flow < 0
                              ? 'text-rose-500 font-bold'
                              : ''
                          }
                        >
                          {acc.net_flow > 0 ? '+' : ''}{formatCurrency(acc.net_flow || 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Expense Categories */}
              {dailyReport?.expense_categories && dailyReport.expense_categories.length > 0 && (
                <div className="p-4 rounded-3xl bg-white dark:bg-[#0b1822] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
                    <span>Today's Spending Categories</span>
                    <PieChartIcon className="w-4 h-4 text-rose-500" />
                  </h4>

                  <div className="space-y-2">
                    {dailyReport.expense_categories.map((c, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {c.category}
                          </span>
                          <span className="font-bold font-mono text-slate-900 dark:text-white">
                            {formatCurrency(c.amount)} ({c.percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500"
                            style={{ width: `${Math.min(c.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACCOUNTS MANAGEMENT VIEW */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          {/* Top Actions & Net Worth Banner */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-[#071924] dark:from-[#088ac1]/30 dark:to-[#0b1822] text-white border border-slate-800 dark:border-[#088ac1]/30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-cyan-300">
                Total Portfolio Liquidity
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-mono tracking-tight mt-1">
                {formatCurrency(totalNetWorth)}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Aggregate across {accounts.length} linked accounts (Cash, Kotak UPI, Canara UPI & Banks)
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setEditingAccount(null);
                  setIsAccountModalOpen(true);
                }}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#088ac1] to-[#1eb4eb] hover:from-[#1eb4eb] hover:to-[#088ac1] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#088ac1]/30 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Account</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenSetOpeningBalance(null)}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer active:scale-95"
              >
                <Landmark className="w-4 h-4 text-cyan-300" />
                <span>Set Opening Balance</span>
              </button>

              <button
                type="button"
                onClick={() => openNewTransaction('transfer')}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer active:scale-95"
              >
                <ArrowRightLeft className="w-4 h-4 text-sky-300" />
                <span>Transfer Funds</span>
              </button>
            </div>
          </div>

          {/* Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => {
              const IconComp =
                acc.account_type === 'cash'
                  ? Wallet
                  : acc.account_type === 'upi'
                  ? Smartphone
                  : acc.account_type === 'credit_card'
                  ? CreditCard
                  : acc.account_type === 'savings'
                  ? PiggyBank
                  : Building2;

              return (
                <div
                  key={acc.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#0b1822] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group"
                >
                  {/* Account Card Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                        style={{
                          backgroundColor: `${acc.color}18`,
                          color: acc.color,
                        }}
                      >
                        <IconComp className="w-6 h-6" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                            {acc.name}
                          </h3>
                          {acc.is_default && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {acc.bank_name || acc.account_type?.toUpperCase()}
                          {acc.account_number_last4 ? ` •• ${acc.account_number_last4}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAccount(acc);
                          setIsAccountModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        title="Edit Account Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAccount(acc)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Remove Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Account Live Balance & Opening */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Current Live Balance
                      </span>
                      <span className="text-lg font-extrabold font-mono text-slate-900 dark:text-white">
                        {formatCurrency(acc.current_balance)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-200/50 dark:border-white/5">
                      <span>Baseline Opening:</span>
                      <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        <span>{formatCurrency(acc.opening_balance)}</span>
                        <button
                          type="button"
                          onClick={() => handleOpenSetOpeningBalance(acc)}
                          className="text-[#088ac1] dark:text-[#3dc3f3] hover:underline text-[10px] cursor-pointer"
                        >
                          (Edit)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Account Flow Metrics (Income, Expense, Transfers) */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                        Credits In
                      </span>
                      <div className="font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                        +{formatCurrency(acc.total_income)}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/30">
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">
                        Debits Out
                      </span>
                      <div className="font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-0.5">
                        -{formatCurrency(acc.total_expense)}
                      </div>
                    </div>
                  </div>

                  {/* Account Footer Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => handleOpenAccountStatement(acc)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#e1f3fd] dark:bg-[#088ac1]/20 hover:bg-[#bce8fb] text-[#076e9d] dark:text-[#3dc3f3] font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer active:scale-95"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Statement</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingTransaction({
                          account: acc.id,
                          transaction_type: 'transfer',
                        });
                        setTxModalType('transfer');
                        setIsTxModalOpen(true);
                      }}
                      className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer active:scale-95"
                      title="Transfer from this account"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-sky-500" />
                      <span>Transfer</span>
                    </button>

                    {!acc.is_default && (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultAccount(acc)}
                        className="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                        title="Set as Default Account"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add New Account Card Button */}
            <div
              onClick={() => {
                setEditingAccount(null);
                setIsAccountModalOpen(true);
              }}
              className="p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-[#088ac1] dark:hover:border-[#3dc3f3] bg-slate-50/50 dark:bg-white/[0.01] hover:bg-[#e1f3fd]/30 dark:hover:bg-[#088ac1]/10 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all group min-h-[240px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 text-[#088ac1] dark:text-[#3dc3f3] shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Add Another Account
              </h4>
              <p className="text-xs text-slate-400 max-w-xs">
                Link additional UPI handles, secondary bank accounts, wallets, or credit cards.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MONTHLY ANALYTICS & CHARTS */}
      {activeTab === 'analytics' && (
        <ExpenseAnalyticsView
          analyticsData={analyticsData}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          loading={loading}
          onAddTransaction={(type) => {
            setEditingTransaction(null);
            setTxModalType(type || 'expense');
            setIsTxModalOpen(true);
          }}
        />
      )}

      {/* TAB 4: ALL RECORDS & SEARCHABLE LEDGER */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          {/* Search and Filters Bar */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#0b1822] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by notes, category, UPI ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#088ac1]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="expense">Expenses Only</option>
                <option value="income">Income Only</option>
                <option value="transfer">Transfers Only</option>
              </select>

              <select
                value={selectedAccountFilter}
                onChange={(e) => setSelectedAccountFilter(e.target.value)}
                className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="all">All Accounts</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ledger Table / List */}
          <div className="space-y-2">
            {allTransactions.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white dark:bg-[#0b1822] border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                No matching transactions found.
              </div>
            ) : (
              allTransactions.map((tx) => {
                const isExpense = tx.transaction_type === 'expense';
                const isIncome = tx.transaction_type === 'income';
                const isTransfer = tx.transaction_type === 'transfer';
                const IconComp = ICON_MAP[tx.category_icon] || Tag;

                return (
                  <div
                    key={tx.id}
                    className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#0b1822] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isExpense
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                            : isIncome
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            : 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {tx.category}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {isTransfer ? `${tx.account_name} ➔ ${tx.to_account_name}` : tx.account_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{tx.date}</span>
                          {tx.notes && <span>• {tx.notes}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div
                        className={`text-sm sm:text-base font-extrabold font-mono ${
                          isExpense
                            ? 'text-rose-600 dark:text-rose-400'
                            : isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-sky-600 dark:text-sky-400'
                        }`}
                      >
                        {isExpense ? '-' : isIncome ? '+' : '⇄'}
                        {formatCurrency(tx.amount)}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditTransaction(tx)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTransaction(tx)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTransaction(null);
        }}
        transaction={editingTransaction}
        accounts={accounts}
        initialType={txModalType}
        initialDate={selectedDate}
        onSaved={handleRefresh}
      />

      <OpeningBalanceModal
        isOpen={isOpeningBalanceModalOpen}
        onClose={() => {
          setIsOpeningBalanceModalOpen(false);
          setOpeningBalanceAccount(null);
        }}
        accounts={accounts}
        selectedAccount={openingBalanceAccount}
        onSaved={handleRefresh}
      />

      <AccountFormModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setEditingAccount(null);
        }}
        account={editingAccount}
        onSaved={handleRefresh}
      />

      <AccountStatementModal
        isOpen={isStatementModalOpen}
        onClose={() => {
          setIsStatementModalOpen(false);
          setSelectedStatementAccount(null);
        }}
        account={selectedStatementAccount}
        onEditAccount={(acc) => {
          setIsStatementModalOpen(false);
          setEditingAccount(acc);
          setIsAccountModalOpen(true);
        }}
        onSetOpeningBalance={(acc) => {
          setIsStatementModalOpen(false);
          setOpeningBalanceAccount(acc);
          setIsOpeningBalanceModalOpen(true);
        }}
        onNewTransfer={(acc) => {
          setIsStatementModalOpen(false);
          setEditingTransaction({
            account: acc.id,
            transaction_type: 'transfer',
          });
          setTxModalType('transfer');
          setIsTxModalOpen(true);
        }}
        onAccountUpdated={handleRefresh}
      />
    </div>
  );
};
