import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit2,
  Trash2,
  BookOpen,
  Calendar,
  Building2,
  Layers,
  Coins,
  ChevronRight,
  UserCheck,
  Check,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { expenseApi } from '../../api/expenseApi';
import { useNotification } from '../../context/NotificationContext';
import { CreditEntryModal } from '../modals/CreditEntryModal';
import { CreditAccountModal } from '../modals/CreditAccountModal';
import { ManageCreditAccountsModal } from '../modals/ManageCreditAccountsModal';

export const CreditBookView = () => {
  const { showToast } = useNotification();

  // Data states
  const [accounts, setAccounts] = useState([]);
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedAccountId, setSelectedAccountId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending'); // 'all' | 'pending' | 'settled'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'credit' | 'debit'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryModalType, setEntryModalType] = useState('credit');
  const [editingEntry, setEditingEntry] = useState(null);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const [isManageAccountsOpen, setIsManageAccountsOpen] = useState(false);

  // Fetch all Credit Book data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [accRes, entRes, sumRes] = await Promise.all([
        expenseApi.getCreditAccounts(),
        expenseApi.getCreditEntries(),
        expenseApi.getCreditSummary(),
      ]);

      const accList = Array.isArray(accRes.data) ? accRes.data : accRes.data?.results || [];
      const entList = Array.isArray(entRes.data) ? entRes.data : entRes.data?.results || [];

      setAccounts(accList);
      setEntries(entList);
      setSummary(sumRes.data);
    } catch (err) {
      console.error('Failed to load credit book data:', err);
      showToast('Could not load credit book data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Quick 1-click Toggle Settle
  const handleToggleSettle = async (entryId) => {
    try {
      const res = await expenseApi.toggleSettleCreditEntry(entryId);
      showToast(res.data.message || 'Updated status', 'success');
      // Optimistic update
      setEntries((prev) =>
        prev.map((item) => (item.id === entryId ? res.data.entry : item))
      );
      // Reload summary & accounts to recalculate aggregates
      const [sumRes, accRes] = await Promise.all([
        expenseApi.getCreditSummary(),
        expenseApi.getCreditAccounts(),
      ]);
      setSummary(sumRes.data);
      const accList = Array.isArray(accRes.data) ? accRes.data : accRes.data?.results || [];
      setAccounts(accList);
    } catch (err) {
      console.error('Failed to toggle settlement:', err);
      showToast('Failed to update entry status', 'error');
    }
  };

  // Delete entry
  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this credit book record?')) return;
    try {
      await expenseApi.deleteCreditEntry(entryId);
      showToast('Record deleted', 'success');
      loadData();
    } catch (err) {
      console.error('Failed to delete credit entry:', err);
      showToast('Failed to delete record', 'error');
    }
  };

  // Filtered Entries
  const filteredEntries = useMemo(() => {
    return entries.filter((item) => {
      // Account filter
      if (selectedAccountId !== 'all' && String(item.account) !== String(selectedAccountId)) {
        return false;
      }
      // Status filter
      if (statusFilter === 'pending' && item.is_settled) return false;
      if (statusFilter === 'settled' && !item.is_settled) return false;

      // Type filter
      if (typeFilter !== 'all' && item.entry_type !== typeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const descMatch = (item.description || '').toLowerCase().includes(q);
        const accMatch = (item.account_name || '').toLowerCase().includes(q);
        const amountMatch = String(item.amount).includes(q);
        if (!descMatch && !accMatch && !amountMatch) return false;
      }

      return true;
    });
  }, [entries, selectedAccountId, statusFilter, typeFilter, searchQuery]);

  // Format currency helper
  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return `₹${Math.abs(num).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-800/90 text-white border border-white/10 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#088ac1]/20 border border-[#088ac1]/40 flex items-center justify-center text-[#3dc3f3]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight flex items-center gap-2">
              Credit Book (Khata Ledger)
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Isolated Ledger
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              Dedicated credit & debit accounts for tracking money lent, borrowed, and party dues. Zero impact on your main wallet or bank balances.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => {
              setEntryModalType('credit');
              setEditingEntry(null);
              setIsEntryModalOpen(true);
            }}
            className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>You Gave (Credit)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEntryModalType('debit');
              setEditingEntry(null);
              setIsEntryModalOpen(true);
            }}
            className="px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>You Took (Debit)</span>
          </button>
          <button
            type="button"
            onClick={() => setIsManageAccountsOpen(true)}
            className="px-3 py-2 text-xs font-bold text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 rounded-xl border border-white/10 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#3dc3f3]" />
            <span>Manage Accounts</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingAccount(null);
              setIsAccountModalOpen(true);
            }}
            className="px-3 py-2 text-xs font-bold text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 rounded-xl border border-white/10 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Account</span>
          </button>
        </div>
      </div>

      {/* Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* You'll Get (Credits) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              You'll Get (Cash Credit)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Receivables
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            +{formatCurrency(summary?.total_to_get)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/50 pt-2">
            <span>Money lent / credit extended</span>
            <span className="font-semibold">{summary?.pending_count || 0} active records</span>
          </div>
        </div>

        {/* You'll Give (Debits) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4 text-rose-500" />
              You'll Give (Cash Debit)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
              Payables
            </span>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            -{formatCurrency(summary?.total_to_give)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/50 pt-2">
            <span>Money borrowed / owed</span>
            <span className="font-semibold">{summary?.overdue_count || 0} overdue</span>
          </div>
        </div>

        {/* Net Position */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-[#088ac1] dark:text-[#3dc3f3]" />
              Net Due Position
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                (summary?.net_balance || 0) >= 0
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {(summary?.net_balance || 0) >= 0 ? 'Net Receivable' : 'Net Payable'}
            </span>
          </div>
          <div
            className={`text-2xl font-black tracking-tight ${
              (summary?.net_balance || 0) >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {(summary?.net_balance || 0) >= 0 ? '+' : '-'}
            {formatCurrency(summary?.net_balance)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/50 pt-2">
            <span>{accounts.length} accounts tracking</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {summary?.settled_count || 0} cleared
            </span>
          </div>
        </div>
      </div>

      {/* Accounts Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#088ac1] dark:text-[#3dc3f3]" />
            Credit Book Accounts ({accounts.length})
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsManageAccountsOpen(true)}
              className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#088ac1] dark:hover:text-[#3dc3f3] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#088ac1] dark:text-[#3dc3f3]" />
              <span>Manage Accounts</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              type="button"
              onClick={() => {
                setEditingAccount(null);
                setIsAccountModalOpen(true);
              }}
              className="text-xs font-semibold text-[#088ac1] dark:text-[#3dc3f3] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Party</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {/* All Accounts Pill */}
          <button
            type="button"
            onClick={() => setSelectedAccountId('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
              selectedAccountId === 'all'
                ? 'bg-[#088ac1] text-white border-[#088ac1] shadow-sm shadow-[#088ac1]/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Accounts</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedAccountId === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {entries.length}
            </span>
          </button>

          {/* Account Pills */}
          {accounts.map((acc) => {
            const isSelected = String(selectedAccountId) === String(acc.id);
            const net = acc.net_balance ?? 0;
            return (
              <div
                key={acc.id}
                className={`inline-flex items-center rounded-xl border transition-all whitespace-nowrap text-xs font-bold ${
                  isSelected
                    ? 'bg-white dark:bg-slate-700 text-[#088ac1] dark:text-[#3dc3f3] border-[#088ac1] shadow-xs ring-2 ring-[#088ac1]/20'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedAccountId(isSelected ? 'all' : String(acc.id))}
                  className="px-3 py-2 flex items-center gap-2 cursor-pointer"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: acc.color || '#088ac1' }}
                  />
                  <span>{acc.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      net > 0
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : net < 0
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    {net >= 0 ? '+' : '-'}
                    {formatCurrency(net)}
                  </span>
                </button>
                {isSelected && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingAccount(acc);
                      setIsAccountModalOpen(true);
                    }}
                    className="pr-2.5 pl-1 py-2 text-slate-400 hover:text-[#088ac1] dark:hover:text-[#3dc3f3] transition-colors cursor-pointer"
                    title={`Edit ${acc.name}`}
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by remarks, party name, or amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#088ac1] outline-none text-slate-900 dark:text-white"
          />
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Switcher (Pending | Settled | All) */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-white/10">
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                statusFilter === 'pending'
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3" />
              Pending
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('settled')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                statusFilter === 'settled'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Check className="w-3 h-3" />
              Settled
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              All
            </button>
          </div>

          {/* Type Filter (All | Credits | Debits) */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-white/10">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Both
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('credit')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer text-emerald-600 ${
                typeFilter === 'credit'
                  ? 'bg-white dark:bg-slate-800 font-extrabold shadow-xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Gave (+Cr)
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('debit')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer text-rose-600 ${
                typeFilter === 'debit'
                  ? 'bg-white dark:bg-slate-800 font-extrabold shadow-xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Took (-Dr)
            </button>
          </div>
        </div>
      </div>

      {/* Entries List / Ledger */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 font-semibold">
          <span>Showing {filteredEntries.length} records</span>
          {statusFilter === 'pending' && (
            <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Active Due Records
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Loading Credit Book records...
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-slate-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
              No Credit Book records found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Start tracking cash debits and credits. Entries here stay isolated from your daily wallet expenses.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEntryModalType('credit');
                  setEditingEntry(null);
                  setIsEntryModalOpen(true);
                }}
                className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ArrowUpRight className="w-4 h-4" />
                Record Cash Credit (You Gave)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEntryModalType('debit');
                  setEditingEntry(null);
                  setIsEntryModalOpen(true);
                }}
                className="px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ArrowDownLeft className="w-4 h-4" />
                Record Cash Debit (You Took)
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEntries.map((item) => {
              const isCredit = item.entry_type === 'credit';
              const isOverdue =
                !item.is_settled &&
                item.due_date &&
                new Date(item.due_date) < new Date(new Date().toDateString());

              return (
                <div
                  key={item.id}
                  className={`group p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:shadow-md ${
                    item.is_settled
                      ? 'border-slate-200/60 dark:border-white/5 opacity-80'
                      : isCredit
                      ? 'border-emerald-500/20 hover:border-emerald-500/40'
                      : 'border-rose-500/20 hover:border-rose-500/40'
                  }`}
                >
                  {/* Left: Direction badge + details */}
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        item.is_settled
                          ? 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                          : isCredit
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-800 dark:text-white">
                          {item.account_name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isCredit
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isCredit ? 'You Gave' : 'You Took'}
                        </span>
                        {item.is_settled ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" />
                            Settled
                          </span>
                        ) : isOverdue ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Overdue
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatDate(item.date)}
                        </span>
                        {item.due_date && (
                          <span
                            className={`flex items-center gap-1 ${
                              isOverdue ? 'text-rose-500 font-bold' : ''
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            Due: {formatDate(item.due_date)}
                          </span>
                        )}
                        {item.description && (
                          <span className="text-slate-600 dark:text-slate-300 italic font-medium">
                            "{item.description}"
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount + Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700/50">
                    <div className="text-right">
                      <div
                        className={`text-lg font-black tracking-tight ${
                          item.is_settled
                            ? 'text-slate-400 dark:text-slate-500 line-through'
                            : isCredit
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isCredit ? '+' : '-'}
                        {formatCurrency(item.amount)}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {item.is_settled ? 'Cleared' : isCredit ? 'To Receive' : 'To Pay'}
                      </span>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex items-center gap-1">
                      {/* 1-click Toggle Settle */}
                      <button
                        type="button"
                        onClick={() => handleToggleSettle(item.id)}
                        title={item.is_settled ? 'Mark as Pending' : 'Mark as Settled / Paid'}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                          item.is_settled
                            ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {item.is_settled ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Unsettle</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Settle</span>
                          </>
                        )}
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEntry(item);
                          setEntryModalType(item.entry_type);
                          setIsEntryModalOpen(true);
                        }}
                        title="Edit Record"
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteEntry(item.id)}
                        title="Delete Record"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
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

      {/* Entry Modal (Create / Edit) */}
      <CreditEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => {
          setIsEntryModalOpen(false);
          setEditingEntry(null);
        }}
        entry={editingEntry}
        accounts={accounts}
        defaultType={entryModalType}
        defaultAccountId={selectedAccountId !== 'all' ? selectedAccountId : null}
        onSaved={loadData}
      />

      {/* Account Modal (Create / Edit) */}
      <CreditAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setEditingAccount(null);
        }}
        account={editingAccount}
        onSaved={loadData}
      />

      {/* Manage Credit Accounts / Parties Modal */}
      <ManageCreditAccountsModal
        isOpen={isManageAccountsOpen}
        onClose={() => setIsManageAccountsOpen(false)}
        accounts={accounts}
        onEditAccount={(acc) => {
          setIsManageAccountsOpen(false);
          setEditingAccount(acc);
          setIsAccountModalOpen(true);
        }}
        onAddNewAccount={() => {
          setIsManageAccountsOpen(false);
          setEditingAccount(null);
          setIsAccountModalOpen(true);
        }}
        onSelectAccount={(accId) => {
          setSelectedAccountId(accId);
        }}
        onAccountDeleted={loadData}
      />
    </div>
  );
};
