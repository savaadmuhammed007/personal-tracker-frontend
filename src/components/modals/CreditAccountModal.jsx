import React, { useState, useEffect } from 'react';
import { Modal } from '../common/UIComponents';
import { ArrowDownLeft, ArrowUpRight, Users, Check, Phone, FileText } from 'lucide-react';
import { expenseApi } from '../../api/expenseApi';
import { useNotification } from '../../context/NotificationContext';

const ACCOUNT_TYPES = [
  { id: 'cash_debit', label: 'Cash Debit', desc: 'You Owe / Payable', icon: ArrowDownLeft, color: '#f43f5e' },
  { id: 'cash_credit', label: 'Cash Credit', desc: 'You Are Owed / Receivable', icon: ArrowUpRight, color: '#10b981' },
  { id: 'general', label: 'Party / General', desc: 'Tracks both dues & advances', icon: Users, color: '#088ac1' },
];

const COLOR_PRESETS = ['#f43f5e', '#10b981', '#088ac1', '#6366f1', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

export const CreditAccountModal = ({ isOpen, onClose, account = null, onSaved }) => {
  const { showToast } = useNotification();
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState('cash_credit');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('#10b981');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (account) {
        setName(account.name || '');
        setAccountType(account.account_type || 'cash_credit');
        setPhone(account.phone || '');
        setNotes(account.notes || '');
        setColor(account.color || '#10b981');
      } else {
        setName('');
        setAccountType('cash_credit');
        setPhone('');
        setNotes('');
        setColor('#10b981');
      }
    }
  }, [isOpen, account]);

  const handleTypeSelect = (typeId) => {
    setAccountType(typeId);
    if (!account) {
      if (typeId === 'cash_debit') setColor('#f43f5e');
      else if (typeId === 'cash_credit') setColor('#10b981');
      else setColor('#088ac1');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter an account name', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        account_type: accountType,
        phone: phone.trim(),
        notes: notes.trim(),
        color,
      };

      if (account) {
        await expenseApi.updateCreditAccount(account.id, payload);
        showToast('Account Updated', `Saved changes to ${name.trim()}`);
      } else {
        await expenseApi.createCreditAccount(payload);
        showToast('Account Created', `Created ${name.trim()} successfully`);
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save credit account:', err);
      const errMsg =
        err.response?.data?.name?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        'Failed to save account';
      showToast('Error', errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={account ? 'Edit Credit Account' : 'New Credit Book Account'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Account Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Account / Party Name
          </label>
          <input
            type="text"
            required
            autoFocus
            placeholder="e.g. Cash Credit, Cash Debit, Brother Ali, Store ABC"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#088ac1] outline-none text-slate-900 dark:text-white"
          />
        </div>

        {/* Account Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Account Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ACCOUNT_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = accountType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleTypeSelect(type.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    isSelected
                      ? 'border-[#088ac1] bg-[#088ac1]/10 text-[#088ac1] dark:text-[#3dc3f3] shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px] font-bold leading-tight">{type.label}</span>
                  <span className="text-[9px] text-slate-400 leading-tight">{type.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contact Phone (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            Contact / Phone (Optional)
          </label>
          <input
            type="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#088ac1] outline-none text-slate-900 dark:text-white"
          />
        </div>

        {/* Color presets */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Accent Color
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                  color === c ? 'scale-110 ring-2 ring-offset-2 ring-[#088ac1]' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              >
                {color === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Notes (Optional)
          </label>
          <textarea
            rows="2"
            placeholder="Remarks or memo about this credit account..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#088ac1] outline-none text-slate-900 dark:text-white resize-none"
          />
        </div>

        {/* Actions */}
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
            className="px-5 py-2 text-xs font-bold text-white bg-[#088ac1] hover:bg-[#0779ab] rounded-xl shadow-md shadow-[#088ac1]/20 transition-all cursor-pointer active:scale-95"
          >
            {submitting ? 'Saving...' : account ? 'Update Account' : 'Create Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
