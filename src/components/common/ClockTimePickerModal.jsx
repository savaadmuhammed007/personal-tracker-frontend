import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, Check, X, Sparkles, Moon, Sun } from 'lucide-react';

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

  const [mode, setMode] = useState('hours'); // 'hours' or 'minutes'
  const [selectedHour, setSelectedHour] = useState(7);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('AM');
  const [isDragging, setIsDragging] = useState(false);
  const clockRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const parsed = parseTimeString(initialTime);
      setSelectedHour(parsed.hour);
      setSelectedMinute(parsed.minute);
      setSelectedPeriod(parsed.period);
      setMode('hours');
    }
  }, [isOpen, initialTime]);

  // Calculate clock coordinates
  const DIAL_RADIUS = 110;
  const CENTER = 130; // dial size 260x260

  const getPositionForAngle = (deg, radius = 88) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return {
      x: CENTER + radius * Math.cos(rad),
      y: CENTER + radius * Math.sin(rad),
    };
  };

  const handlePointerCalculation = useCallback(
    (clientX, clientY) => {
      if (!clockRef.current) return;
      const rect = clockRef.current.getBoundingClientRect();
      const x = clientX - rect.left - rect.width / 2;
      const y = clientY - rect.top - rect.height / 2;

      // Calculate angle from 12 o'clock (top) in degrees [0, 360)
      let angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
      if (angle < 0) angle += 360;

      if (mode === 'hours') {
        // 12 hours: each hour is 30 deg
        let h = Math.round(angle / 30);
        if (h === 0) h = 12;
        setSelectedHour(h);
      } else {
        // 60 minutes: each minute is 6 deg
        let m = Math.round(angle / 6);
        if (m === 60) m = 0;
        setSelectedMinute(m);
      }
    },
    [mode]
  );

  const handlePointerDown = (e) => {
    setIsDragging(true);
    handlePointerCalculation(e.clientX, e.clientY);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    handlePointerCalculation(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (mode === 'hours') {
        // Auto transition to minute picker on release
        setTimeout(() => setMode('minutes'), 200);
      }
    }
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
    { label: '🌅 Pre-Fajr', time: '05:00 AM' },
    { label: '☀️ Duha', time: '08:30 AM' },
    { label: '🕌 Dhuhr', time: '01:30 PM' },
    { label: '🌤️ Asr', time: '05:00 PM' },
    { label: '🌇 Maghrib', time: '07:15 PM' },
    { label: '🌙 Isha / Night', time: '09:30 PM' },
  ];

  const applyPreset = (timeStr) => {
    const parsed = parseTimeString(timeStr);
    setSelectedHour(parsed.hour);
    setSelectedMinute(parsed.minute);
    setSelectedPeriod(parsed.period);
  };

  if (!isOpen) return null;

  // Calculate rotation angle for clock hand
  const currentAngle =
    mode === 'hours'
      ? selectedHour * 30
      : selectedMinute * 6;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div
        className="w-full max-w-sm max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-islamic-card-dark border border-islamic-border-light dark:border-islamic-border-dark shadow-2xl animate-scale-up my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 pt-4 pb-3 border-b border-islamic-border-light/60 dark:border-islamic-border-dark/60 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-islamic-card-dark/95 backdrop-blur-sm z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-islamic-primary-100 dark:bg-islamic-primary-950/80 text-islamic-primary-700 dark:text-islamic-primary-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 flex flex-col items-center space-y-4 sm:space-y-5">
          {/* Big Digital Display + AM/PM Switcher */}
          <div className="flex items-center justify-center gap-3 w-full">
            <div className="flex items-center rounded-2xl bg-islamic-subtle-light/70 dark:bg-islamic-subtle-dark/70 border border-islamic-border-light dark:border-islamic-border-dark p-2">
              <button
                type="button"
                onClick={() => setMode('hours')}
                className={`px-3 py-1.5 rounded-xl text-3xl font-extrabold font-mono transition-all ${
                  mode === 'hours'
                    ? 'bg-islamic-primary-600 text-white shadow-picton-glow'
                    : 'text-slate-700 dark:text-slate-300 hover:text-islamic-primary-600'
                }`}
              >
                {selectedHour.toString().padStart(2, '0')}
              </button>

              <span className="text-2xl font-black text-slate-400 dark:text-slate-500 px-1 font-mono animate-pulse">
                :
              </span>

              <button
                type="button"
                onClick={() => setMode('minutes')}
                className={`px-3 py-1.5 rounded-xl text-3xl font-extrabold font-mono transition-all ${
                  mode === 'minutes'
                    ? 'bg-islamic-primary-600 text-white shadow-picton-glow'
                    : 'text-slate-700 dark:text-slate-300 hover:text-islamic-primary-600'
                }`}
              >
                {selectedMinute.toString().padStart(2, '0')}
              </button>
            </div>

            {/* AM / PM Toggle */}
            <div className="flex flex-col gap-1 rounded-xl bg-islamic-subtle-light/70 dark:bg-islamic-subtle-dark/70 border border-islamic-border-light dark:border-islamic-border-dark p-1 text-xs font-extrabold">
              <button
                type="button"
                onClick={() => setSelectedPeriod('AM')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedPeriod === 'AM'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod('PM')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedPeriod === 'PM'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                PM
              </button>
            </div>
          </div>

          {/* Mode helper label */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Select {mode === 'hours' ? 'Hour (1 - 12)' : 'Minute (00 - 59)'}</span>
          </div>

          {/* Interactive Clock Face Canvas */}
          <div
            ref={clockRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative w-[260px] h-[260px] rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-islamic-card-dark border-4 border-islamic-border-light dark:border-islamic-border-dark/80 shadow-inner flex items-center justify-center cursor-pointer touch-none"
          >
            {/* Center Pivot Point */}
            <div className="w-3.5 h-3.5 rounded-full bg-islamic-primary-600 dark:bg-islamic-primary-500 ring-4 ring-white dark:ring-slate-900 z-20 shadow-md" />

            {/* Hand Pointer */}
            <div
              className="absolute top-1/2 left-1/2 origin-top pointer-events-none transition-transform duration-100 ease-out z-10"
              style={{
                transform: `rotate(${currentAngle + 180}deg) translate(-50%, 0)`,
                width: '2.5px',
                height: `${DIAL_RADIUS - 22}px`,
              }}
            >
              <div className="w-full h-full bg-islamic-primary-600 dark:bg-islamic-primary-500 rounded-full shadow-sm" />
              {/* Target bubble indicator */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-islamic-primary-600/90 dark:bg-islamic-primary-500/90 shadow-picton-glow" />
            </div>

            {/* Dial Numbers: Hours (1 to 12) or Minutes (00, 05.. 55) */}
            {mode === 'hours'
              ? Array.from({ length: 12 }).map((_, idx) => {
                  const hourNum = idx + 1;
                  const deg = hourNum * 30;
                  const pos = getPositionForAngle(deg, 88);
                  const isSelected = selectedHour === hourNum;

                  return (
                    <button
                      type="button"
                      key={hourNum}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHour(hourNum);
                        setTimeout(() => setMode('minutes'), 200);
                      }}
                      style={{
                        left: `${pos.x}px`,
                        top: `${pos.y}px`,
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all z-20 ${
                        isSelected
                          ? 'text-white font-black scale-110'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {hourNum}
                    </button>
                  );
                })
              : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((minNum) => {
                  const deg = minNum * 6;
                  const pos = getPositionForAngle(deg, 88);
                  const isSelected = selectedMinute === minNum;

                  return (
                    <button
                      type="button"
                      key={minNum}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMinute(minNum);
                      }}
                      style={{
                        left: `${pos.x}px`,
                        top: `${pos.y}px`,
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all z-20 ${
                        isSelected
                          ? 'text-white font-black scale-110'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {minNum.toString().padStart(2, '0')}
                    </button>
                  );
                })}
          </div>

          {/* Quick Islamic Preset Times */}
          <div className="w-full pt-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2 text-center">
              Quick Islamic Presets
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {quickPresets.map((preset) => (
                <button
                  type="button"
                  key={preset.time}
                  onClick={() => applyPreset(preset.time)}
                  className="px-2 py-1.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark/70 bg-islamic-subtle-light/40 dark:bg-islamic-subtle-dark/40 hover:bg-islamic-primary-50 dark:hover:bg-islamic-primary-950/40 text-[11px] font-bold text-slate-700 dark:text-slate-300 text-center transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/60 border-t border-islamic-border-light/60 dark:border-islamic-border-dark/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl bg-islamic-primary-600 hover:bg-islamic-primary-700 text-white text-xs font-bold shadow-picton-glow flex items-center gap-1.5 transition-all"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Set to {formatOutput()}
          </button>
        </div>
      </div>
    </div>
  );
};
