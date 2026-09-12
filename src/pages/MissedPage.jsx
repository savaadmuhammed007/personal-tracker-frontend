import React, { useState, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  Sparkles,
  Calendar,
  CheckCircle2,
  Sun,
  BookOpen,
  Repeat,
  Heart,
} from 'lucide-react';
import { analyticsApi } from '../api/analyticsApi';
import { prayerApi } from '../api/prayerApi';
import { habitApi } from '../api/habitApi';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/common/UIComponents';

export const MissedPage = () => {
  const [missedData, setMissedData] = useState(null);
  const [days, setDays] = useState(7);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotification();

  const fetchMissed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await analyticsApi.getMissed({ days, category });
      setMissedData(res.data);
    } catch (e) {
      console.error('Failed to load missed activities:', e);
    } finally {
      setLoading(false);
    }
  }, [days, category]);

  useEffect(() => {
    fetchMissed();
  }, [fetchMissed]);

  const handleMakeUpPrayer = async (prayerName, date) => {
    try {
      await prayerApi.togglePrayer({
        prayer_name: prayerName,
        date: date,
        status: 'completed',
        notes: 'Made up (Qada/Late)',
      });
      showToast('Prayer Logged', `✓ ${prayerName} for ${date} marked completed.`);
      fetchMissed();
    } catch (e) {
      console.error('Failed to make up prayer:', e);
    }
  };

  const handleMakeUpHabit = async (habitId, date, name) => {
    try {
      await habitApi.toggleHabit(habitId, { date: date });
      showToast('Habit Logged', `✓ ${name} for ${date} marked completed.`);
      fetchMissed();
    } catch (e) {
      console.error('Failed to make up habit:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <RotateCcw className="w-6 h-6 text-islamic-primary-600" />
          Reflect & Realign (Missed Activities)
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          A gentle, encouraging space to review missed opportunities and make them up with intention
        </p>
      </div>

      {/* Encouragement Banner (Principle #26) */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#0f4d6b]/50 via-[#0a3147]/40 to-slate-900/40 border border-[#088ac1]/40 text-slate-200 flex items-start gap-4 shadow-soft">
        <div className="w-10 h-10 rounded-2xl bg-[#1eb4eb]/20 text-[#3dc3f3] flex items-center justify-center shrink-0">
          <Heart className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-white flex items-center gap-2">
            Every Day is a Fresh Opportunity for Goodness
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            "The most beloved deeds to Allah are those that are consistent, even if small."
            Missing a deed is a reminder to realign your heart with sincerity. Never lose hope.
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Activities' },
            { id: 'prayers', label: 'Prayers Only' },
            { id: 'quran', label: 'Qur’an Only' },
            { id: 'habits', label: 'Habits' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                category === tab.id
                  ? 'bg-islamic-primary-700 text-white'
                  : 'bg-white dark:bg-islamic-card-dark text-slate-600 dark:text-slate-300 border border-islamic-border-light dark:border-islamic-border-dark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>Lookback:</span>
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                days === d
                  ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-bold'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Missed Groups List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Reviewing records...</div>
      ) : !missedData || !Array.isArray(missedData.days_grouped) || missedData.days_grouped.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-400 bg-[#e1f3fd]/50 dark:bg-[#0f4d6b]/20 rounded-3xl border border-[#bce8fb] dark:border-[#0b5d81]/50 p-8">
          <div className="w-12 h-12 rounded-full bg-[#bce8fb]/60 dark:bg-[#0f4d6b]/60 text-[#076e9d] dark:text-[#3dc3f3] flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="font-bold text-slate-900 dark:text-white text-base">Alhamdulillah! Nothing missed.</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            You were consistent with all tracked activities over the past {days} days.
          </p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {(missedData.days_grouped || []).map((group) => (
            <div
              key={group.date}
              className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-soft space-y-3"
            >
              <div className="flex items-center justify-between pb-3 border-b border-islamic-border-light/60 dark:border-islamic-border-dark/60">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-islamic-primary-600" />
                  {group.date_formatted}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {group.items.length} uncompleted
                </span>
              </div>

              <div className="space-y-2">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 sm:p-3.5 rounded-2xl bg-islamic-subtle-light/50 dark:bg-islamic-subtle-dark/50 border border-islamic-border-light/60 dark:border-islamic-border-dark/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.category} • {item.scheduled_time ? `Scheduled: ${item.scheduled_time}` : 'Daily Routine'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {item.type === 'prayer' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMakeUpPrayer(item.prayer_name, group.date)}
                          className="w-full sm:w-auto text-xs"
                        >
                          Make Up / Mark Done
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMakeUpHabit(item.habit_id, group.date, item.title)}
                          className="w-full sm:w-auto text-xs"
                        >
                          Log Completion
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
