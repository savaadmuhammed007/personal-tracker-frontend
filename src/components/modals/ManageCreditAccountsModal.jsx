import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Modal } from '../common/UIComponents';
import { expenseApi } from '../../api/expenseApi';
import { useNotification } from '../../context/NotificationContext';

export const ManageCreditAccountsModal = ({
  isOpen,
  onClose,
  accounts = [],
  onEditAccount,
  onAddNewAccount,
  onSelectAccount,
  onAccountDeleted,
}) => {
  const { showToast } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Filter accounts by search query
  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return accounts;
    const q = searchQuery.toLowerCase().trim();
    return accounts.filter((acc) => {
      const nameMatch = (acc.name || '').toLowerCase().includes(q);
      const phoneMatch = (acc.phone || '').includes(q);
      const notesMatch = (acc.notes || '').toLowerCase().includes(q);
      const typeMatch = (acc.account_type || '').toLowerCase().includes(q);
      return nameMatch || phoneMatch || notesMatch || typeMatch;
    });
  }, [accounts, searchQuery]);

  // Aggregate stats across accounts
  const stats = useMemo(() => {
    let totalReceivables = 0;
    let totalPayables = 0;
    accounts.forEach((acc) => {
      const net = Number(acc.net_balance || 0);
      if (net > 0) totalReceivables += net;
      else if (net < 0) totalPayables += Math.abs(net);
    });
    return {
      totalAccounts: accounts.length,
      totalReceivables,
      totalPayables,
    };
  }, [accounts]);

  // Format currency helper
  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return `₹${Math.abs(num).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Handle Delete / Archive Account
  const handleDelete = async (acc) => {
    const hasEntries = (acc.total_entries_count || 0) > 0 || (acc.pending_entries_count || 0) > 0;
    const confirmPrompt = hasEntries
      ? `Archive "${acc.name}"? It has ${acc.total_entries_count || 'linked'} record(s). It will be safely archived to preserve historical reports.`
      : `Are you sure you want to permanently delete "${acc.name}"?`;

    if (!window.confirm(confirmPrompt)) return;

    setDeletingId(acc.id);
    try {
      const res = await expenseApi.deleteCreditAccount(acc.id);
      showToast(
        'Account Removed',
        res.data?.message || `Successfully removed ${acc.name}.`
      );
      if (onAccountDeleted) onAccountDeleted();
    } catch (err) {
      console.error('Failed to delete credit account:', err);
      const errMsg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        'Failed to remove account';
      showToast('Error', errMsg, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-[#088ac1]/15 text-[#088ac1] dark:text-[#3dc3f3]">
            <Users className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
              Manage Credit Book Accounts
            </h3>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {accounts.length} parties & accounts configured
            </p>
          </div>
        </div>
      }
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Showing {filteredAccounts.length} of {accounts.length} parties
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onAddNewAccount) onAddNewAccount();
              }}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#088ac1] to-[#1eb4eb] hover:from-[#1eb4eb] hover:to-[#088ac1] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#088ac1]/20 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Party</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Top Summary & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by party name, phone, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#088ac1] outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 text-[11px] shrink-0">
            <div className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>To Get: +{formatCurrency(stats.totalReceivables)}</span>
            </div>
            <div className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-800/40 text-rose-700 dark:text-rose-400 font-bold flex items-center gap-1">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>To Give: -{formatCurrency(stats.totalPayables)}</span>
            </div>
          </div>
        </div>

        {/* Parties List */}
        <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
          {filteredAccounts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {searchQuery ? `No parties matching "${searchQuery}"` : 'No accounts found in Credit Book'}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-[#088ac1] dark:text-[#3dc3f3] font-bold hover:underline"
                >
                  Clear search filter
                </button>
              )}
            </div>
          ) : (
            filteredAccounts.map((acc) => {
              const net = Number(acc.net_balance || 0);
              const isDebit = acc.account_type === 'cash_debit';
              const isCredit = acc.account_type === 'cash_credit';
              const isDeleting = deletingId === acc.id;

              return (
                <div
                  key={acc.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  {/* Left: Account Identity & Info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-sm shadow-xs"
                      style={{
                        backgroundColor: `${acc.color || '#088ac1'}1a`,
                        color: acc.color || '#088ac1',
                        border: `1px solid ${acc.color || '#088ac1'}33`,
                      }}
                    >
                      {acc.name ? acc.name.charAt(0).toUpperCase() : 'P'}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {acc.name}
                        </h4>

                        {/* Account Type Badge */}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            isCredit
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : isDebit
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                              : 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
                          }`}
                        >
                          {isCredit ? 'Cash Credit' : isDebit ? 'Cash Debit' : 'Party'}
                        </span>
                      </div>

                      {/* Phone & Notes */}
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                        {acc.phone && (
                          <a
                            href={`tel:${acc.phone}`}
                            className="flex items-center gap-1 hover:text-[#088ac1] dark:hover:text-[#3dc3f3] transition-colors"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{acc.phone}</span>
                          </a>
                        )}
                        {acc.notes && (
                          <span className="flex items-center gap-1 truncate max-w-xs text-[11px]">
                            <FileText className="w-3 h-3 shrink-0 opacity-70" />
                            <span className="truncate">{acc.notes}</span>
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          {acc.pending_entries_count || 0} active • {acc.settled_entries_count || 0} settled
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Net Balance & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Net Balance
                      </span>
                      <span
                        className={`text-sm sm:text-base font-extrabold font-mono ${
                          net > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : net < 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {net > 0 ? '+' : net < 0 ? '-' : ''}
                        {formatCurrency(net)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          if (onSelectAccount) onSelectAccount(String(acc.id));
                        }}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                        title="Filter Ledger to this Party"
                      >
                        <Layers className="w-3.5 h-3.5 text-[#088ac1] dark:text-[#3dc3f3]" />
                        <span className="hidden md:inline">Ledger</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onEditAccount) onEditAccount(acc);
                        }}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#088ac1] dark:hover:text-[#3dc3f3] transition-all cursor-pointer"
                        title="Edit Party Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(acc)}
                        disabled={isDeleting}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                        title="Delete or Archive Party"
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
    </Modal>
  );
};
