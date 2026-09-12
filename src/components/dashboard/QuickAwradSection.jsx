import React from 'react';
import { Plus, Minus, RotateCcw, Check, Sparkles } from 'lucide-react';
import { awradApi } from '../../api/awradApi';
import { useNotification } from '../../context/NotificationContext';
import { getLocalDateString } from '../../utils/dateUtils';

export const QuickAwradSection = ({ awradList, onAwradUpdated, onUpdateAwrad }) => {
  const { showToast, playChime, triggerHaptic } = useNotification();

  const handleIncrement = async (id, name, currentCount, targetCount) => {
    try {
      triggerHaptic(20);
      playChime('tap');
      if (onUpdateAwrad) {
        await onUpdateAwrad(id, 1, currentCount, targetCount);
      } else {
        await awradApi.increment(id, { delta: 1, date: getLocalDateString() });
        if (onAwradUpdated) onAwradUpdated();
      }
      if (currentCount + 1 === targetCount) {
        showToast('Target Reached', `Alhamdulillah! Completed ${targetCount}x ${name}`, 'success');
      }
    } catch (e) {
      console.error('Failed to increment awrad:', e);
    }
  };

  const handleDecrement = async (id, currentCount, targetCount) => {
    try {
      if (onUpdateAwrad) {
        await onUpdateAwrad(id, -1, currentCount, targetCount);
      } else {
        await awradApi.increment(id, { delta: -1, date: getLocalDateString() });
        if (onAwradUpdated) onAwradUpdated();
      }
    } catch (e) {
      console.error('Failed to decrement awrad:', e);
    }
  };

  const handleReset = async (id, name) => {
    try {
      await awradApi.reset(id, { date: getLocalDateString() });
      if (onAwradUpdated) onAwradUpdated();
      showToast('Counter Reset', `Reset counter for ${name}`, 'neutral');
    } catch (e) {
      console.error('Failed to reset awrad:', e);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#088ac1] dark:text-[#3dc3f3]" />
            Daily Awrad & Digital Dhikr
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Digital tasbih counter with count persistence and targets
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {awradList.slice(0, 6).map((item) => {
          const isDone = item.is_completed;
          const pct = item.progress_percentage || 0;

          return (
            <div
              key={item.id}
              className={`rounded-2xl p-4 transition-all duration-200 border flex flex-col justify-between ${
                isDone
                  ? 'bg-[#e1f3fd]/70 dark:bg-[#0f4d6b]/30 border-[#bce8fb] dark:border-[#0b5d81]'
                  : 'glass-card border-islamic-border-light dark:border-islamic-border-dark hover:border-[#81d7f8] dark:hover:border-[#0b5d81]'
              }`}
            >
              {/* Card Header: Arabic + Name */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {item.name}
                  </span>
                  {isDone && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#076e9d] dark:text-[#81d7f8] px-2 py-0.5 rounded-full bg-[#bce8fb]/60 dark:bg-[#0f4d6b]/50 border border-[#81d7f8]/30">
                      <Check className="w-3 h-3 stroke-[3]" /> Completed
                    </span>
                  )}
                </div>

                {item.arabic_text && (
                  <p className="font-arabic text-lg text-[#088ac1] dark:text-[#3dc3f3] font-bold my-1 text-right">
                    {item.arabic_text}
                  </p>
                )}

                {item.transliteration && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic truncate mb-2">
                    {item.transliteration}
                  </p>
                )}
              </div>

              {/* Progress & Counter Controls */}
              <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {item.today_count}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      / {item.target_count}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#088ac1] dark:text-[#3dc3f3]">
                    {pct}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-[#088ac1] dark:bg-[#1eb4eb] transition-all duration-300 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDecrement(item.id)}
                      disabled={item.today_count <= 0}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
                      title="Minus 1"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReset(item.id, item.name)}
                      disabled={item.today_count <= 0}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
                      title="Reset Counter"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleIncrement(item.id, item.name, item.today_count, item.target_count)}
                    className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-[#088ac1] to-[#076e9d] hover:from-[#3dc3f3] hover:to-[#088ac1] active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-[#088ac1]/25 transition-all duration-150 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Tap +1</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
