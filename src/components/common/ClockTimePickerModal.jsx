import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, Check, X } from 'lucide-react';

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

  // Compact clock coordinates (210px dial)
  const DIAL_RADIUS = 90;
  const CENTER = 105;

  const getPositionForAngle = (deg, radius = 72) => {
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

  if (!isOpen) return null;

  const currentAngle =
    mode === 'hours'
      ? selectedHour * 30
      : selectedMinute * 6;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[290px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-islamic-primary-100 dark:bg-islamic-primary-950/80 text-islamic-primary-600 dark:text-islamic-primary-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
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
        <div className="p-3.5 flex flex-col items-center space-y-2.5">
          {/* Digital Display + AM/PM Toggle */}
          <div className="flex items-center justify-center gap-2 w-full">
            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-1">
              <button
                type="button"
                onClick={() => setMode('hours')}
                className={`px-2 py-1 rounded-lg text-xl font-extrabold font-mono transition-all ${
                  mode === 'hours'
                    ? 'bg-islamic-primary-600 text-white shadow-picton-glow'
                    : 'text-slate-700 dark:text-slate-300 hover:text-islamic-primary-600'
                }`}
              >
                {selectedHour.toString().padStart(2, '0')}
              </button>

              <span className="text-lg font-black text-slate-400 dark:text-slate-500 px-0.5 font-mono">
                :
              </span>

              <button
                type="button"
                onClick={() => setMode('minutes')}
                className={`px-2 py-1 rounded-lg text-xl font-extrabold font-mono transition-all ${
                  mode === 'minutes'
                    ? 'bg-islamic-primary-600 text-white shadow-picton-glow'
                    : 'text-slate-700 dark:text-slate-300 hover:text-islamic-primary-600'
                }`}
              >
                {selectedMinute.toString().padStart(2, '0')}
              </button>
            </div>

            {/* AM / PM Toggle */}
            <div className="flex flex-col gap-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-1 text-[11px] font-extrabold">
              <button
                type="button"
                onClick={() => setSelectedPeriod('AM')}
                className={`px-2 py-0.5 rounded-md transition-all ${
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
                className={`px-2 py-0.5 rounded-md transition-all ${
                  selectedPeriod === 'PM'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                PM
              </button>
            </div>
          </div>

          {/* Mode label */}
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">
            Select {mode === 'hours' ? 'Hour (1 - 12)' : 'Minute (00 - 59)'}
          </div>

          {/* Compact Analog Clock Dial (210x210) */}
          <div
            ref={clockRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative w-[210px] h-[210px] rounded-full bg-gradient-to-br from-slate-100 to-slate-200/80 dark:from-slate-900 dark:to-slate-800/90 border-2 border-slate-200 dark:border-slate-700/80 shadow-inner flex items-center justify-center cursor-pointer touch-none select-none"
          >
            {/* Center Pivot Point */}
            <div className="w-2.5 h-2.5 rounded-full bg-islamic-primary-600 dark:bg-islamic-primary-500 ring-2 ring-white dark:ring-slate-900 z-20 shadow-sm" />

            {/* Clock Hand Pointer */}
            <div
              className="absolute top-1/2 left-1/2 origin-top pointer-events-none transition-transform duration-100 ease-out z-10"
              style={{
                transform: `rotate(${currentAngle + 180}deg) translate(-50%, 0)`,
                width: '2px',
                height: `${DIAL_RADIUS - 16}px`,
              }}
            >
              <div className="w-full h-full bg-islamic-primary-600 dark:bg-islamic-primary-500 rounded-full shadow-sm" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-islamic-primary-600/90 dark:bg-islamic-primary-500/90 shadow-picton-glow" />
            </div>

            {/* Dial Numbers: Hours (1 to 12) or Minutes (00, 05.. 55) */}
            {mode === 'hours'
              ? Array.from({ length: 12 }).map((_, idx) => {
                  const hourNum = idx + 1;
                  const deg = hourNum * 30;
                  const pos = getPositionForAngle(deg, 72);
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
                  const pos = getPositionForAngle(deg, 72);
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
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all z-20 ${
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
        </div>

        {/* Modal Actions */}
        <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
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
            className="px-3.5 py-1.5 rounded-xl bg-islamic-primary-600 hover:bg-islamic-primary-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            Set to {formatOutput()}
          </button>
        </div>
      </div>
    </div>
  );
};
