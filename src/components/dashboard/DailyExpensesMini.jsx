import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Coins,
  Landmark,
  Sparkles,
} from 'lucide-react';
import { expenseApi } from '../../api/expenseApi';
import { formatCurrency } from '../../data/expenseCategories';
import { getLocalDateString, getDailyCache, setDailyCache } from '../../utils/dateUtils';
import { TransactionModal } from '../modals/TransactionModal';

const CACHE_ACCOUNTS_KEY = 'cached_expense_accounts';
const CACHE_DAILY_PREFIX = 'cached_daily_report_';

export const DailyExpensesMini = ({ onDataChanged }) => {
  const navigate = useNavigate();
  const today = getLocalDateString();
  const [dailyReport, setDailyReport] = useState(() => getDailyCache(`${CACHE_DAILY_PREFIX}${today}`, null, today));
  const [accounts, setAccounts] = useState(() => getDailyCache(CACHE_ACCOUNTS_KEY, []));
  const [loading, setLoading] = useState(() => !dailyReport && !accounts.length);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState('expense');

  const loadData = async () => {
    try {
      const todayStr = getLocalDateString();
      const [accRes, repRes] = await Promise.all([
        expenseApi.getAccounts(),
        expenseApi.getDailyReport(todayStr),
      ]);
      const accData = Array.isArray(accRes.data) ? accRes.data : accRes.data?.results || [];
      setAccounts(accData);
      setDailyReport(repRes.data);

      setDailyCache(CACHE_ACCOUNTS_KEY, accData);
      if (repRes.data) {
        setDailyCache(`${CACHE_DAILY_PREFIX}${todayStr}`, repRes.data, todayStr);
      }
    } catch (e) {
      console.error('Failed to load mini expenses widget:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openQuickModal = (type) => {
    setTxModalType(type);
    setIsTxModalOpen(true);
  };

  const handleSaved = (optimisticTx, isFullRefresh = true) => {
    if (optimisticTx) {
      const amt = Number(optimisticTx.amount || 0);
      setDailyReport((prev) => {
        if (!prev) return prev;
        let newIncome = Number(prev.total_income || 0);
        let newExpense = Number(prev.total_expense || 0);
        let newClosing = Number(prev.closing_balance || 0);

        if (optimisticTx.transaction_type === 'income') {
          newIncome += amt;
          newClosing += amt;
        } else if (optimisticTx.transaction_type === 'expense') {
          newExpense += amt;
          newClosing -= amt;
        }
        return {
          ...prev,
          total_income: newIncome,
          total_expense: newExpense,
          closing_balance: newClosing,
          net_flow: newIncome - newExpense,
        };
      });

      setAccounts((prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((acc) => {
          if (Number(acc.id) === Number(optimisticTx.account)) {
            const currentBal = Number(acc.current_balance || 0);
            const delta = optimisticTx.transaction_type === 'income' ? amt : -amt;
            return { ...acc, current_balance: currentBal + delta };
          }
          if (optimisticTx.transaction_type === 'transfer' && Number(acc.id) === Number(optimisticTx.to_account)) {
            const currentBal = Number(acc.current_balance || 0);
            return { ...acc, current_balance: currentBal + amt };
          }
          return acc;
        });
      });
    }

    if (isFullRefresh) {
      loadData();
    }
    if (onDataChanged) onDataChanged();
  };

  const netFlow = dailyReport?.net_flow ?? 0;

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-6 mb-8 border border-slate-200/80 dark:border-slate-800/80 shadow-soft relative overflow-hidden group">
      {/* Decorative gradient flare */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#088ac1]/10 dark:bg-[#3dc3f3]/10 rounded-full blur-3xl group-hover:scale-125 transition-transform pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-[#088ac1] to-[#1eb4eb] text-white shadow-xs">
              <Wallet className="w-4 h-4" />
            </span>
            Daily Expenses & Cash Flow
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Today's ledger, UPI balances & closing liquidity
          </p>
        </div>

        <Link
          to="/expenses"
          className="text-xs font-bold text-[#088ac1] dark:text-[#3dc3f3] hover:underline flex items-center gap-1 group/link cursor-pointer"
        >
          <span>Open Ledger</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Bento Mini Financial Pipeline (Opening ➔ Income ➔ Expense ➔ Closing) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        {/* 1. Opening Balance */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Landmark className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            Day Opening
          </span>
          <div className="text-sm sm:text-base font-extrabold font-mono text-slate-800 dark:text-slate-100 mt-1 truncate">
            {formatCurrency(dailyReport?.opening_balance ?? 0)}
          </div>
        </div>

        {/* 2. Total Income Today */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/60 dark:border-emerald-800/40 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            Income Today
          </span>
          <div className="text-sm sm:text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1 truncate">
            +{formatCurrency(dailyReport?.total_income ?? 0)}
          </div>
        </div>

        {/* 3. Total Expense Today */}
        <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/25 border border-rose-200/60 dark:border-rose-800/40 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-rose-500" />
            Expenses Today
          </span>
          <div className="text-sm sm:text-base font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-1 truncate">
            -{formatCurrency(dailyReport?.total_expense ?? 0)}
          </div>
        </div>

        {/* 4. Closing Balance */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-[#071924] dark:from-[#088ac1]/25 dark:via-[#0b293c]/40 dark:to-[#0b1822] text-white border border-slate-800 dark:border-[#088ac1]/30 flex flex-col justify-between shadow-xs">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
            <Coins className="w-3 h-3 text-amber-400" />
            Closing Total
          </span>
          <div className="text-sm sm:text-base font-extrabold font-mono text-white mt-1 truncate">
            {formatCurrency(dailyReport?.closing_balance ?? 0)}
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
        <button
          type="button"
          onClick={() => openQuickModal('expense')}
          className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>- Expense</span>
        </button>

        <button
          type="button"
          onClick={() => openQuickModal('income')}
          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>+ Income</span>
        </button>

        <button
          type="button"
          onClick={() => openQuickModal('transfer')}
          className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>⇄ Transfer</span>
        </button>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        accounts={accounts}
        initialType={txModalType}
        initialDate={getLocalDateString()}
        onSaved={handleSaved}
      />
    </div>
  );
};
