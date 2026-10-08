import React, { useState, useEffect } from 'react';
import { Modal } from '../common/UIComponents';
import { Wallet, Smartphone, Building2, CreditCard, PiggyBank, Check } from 'lucide-react';
import { expenseApi } from '../../api/expenseApi';
import { useNotification } from '../../context/NotificationContext';
import { getLocalDateString } from '../../utils/dateUtils';

const ACCOUNT_TYPES = [
  { id: 'cash', label: 'Cash', icon: Wallet, color: '#10b981' },
  { id: 'upi', label: 'UPI / Mobile', icon: Smartphone, color: '#0284c7' },
  { id: 'bank', label: 'Bank Account', icon: Building2, color: '#6366f1' },
  { id: 'credit_card', label: 'Credit Card', icon: CreditCard, color: '#f43f5e' },
  { id: 'savings', label: 'Savings', icon: PiggyBank, color: '#eab308' },
];

const COLOR_PRESETS = ['#10b981', '#0284c7', '#ef4444', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

export const AccountFormModal = ({ isOpen, onClose, account = null, onSaved }) => {
  const { showToast } = useNotification();
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState('upi');
  const [bankName, setBankName] = useState('');
  const [balanceSign, setBalanceSign] = useState('+'); // '+' or '-'
  const [balanceMagnitude, setBalanceMagnitude] = useState('0');
  const [openingDate, setOpeningDate] = useState(getLocalDateString());
  const [color, setColor] = useState('#0284c7');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (account) {
        setName(account.name || '');
        setAccountType(account.account_type || 'upi');
        setBankName(account.bank_name || '');
        const num = Number(account.opening_balance ?? 0);
        if (num < 0) {
          setBalanceSign('-');
          setBalanceMagnitude(String(Math.abs(num)));
        } else {
          setBalanceSign('+');
          setBalanceMagnitude(String(num));
        }
        setOpeningDate(account.opening_balance_date || getLocalDateString());
        setColor(account.color || '#0284c7');
      } else {
        setName('');
        setAccountType('upi');
        setBankName('');
        setBalanceSign('+');
        setBalanceMagnitude('0');
        setOpeningDate(getLocalDateString());
        setColor('#0284c7');
      }
    }
  }, [isOpen, account]);

  const handleMagnitudeChange = (e) => {
    const val = e.target.value;
    if (val.startsWith('-')) {
      setBalanceSign('-');
      setBalanceMagnitude(val.replace(/^-+/, ''));
    } else if (val.startsWith('+')) {
      setBalanceSign('+');
      setBalanceMagnitude(val.replace(/^\++/, ''));
    } else {
      setBalanceMagnitude(val);
    }
  };

  const toggleSign = () => {
    setBalanceSign((prev) => (prev === '+' ? '-' : '+'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const mag = parseFloat(balanceMagnitude) || 0;
    const finalBalance = balanceSign === '-' ? -Math.abs(mag) : Math.abs(mag);

    setSubmitting(true);

    const payload = {
      name: name.trim(),
      account_type: accountType,
      bank_name: bankName.trim(),
      opening_balance: finalBalance.toFixed(2),
      opening_balance_date: openingDate || null,
      color,
      icon:
        accountType === 'cash'
          ? 'Wallet'
          : accountType === 'upi'
          ? 'Smartphone'
          : accountType === 'credit_card'
          ? 'CreditCard'
          : accountType === 'savings'
          ? 'PiggyBank'
          : 'Building2',
    };

    try {
      if (account?.id) {
        await expenseApi.updateAccount(account.id, payload);
        showToast('Account Updated', `Saved changes to ${name}`);
      } else {
        await expenseApi.createAccount(payload);
        showToast('Account Created', `Created account ${name}`);
      }
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.name?.[0] || 'Failed to save account';
      showToast('Error', msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const isNegative = balanceSign === '-';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200">
            <Building2 className="w-5 h-5 text-[#088ac1] dark:text-[#3dc3f3]" />
          </span>
          <span>{account?.id ? 'Edit Account' : 'Add Financial Account'}</span>
        </div>
      }
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center gap-2.5 w-full">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="account-form"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#088ac1] to-[#076e9d] hover:from-[#1eb4eb] hover:to-[#088ac1] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#088ac1]/30 transition-all cursor-pointer active:scale-98"
          >
            {submitting ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </span>
            ) : account?.id ? 'Update Account' : 'Create Account'}
          </button>
        </div>
      }
    >
      <form id="account-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Account Name */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Account Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. HDFC Bank, PayTM Wallet, Credit Card..."
            required
            className="w-full px-3 py-2 text-xs sm:text-sm font-medium rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#088ac1]"
          />
        </div>

        {/* Account Type Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Account Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ACCOUNT_TYPES.map((t) => {
              const isSelected = accountType === t.id;
              const IconComp = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setAccountType(t.id);
                    setColor(t.color);
                    if (t.id === 'credit_card' && !account) {
                      setBalanceSign('-');
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#088ac1] bg-[#e1f3fd] dark:bg-[#088ac1]/20 dark:border-[#3dc3f3] text-slate-900 dark:text-white font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <IconComp className="w-4 h-4" style={{ color: isSelected ? '#088ac1' : t.color }} />
                  <span className="text-xs">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bank / Institution Name */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Bank / Provider Name (Optional)
          </label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="e.g. Kotak Mahindra, Canara, SBI, Cash..."
            className="w-full px-3 py-2 text-xs sm:text-sm font-medium rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#088ac1]"
          />
        </div>

        {/* Initial Opening Balance */}
        {!account && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Starting Opening Balance (₹)
              </label>
              <span
                className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                  isNegative
                    ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                    : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {isNegative ? 'Negative Balance (-)' : 'Positive Asset (+)'}
              </span>
            </div>

            <div className="relative flex items-center">
              <button
                type="button"
                onClick={toggleSign}
                title="Click to toggle positive / negative"
                className={`absolute left-2 z-10 px-2 py-1 rounded-lg font-mono font-bold text-xs flex items-center gap-0.5 transition-colors cursor-pointer select-none ${
                  isNegative
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-emerald-500 text-white shadow-xs'
                }`}
              >
                <span>{balanceSign}</span>
                <span>₹</span>
              </button>
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={balanceMagnitude}
                onChange={handleMagnitudeChange}
                placeholder="0.00"
                className={`w-full pl-14 pr-3 py-2 text-sm font-bold font-mono rounded-xl bg-slate-50 dark:bg-slate-900 border focus:outline-none transition-colors ${
                  isNegative
                    ? 'border-rose-300 dark:border-rose-800/70 focus:ring-2 focus:ring-rose-500 text-rose-600 dark:text-rose-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#088ac1]'
                }`}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {isNegative
                ? 'Tip: Negative balance is ideal for existing debt, loan balance, or credit card bills.'
                : 'Tip: Tap +/- to switch between positive asset and negative liability/debt.'}
            </p>
          </div>
        )}

        {/* Color Accent */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Color Accent
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                  color === c ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              >
                {color === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
};
