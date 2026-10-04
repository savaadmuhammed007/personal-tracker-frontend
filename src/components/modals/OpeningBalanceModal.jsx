import React, { useState, useEffect } from 'react';
import { Modal } from '../common/UIComponents';
import { Landmark, Wallet, Smartphone, Building2, Check, AlertCircle, RefreshCw, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '../../data/expenseCategories';
import { expenseApi } from '../../api/expenseApi';
import { useNotification } from '../../context/NotificationContext';
import { getLocalDateString } from '../../utils/dateUtils';

export const OpeningBalanceModal = ({
  isOpen,
  onClose,
  accounts = [],
  selectedAccount = null,
  onSaved,
}) => {
  const { showToast } = useNotification();
  const [accountId, setAccountId] = useState('');
  const [balanceSign, setBalanceSign] = useState('+'); // '+' or '-'
  const [balanceMagnitude, setBalanceMagnitude] = useState('0');
  const [openingDate, setOpeningDate] = useState(getLocalDateString());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const active = selectedAccount || accounts[0];
      if (active) {
        setAccountId(String(active.id));
        const num = Number(active.opening_balance ?? 0);
        if (num < 0) {
          setBalanceSign('-');
          setBalanceMagnitude(String(Math.abs(num)));
        } else {
          setBalanceSign('+');
          setBalanceMagnitude(String(num));
        }
        setOpeningDate(active.opening_balance_date || getLocalDateString());
      }
    }
  }, [isOpen, selectedAccount, accounts]);

  const currentActiveAccount = accounts.find((a) => String(a.id) === String(accountId)) || accounts[0];

  const handleAccountSelect = (acc) => {
    setAccountId(String(acc.id));
    const num = Number(acc.opening_balance ?? 0);
    if (num < 0) {
      setBalanceSign('-');
      setBalanceMagnitude(String(Math.abs(num)));
    } else {
      setBalanceSign('+');
      setBalanceMagnitude(String(num));
    }
    setOpeningDate(acc.opening_balance_date || getLocalDateString());
  };

  const handleMagnitudeChange = (e) => {
    const val = e.target.value;
    // If user typed a minus sign directly
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
    if (!accountId) return;

    const mag = parseFloat(balanceMagnitude);
    if (isNaN(mag)) {
      showToast('Invalid Amount', 'Please enter a valid balance amount', 'error');
      return;
    }

    const finalValue = balanceSign === '-' ? -Math.abs(mag) : Math.abs(mag);

    setSubmitting(true);
    try {
      await expenseApi.setOpeningBalance(accountId, {
        opening_balance: finalValue.toFixed(2),
        opening_balance_date: openingDate || null,
      });

      showToast(
        'Opening Balance Set',
        `Opening balance for ${currentActiveAccount?.name || 'Account'} set to ${formatCurrency(finalValue)}`
      );
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update opening balance';
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
          <span className="p-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
            <Landmark className="w-5 h-5" />
          </span>
          <span>Set Account Opening Balance</span>
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
            form="opening-balance-form"
            onClick={handleSubmit}
            disabled={submitting}
            className={`flex-1 py-3 px-4 rounded-xl text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-98 ${
              isNegative
                ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-600/30'
                : 'bg-gradient-to-r from-[#088ac1] to-[#076e9d] hover:from-[#1eb4eb] hover:to-[#088ac1] shadow-[#088ac1]/30'
            }`}
          >
            {submitting ? (
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </span>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Save Opening Balance</span>
              </>
            )}
          </button>
        </div>
      }
    >
      <form id="opening-balance-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Account Selector Tabs */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Select Account
          </label>
          <div className="grid grid-cols-3 gap-2">
            {accounts.map((acc) => {
              const isSelected = String(accountId) === String(acc.id);
              const IconComponent =
                acc.account_type === 'cash'
                  ? Wallet
                  : acc.account_type === 'upi'
                  ? Smartphone
                  : Building2;

              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleAccountSelect(acc)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-[#088ac1] bg-[#e1f3fd] dark:bg-[#088ac1]/20 dark:border-[#3dc3f3] shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <IconComponent
                      className="w-4 h-4"
                      style={{ color: isSelected ? '#088ac1' : acc.color || '#64748b' }}
                    />
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#088ac1] dark:text-[#3dc3f3]" />}
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {acc.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">
                    Live: {formatCurrency(acc.current_balance)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Balance Mode Switcher (+ Positive / - Negative) */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Balance Type / Sign
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setBalanceSign('+')}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                !isNegative
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Positive (+ Balance)</span>
            </button>
            <button
              type="button"
              onClick={() => setBalanceSign('-')}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isNegative
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400'
              }`}
            >
              <Minus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Negative (- Due/Overdraft)</span>
            </button>
          </div>
        </div>

        {/* Informational Tip */}
        <div
          className={`p-3 rounded-2xl border flex items-start gap-2.5 text-xs leading-relaxed transition-colors ${
            isNegative
              ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200/60 dark:border-rose-800/40 text-rose-900 dark:text-rose-200'
              : 'bg-cyan-50/70 dark:bg-cyan-950/30 border-cyan-200/60 dark:border-cyan-800/40 text-cyan-900 dark:text-cyan-200'
          }`}
        >
          <AlertCircle
            className={`w-4 h-4 shrink-0 mt-0.5 ${
              isNegative ? 'text-rose-600 dark:text-rose-400' : 'text-cyan-600 dark:text-cyan-400'
            }`}
          />
          <span>
            {isNegative
              ? 'Negative opening balance represents an existing debt, credit card liability, or bank overdraft before starting records.'
              : 'Opening balance is your initial baseline cash or bank balance. All transactions will mathematically flow from this base point.'}
          </span>
        </div>

        {/* Opening Balance Amount Input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Initial Amount (INR)
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
            {/* Quick Clickable Sign Toggle Inside Input */}
            <button
              type="button"
              onClick={toggleSign}
              title="Click to toggle positive / negative"
              className={`absolute left-2.5 z-10 px-2 py-1 rounded-lg font-mono font-bold text-sm flex items-center gap-0.5 transition-colors cursor-pointer select-none ${
                isNegative
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-emerald-500 text-white shadow-xs'
              }`}
            >
              <span>{balanceSign}</span>
              <span className="text-xs">₹</span>
            </button>

            <input
              type="number"
              step="0.01"
              inputMode="decimal"
              value={balanceMagnitude}
              onChange={handleMagnitudeChange}
              placeholder="0.00"
              required
              className={`w-full pl-16 pr-4 py-3 text-2xl font-extrabold font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/80 border-2 rounded-2xl focus:outline-none transition-colors ${
                isNegative
                  ? 'border-rose-300 dark:border-rose-800/70 focus:border-rose-500 dark:focus:border-rose-400'
                  : 'border-slate-200 dark:border-slate-700/80 focus:border-[#088ac1] dark:focus:border-[#3dc3f3]'
              }`}
            />
          </div>
        </div>

        {/* Effective Date */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Effective Baseline Date
          </label>
          <input
            type="date"
            value={openingDate}
            onChange={(e) => setOpeningDate(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm font-medium rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#088ac1]"
          />
        </div>
      </form>
    </Modal>
  );
};
