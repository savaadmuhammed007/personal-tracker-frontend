import React, { useState, useEffect } from 'react';
import { Modal } from '../common/UIComponents';
import {
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
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Smartphone,
  CreditCard,
  Building2,
  Check,
  RefreshCw,
  X,
  Calendar,
  Clock,
  FileText,
} from 'lucide-react';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  formatCurrency,
} from '../../data/expenseCategories';
import { expenseApi } from '../../api/expenseApi';
import { useNotification } from '../../context/NotificationContext';
import { getLocalDateString } from '../../utils/dateUtils';

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
};

export const TransactionModal = ({
  isOpen,
  onClose,
  transaction,
  accounts = [],
  initialType = 'expense',
  initialDate,
  onSaved,
}) => {
  const { showToast } = useNotification();
  const [type, setType] = useState(initialType);
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [category, setCategory] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('');
  const [date, setDate] = useState(initialDate || getLocalDateString());
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [referenceId, setReferenceId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Initialize or reset form state on open / transaction change
  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        setType(transaction.transaction_type || 'expense');
        setAmount(transaction.amount ? String(transaction.amount) : '');
        setAccountId(transaction.account ? String(transaction.account) : accounts[0]?.id ? String(accounts[0].id) : '');
        setToAccountId(transaction.to_account ? String(transaction.to_account) : '');
        setCategory(transaction.category || '');
        setCategoryIcon(transaction.category_icon || '');
        setDate(transaction.date || initialDate || getLocalDateString());
        setTime(transaction.time ? transaction.time.slice(0, 5) : '');
        setNotes(transaction.notes || '');
        setPaymentMethod(transaction.payment_method || 'UPI');
        setReferenceId(transaction.reference_id || '');
      } else {
        const defaultType = initialType || 'expense';
        setType(defaultType);
        setAmount('');
        
        // Default account matching type or default account in list
        const defaultAcc = accounts.find((a) => a.is_default) || accounts[0];
        setAccountId(defaultAcc ? String(defaultAcc.id) : '');
        
        // If transfer, set toAccount to next account
        const otherAcc = accounts.find((a) => a.id !== defaultAcc?.id);
        setToAccountId(otherAcc ? String(otherAcc.id) : '');

        const defaultCats = defaultType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
        setCategory(defaultCats[0]?.name || '');
        setCategoryIcon(defaultCats[0]?.icon || '');
        setDate(initialDate || getLocalDateString());
        
        // Current time format HH:MM
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        setTime(`${hrs}:${mins}`);
        
        setNotes('');
        setPaymentMethod(defaultAcc?.account_type === 'cash' ? 'Cash' : 'UPI');
        setReferenceId('');
      }
    }
  }, [isOpen, transaction, initialType, initialDate, accounts]);

  // When account changes, smartly adapt default payment method
  const handleAccountChange = (newAccId) => {
    setAccountId(newAccId);
    const selectedAcc = accounts.find((a) => String(a.id) === String(newAccId));
    if (selectedAcc) {
      if (selectedAcc.account_type === 'cash') {
        setPaymentMethod('Cash');
      } else if (selectedAcc.account_type === 'upi') {
        setPaymentMethod('UPI');
      } else if (selectedAcc.account_type === 'credit_card') {
        setPaymentMethod('Card');
      }
    }
  };

  const handleTypeSwitch = (newType) => {
    setType(newType);
    if (newType === 'transfer') {
      setCategory('Transfer');
      setCategoryIcon('ArrowRightLeft');
      if (accountId && (!toAccountId || toAccountId === accountId)) {
        const nextOther = accounts.find((a) => String(a.id) !== String(accountId));
        if (nextOther) setToAccountId(String(nextOther.id));
      }
    } else {
      const cats = newType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      setCategory(cats[0]?.name || '');
      setCategoryIcon(cats[0]?.icon || '');
    }
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast('Invalid Amount', 'Please enter a valid amount greater than 0', 'error');
      return;
    }

    if (!accountId) {
      showToast('Account Required', 'Please select an account', 'error');
      return;
    }

    if (type === 'transfer' && (!toAccountId || toAccountId === accountId)) {
      showToast('Transfer Error', 'Please select a different destination account', 'error');
      return;
    }

    const payload = {
      transaction_type: type,
      amount: parsedAmount.toFixed(2),
      account: parseInt(accountId, 10),
      to_account: type === 'transfer' ? parseInt(toAccountId, 10) : null,
      category: type === 'transfer' ? 'Transfer' : category || (type === 'income' ? 'Other Income' : 'Other Expense'),
      category_icon: type === 'transfer' ? 'ArrowRightLeft' : categoryIcon,
      date: date || getLocalDateString(),
      time: time ? (time.length === 5 ? `${time}:00` : time) : null,
      notes: notes.trim(),
      payment_method: paymentMethod,
      reference_id: referenceId.trim(),
    };

    // 1. Instant 0ms dismiss & optimistic state update
    onClose();
    if (onSaved) {
      onSaved({ ...payload, id: transaction?.id || `temp-${Date.now()}` }, false);
    }

    showToast(
      transaction?.id
        ? 'Updated'
        : type === 'expense'
        ? '✓ Expense Added'
        : type === 'income'
        ? '✓ Income Logged'
        : '✓ Transfer Completed',
      `₹${parsedAmount.toLocaleString('en-IN')} recorded.`
    );

    // 2. Perform background server sync without blocking the user
    (async () => {
      try {
        if (transaction?.id) {
          const res = await expenseApi.updateTransaction(transaction.id, payload);
          if (onSaved) onSaved(res.data, true);
        } else {
          const res = await expenseApi.createTransaction(payload);
          if (onSaved) onSaved(res.data, true);
        }
      } catch (err) {
        const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to sync transaction with server';
        showToast('Sync Error', msg, 'error');
        if (onSaved) onSaved(); // Fallback reconcile
      }
    })();
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200">
            {type === 'expense' ? (
              <ArrowDownLeft className="w-4 h-4 text-rose-500" />
            ) : type === 'income' ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            ) : (
              <ArrowRightLeft className="w-4 h-4 text-sky-500" />
            )}
          </span>
          <span className="text-sm sm:text-base font-extrabold">{transaction?.id ? 'Edit Transaction' : 'Add Transaction'}</span>
        </div>
      }
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center gap-2.5 w-full">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="transaction-form"
            onClick={handleSubmit}
            disabled={submitting}
            className={`flex-1 py-3 px-4 rounded-xl text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer active:scale-98 ${
              type === 'expense'
                ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-red-500 hover:from-rose-500 hover:to-red-400 shadow-rose-600/30 ring-1 ring-rose-400/40'
                : type === 'income'
                ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-600/30 ring-1 ring-emerald-400/40'
                : 'bg-gradient-to-r from-sky-600 via-sky-500 to-blue-500 hover:from-sky-500 hover:to-blue-400 shadow-sky-600/30 ring-1 ring-sky-400/40'
            }`}
          >
            {submitting ? (
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </span>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span className="truncate">
                  {transaction?.id
                    ? 'Save Changes'
                    : `Confirm ${type === 'expense' ? 'Expense' : type === 'income' ? 'Income' : 'Transfer'}${
                        amount && parseFloat(amount) > 0 ? ` • ₹${parseFloat(amount).toLocaleString('en-IN')}` : ''
                      }`}
                </span>
              </>
            )}
          </button>
        </div>
      }
    >
      <form id="transaction-form" onSubmit={handleSubmit} className="space-y-3">
        {/* Type Toggle Selector */}
        <div className="grid grid-cols-3 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-white/10">
          <button
            type="button"
            onClick={() => handleTypeSwitch('expense')}
            className={`py-1.5 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              type === 'expense'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Expense</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeSwitch('income')}
            className={`py-1.5 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              type === 'income'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Income</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeSwitch('transfer')}
            className={`py-1.5 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              type === 'transfer'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Transfer</span>
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Amount (INR)
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-xl sm:text-2xl font-bold font-mono text-slate-400 dark:text-slate-500 select-none">
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              autoFocus={!transaction}
              required
              className="w-full pl-9 pr-9 py-2.5 text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:border-[#088ac1] dark:focus:border-[#3dc3f3] transition-colors"
            />
            {amount && (
              <button
                type="button"
                onClick={() => setAmount('')}
                className="absolute right-3 p-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                title="Clear Amount"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Account Selector(s) */}
        {type === 'transfer' ? (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                From Account
              </label>
              <select
                value={accountId}
                onChange={(e) => handleAccountChange(e.target.value)}
                required
                className="w-full px-2.5 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#088ac1]"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.current_balance)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                To Account
              </label>
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                required
                className="w-full px-2.5 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#088ac1]"
              >
                {accounts
                  .filter((a) => String(a.id) !== String(accountId))
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatCurrency(acc.current_balance)})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Account / Payment Method
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {accounts.map((acc) => {
                const isSelected = String(accountId) === String(acc.id);
                const IconComp = acc.account_type === 'cash' ? Wallet : acc.account_type === 'upi' ? Smartphone : Building2;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleAccountChange(acc.id)}
                    className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#088ac1] bg-[#e1f3fd] dark:bg-[#088ac1]/20 dark:border-[#3dc3f3] shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-0.5">
                      <IconComp
                        className="w-3.5 h-3.5"
                        style={{ color: isSelected ? '#088ac1' : acc.color || '#64748b' }}
                      />
                      {isSelected && <Check className="w-3 h-3 text-[#088ac1] dark:text-[#3dc3f3]" />}
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                      {acc.name}
                    </span>
                    <span className="text-[9px] font-mono font-semibold text-slate-500 dark:text-slate-400 truncate">
                      {formatCurrency(acc.current_balance)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Grid (No nested scroll trap, clean compact 4-col buttons) */}
        {type !== 'transfer' && (
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {categories.map((cat) => {
                const isSelected = category === cat.name;
                const IconComponent = ICON_MAP[cat.icon] || Tag;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.name);
                      setCategoryIcon(cat.icon);
                    }}
                    className={`py-1.5 px-1 rounded-xl border text-center flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'border-[#088ac1] bg-[#e1f3fd] dark:bg-[#088ac1]/25 dark:border-[#3dc3f3] text-slate-900 dark:text-white font-extrabold shadow-sm ring-1 ring-[#088ac1]/40'
                        : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <IconComponent
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: isSelected ? '#088ac1' : cat.color }}
                    />
                    <span className="text-[9px] leading-tight truncate w-full font-medium">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Date and Time Pickers */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-2.5 py-1.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#088ac1]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#088ac1]"
            />
          </div>
        </div>

        {/* Notes / Description */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Note / Merchant / Details (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              type === 'expense'
                ? 'e.g. Swiggy lunch, Groceries, Fuel bill...'
                : type === 'income'
                ? 'e.g. Monthly salary, Freelance payment...'
                : 'e.g. ATM withdrawal, Card settlement...'
            }
            className="w-full px-2.5 py-1.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#088ac1]"
          />
        </div>
      </form>
    </Modal>
  );
};
