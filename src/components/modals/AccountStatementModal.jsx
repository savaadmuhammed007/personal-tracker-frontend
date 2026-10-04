import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../common/UIComponents';
import {
  Wallet,
  Smartphone,
  Building2,
  CreditCard,
  PiggyBank,
  Edit2,
  Trash2,
  Check,
  Star,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Landmark,
  Calendar,
  Clock,
  Tag,
  Download,
  Plus,
} from 'lucide-react';
import { formatCurrency } from '../../data/expenseCategories';
import { expenseApi } from '../../api/expenseApi';
import { useNotification } from '../../context/NotificationContext';

export const AccountStatementModal = ({
  isOpen,
  onClose,
  account,
  onEditAccount,
  onSetOpeningBalance,
  onNewTransfer,
  onAccountUpdated,
}) => {
  const { showToast } = useNotification();
  const [statementData, setStatementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadStatement = useCallback(async () => {
    if (!account?.id) return;
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await expenseApi.getAccountStatement(account.id, params);
      setStatementData(res.data);
    } catch (err) {
      console.error('Failed to load statement:', err);
      showToast('Error', 'Failed to load account statement', 'error');
    } finally {
      setLoading(false);
    }
  }, [account?.id, startDate, endDate, showToast]);

  useEffect(() => {
    if (isOpen && account?.id) {
      loadStatement();
    }
  }, [isOpen, account?.id, loadStatement]);

  const handleSetDefault = async () => {
    if (!account?.id) return;
    try {
      await expenseApi.setDefaultAccount(account.id);
      showToast('Default Account', `✓ ${account.name} is now your default payment account.`);
      if (onAccountUpdated) onAccountUpdated();
      loadStatement();
    } catch (err) {
      showToast('Error', 'Failed to set default account', 'error');
    }
  };

  const handleDelete = async () => {
    if (!account?.id) return;
    const confirmMsg = `Are you sure you want to remove "${account.name}"? If it has transactions, it will be safely archived.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await expenseApi.deleteAccount(account.id);
      showToast('Account Removed', res.data?.message || `Account ${account.name} removed.`);
      if (onAccountUpdated) onAccountUpdated();
      onClose();
    } catch (err) {
      showToast('Error', 'Failed to delete account', 'error');
    }
  };

  const handleExportStatementCSV = () => {
    if (!statementData?.transactions || statementData.transactions.length === 0) {
      showToast('No Data', 'No transactions found in this statement', 'info');
      return;
    }

    const headers = ['Date', 'Time', 'Type', 'Amount (INR)', 'Category', 'Notes', 'Counterparty / Destination', 'Payment Method'];
    const rows = statementData.transactions.map((t) => [
      t.date,
      t.time || '',
      t.transaction_type.toUpperCase(),
      t.amount,
      `"${t.category || ''}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      `"${t.to_account_name || t.account_name || ''}"`,
      t.payment_method || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Statement_${account.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported', 'Account CSV statement downloaded');
  };

  if (!account) return null;

  const IconComp =
    account.account_type === 'cash'
      ? Wallet
      : account.account_type === 'upi'
      ? Smartphone
      : account.account_type === 'credit_card'
      ? CreditCard
      : account.account_type === 'savings'
      ? PiggyBank
      : Building2;

  const activeAcc = statementData?.account || account;
  const transactions = statementData?.transactions || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span
            className="p-2 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${activeAcc.color}20`, color: activeAcc.color }}
          >
            <IconComp className="w-5 h-5" />
          </span>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 dark:text-white truncate">
                {activeAcc.name}
              </span>
              {activeAcc.is_default && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  Default
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {activeAcc.bank_name || activeAcc.account_type?.toUpperCase()}
              {activeAcc.account_number_last4 ? ` •• ${activeAcc.account_number_last4}` : ''}
            </p>
          </div>
        </div>
      }
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Account Financial Overview Bento */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* 1. Live Balance */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#088ac1] to-[#076e9d] text-white shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">
              Live Balance
            </span>
            <div className="text-lg sm:text-xl font-extrabold font-mono tracking-tight mt-1 truncate">
              {formatCurrency(activeAcc.current_balance)}
            </div>
          </div>

          {/* 2. Opening Balance */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Opening Base</span>
              <button
                type="button"
                onClick={() => onSetOpeningBalance(activeAcc)}
                className="text-[#088ac1] dark:text-[#3dc3f3] hover:underline text-[9px] cursor-pointer"
              >
                Edit
              </button>
            </span>
            <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white mt-1 truncate">
              {formatCurrency(activeAcc.opening_balance)}
            </div>
          </div>

          {/* 3. Total Incomes */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Total Credits
            </span>
            <div className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 truncate">
              +{formatCurrency(activeAcc.total_income)}
            </div>
          </div>

          {/* 4. Total Expenses */}
          <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Total Debits
            </span>
            <div className="text-base sm:text-lg font-bold font-mono text-rose-600 dark:text-rose-400 mt-1 truncate">
              -{formatCurrency(activeAcc.total_expense)}
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-slate-100 dark:border-white/5">
          <button
            type="button"
            onClick={() => onSetOpeningBalance(activeAcc)}
            className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Landmark className="w-3.5 h-3.5 text-cyan-500" />
            Set Opening Balance
          </button>

          <button
            type="button"
            onClick={() => onEditAccount(activeAcc)}
            className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#088ac1]" />
            Edit Account
          </button>

          {!activeAcc.is_default && (
            <button
              type="button"
              onClick={handleSetDefault}
              className="py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Star className="w-3.5 h-3.5" />
              Make Default
            </button>
          )}

          <button
            type="button"
            onClick={() => onNewTransfer(activeAcc)}
            className="py-2 px-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/40 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Transfer Funds
          </button>

          <button
            type="button"
            onClick={handleExportStatementCSV}
            className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
            title="Download CSV Statement"
          >
            <Download className="w-3.5 h-3.5" />
            CSV Statement
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Archive / Remove Account"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Date Range Filters for Statement */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="From"
              className="px-2.5 py-1 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="To"
              className="px-2.5 py-1 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-xs text-rose-500 hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          <span className="text-xs text-slate-400">
            {transactions.length} Transactions Found
          </span>
        </div>

        {/* Statement Transactions Timeline */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading statement...</div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              No transactions recorded for this account yet.
            </div>
          ) : (
            transactions.map((tx) => {
              const isSource = String(tx.account) === String(activeAcc.id);
              const isExpense = tx.transaction_type === 'expense';
              const isIncome = tx.transaction_type === 'income';
              const isTransfer = tx.transaction_type === 'transfer';

              const isDebit = isExpense || (isTransfer && isSource);
              const isCredit = isIncome || (isTransfer && !isSource);

              return (
                <div
                  key={tx.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isDebit
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isDebit ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {tx.category}
                        </span>
                        {isTransfer && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
                            {isSource ? `To: ${tx.to_account_name}` : `From: ${tx.account_name}`}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>{tx.date}</span>
                        {tx.time && <span>• {tx.time.slice(0, 5)}</span>}
                        {tx.notes && <span className="truncate max-w-[150px]">• {tx.notes}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs sm:text-sm font-extrabold font-mono ${
                        isDebit
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isDebit ? '-' : '+'}
                      {formatCurrency(tx.amount)}
                    </span>
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
