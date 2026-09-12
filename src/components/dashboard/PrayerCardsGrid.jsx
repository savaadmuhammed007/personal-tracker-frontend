import React from 'react';
import { Check, Flame, Clock, MoreVertical, XCircle, CheckCircle } from 'lucide-react';
import { usePrayers } from '../../context/PrayerContext';
import { useNotification } from '../../context/NotificationContext';

export const PrayerCardsGrid = () => {
  const { prayers, togglePrayer, timetable } = usePrayers();
  const { showToast } = useNotification();

  const handleToggle = async (prayerName, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await togglePrayer(prayerName, newStatus);
    if (newStatus === 'completed') {
      showToast('Salah Completed', `Alhamdulillah, ${prayerName} marked as completed.`);
    }
  };

  const handleSetMissed = async (prayerName, e) => {
    e.stopPropagation();
    await togglePrayer(prayerName, 'missed');
    showToast('Salah Updated', `${prayerName} marked as missed. Make it up when possible.`, 'neutral');
  };

  const prayerIcons = {
    FAJR: '🌅',
    DHUHR: '☀️',
    ASR: '🌤️',
    MAGHRIB: '🌇',
    ISHA: '🌙',
  };

  const safePrayers = Array.isArray(prayers) ? prayers : [];

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Daily 5 Prayers (Salah)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track timely completion with exact timestamps & consistency streaks
          </p>
        </div>
        {timetable?.Sunrise && (
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
            <span>Sunrise: {timetable.Sunrise}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        {safePrayers.map((prayer) => {
          const isCompleted = prayer.status === 'completed';
          const isMissed = prayer.status === 'missed';
          const emoji = prayerIcons[prayer.prayer_name] || '🕌';

          // Format completed time
          let completionTimeDisplay = null;
          if (prayer.completed_at) {
            try {
              const dt = new Date(prayer.completed_at);
              completionTimeDisplay = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } catch (e) {
              completionTimeDisplay = null;
            }
          }

          return (
            <div
              key={prayer.prayer_name}
              onClick={() => handleToggle(prayer.prayer_name, prayer.status)}
              className={`group cursor-pointer relative rounded-2xl p-3.5 sm:p-4 transition-all duration-200 border text-left flex flex-col justify-between select-none active:scale-[0.99] ${
                isCompleted
                  ? 'bg-[#e1f3fd]/80 dark:bg-[#0f4d6b]/30 border-[#bce8fb] dark:border-[#0b5d81] shadow-soft'
                  : isMissed
                  ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                  : 'glass-card glass-card-hover border-islamic-border-light dark:border-islamic-border-dark'
              }`}
            >
              {/* Header: Name + Emoji + Streak */}
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl">{emoji}</span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {prayer.display_name}
                    </h4>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {prayer.scheduled_time || '—'}
                    </p>
                  </div>
                </div>

                {prayer.streak > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-bold text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900">
                    <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {prayer.streak}d
                  </span>
                )}
              </div>

              {/* Status / Completion Time Box */}
              <div className="mt-2 pt-2.5 sm:pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                <div>
                  {isCompleted ? (
                    <span className="text-xs font-semibold text-[#076e9d] dark:text-[#3dc3f3] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      {completionTimeDisplay ? `at ${completionTimeDisplay}` : 'Completed'}
                    </span>
                  ) : isMissed ? (
                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                      Missed
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                      Tap to complete
                    </span>
                  )}
                </div>

                {/* Quick Action Checkmark / Missed Toggle */}
                <div className="flex items-center gap-1">
                  {!isCompleted && !isMissed && (
                    <button
                      onClick={(e) => handleSetMissed(prayer.prayer_name, e)}
                      title="Mark as Missed"
                      className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 text-[10px] text-slate-400 hover:text-rose-500 px-1.5 py-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-opacity"
                    >
                      Missed
                    </button>
                  )}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-[#088ac1] text-white shadow-xs'
                        : isMissed
                        ? 'bg-rose-200 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                        : 'border-2 border-slate-300 dark:border-slate-600 group-hover:border-[#1eb4eb]'
                    }`}
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    {isMissed && <XCircle className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
