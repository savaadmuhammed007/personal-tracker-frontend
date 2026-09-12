import React, { useState, useEffect } from 'react';
import { Clock, Check, X, ChevronUp, ChevronDown } from 'lucide-react';

export const ClockTimePickerModal = ({
  isOpen,
  onClose,
  initialTime = '07:00 AM',
  onSelectTime,
  title = 'Set Time',
}) => {
  // Parse initial time string e.g. "07:30 AM" or "19:30" or "7:00 AM"
  const parseTimeString = (str) => {
    if (!str) return { hour: 7, minute: 0, period: 'AM' };
    const cleaned = str.trim().toUpperCase();
    const isPM = cleaned.includes('PM');
    const isAM = cleaned.includes('AM');
    const parts = cleaned.replace(/[^0-9:]/g, '').split(':');
    let h = parseInt(parts[0], 10) || 7;
    let m = parseInt(parts[1], 10) || 0;

    let period = 'AM';
    if (isPM) {
      period = 'PM';
    } else if (isAM) {
      period = 'AM';
    } else if (h >= 12) {
      period = 'PM';
      if (h > 12) h -= 12;
    }

    if (h > 12) h = h % 12;
    if (h === 0) h = 12;
    if (m >= 60) m = 0;

    return { hour: h, minute: m, period };
  };

  const [selectedHour, setSelectedHour] = useState(7);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('AM');

  useEffect(() => {
    if (isOpen) {
      const parsed = parseTimeString(initialTime);
      setSelectedHour(parsed.hour);
      setSelectedMinute(parsed.minute);
      setSelectedPeriod(parsed.period);
    }
  }, [isOpen, initialTime]);

  const stepHour = (delta) => {
    setSelectedHour((prev) => {
      let next = prev + delta;
      if (next > 12) return 1;
      if (next < 1) return 12;
      return next;
    });
  };

  const stepMinute = (delta) => {
    setSelectedMinute((prev) => {
      let next = prev + delta;
      if (next >= 60) return 0;
      if (next < 0) return 55;
      return next;
    });
  };

  const formatOutput = () => {
    const hStr = selectedHour.toString().padStart(2, '0');
    const mStr = selectedMinute.toString().padStart(2, '0');
    return `${hStr}:${mStr} ${selectedPeriod}`;
  };

  const handleConfirm = () => {
    const formatted = formatOutput();
    if (onSelectTime) onSelectTime(formatted);
    onClose();
  };

  const quickPresets = [
    { label: 'Fajr', time: '05:00 AM' },
    { label: 'Duha', time: '08:30 AM' },
    { label: 'Dhuhr', time: '01:30 PM' },
    { label: 'Asr', time: '05:00 PM' },
    { label: 'Maghrib', time: '07:15 PM' },
    { label: 'Isha', time: '09:30 PM' },
  ];

  const applyPreset = (timeStr) => {
    const parsed = parseTimeString(timeStr);
    setSelectedHour(parsed.hour);
    setSelectedMinute(parsed.minute);
    setSelectedPeriod(parsed.period);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[320px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-islamic-primary-100 dark:bg-islamic-primary-950/80 text-islamic-primary-600 dark:text-islamic-primary-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5">
          {/* Time Controls: Hour, Colon, Minute, AM/PM */}
          <div className="flex items-center justify-center gap-2">
            {/* Hour Column */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => stepHour(1)}
                className="w-14 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition-colors"
                title="Increase Hour"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <div className="w-14 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl font-black font-mono text-slate-900 dark:text-white select-none">
                {selectedHour.toString().padStart(2, '0')}
              </div>
              <button
                type="button"
                onClick={() => stepHour(-1)}
                className="w-14 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition-colors"
                title="Decrease Hour"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-semibold text-slate-400 uppercase mt-0.5">Hour</span>
            </div>

            {/* Separator */}
            <span className="text-2xl font-black font-mono text-slate-400 dark:text-slate-500 pb-5">:</span>

            {/* Minute Column */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => stepMinute(5)}
                className="w-14 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition-colors"
                title="Increase Minute"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <div className="w-14 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl font-black font-mono text-slate-900 dark:text-white select-none">
                {selectedMinute.toString().padStart(2, '0')}
              </div>
              <button
                type="button"
                onClick={() => stepMinute(-5)}
                className="w-14 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition-colors"
                title="Decrease Minute"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-semibold text-slate-400 uppercase mt-0.5">Min</span>
            </div>

            {/* AM / PM Column */}
            <div className="flex flex-col gap-1.5 ml-2 pb-4">
              <button
                type="button"
                onClick={() => setSelectedPeriod('AM')}
                className={`w-12 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedPeriod === 'AM'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod('PM')}
                className={`w-12 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedPeriod === 'PM'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                PM
              </button>
            </div>
          </div>

          {/* Quick Minute Chips */}
          <div className="flex items-center justify-center gap-1.5 pt-0.5">
            {[0, 15, 30, 45].map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setSelectedMinute(m)}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold font-mono border transition-all ${
                  selectedMinute === m
                    ? 'bg-islamic-primary-50 dark:bg-islamic-primary-950/60 border-islamic-primary-500 text-islamic-primary-600 dark:text-islamic-primary-400'
                    : 'border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                :{m.toString().padStart(2, '0')}
              </button>
            ))}
          </div>

          {/* Quick Presets */}
          <div className="pt-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5 text-center">
              Quick Presets
            </span>
            <div className="grid grid-cols-3 gap-1">
              {quickPresets.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => applyPreset(preset.time)}
                  className="px-1.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-islamic-primary-50 dark:hover:bg-islamic-primary-950/50 hover:border-islamic-primary-300 text-[11px] font-medium text-slate-700 dark:text-slate-300 text-center transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-1.5 rounded-xl bg-islamic-primary-600 hover:bg-islamic-primary-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            Set {formatOutput()}
          </button>
        </div>
      </div>
    </div>
  );
};
