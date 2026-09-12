import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Bookmark,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Flame,
  Target,
  Plus,
} from 'lucide-react';
import { QURAN_SURAHS, JUZ_PRESETS } from '../../data/quranData';
import { habitApi } from '../../api/habitApi';
import { useNotification } from '../../context/NotificationContext';
import { getLocalDateString } from '../../utils/dateUtils';

export const QuranSection = ({
  quranHabit,
  onQuranUpdated,
  onOpenLogModal,
}) => {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const [quickLogging, setQuickLogging] = useState(false);

  // Extract Quran bookmark and today completion
  const isDoneToday = Boolean(quranHabit?.today_completion);
  const completion = quranHabit?.today_completion;

  const currentSurahName = completion?.surah_name || quranHabit?.last_surah_name || 'Al-Baqarah';
  const currentSurahObj = QURAN_SURAHS.find((s) => s.name === currentSurahName) || QURAN_SURAHS[1];
  const currentAyah = completion?.last_ayah_number || completion?.ayah_end || quranHabit?.last_ayah_number || 1;
  const targetGoal = quranHabit?.target_juz_goal || 1.0;
  
  const todayJuzRead = completion?.juz_count !== undefined && completion?.juz_count !== null
    ? completion.juz_count
    : completion?.pages_read
    ? Number((completion.pages_read / 20.0).toFixed(2))
    : isDoneToday
    ? 1.0
    : 0.0;

  const progressPercent = Math.min(100, Math.round((todayJuzRead / (targetGoal || 1.0)) * 100));

  // Quick 1-tap preset log handler
  const handleQuickLog = async (presetValue) => {
    if (!quranHabit) return;
    setQuickLogging(true);
    try {
      await habitApi.logDetails(quranHabit.id, {
        date: getLocalDateString(),
        surah_name: currentSurahObj.name,
        last_surah_name: currentSurahObj.name,
        last_surah_number: currentSurahObj.number,
        last_ayah_number: currentAyah,
        ayah_end: currentAyah,
        juz_count: presetValue,
        target_juz_goal: targetGoal,
        pages_read: Math.round(presetValue * 20),
        duration_minutes: 20,
      });

      showToast(
        'Qur’an Logged',
        `MashaAllah! Recorded ${presetValue} Juz recitation for today.`
      );
      if (onQuranUpdated) onQuranUpdated();
    } catch (e) {
      console.error('Failed to quick log quran:', e);
      showToast('Error', 'Failed to log recitation.', 'error');
    } finally {
      setQuickLogging(false);
    }
  };

  return (
    <div className="mb-6 sm:mb-8 rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-white via-[#f0faff] to-[#e1f3fd] dark:from-[#06121a] dark:via-[#092230] dark:to-[#0a3147] border border-[#bce8fb] dark:border-[#0b5d81]/80 shadow-soft relative overflow-hidden">
      {/* Decorative Arabic Calligraphy Watermark */}
      <div className="absolute top-2 right-4 text-6xl sm:text-8xl font-arabic font-bold text-[#088ac1]/[0.05] dark:text-[#3dc3f3]/[0.07] select-none pointer-events-none">
        القرآن
      </div>

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 mb-4 sm:mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#088ac1] to-[#076e9d] text-white flex items-center justify-center shadow-md shadow-[#088ac1]/30">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#076e9d] dark:text-[#81d7f8]">
                Divine Revelation
              </span>
              <span className="font-arabic text-xs font-bold text-[#088ac1] dark:text-[#3dc3f3]">
                القرآن الكريم
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              Daily Noble Qur’an & Tilawah
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {quranHabit?.current_streak > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              {quranHabit.current_streak}d Streak
            </span>
          )}

          <button
            type="button"
            onClick={() => navigate('/quran')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 hover:bg-[#e1f3fd] dark:hover:bg-[#0f4d6b] text-xs font-bold text-[#088ac1] dark:text-[#3dc3f3] border border-[#bce8fb] dark:border-[#0b5d81] transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <span>Qur'an Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Bookmark Card & Daily Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 relative z-10">
        {/* Left Card (7 Cols): Active Bookmark & Position */}
        <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-[#071926]/90 border border-[#bce8fb]/80 dark:border-[#0b5d81]/60 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#076e9d] dark:text-[#81d7f8]">
                <Bookmark className="w-4 h-4 text-[#088ac1] dark:text-[#3dc3f3]" />
                <span>Last Recited Bookmark</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#e1f3fd] dark:bg-[#0f4d6b]/50 text-[#088ac1] dark:text-[#81d7f8]">
                Surah #{currentSurahObj.number}
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-2 mt-1">
              <div>
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Surah {currentSurahObj.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentSurahObj.englishName} • {currentSurahObj.type} ({currentSurahObj.ayahCount} Ayahs)
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl sm:text-2xl font-arabic font-bold text-[#088ac1] dark:text-[#3dc3f3]">
                  {currentSurahObj.arabicName}
                </span>
              </div>
            </div>

            {/* Ayah Badge */}
            <div className="mt-3 p-2.5 rounded-xl bg-[#f0faff] dark:bg-[#0a2333]/80 border border-[#bce8fb]/60 dark:border-[#0b5d81]/40 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Marked at Verse:
              </span>
              <span className="font-extrabold text-[#088ac1] dark:text-[#3dc3f3] text-sm">
                Ayah {currentAyah} <span className="text-xs text-slate-400 font-normal">/ {currentSurahObj.ayahCount}</span>
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Page ~{currentSurahObj.page || 1}
            </span>

            <button
              type="button"
              onClick={() => onOpenLogModal && onOpenLogModal(quranHabit)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#088ac1] to-[#076e9d] hover:from-[#1eb4eb] hover:to-[#088ac1] text-white text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Log Recitation & Remark</span>
            </button>
          </div>
        </div>

        {/* Right Card (5 Cols): Daily Juz Goal & Quick 1-Tap Fractions */}
        <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-[#071926]/90 border border-[#bce8fb]/80 dark:border-[#0b5d81]/60 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#076e9d] dark:text-[#81d7f8]">
                <Target className="w-4 h-4 text-[#088ac1] dark:text-[#3dc3f3]" />
                <span>Today's Tilawah Progress</span>
              </div>
              {isDoneToday ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#076e9d] dark:text-[#3dc3f3] px-2 py-0.5 rounded-md bg-[#e1f3fd] dark:bg-[#0f4d6b]/50">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Done
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  Pending
                </span>
              )}
            </div>

            {/* Juz metrics number */}
            <div className="flex items-baseline justify-between mt-1 mb-1.5">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {todayJuzRead} <span className="text-xs text-slate-400 font-medium">/ {targetGoal} Juz</span>
              </span>
              <span className="text-xs font-extrabold text-[#088ac1] dark:text-[#3dc3f3]">
                {progressPercent}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-[#088ac1] to-[#3dc3f3] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Quick 1-Tap Log Buttons */}
            <div className="space-y-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                1-Tap Quick Log:
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {JUZ_PRESETS.map((preset) => {
                  const isCurrentLogged = Math.abs(todayJuzRead - preset.value) < 0.01;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      disabled={quickLogging}
                      onClick={() => handleQuickLog(preset.value)}
                      className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer border ${
                        isCurrentLogged
                          ? 'bg-[#088ac1] text-white border-[#088ac1] shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-[#e1f3fd] dark:hover:bg-[#0f4d6b]/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                      title={preset.desc}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 text-center border-t border-slate-200/80 dark:border-slate-800/80">
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              ~20 pages standard Mus'haf = 1 Full Juz
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
