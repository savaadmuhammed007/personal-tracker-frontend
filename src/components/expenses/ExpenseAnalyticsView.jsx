import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  PieChart as PieChartIcon,
  BarChart3,
  LineChart as LineChartIcon,
  HeartHandshake,
  Sparkles,
  Zap,
  Tag,
  ShieldCheck,
  Award,
  Wallet,
  Smartphone,
  Building2,
  CreditCard,
  PiggyBank,
  ArrowRight,
  Scale,
  CalendarDays,
  Percent,
  CheckCircle2,
  AlertCircle,
  Clock,
  Utensils,
  ShoppingCart,
  Fuel,
  ShoppingBag,
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
  ArrowRightLeft,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { formatCurrency } from '../../data/expenseCategories';

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

const CATEGORY_PALETTE = [
  '#088ac1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6',
  '#06b6d4', '#f43f5e', '#6366f1', '#14b8a6', '#eab308',
  '#3b82f6', '#a855f7', '#64748b'
];

export const ExpenseAnalyticsView = ({
  analyticsData,
  selectedMonth,
  setSelectedMonth,
  loading = false,
  onAddTransaction,
}) => {
  const [chartViewMode, setChartViewMode] = useState('daily'); // 'daily' | 'cumulative' | 'history6m'
  const [activeCategoryTab, setActiveCategoryTab] = useState('expense'); // 'expense' | 'income'
  const [hoveredSliceIndex, setHoveredSliceIndex] = useState(null);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (!selectedMonth) return;
    const [y, m] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const newY = prevDate.getFullYear();
    const newM = String(prevDate.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newY}-${newM}`);
  };

  const handleNextMonth = () => {
    if (!selectedMonth) return;
    const [y, m] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    const newY = nextDate.getFullYear();
    const newM = String(nextDate.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newY}-${newM}`);
  };

  const setPresetMonth = (preset) => {
    const now = new Date();
    if (preset === 'current') {
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      setSelectedMonth(`${y}-${m}`);
    } else if (preset === 'last') {
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const y = prev.getFullYear();
      const newM = String(prev.getMonth() + 1).padStart(2, '0');
      setSelectedMonth(`${y}-${m}`);
    } else if (preset === '2months_ago') {
      const prev = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const y = prev.getFullYear();
      const newM = String(prev.getMonth() + 1).padStart(2, '0');
      setSelectedMonth(`${y}-${m}`);
    }
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

  // Safe data access
  const income = analyticsData?.monthly_income ?? 0;
  const expense = analyticsData?.monthly_expense ?? 0;
  const savings = analyticsData?.monthly_savings ?? 0;
  const savingsRate = analyticsData?.savings_rate ?? 0;
  const daysElapsed = analyticsData?.days_elapsed ?? 1;
  const dailyAvgExp = analyticsData?.daily_avg_expense ?? 0;
  const dailyAvgInc = analyticsData?.daily_avg_income ?? 0;
  const peakExpense = analyticsData?.peak_expense_day;
  const mom = analyticsData?.mom_comparison || {};
  const sadaqah = analyticsData?.sadaqah || {};
  const dailyTrend = analyticsData?.daily_trend || [];
  const topCategories = analyticsData?.top_categories || [];
  const incomeCategories = analyticsData?.income_categories || [];
  const accountFlows = analyticsData?.account_flows || [];
  const topExpenses = analyticsData?.top_expenses || [];
  const history6m = analyticsData?.history_6m || [];

  const hasTransactions = useMemo(() => {
    return (
      (income > 0 || expense > 0) ||
      topCategories.length > 0 ||
      incomeCategories.length > 0 ||
      topExpenses.length > 0 ||
      dailyTrend.some((d) => (d.income > 0 || d.expense > 0))
    );
  }, [income, expense, topCategories, incomeCategories, topExpenses, dailyTrend]);

  // Savings status evaluation
  const savingsStatus = useMemo(() => {
    if (savings < 0) return { label: 'Deficit / Overspent', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60', icon: AlertCircle };
    if (savingsRate >= 40) return { label: 'Exceptional (≥40%)', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60', icon: Award };
    if (savingsRate >= 20) return { label: 'Healthy (≥20%)', color: 'text-[#088ac1] dark:text-[#3dc3f3]', bg: 'bg-[#e1f3fd] dark:bg-[#0c4059]/50 border-[#bce8fb] dark:border-[#1eb4eb]/30', icon: ShieldCheck };
    if (savingsRate > 0) return { label: 'Moderate (>0%)', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60', icon: Scale };
    return { label: 'Balanced (0%)', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700', icon: Scale };
  }, [savings, savingsRate]);

  // Donut chart dataset
  const donutData = useMemo(() => {
    if (activeCategoryTab === 'expense') {
      return topCategories.map((c, idx) => ({
        name: c.category,
        value: c.amount,
        percentage: c.percentage,
        count: c.count,
        color: CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length],
      }));
    } else {
      return incomeCategories.map((c, idx) => ({
        name: c.category,
        value: c.amount,
        percentage: c.percentage,
        count: c.count,
        color: CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length],
      }));
    }
  }, [activeCategoryTab, topCategories, incomeCategories]);

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
      {/* 1. Header & Period Control Suite */}
      <div className="glass-card rounded-3xl p-4 sm:p-6 shadow-soft flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#e1f3fd] dark:bg-[#0c4059]/60 text-[#076e9d] dark:text-[#3dc3f3]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Financial Analytics & Velocity</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#e1f3fd] dark:bg-[#0c4059]/60 text-[#076e9d] dark:text-[#3dc3f3] uppercase tracking-wider">
                  Live Vectorized
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Accurate month-over-month cashflow, category distribution & Islamic giving audit
              </p>
            </div>
          </div>
        </div>

        {/* Quick Period Selector & Month Stepper */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Preset Buttons */}
          <div className="inline-flex rounded-2xl bg-slate-100 dark:bg-white/[0.04] p-1 border border-slate-200/80 dark:border-white/5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setPresetMonth('current')}
              className="px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setPresetMonth('last')}
              className="px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              Last Month
            </button>
            <button
              type="button"
              onClick={() => setPresetMonth('2months_ago')}
              className="hidden sm:inline-block px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              2 Mo Ago
            </button>
          </div>

          {/* Month Stepper Controller */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#0b1822] p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="relative flex items-center">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                title="Click to choose custom month"
              />
              <span className="px-2.5 text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 select-none pointer-events-none min-w-[110px] text-center justify-center">
                <Calendar className="w-3.5 h-3.5 text-[#088ac1] dark:text-[#3dc3f3]" />
                {displayMonthName}
              </span>
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State Action Banner when no transactions exist for selected month */}
      {!hasTransactions && (
        <div className="glass-card rounded-3xl p-5 sm:p-6 border border-dashed border-[#088ac1]/30 bg-gradient-to-r from-[#088ac1]/10 via-slate-50/50 dark:via-slate-900/40 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#e1f3fd] dark:bg-[#0c4059] text-[#088ac1] dark:text-[#3dc3f3]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                No Transactions Logged for {displayMonthName}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Log your daily expenses, salary credits, or transfers to unlock real-time graphs and analytics.
              </p>
            </div>
          </div>

          {onAddTransaction && (
            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                type="button"
                onClick={() => onAddTransaction('expense')}
                className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>- Expense</span>
              </button>
              <button
                type="button"
                onClick={() => onAddTransaction('income')}
                className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Income</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. Executive Financial Health Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Monthly Total Inflow (Income) */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/40 dark:via-[#0b1822] dark:to-[#0b1822] border border-emerald-500/20 dark:border-emerald-500/30 flex flex-col justify-between shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Total Inflow (Income)</span>
            </span>
            <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Coins className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
              +{formatCurrency(income)}
            </div>

            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-emerald-500/15">
              <span className="text-slate-500 dark:text-slate-400">
                Avg: <strong className="font-mono text-slate-700 dark:text-slate-300">{formatCurrency(dailyAvgInc)}/day</strong>
              </span>

              {mom.income_mom_pct !== null && (
                <span
                  className={`inline-flex items-center gap-0.5 font-bold font-mono px-1.5 py-0.5 rounded-md text-[10px] ${
                    mom.income_mom_pct >= 0
                      ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60'
                      : 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60'
                  }`}
                >
                  {mom.income_mom_pct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {mom.income_mom_pct >= 0 ? '+' : ''}{mom.income_mom_pct}% MoM
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Monthly Total Outflow (Expenses) */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent dark:from-rose-950/40 dark:via-[#0b1822] dark:to-[#0b1822] border border-rose-500/20 dark:border-rose-500/30 flex flex-col justify-between shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Total Outflow (Spent)</span>
            </span>
            <span className="p-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400 tracking-tight">
              -{formatCurrency(expense)}
            </div>

            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-rose-500/15">
              <span className="text-slate-500 dark:text-slate-400">
                Burn: <strong className="font-mono text-slate-700 dark:text-slate-300">{formatCurrency(dailyAvgExp)}/day</strong>
              </span>

              {mom.expense_mom_pct !== null && (
                <span
                  className={`inline-flex items-center gap-0.5 font-bold font-mono px-1.5 py-0.5 rounded-md text-[10px] ${
                    mom.expense_mom_pct <= 0
                      ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60'
                      : 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60'
                  }`}
                  title={`${mom.expense_mom_pct}% spending change compared to ${mom.prev_month_name}`}
                >
                  {mom.expense_mom_pct <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                  {mom.expense_mom_pct > 0 ? '+' : ''}{mom.expense_mom_pct}% MoM
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Net Cashflow & Savings Rate */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#088ac1]/10 via-[#088ac1]/5 to-transparent dark:from-[#0c4059]/50 dark:via-[#0b1822] dark:to-[#0b1822] border border-[#088ac1]/25 dark:border-[#1eb4eb]/30 flex flex-col justify-between shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#076e9d] dark:text-[#3dc3f3] uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-[#088ac1] shrink-0" />
              <span>Net Surplus / Savings</span>
            </span>
            <span className="p-1.5 rounded-xl bg-[#088ac1]/10 text-[#088ac1] dark:text-[#3dc3f3] shrink-0">
              <Percent className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-1">
            <div
              className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
                savings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {savings >= 0 ? '+' : ''}{formatCurrency(savings)}
            </div>

            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#088ac1]/15">
              <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] border ${savingsStatus.bg} ${savingsStatus.color}`}>
                <savingsStatus.icon className="w-3 h-3" />
                {savingsStatus.label}
              </span>

              <span className="font-extrabold font-mono text-xs text-slate-800 dark:text-slate-200">
                {savingsRate}% Saved
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Sadaqah & Virtuous Giving (Islamic Barakah) */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-cyan-500/5 to-transparent dark:from-amber-950/30 dark:via-cyan-950/20 dark:to-[#0b1822] border border-amber-500/25 dark:border-amber-500/30 flex flex-col justify-between shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Sadaqah & Charity</span>
            </span>
            <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-300 tracking-tight">
              {formatCurrency(sadaqah.spent || 0)}
            </div>

            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-amber-500/15">
              <span className="text-slate-500 dark:text-slate-400 text-[10px]">
                {sadaqah.count || 0} donations logged
              </span>
              <span className="inline-flex items-center gap-1 font-bold font-mono text-[10px] text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-900">
                {sadaqah.rate || 0}% of Income
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Multi-Mode Cashflow Visualizer Suite */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 shadow-soft-lg space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-[#088ac1] dark:text-[#3dc3f3]" />
              <span>Cashflow Trajectory & Trend Visualizer</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Switch between daily velocity, cumulative wealth trajectory, and 6-month macro history
            </p>
          </div>

          {/* View Mode Tabs */}
          <div className="inline-flex rounded-2xl bg-slate-100 dark:bg-white/[0.05] p-1 border border-slate-200/80 dark:border-white/10 self-start sm:self-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => setChartViewMode('daily')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                chartViewMode === 'daily'
                  ? 'bg-white dark:bg-[#088ac1] text-[#088ac1] dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Daily Flow</span>
            </button>

            <button
              type="button"
              onClick={() => setChartViewMode('cumulative')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                chartViewMode === 'cumulative'
                  ? 'bg-white dark:bg-[#088ac1] text-[#088ac1] dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>Cumulative Net</span>
            </button>

            <button
              type="button"
              onClick={() => setChartViewMode('history6m')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                chartViewMode === 'history6m'
                  ? 'bg-white dark:bg-[#088ac1] text-[#088ac1] dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>6-Month Macro</span>
            </button>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-72 sm:h-80 w-full pt-2">
          {/* VIEW 1: DAILY FLOW (BAR + NET LINE) */}
          {chartViewMode === 'daily' && (
            dailyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} vertical={false} />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0b1822',
                      borderRadius: '16px',
                      border: '1px solid #163246',
                      color: '#fff',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
                    }}
                    formatter={(val, name) => [`₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                  <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
                  <Bar dataKey="income" name="Income Credits (+)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="expense" name="Expense Debits (-)" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No daily transaction activity recorded for this period.
              </div>
            )
          )}

          {/* VIEW 2: CUMULATIVE NET CASHFLOW (AREA CHART) */}
          {chartViewMode === 'cumulative' && (
            dailyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNetSurplus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#088ac1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#088ac1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} vertical={false} />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0b1822',
                      borderRadius: '16px',
                      border: '1px solid #163246',
                      color: '#fff',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
                    }}
                    formatter={(val, name) => [`₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, name]}
                  />
                  <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                  <Area
                    type="monotone"
                    dataKey="cumulative_net"
                    name="Cumulative Month Surplus (₹)"
                    stroke="#088ac1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorNetSurplus)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No cumulative cashflow data available.
              </div>
            )
          )}

          {/* VIEW 3: 6-MONTH MACRO COMPARISON */}
          {chartViewMode === 'history6m' && (
            history6m.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={history6m} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} vertical={false} />
                  <XAxis dataKey="short_label" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0b1822',
                      borderRadius: '16px',
                      border: '1px solid #163246',
                      color: '#fff',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
                    }}
                    formatter={(val, name) => [
                      name === 'Savings Rate (%)' ? `${val}%` : `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                      name
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                  <Bar dataKey="income" name="Monthly Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="expense" name="Monthly Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="savings" name="Net Savings" fill="#088ac1" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No 6-month historical data available.
              </div>
            )
          )}
        </div>

        {/* Micro KPI highlights under chart */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Days Recorded</span>
            <p className="font-extrabold text-sm text-slate-900 dark:text-white font-mono mt-0.5">
              {daysElapsed} Days
            </p>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Peak Spending Day</span>
            <p className="font-extrabold text-sm text-rose-600 dark:text-rose-400 font-mono mt-0.5 truncate">
              {peakExpense ? `${peakExpense.label} (${formatCurrency(peakExpense.amount)})` : 'None'}
            </p>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Avg Inflow Speed</span>
            <p className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              {formatCurrency(dailyAvgInc)}/d
            </p>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Avg Burn Speed</span>
            <p className="font-extrabold text-sm text-rose-600 dark:text-rose-400 font-mono mt-0.5">
              {formatCurrency(dailyAvgExp)}/d
            </p>
          </div>
        </div>
      </div>

      {/* 4. Dual Category Intelligence Hub (Donut + Progress Rows) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left: Interactive Donut & Category Breakdown (7 Cols) */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-5 sm:p-7 shadow-soft space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-purple-500" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Category Distribution Matrix
              </h3>
            </div>

            {/* Inflow vs Outflow toggle */}
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-white/[0.05] p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveCategoryTab('expense')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeCategoryTab === 'expense'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Expenses ({topCategories.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveCategoryTab('income')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeCategoryTab === 'income'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Income ({incomeCategories.length})
              </button>
            </div>
          </div>

          {donutData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              {/* Donut Chart (5 cols) */}
              <div className="sm:col-span-5 h-52 sm:h-60 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      onMouseEnter={(_, index) => setHoveredSliceIndex(index)}
                      onMouseLeave={() => setHoveredSliceIndex(null)}
                    >
                      {donutData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="#0b1822"
                          strokeWidth={hoveredSliceIndex === index ? 3 : 1}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [`₹${Number(val).toLocaleString('en-IN')}`, name]}
                      contentStyle={{
                        backgroundColor: '#0b1822',
                        borderRadius: '12px',
                        border: '1px solid #163246',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {activeCategoryTab === 'expense' ? 'Spent' : 'Earned'}
                  </span>
                  <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">
                    {formatCurrency(activeCategoryTab === 'expense' ? expense : income)}
                  </span>
                </div>
              </div>

              {/* Category Rows with Progress (7 cols) */}
              <div className="sm:col-span-7 space-y-2.5 max-h-64 overflow-y-auto pr-1 scrollbar-none">
                {donutData.map((item, idx) => {
                  const IconComp = ICON_MAP[item.name] || Tag;
                  const isHovered = hoveredSliceIndex === idx;

                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredSliceIndex(idx)}
                      onMouseLeave={() => setHoveredSliceIndex(null)}
                      className={`p-2.5 rounded-2xl border transition-all ${
                        isHovered
                          ? 'bg-slate-100 dark:bg-white/[0.06] border-[#088ac1] shadow-xs'
                          : 'bg-slate-50/70 dark:bg-white/[0.02] border-slate-100 dark:border-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-extrabold font-mono text-slate-900 dark:text-white shrink-0">
                          {formatCurrency(item.value)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>{item.count} transactions</span>
                        <span className="font-bold">{item.percentage}%</span>
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700/60 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(item.percentage, 100)}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 dark:bg-white/[0.01] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              No {activeCategoryTab} categories logged for {displayMonthName}.
            </div>
          )}
        </div>

        {/* Right: Account Cashflow Matrix & Share of Spend (5 Cols) */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-5 sm:p-7 shadow-soft space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-500" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Account Flow Matrix
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              {accountFlows.length} Accounts
            </span>
          </div>

          <div className="space-y-3">
            {accountFlows.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No active accounts found.
              </div>
            ) : (
              accountFlows.map((acc) => {
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
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="p-1.5 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${acc.color || '#088ac1'}20`,
                            color: acc.color || '#088ac1',
                          }}
                        >
                          <IconComp className="w-3.5 h-3.5" />
                        </span>
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {acc.name}
                        </span>
                      </div>

                      <span
                        className={`text-xs font-extrabold font-mono ${
                          acc.net_flow > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : acc.net_flow < 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {acc.net_flow > 0 ? '+' : ''}{formatCurrency(acc.net_flow)}
                      </span>
                    </div>

                    {/* Flow details pill */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1.5 border-t border-slate-200/50 dark:border-white/5">
                      <span className="text-emerald-600 dark:text-emerald-400">
                        In: +{formatCurrency(acc.income + acc.transfers_in)}
                      </span>
                      <span className="text-rose-600 dark:text-rose-400 text-right">
                        Out: -{formatCurrency(acc.expense + acc.transfers_out)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 5. Top 5 Major Debits (Highest Spending Outliers) */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Major Spending Outliers (Top 5 Debits)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Largest individual transactions this month for immediate budget auditing
              </p>
            </div>
          </div>
        </div>

        {topExpenses.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-white/[0.01] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            No expenses recorded for this month yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {topExpenses.map((t, idx) => {
              const IconComp = ICON_MAP[t.category_icon] || Tag;
              return (
                <div
                  key={t.id || idx}
                  className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5 flex flex-col justify-between space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
                      <IconComp className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      #{idx + 1} Largest
                    </span>
                  </div>

                  <div>
                    <div className="text-base font-extrabold font-mono text-rose-600 dark:text-rose-400">
                      -{formatCurrency(t.amount)}
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                      {t.category}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>{t.date}</span>
                      <span className="truncate max-w-[80px]">{t.account_name}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Smart Financial & Islamic Wealth Barakah Wisdom Insights */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#088ac1]/15 via-emerald-500/10 to-amber-500/15 dark:from-[#0c4059]/40 dark:via-[#0b1822] dark:to-amber-950/30 border border-[#088ac1]/25 dark:border-white/10 shadow-soft space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
            Smart Financial Health & Barakah Summary
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-white/40 dark:border-white/5 space-y-1">
            <span className="font-bold text-[#088ac1] dark:text-[#3dc3f3] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Savings Efficiency
            </span>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              {savingsRate >= 20
                ? `You saved ${savingsRate}% of your earnings this month, exceeding standard financial benchmarks.`
                : savings > 0
                ? `You have a positive surplus of ${formatCurrency(savings)} (${savingsRate}%). Target ≥20% for faster wealth building.`
                : `Expenses exceeded income by ${formatCurrency(Math.abs(savings))}. Review top expense categories to restore positive liquidity.`}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-white/40 dark:border-white/5 space-y-1">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" /> Spending Drivers
            </span>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              {topCategories.length > 0
                ? `${topCategories[0].category} is your highest expense, taking ${topCategories[0].percentage}% (${formatCurrency(topCategories[0].amount)}) of total outflow.`
                : 'No expense categories recorded yet this month.'}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-white/40 dark:border-white/5 space-y-1">
            <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5" /> Islamic Wealth Purification
            </span>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              {sadaqah.spent > 0
                ? `May Allah grant Barakah in your wealth — ${formatCurrency(sadaqah.spent)} was spent in charity & Sadaqah (${sadaqah.rate}% of income).`
                : 'Giving in Sadaqah purifies wealth and attracts divine abundance. Log your charity transactions under Islamic & Sadaqah.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
