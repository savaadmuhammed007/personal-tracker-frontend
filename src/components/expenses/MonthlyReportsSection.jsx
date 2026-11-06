import React, { useState, useMemo, useEffect, useId } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  PieChart as PieChartIcon,
  BarChart3,
  Search,
  Filter,
  Download,
  Receipt,
  Tag,
  Wallet,
  Smartphone,
  CreditCard,
  Building2,
  PiggyBank,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  FileSpreadsheet,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Scale,
  Utensils,
  ShoppingCart,
  Fuel,
  ShoppingBag,
  HeartHandshake,
  HeartPulse,
  Home,
  GraduationCap,
  Coffee,
  MoreHorizontal,
  Briefcase,
  Store,
  Laptop,
  Gift,
  PlusCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { formatCurrency, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../data/expenseCategories';
import { expenseApi } from '../../api/expenseApi';

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
  Receipt,
  Scale,
  Tag,
};

const CATEGORY_PALETTE = [
  '#088ac1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6',
  '#06b6d4', '#f43f5e', '#6366f1', '#14b8a6', '#eab308',
  '#3b82f6', '#a855f7', '#64748b'
];

/**
 * MonthlyReportsSection: Comprehensive monthly base report, different category analytics,
 * and searchable/filterable monthly transaction journal.
 */
