import React, { useState, useEffect } from 'react';
import { Modal } from '../common/UIComponents';
import { ArrowUpRight, ArrowDownLeft, Calendar, FileText, CheckCircle2, Clock } from 'lucide-react';
import { expenseApi } from '../../api/expenseApi';
import { useNotification } from '../../context/NotificationContext';
import { getLocalDateString } from '../../utils/dateUtils';

export const CreditEntryModal = ({
  isOpen,
  onClose,
  entry = null,
  accounts = [],
  defaultType = 'credit',
  defaultAccountId = null,
  onSaved,
}) => {
  const { showToast } = useNotification();
  const [entryType, setEntryType] = useState('credit'); // 'credit' (You Gave) or 'debit' (You Took)
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getLocalDateString());
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [isSettled, setIsSettled] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (entry) {
        setEntryType(entry.entry_type || 'credit');
        setAccountId(entry.account ? String(entry.account) : '');
        setAmount(String(entry.amount || ''));
        setDate(entry.date || getLocalDateString());
        setDueDate(entry.due_date || '');
        setDescription(entry.description || '');
        setIsSettled(Boolean(entry.is_settled));
      } else {
        const initialType = defaultType || 'credit';
        setEntryType(initialType);
        
        // Auto-select preferred account matching type or defaultAccountId
        if (defaultAccountId) {
          setAccountId(String(defaultAccountId));
        } else {
          const matchingAcc = accounts.find((a) =>
            initialType === 'credit'
              ? a.account_type === 'cash_credit' || a.name.toLowerCase().includes('credit')
              : a.account_type === 'cash_debit' || a.name.toLowerCase().includes('debit')
          );
          setAccountId(matchingAcc ? String(matchingAcc.id) : (accounts[0] ? String(accounts[0].id) : ''));
        }

        setAmount('');
        setDate(getLocalDateString());
        setDueDate('');
        setDescription('');
        setIsSettled(false);
      }
    }
  }, [isOpen, entry, defaultType, defaultAccountId, accounts]);

  // When switching type, if using default cash credit/debit account, automatically adapt account
  const handleTypeChange = (newType) => {
    setEntryType(newType);
    if (!entry) {
      const targetAcc = accounts.find((a) =>
        newType === 'credit'
          ? a.account_type === 'cash_credit' || a.name.toLowerCase().includes('credit')
          : a.account_type === 'cash_debit' || a.name.toLowerCase().includes('debit')
      );
      if (targetAcc) {
        setAccountId(String(targetAcc.id));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid amount greater than 0', 'error');
      return;
    }
    if (!accountId) {
      showToast('Please select a Credit Book account', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        entry_type: entryType,
        account: parseInt(accountId, 10),
        amount: parseFloat(amount),
        date,
        due_date: dueDate ? dueDate : null,
        description: description.trim(),
        is_settled: isSettled,
      };

      if (entry) {
        await expenseApi.updateCreditEntry(entry.id, payload);
        showToast('Credit entry updated successfully', 'success');
      } else {
        await expenseApi.createCreditEntry(payload);
        showToast(
          entryType === 'credit'
            ? 'Cash Credit recorded (You Gave)'
            : 'Cash Debit recorded (You Took)',
          'success'
        );
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save credit entry:', err);
      const errMsg = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to save entry';
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={entry ? 'Edit Credit Book Record' : 'Record Credit / Debit'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Isolated System Notice */}
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 flex items-center justify-between">
          <span>
            <strong>Isolated Ledger:</strong> Recording here marks obligations only and does not alter your bank or wallet cash balances.
          </span>
        </div>

        {/* Direction Switcher Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-white/10">
          <button
            type="button"
            onClick={() => handleTypeChange('credit')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
              entryType === 'credit'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>You Gave (Credit)</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('debit')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
              entryType === 'debit'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>You Took (Debit)</span>
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              required
              autoFocus
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 text-xl font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#088ac1] outline-none text-slate-900 dark:text-white"
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {entryType === 'credit'
              ? 'Money you lent or gave (to receive back)'
              : 'Money you borrowed or received (to return back)'}
          </p>
        </div>

        {/* Account Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Credit Book Account / Party
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#088ac1] outline-none text-slate-900 dark:text-white"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.account_type === 'cash_debit' ? 'Cash Debit' : acc.account_type === 'cash_credit' ? 'Cash Credit' : 'Party'})
              </option>
            ))}
          </select>
        </div>

        {/* Dates (Record Date and Due Date) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Transaction Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#088ac1] outline-none text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#088ac1] outline-none text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Description / Remarks */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Remarks / Description
          </label>
          <input
            type="text"
            placeholder="e.g. Lent for groceries, Borrowed for travel..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#088ac1] outline-none text-slate-900 dark:text-white"
          />
        </div>

        {/* Settled Checkbox */}
        <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={isSettled}
            onChange={(e) => setIsSettled(e.target.checked)}
            className="w-4 h-4 text-[#088ac1] rounded focus:ring-[#088ac1] border-slate-300"
          />
          <div className="text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Mark as Settled / Cleared
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Check if this credit/debit has already been paid back.
            </p>
          </div>
        </label>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
              entryType === 'credit'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {submitting ? 'Saving...' : entry ? 'Update Record' : 'Save Record'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
