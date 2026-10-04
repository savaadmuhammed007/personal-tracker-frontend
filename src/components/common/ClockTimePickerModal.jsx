import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Clock, Check, X, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';

const TIME_PRESETS = [
  { label: 'Fajr / Morning', time: '05:00 AM' },
  { label: 'Duha / Forenoon', time: '08:30 AM' },
  { label: 'Dhuhr / Midday', time: '01:00 PM' },
  { label: 'Asr / Afternoon', time: '04:30 PM' },
  { label: 'Maghrib / Evening', time: '06:45 PM' },
  { label: 'Isha / Night', time: '08:30 PM' },
  { label: 'Tahajjud', time: '03:30 AM' },
];

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

  // Responsive Compact clock coordinates (200px dial)
  const DIAL_RADIUS = 85;
  const CENTER = 100;

  const getPositionForAngle = (deg, radius = 68) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return {
      x: CENTER + radius * Math.cos(rad),
      y: CENTER + radius * Math.sin(rad),
    };
  };

  const calculateAngleFromPoint = useCallback(
    (clientX, clientY) => {
      if (!clockRef.current) return;
      const rect = clockRef.current.getBoundingClientRect();
      const x = clientX - (rect.left + rect.width / 2);
      const y = clientY - (rect.top + rect.height / 2);

      let angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
      if (angle < 0) angle += 360;

      if (mode === 'hours') {
        let h = Math.round(angle / 30);
        if (h === 0) h = 12;
        setSelectedHour(h);
      } else {
        let m = Math.round(angle / 6);
        if (m === 60) m = 0;
        setSelectedMinute(m);
      }
    },
    [mode]
  );

  const handlePointerDown = (e) => {
    setIsDragging(true);
    if (e.target.setPointerCapture && e.pointerId) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch {}
    }
    calculateAngleFromPoint(e.clientX, e.clientY);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    calculateAngleFromPoint(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (mode === 'hours') {
        setTimeout(() => setMode('minutes'), 200);
      }
    }
  };

  // Steppers for precision fine-tuning
  const adjustHour = (delta) => {
    setSelectedHour((prev) => {
      let next = prev + delta;
      if (next > 12) next = 1;
      if (next < 1) next = 12;
      return next;
    });
  };

  const adjustMinute = (delta) => {
    setSelectedMinute((prev) => {
      let next = prev + delta;
      if (next >= 60) next = next % 60;
      if (next < 0) next = 60 + (next % 60);
      return next;
    });
  };

  const applyPreset = (timeStr) => {
    const parsed = parseTimeString(timeStr);
    setSelectedHour(parsed.hour);
    setSelectedMinute(parsed.minute);
    setSelectedPeriod(parsed.period);
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

  if (!isOpen) return null;

  const currentAngle = mode === 'hours' ? selectedHour * 30 : selectedMinute * 6;

  const modalNode = (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4 select-none overscroll-contain pointer-events-auto"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity -z-10 animate-fade-in" />
      <div
        className="w-full max-w-[310px] rounded-3xl bg-white dark:bg-[#071924] border border-slate-200 dark:border-[#0f344a] shadow-2xl overflow-hidden animate-scale-up max-h-[88vh] max-h-[88dvh] min-h-0 flex flex-col z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-[#0f344a]/80 flex items-center justify-between bg-slate-50/80 dark:bg-[#091f2c]/80 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#e1f3fd] dark:bg-[#0c4059] text-[#088ac1] dark:text-[#3dc3f3] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
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

        {/* Scrollable Dial & Controls Body */}
        <div className="p-3 sm:p-4 flex flex-col items-center space-y-3 overflow-y-auto">
          {/* Digital Display with Stepper Arrows */}
          <div className="flex items-center justify-center gap-2 w-full">
            {/* Hour Block */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => adjustHour(1)}
                className="p-1 text-slate-400 hover:text-[#088ac1] dark:hover:text-[#3dc3f3] transition-colors"
                title="+1 Hour"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setMode('hours')}
                className={`w-12 py-1.5 rounded-xl text-xl font-black font-mono text-center transition-all ${
                  mode === 'hours'
                    ? 'bg-[#088ac1] text-white shadow-picton-glow ring-2 ring-[#3dc3f3]'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:bg-slate-200'
                }`}
              >
                {selectedHour.toString().padStart(2, '0')}
              </button>
              <button
                type="button"
                onClick={() => adjustHour(-1)}
                className="p-1 text-slate-400 hover:text-[#088ac1] dark:hover:text-[#3dc3f3] transition-colors"
                title="-1 Hour"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <span className="text-xl font-black text-slate-400 dark:text-slate-500 font-mono self-center -mt-1">
              :
            </span>

            {/* Minute Block */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => adjustMinute(5)}
                className="p-1 text-slate-400 hover:text-[#088ac1] dark:hover:text-[#3dc3f3] transition-colors"
                title="+5 Minutes"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setMode('minutes')}
                className={`w-12 py-1.5 rounded-xl text-xl font-black font-mono text-center transition-all ${
                  mode === 'minutes'
                    ? 'bg-[#088ac1] text-white shadow-picton-glow ring-2 ring-[#3dc3f3]'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:bg-slate-200'
                }`}
              >
                {selectedMinute.toString().padStart(2, '0')}
              </button>
              <button
                type="button"
                onClick={() => adjustMinute(-5)}
                className="p-1 text-slate-400 hover:text-[#088ac1] dark:hover:text-[#3dc3f3] transition-colors"
                title="-5 Minutes"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* AM / PM Toggle */}
            <div className="flex flex-col gap-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-1 text-[11px] font-extrabold ml-1 self-center">
              <button
                type="button"
                onClick={() => setSelectedPeriod('AM')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedPeriod === 'AM'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod('PM')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedPeriod === 'PM'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                PM
              </button>
            </div>
          </div>

          {/* Mode label */}
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">
            Tap dial to set {mode === 'hours' ? 'Hour' : 'Minute'}
          </div>

          {/* Analog Clock Dial (200x200) */}
          <div
            ref={clockRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative w-[200px] h-[200px] rounded-full bg-gradient-to-br from-slate-50 to-slate-200/90 dark:from-[#091b26] dark:to-[#071722] border-2 border-slate-200 dark:border-[#0f344a] shadow-inner flex items-center justify-center cursor-pointer touch-none select-none"
          >
            {/* Center Pivot Point */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#088ac1] dark:bg-[#3dc3f3] ring-2 ring-white dark:ring-[#071924] z-20 shadow-xs" />

            {/* Clock Hand Pointer */}
            <div
              className="absolute top-1/2 left-1/2 origin-top pointer-events-none transition-transform duration-100 ease-out z-10"
              style={{
                transform: `rotate(${currentAngle + 180}deg) translate(-50%, 0)`,
                width: '2px',
                height: `${DIAL_RADIUS - 14}px`,
              }}
            >
              <div className="w-full h-full bg-[#088ac1] dark:bg-[#3dc3f3] rounded-full shadow-xs" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#088ac1] dark:bg-[#3dc3f3] shadow-picton-glow" />
            </div>

            {/* Dial Numbers */}
            {mode === 'hours'
              ? Array.from({ length: 12 }).map((_, idx) => {
                  const hourNum = idx + 1;
                  const deg = hourNum * 30;
                  const pos = getPositionForAngle(deg, 68);
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
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all z-20 ${
                        isSelected
                          ? 'text-white font-black scale-110'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800'
                      }`}
                    >
                      {hourNum}
                    </button>
                  );
                })
              : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((minNum) => {
                  const deg = minNum * 6;
                  const pos = getPositionForAngle(deg, 68);
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
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all z-20 ${
                        isSelected
                          ? 'text-white font-black scale-110'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-800'
                      }`}
                    >
                      {minNum.toString().padStart(2, '0')}
                    </button>
                  );
                })}
          </div>

          {/* Quick Time Presets (Fajr, Dhuhr, Asr, Maghrib, Isha) */}
          <div className="w-full pt-1 border-t border-slate-100 dark:border-[#0f344a]/80">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1.5">
              <Sparkles className="w-3 h-3 text-[#088ac1] dark:text-[#3dc3f3]" />
              <span>Quick Presets:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {TIME_PRESETS.slice(0, 5).map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p.time)}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800/80 hover:bg-[#e1f3fd] dark:hover:bg-[#0c4059] text-slate-700 dark:text-slate-300 hover:text-[#088ac1] dark:hover:text-[#3dc3f3] transition-colors"
                >
                  {p.label.split('/')[0].trim()} ({p.time.replace(':00', '')})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-[#091f2c]/90 border-t border-slate-100 dark:border-[#0f344a] flex items-center justify-between gap-2 shrink-0">
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
            className="px-3.5 py-1.5 rounded-xl bg-[#088ac1] hover:bg-[#1eb4eb] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            Set to {formatOutput()}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};