export const MonthlyReportsSection = ({
  analyticsData,
  selectedMonth,
  setSelectedMonth,
  accounts = [],
  loading = false,
  onAddTransaction,
  onRefresh,
}) => {
  // Sub-view Tab: 'all' | 'report' | 'categories' | 'transactions'
  const [activeSubView, setActiveSubView] = useState('all');

  // Transactions State
  const [localTransactions, setLocalTransactions] = useState([]);
  const [loadingTxs, setLoadingTxs] = useState(false);

  // Category Filtering & Category View Mode
  const [activeCategoryTab, setActiveCategoryTab] = useState('expense'); // 'expense' | 'income'
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' or category name
  const [categorySortBy, setCategorySortBy] = useState('amount_desc'); // 'amount_desc' | 'count_desc' | 'name_asc'

  // Transaction Search & Filter Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all'); // 'all' | 'expense' | 'income' | 'transfer'
  const [selectedAccountFilter, setSelectedAccountFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('date_desc'); // 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'
  const [displayLimit, setDisplayLimit] = useState(15);
  const [showCategoryTable, setShowCategoryTable] = useState(false);

  // Sync transactions from analyticsData or fetch from backend API
  useEffect(() => {
    if (analyticsData?.month_transactions && Array.isArray(analyticsData.month_transactions)) {
      setLocalTransactions(analyticsData.month_transactions);
      setLoadingTxs(false);
    } else if (selectedMonth) {
      setLoadingTxs(true);
      const [y, m] = selectedMonth.split('-');
      const lastDay = new Date(Number(y), Number(m), 0).getDate();
      expenseApi.getTransactions({
        start_date: `${y}-${m}-01`,
        end_date: `${y}-${m}-${String(lastDay).padStart(2, '0')}`,
        limit: 300,
      })
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
          setLocalTransactions(list);
        })
        .catch((err) => {
          console.error('Failed to load month transactions:', err);
          setLocalTransactions([]);
        })
        .finally(() => setLoadingTxs(false));
    }
  }, [analyticsData?.month_transactions, selectedMonth]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (!selectedMonth) return;
    const [y, m] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const newY = prevDate.getFullYear();
    const newM = String(prevDate.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newY}-${newM}`);
    setSelectedCategory('all');
  };

  const handleNextMonth = () => {
    if (!selectedMonth) return;
    const [y, m] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    const newY = nextDate.getFullYear();
    const newM = String(nextDate.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newY}-${newM}`);
    setSelectedCategory('all');
  };

  const displayMonthName = useMemo(() => {
    if (analyticsData?.month_name) return analyticsData.month_name;
    if (!selectedMonth) return 'Current Month';
    try {
      const [y, m] = selectedMonth.split('-').map(Number);
      const d = new Date(y, (m || 1) - 1, 1);
      return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return selectedMonth;
    }
  }, [analyticsData?.month_name, selectedMonth]);

  // Core Financial Aggregates
  const income = Number(analyticsData?.monthly_income ?? 0);
  const expense = Number(analyticsData?.monthly_expense ?? 0);
  const savings = Number(analyticsData?.monthly_savings ?? (income - expense));
  const savingsRate = analyticsData?.savings_rate ?? (income > 0 ? Number(((savings / income) * 100).toFixed(1)) : 0);
  const daysElapsed = analyticsData?.days_elapsed ?? 1;
  const dailyAvgExp = analyticsData?.daily_avg_expense ?? Number((expense / Math.max(daysElapsed, 1)).toFixed(2));
  const dailyAvgInc = analyticsData?.daily_avg_income ?? Number((income / Math.max(daysElapsed, 1)).toFixed(2));
  const mom = analyticsData?.mom_comparison || {};
  const peakExpense = analyticsData?.peak_expense_day;

  // Compute Comprehensive Category Aggregates from localTransactions
  const categoryAnalyticsMap = useMemo(() => {
    const map = {
      expense: {},
      income: {},
    };

    localTransactions.forEach((tx) => {
      const type = tx.transaction_type;
      if (type !== 'expense' && type !== 'income') return;

      const catName = tx.category || 'Uncategorized';
      const amt = Number(tx.amount || 0);

      if (!map[type][catName]) {
        map[type][catName] = {
          category: catName,
          type,
          totalAmount: 0,
          count: 0,
          transactions: [],
          maxTx: null,
          minTx: null,
          icon: tx.category_icon || 'Tag',
        };
      }

      const item = map[type][catName];
      item.totalAmount += amt;
      item.count += 1;
      item.transactions.push(tx);

      if (!item.maxTx || amt > Number(item.maxTx.amount)) {
        item.maxTx = tx;
      }
      if (!item.minTx || amt < Number(item.minTx.amount)) {
        item.minTx = tx;
      }
    });

    return map;
  }, [localTransactions]);

  // Sorted Category Lists
  const expenseCategoryList = useMemo(() => {
    const list = Object.values(categoryAnalyticsMap.expense || {});
    const totalExp = expense > 0 ? expense : list.reduce((s, c) => s + c.totalAmount, 0);

    return list.map((c, idx) => ({
      ...c,
      color: CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length],
      percentage: totalExp > 0 ? Number(((c.totalAmount / totalExp) * 100).toFixed(1)) : 0,
      avgAmount: c.count > 0 ? Number((c.totalAmount / c.count).toFixed(2)) : 0,
    })).sort((a, b) => {
      if (categorySortBy === 'count_desc') return b.count - a.count;
      if (categorySortBy === 'name_asc') return (a.category || '').localeCompare(b.category || '');
      return b.totalAmount - a.totalAmount;
    });
  }, [categoryAnalyticsMap.expense, expense, categorySortBy]);

  const incomeCategoryList = useMemo(() => {
    const list = Object.values(categoryAnalyticsMap.income || {});
    const totalInc = income > 0 ? income : list.reduce((s, c) => s + c.totalAmount, 0);

    return list.map((c, idx) => ({
      ...c,
      color: CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length],
      percentage: totalInc > 0 ? Number(((c.totalAmount / totalInc) * 100).toFixed(1)) : 0,
      avgAmount: c.count > 0 ? Number((c.totalAmount / c.count).toFixed(2)) : 0,
    })).sort((a, b) => {
      if (categorySortBy === 'count_desc') return b.count - a.count;
      if (categorySortBy === 'name_asc') return (a.category || '').localeCompare(b.category || '');
      return b.totalAmount - a.totalAmount;
    });
  }, [categoryAnalyticsMap.income, income, categorySortBy]);

  const activeCategoryList = activeCategoryTab === 'expense' ? expenseCategoryList : incomeCategoryList;
  const currentTotalFlow = activeCategoryTab === 'expense' ? expense : income;

  // Selected Category Detailed Stats
  const selectedCategoryStats = useMemo(() => {
    if (selectedCategory === 'all') return null;
    return activeCategoryList.find((c) => c.category === selectedCategory) || null;
  }, [selectedCategory, activeCategoryList]);

  // Payment Method Breakdown
  const paymentMethodStats = useMemo(() => {
    const methods = {
      upi: { label: 'UPI / Scan & Pay', amount: 0, count: 0, icon: Smartphone, color: '#088ac1' },
      cash: { label: 'Cash in Hand', amount: 0, count: 0, icon: Wallet, color: '#10b981' },
      card: { label: 'Card / POS', amount: 0, count: 0, icon: CreditCard, color: '#f59e0b' },
      bank_transfer: { label: 'Net Banking / Transfer', amount: 0, count: 0, icon: Building2, color: '#8b5cf6' },
    };

    localTransactions.forEach((tx) => {
      const pm = (tx.payment_method || 'cash').toLowerCase();
      const amt = Number(tx.amount || 0);
      if (methods[pm]) {
        methods[pm].amount += amt;
        methods[pm].count += 1;
      } else {
        methods.cash.amount += amt;
        methods.cash.count += 1;
      }
    });

    return Object.entries(methods).map(([key, data]) => ({
      key,
      ...data,
      percentage: expense > 0 ? Number(((data.amount / (expense + income || 1)) * 100).toFixed(1)) : 0,
    })).filter((m) => m.count > 0);
  }, [localTransactions, expense, income]);

  // Filtered & Sorted Transactions for the Journal View
  const filteredTransactions = useMemo(() => {
    let result = [...localTransactions];

    // Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter((t) => t.category === selectedCategory);
    }

    // Type Filter
    if (selectedTypeFilter !== 'all') {
      result = result.filter((t) => t.transaction_type === selectedTypeFilter);
    }

    // Account Filter
    if (selectedAccountFilter !== 'all') {
      result = result.filter((t) => String(t.account_id) === String(selectedAccountFilter) || String(t.account) === String(selectedAccountFilter));
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((t) => {
        const notesMatch = (t.notes || '').toLowerCase().includes(q);
        const catMatch = (t.category || '').toLowerCase().includes(q);
        const accMatch = (t.account_name || '').toLowerCase().includes(q);
        const pmMatch = (t.payment_method || '').toLowerCase().includes(q);
        const amtMatch = String(t.amount || '').includes(q);
        return notesMatch || catMatch || accMatch || pmMatch || amtMatch;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortOrder === 'date_asc') {
        const da = new Date(a.date ? `${String(a.date).slice(0, 10)}T${String(a.time || '00:00').slice(0, 5)}` : 0).getTime() || 0;
        const db = new Date(b.date ? `${String(b.date).slice(0, 10)}T${String(b.time || '00:00').slice(0, 5)}` : 0).getTime() || 0;
        return da - db;
      }
      if (sortOrder === 'amount_desc') {
        return Number(b.amount || 0) - Number(a.amount || 0);
      }
      if (sortOrder === 'amount_asc') {
        return Number(a.amount || 0) - Number(b.amount || 0);
      }
      // date_desc (default)
      const da = new Date(a.date ? `${String(a.date).slice(0, 10)}T${String(a.time || '00:00').slice(0, 5)}` : 0).getTime() || 0;
      const db = new Date(b.date ? `${String(b.date).slice(0, 10)}T${String(b.time || '00:00').slice(0, 5)}` : 0).getTime() || 0;
      return db - da;
    });

    return result;
  }, [localTransactions, selectedCategory, selectedTypeFilter, selectedAccountFilter, searchQuery, sortOrder]);

  // Filtered Transactions Total
  const filteredTotalAmount = useMemo(() => {
    return filteredTransactions.reduce((sum, tx) => {
      const amt = Number(tx.amount || 0);
      if (tx.transaction_type === 'expense') return sum - amt;
      if (tx.transaction_type === 'income') return sum + amt;
      return sum;
    }, 0);
  }, [filteredTransactions]);

  // CSV Export for Monthly Base Report & Transactions
  const handleExportMonthlyCsv = () => {
    try {
      let csv = `MONTHLY FINANCIAL BASE REPORT - ${displayMonthName.toUpperCase()}\n`;
      csv += `Generated On,${new Date().toLocaleString()}\n`;
      csv += `Total Inflow (Income),${income}\n`;
      csv += `Total Outflow (Expense),${expense}\n`;
      csv += `Net Balance / Savings,${savings}\n`;
      csv += `Savings Rate,${savingsRate}%\n`;
      csv += `Average Daily Burn Speed,${dailyAvgExp}\n`;
      csv += `Total Transactions,${localTransactions.length}\n\n`;

      csv += `CATEGORY BREAKDOWN MATRIX\n`;
      csv += `Category Name,Type,Transaction Count,Total Amount,Share %,Average Tx Size\n`;
      expenseCategoryList.forEach((c) => {
        csv += `"${c.category}",Expense,${c.count},${c.totalAmount},${c.percentage}%,${c.avgAmount}\n`;
      });
      incomeCategoryList.forEach((c) => {
        csv += `"${c.category}",Income,${c.count},${c.totalAmount},${c.percentage}%,${c.avgAmount}\n`;
      });

      csv += `\nMONTHLY TRANSACTIONS JOURNAL\n`;
      csv += `Date,Time,Type,Category,Account,Payment Method,Notes,Amount\n`;
      localTransactions.forEach((t) => {
        csv += `"${t.date}","${t.time || ''}","${t.transaction_type}","${t.category || ''}","${t.account_name || 'Account'}","${t.payment_method || ''}","${(t.notes || '').replace(/"/g, '""')}",${t.amount}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Monthly_Report_${selectedMonth || 'export'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    }
  };

  // Savings status badge helper
  const savingsStatusInfo = useMemo(() => {
    if (savings < 0) {
      return {
        label: 'Deficit / Overspent',
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60',
        icon: AlertCircle,
        advice: 'Expenditure exceeded earnings this month. Review high-spend categories.',
      };
    }
    if (savingsRate >= 40) {
      return {
        label: 'Exceptional (≥40%)',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60',
        icon: Sparkles,
        advice: 'Outstanding financial discipline! You retained over 40% of earnings.',
      };
    }
    if (savingsRate >= 20) {
      return {
        label: 'Healthy (≥20%)',
        color: 'text-[#088ac1] dark:text-[#3dc3f3]',
        bg: 'bg-[#e1f3fd] dark:bg-[#0c4059]/50 border-[#bce8fb] dark:border-[#1eb4eb]/30',
        icon: CheckCircle2,
        advice: 'Healthy savings buffer meeting recommended wealth building targets.',
      };
    }
    if (savingsRate > 0) {
      return {
        label: 'Moderate (>0%)',
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60',
        icon: Coins,
        advice: 'Positive liquidity surplus. Aim to curb discretionary costs to reach ≥20%.',
      };
    }
    return {
      label: 'Balanced (0%)',
      color: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
      icon: Scale,
      advice: 'Income precisely matched expenses. Try setting aside an emergency fund.',
    };
  }, [savings, savingsRate]);

  if (loading && !analyticsData) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-pulse">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
        <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* 1. Header Suite & View Switcher */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 shadow-soft border border-slate-200/80 dark:border-white/10 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#088ac1] to-[#076e9d] text-white shadow-xs">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  Monthly Base Reports & Category Intelligence
                </h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-[#e1f3fd] dark:bg-[#0c4059] text-[#076e9d] dark:text-[#3dc3f3] uppercase tracking-wider">
                  Audited Ledger
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Periodical balance statements, category-wise expenditure velocity & integrated transaction journal
              </p>
            </div>
          </div>

          {/* Quick Actions & Month Controller */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Month Stepper */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-[#0b1822] p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="relative flex items-center">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    setSelectedCategory('all');
                  }}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                  title="Choose custom month"
                />
                <span className="px-2.5 text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 select-none pointer-events-none min-w-[110px] text-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-[#088ac1] dark:text-[#3dc3f3]" />
                  {displayMonthName}
                </span>
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportMonthlyCsv}
              className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#0b1822] border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-[#088ac1] dark:hover:text-[#3dc3f3] hover:border-[#088ac1]/40 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
              title="Download Monthly Base Report & Transactions as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {/* Quick Add Transaction Button */}
            {onAddTransaction && (
              <button
                type="button"
                onClick={() => onAddTransaction('expense')}
                className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#088ac1] to-[#076e9d] hover:from-[#0999d7] hover:to-[#088ac1] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Log Entry</span>
              </button>
            )}
          </div>
        </div>

        {/* Section View Pills Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-2 border-t border-slate-100 dark:border-white/5">
          <button
            type="button"
            onClick={() => setActiveSubView('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
              activeSubView === 'all'
                ? 'bg-[#088ac1] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Complete Suite</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubView('report')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
              activeSubView === 'report'
                ? 'bg-[#088ac1] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Monthly Base Report</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubView('categories')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
              activeSubView === 'categories'
                ? 'bg-[#088ac1] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            <span>Category Analytics ({activeCategoryList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubView('transactions')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
              activeSubView === 'transactions'
                ? 'bg-[#088ac1] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Transactions Journal ({localTransactions.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Monthly Base Report: Executive Cards & Flow Meter */}
      {(activeSubView === 'all' || activeSubView === 'report') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400">
                <BarChart3 className="w-4 h-4" />
              </span>
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Monthly Statement & Inflow/Outflow Audit
              </h4>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">
              {daysElapsed} Days Tracked
            </span>
          </div>

          {/* 4-Card Executive Financial Health Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Income */}
            <div className="glass-card rounded-3xl p-5 shadow-soft border border-slate-200/80 dark:border-white/10 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                  Total Inflow
                </span>
                <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <ArrowDownLeft className="w-4 h-4" />
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(income)}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-white/5">
                <span>Avg: {formatCurrency(dailyAvgInc)}/day</span>
                <span className="font-medium">{incomeCategoryList.reduce((s, c) => s + c.count, 0)} Credits</span>
              </div>
            </div>

            {/* Total Expense */}
            <div className="glass-card rounded-3xl p-5 shadow-soft border border-slate-200/80 dark:border-white/10 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                  Total Outflow
                </span>
                <span className="p-2 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
                {formatCurrency(expense)}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-white/5">
                <span>Burn: {formatCurrency(dailyAvgExp)}/day</span>
                <span className="font-medium">{expenseCategoryList.reduce((s, c) => s + c.count, 0)} Debits</span>
              </div>
            </div>

            {/* Net Savings & Retention */}
            <div className="glass-card rounded-3xl p-5 shadow-soft border border-slate-200/80 dark:border-white/10 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                  Net Retained / Surplus
                </span>
                <span className={`p-2 rounded-xl ${savings >= 0 ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'}`}>
                  <Coins className="w-4 h-4" />
                </span>
              </div>
              <div className={`text-xl sm:text-2xl font-extrabold font-mono ${savings >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {savings >= 0 ? '+' : ''}{formatCurrency(savings)}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-white/5">
                <span className="font-bold text-slate-700 dark:text-slate-300">Rate: {savingsRate}%</span>
                <span className={`px-1.5 py-0.5 rounded-md font-bold text-[10px] ${savingsStatusInfo.bg} ${savingsStatusInfo.color}`}>
                  {savingsStatusInfo.label.split(' ')[0]}
                </span>
              </div>
            </div>

            {/* Peak Expense Day & Outliers */}
            <div className="glass-card rounded-3xl p-5 shadow-soft border border-slate-200/80 dark:border-white/10 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                  Peak Spend Velocity
                </span>
                <span className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Zap className="w-4 h-4" />
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                {peakExpense ? formatCurrency(peakExpense.amount) : '₹0.00'}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-white/5">
                <span className="truncate max-w-[130px]">Day: {peakExpense?.label || 'None'}</span>
                <span>{localTransactions.length} Total Tx</span>
              </div>
            </div>
          </div>

          {/* Inflow vs Outflow Allocation Bar & Status Banner */}
          <div className="glass-card rounded-3xl p-5 sm:p-6 shadow-soft border border-slate-200/80 dark:border-white/10 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-white">Monthly Cash Flow Allocation</span>
                <span className="text-[11px] text-slate-400">
                  (Expenditure: {income > 0 ? ((expense / income) * 100).toFixed(1) : 0}% of earnings)
                </span>
              </div>
              <span className={`text-[11px] font-bold ${savingsStatusInfo.color}`}>
                {savingsStatusInfo.advice}
              </span>
            </div>

            {/* Dynamic Multi-Segment Allocation Meter */}
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex shadow-inner">
              {income > 0 ? (
                <>
                  <div
                    className="h-full bg-rose-500 transition-all duration-500"
                    style={{ width: `${Math.min(Math.max((expense / income) * 100, 0), 100)}%` }}
                    title={`Spent: ${formatCurrency(expense)}`}
                  />
                  {savings > 0 && (
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.min(Math.max((savings / income) * 100, 0), 100)}%` }}
                      title={`Saved: ${formatCurrency(savings)}`}
                    />
                  )}
                </>
              ) : (
                <div
                  className="h-full bg-slate-300 dark:bg-slate-700 transition-all duration-500"
                  style={{ width: expense > 0 ? '100%' : '0%' }}
                />
              )}
            </div>

            {/* Legend & Payment Methods */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px]">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Outflow ({formatCurrency(expense)})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Retained ({formatCurrency(Math.max(savings, 0))})</span>
                </div>
              </div>

              {/* Payment Methods Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {paymentMethodStats.map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <div
                      key={pm.key}
                      className="px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 flex items-center gap-1.5 text-[10px] font-medium text-slate-700 dark:text-slate-300"
                    >
                      <Icon className="w-3 h-3 text-[#088ac1]" />
                      <span>{pm.label.split('/')[0]}:</span>
                      <span className="font-bold font-mono">{formatCurrency(pm.amount)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Different Category Analytics & Comparative Intelligence */}
      {(activeSubView === 'all' || activeSubView === 'categories') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <PieChartIcon className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Different Category Analytics & Distribution
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select any category to inspect transaction frequency, average spend & individual journal items
                </p>
              </div>
            </div>

            {/* Category Mode Switcher: Expense vs Income */}
            <div className="inline-flex rounded-2xl bg-slate-100 dark:bg-white/[0.05] p-1 text-xs font-bold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveCategoryTab('expense');
                  setSelectedCategory('all');
                }}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCategoryTab === 'expense'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Expense Categories ({expenseCategoryList.length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveCategoryTab('income');
                  setSelectedCategory('all');
                }}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCategoryTab === 'income'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Income Categories ({incomeCategoryList.length})</span>
              </button>
            </div>
          </div>

          {/* Horizontal Category Filtering Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {/* All Categories Pill */}
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 active:scale-95 ${
                selectedCategory === 'all'
                  ? 'bg-[#088ac1] text-white border-[#088ac1] shadow-xs'
                  : 'bg-white dark:bg-[#0b1822] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:border-[#088ac1]/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Categories ({activeCategoryList.length})</span>
              <span className={`px-1.5 py-0.2 rounded-md font-mono text-[10px] ${selectedCategory === 'all' ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/10'}`}>
                {formatCurrency(currentTotalFlow)}
              </span>
            </button>

            {/* Individual Category Pills */}
            {activeCategoryList.map((cat) => {
              const Icon = ICON_MAP[cat.icon] || ICON_MAP[cat.category] || Tag;
              const isSelected = selectedCategory === cat.category;

              return (
                <button
                  key={cat.category}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? 'all' : cat.category)}
                  className={`px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#088ac1] to-[#076e9d] text-white border-[#088ac1] shadow-xs'
                      : 'bg-white dark:bg-[#0b1822] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:border-[#088ac1]/50 hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate max-w-[130px]">{cat.category}</span>
                  <span className="font-mono text-[11px] font-extrabold opacity-90">
                    {formatCurrency(cat.totalAmount)}
                  </span>
                  <span className="text-[10px] font-mono opacity-75">
                    ({cat.percentage}%)
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Category Spotlight Banner (When a specific category is tapped) */}
          {selectedCategoryStats && (
            <div className="glass-card rounded-3xl p-5 sm:p-6 shadow-soft border border-[#088ac1]/30 bg-gradient-to-r from-[#088ac1]/10 via-slate-50/50 dark:via-slate-900/40 to-transparent space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                    style={{
                      backgroundColor: `${selectedCategoryStats.color}25`,
                      color: selectedCategoryStats.color,
                    }}
                  >
                    {React.createElement(ICON_MAP[selectedCategoryStats.icon] || ICON_MAP[selectedCategoryStats.category] || Tag, {
                      className: 'w-6 h-6',
                    })}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                        {selectedCategoryStats.category}
                      </h4>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                        style={{ backgroundColor: selectedCategoryStats.color }}
                      >
                        {selectedCategoryStats.type}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                        {selectedCategoryStats.percentage}% of total {activeCategoryTab}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Detailed analytics & transaction journal for this category
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {onAddTransaction && (
                    <button
                      type="button"
                      onClick={() => onAddTransaction(selectedCategoryStats.type)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#088ac1] to-[#076e9d] text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Entry</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className="p-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    title="Clear Category Filter"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 4 Spotlight Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total Spent</span>
                  <p className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                    {formatCurrency(selectedCategoryStats.totalAmount)}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Transactions</span>
                  <p className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                    {selectedCategoryStats.count} entries
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Average Size</span>
                  <p className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                    {formatCurrency(selectedCategoryStats.avgAmount)}/tx
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Largest Debit</span>
                  <p className="text-base font-extrabold font-mono text-rose-600 dark:text-rose-400 truncate">
                    {selectedCategoryStats.maxTx ? formatCurrency(selectedCategoryStats.maxTx.amount) : 'None'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Comparative Category Ranking & Progress Breakdown */}
          <div className="glass-card rounded-3xl p-5 sm:p-7 shadow-soft border border-slate-200/80 dark:border-white/10 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Category Rankings & Relative Share</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {activeCategoryList.length} Categories
                  </span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Proportional burn matrix sorted by volume. Tap any row to filter the transactions below.
                </p>
              </div>

              {/* Sort Switcher & Table Toggle */}
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setCategorySortBy('amount_desc')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      categorySortBy === 'amount_desc'
                        ? 'bg-white dark:bg-slate-700 text-[#088ac1] dark:text-[#3dc3f3] shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    By Amount
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategorySortBy('count_desc')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      categorySortBy === 'count_desc'
                        ? 'bg-white dark:bg-slate-700 text-[#088ac1] dark:text-[#3dc3f3] shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    By Count
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCategoryTable(!showCategoryTable)}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                  title="Toggle Detailed Table View"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{showCategoryTable ? 'Bar View' : 'Table View'}</span>
                </button>
              </div>
            </div>

            {/* List / Bar Cards View */}
            {!showCategoryTable ? (
              <div className="space-y-3">
                {activeCategoryList.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 dark:bg-white/[0.01] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    No {activeCategoryTab} categories recorded for {displayMonthName}.
                  </div>
                ) : (
                  activeCategoryList.map((cat, idx) => {
                    const Icon = ICON_MAP[cat.icon] || ICON_MAP[cat.category] || Tag;
                    const isSelected = selectedCategory === cat.category;
                    const maxVal = activeCategoryList[0]?.totalAmount || 1;
                    const relativePercent = Math.min((cat.totalAmount / maxVal) * 100, 100);

                    return (
                      <div
                        key={cat.category}
                        onClick={() => setSelectedCategory(isSelected ? 'all' : cat.category)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer group active:scale-[0.99] ${
                          isSelected
                            ? 'bg-[#088ac1]/15 dark:bg-[#088ac1]/20 border-[#088ac1] shadow-xs'
                            : 'bg-slate-50/70 dark:bg-white/[0.02] border-slate-100 dark:border-white/5 hover:border-[#088ac1]/50 hover:bg-slate-100/60 dark:hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-[10px] font-mono font-bold text-slate-400 w-4">
                              #{idx + 1}
                            </span>
                            <span
                              className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white truncate">
                              {cat.category}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold shrink-0">
                              {cat.count} txns
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] text-slate-400 font-mono">
                              avg {formatCurrency(cat.avgAmount)}
                            </span>
                            <span className="font-extrabold font-mono text-sm text-slate-900 dark:text-white">
                              {formatCurrency(cat.totalAmount)}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 font-mono w-10 text-right">
                              {cat.percentage}%
                            </span>
                          </div>
                        </div>

                        {/* Relative Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-slate-200/70 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${relativePercent}%`,
                              backgroundColor: cat.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              /* Detailed Table View */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-center">Entries</th>
                      <th className="py-2.5 px-3 text-right">Average</th>
                      <th className="py-2.5 px-3 text-right">Peak Debit</th>
                      <th className="py-2.5 px-3 text-right">Share</th>
                      <th className="py-2.5 px-3 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {activeCategoryList.map((cat, idx) => {
                      const Icon = ICON_MAP[cat.icon] || Tag;
                      return (
                        <tr
                          key={cat.category}
                          onClick={() => setSelectedCategory(selectedCategory === cat.category ? 'all' : cat.category)}
                          className={`hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors ${
                            selectedCategory === cat.category ? 'bg-[#088ac1]/10 dark:bg-[#088ac1]/15' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono text-slate-400 text-[10px]">#{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                            <Icon className="w-3.5 h-3.5 text-slate-400" />
                            <span>{cat.category}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono">{cat.count}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-500">{formatCurrency(cat.avgAmount)}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-rose-500">
                            {cat.maxTx ? formatCurrency(cat.maxTx.amount) : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-[#088ac1]">{cat.percentage}%</td>
                          <td className="py-2.5 px-3 text-right font-mono font-extrabold text-slate-900 dark:text-white">
                            {formatCurrency(cat.totalAmount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Integrated Monthly Transactions Journal (With Filters & Real-time Search) */}
      {(activeSubView === 'all' || activeSubView === 'transactions') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Receipt className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Monthly Transactions Journal</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {filteredTransactions.length} of {localTransactions.length}
                  </span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Searchable, category-filtered ledger records for {displayMonthName}
                </p>
              </div>
            </div>

            {/* Results Amount Tally */}
            <div className="text-xs font-mono font-bold self-start sm:self-auto text-slate-600 dark:text-slate-300">
              Filtered Sum: <span className={filteredTotalAmount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                {formatCurrency(filteredTotalAmount)}
              </span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="glass-card rounded-3xl p-4 shadow-soft border border-slate-200/80 dark:border-white/10 flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search note, category, account, payment method, amount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#088ac1]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Dropdown Filter */}
            <div className="w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-44 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#088ac1] font-bold cursor-pointer"
              >
                <option value="all">All Categories ({activeCategoryList.length})</option>
                {activeCategoryList.map((c) => (
                  <option key={c.category} value={c.category}>
                    {c.category} ({c.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Type Dropdown Filter */}
            <div className="w-full md:w-auto">
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="w-full md:w-36 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#088ac1] font-bold cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="expense">Expenses Only</option>
                <option value="income">Income Only</option>
                <option value="transfer">Transfers Only</option>
              </select>
            </div>

            {/* Account Filter */}
            {accounts.length > 0 && (
              <div className="w-full md:w-auto">
                <select
                  value={selectedAccountFilter}
                  onChange={(e) => setSelectedAccountFilter(e.target.value)}
                  className="w-full md:w-36 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#088ac1] font-bold cursor-pointer"
                >
                  <option value="all">All Accounts</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Order Dropdown */}
            <div className="w-full md:w-auto">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full md:w-36 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#088ac1] font-bold cursor-pointer"
              >
                <option value="date_desc">Date: Newest</option>
                <option value="date_asc">Date: Oldest</option>
                <option value="amount_desc">Amount: High to Low</option>
                <option value="amount_asc">Amount: Low to High</option>
              </select>
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-2.5">
            {loadingTxs ? (
              <div className="space-y-3 py-6 animate-pulse">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="glass-card rounded-3xl p-8 sm:p-12 text-center space-y-3 border border-dashed border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Receipt className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  No matching transactions found
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {selectedCategory !== 'all' || searchQuery || selectedTypeFilter !== 'all'
                    ? 'Try adjusting your category filter, type filter, or search term.'
                    : `No transactions recorded for ${displayMonthName}.`}
                </p>
                {(selectedCategory !== 'all' || searchQuery || selectedTypeFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                      setSelectedTypeFilter('all');
                      setSelectedAccountFilter('all');
                    }}
                    className="px-4 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {filteredTransactions.slice(0, displayLimit).map((tx) => {
                  const isExp = tx.transaction_type === 'expense';
                  const isInc = tx.transaction_type === 'income';
                  const Icon = ICON_MAP[tx.category_icon] || ICON_MAP[tx.category] || Tag;

                  return (
                    <div
                      key={tx.id}
                      className="glass-card rounded-2xl p-3.5 sm:p-4 shadow-2xs border border-slate-200/70 dark:border-white/5 hover:border-[#088ac1]/40 dark:hover:border-[#088ac1]/40 transition-colors flex items-center justify-between gap-3"
                    >
                      {/* Left Side: Type Icon & Transaction Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                            isExp
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : isInc
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                          }`}
                        >
                          {isExp ? (
                            <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
                          ) : isInc ? (
                            <ArrowDownLeft className="w-5 h-5 stroke-[2.2]" />
                          ) : (
                            <ArrowRightLeft className="w-5 h-5 stroke-[2.2]" />
                          )}
                        </span>

                        <div className="min-w-0 space-y-1">
                          <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {tx.notes && tx.notes.trim() ? tx.notes : tx.category || 'Transaction'}
                          </p>

                          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-400 flex-wrap">
                            <span className="font-mono">{tx.date}</span>
                            {tx.time && <span>• {tx.time.slice(0, 5)}</span>}

                            {/* Category Badge */}
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCategory(tx.category);
                              }}
                              className="px-2 py-0.5 rounded-md font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] hover:bg-[#088ac1]/20 hover:text-[#088ac1] transition-colors cursor-pointer flex items-center gap-1"
                              title={`Filter to ${tx.category}`}
                            >
                              <Icon className="w-3 h-3 text-[#088ac1]" />
                              <span>{tx.category || 'Uncategorized'}</span>
                            </span>

                            {/* Account Badge */}
                            {tx.account_name && (
                              <span
                                className="px-2 py-0.5 rounded-md font-bold"
                                style={{
                                  backgroundColor: `${tx.account_color || '#088ac1'}15`,
                                  color: tx.account_color || '#088ac1',
                                }}
                              >
                                {tx.account_name}
                              </span>
                            )}

                            {/* Payment Method Badge */}
                            {tx.payment_method && (
                              <span className="uppercase text-[9px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 font-mono">
                                {tx.payment_method}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Formatted Amount */}
                      <div className="text-right shrink-0">
                        <span
                          className={`font-mono font-extrabold text-sm sm:text-base ${
                            isExp
                              ? 'text-rose-600 dark:text-rose-400'
                              : isInc
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-sky-600 dark:text-sky-400'
                          }`}
                        >
                          {isExp ? '-' : isInc ? '+' : ''}
                          {formatCurrency(tx.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Show More Pagination Button */}
                {filteredTransactions.length > displayLimit && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setDisplayLimit((prev) => prev + 25)}
                      className="px-5 py-2.5 rounded-2xl bg-white dark:bg-[#0b1822] border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-[#088ac1] dark:hover:text-[#3dc3f3] font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
                    >
                      Show More ({filteredTransactions.length - displayLimit} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

