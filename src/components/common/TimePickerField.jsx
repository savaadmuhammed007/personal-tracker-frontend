import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { ClockTimePickerModal } from './ClockTimePickerModal';

export const TimePickerField = ({
  value = '07:00 AM',
  onChange,
  label = 'Reminder / Target Time',
  className = '',
  modalTitle = 'Set Habit Reminder Time',
}) => {
  const [isClockOpen, setIsClockOpen] = useState(false);

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          {label}
        </label>
      )}

      {/* Interactive Trigger Button */}
      <button
        type="button"
        onClick={() => setIsClockOpen(true)}
        className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500 hover:border-islamic-primary-400 dark:hover:border-islamic-primary-600 transition-all flex items-center justify-between group text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-islamic-primary-100 dark:bg-islamic-primary-950/70 text-islamic-primary-700 dark:text-islamic-primary-300 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">
            {value || '07:00 AM'}
          </span>
        </div>

        <span className="text-[11px] font-bold text-islamic-primary-600 dark:text-islamic-primary-400 bg-islamic-primary-50 dark:bg-islamic-primary-950/60 px-2 py-0.5 rounded-lg border border-islamic-primary-200 dark:border-islamic-primary-800/60 group-hover:bg-islamic-primary-100 transition-colors">
          Open Clock
        </span>
      </button>

      {/* Clock Model Popup */}
      <ClockTimePickerModal
        isOpen={isClockOpen}
        onClose={() => setIsClockOpen(false)}
        initialTime={value}
        onSelectTime={(newTime) => {
          if (onChange) onChange(newTime);
        }}
        title={modalTitle}
      />
    </div>
  );
};
