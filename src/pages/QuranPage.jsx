import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BookOpen,
  Bookmark,
  Sparkles,
  Flame,
  Target,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Compass,
  Layers,
  ChevronRight,
  TrendingUp,
  Award,
  RefreshCw,
} from 'lucide-react';
import { QURAN_SURAHS, JUZ_PRESETS, QURAN_STATS } from '../data/quranData';
import { habitApi } from '../api/habitApi';
import { QuranLogModal } from '../components/modals/QuranLogModal';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/common/UIComponents';
import { getLocalDateString } from '../utils/dateUtils';

export const QuranPage = () => {
  const { showToast } = useNotification();
  const [quranHabit, setQuranHabit] = useState(null);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Surah list filter & search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'Makki' | 'Madani'

  // Fetch Quran habit data & recitation history
  const fetchQuranData = useCallback(async () => {
    setLoading(true);
    try {
      const localDate = getLocalDateString();
      const res = await habitApi.getHabits({ category: 'quran', date: localDate });
      const habitsList = Array.isArray(res?.data) ? res.data : res?.data?.results || [];
      let habit = habitsList.find((h) => h.category === 'quran') || habitsList[0];

      if (!habit) {
        // If no quran habit exists yet, create one
        try {
          const createRes = await habitApi.createHabit({
            name: "Noble Qur'an Tilawah",
            category: 'quran',
            frequency: 'daily',
            target_juz_goal: 1.0,
            target_duration_minutes: 20,
            color: '#1eb4eb',
            icon: 'BookOpen',
          });
          habit = createRes.data;
        } catch (err) {
          console.error('Failed to create default quran habit:', err);
        }
      }

      setQuranHabit(habit);

      if (habit) {
        const historyRes = await habitApi.getCompletions({ habit_id: habit.id });
        setCompletions(Array.isArray(historyRes?.data) ? historyRes.data : historyRes?.data?.results || []);
      }
    } catch (e) {
      console.error('Failed to load quran data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuranData();
  }, [fetchQuranData]);

  // Current bookmark info
  const completion = quranHabit?.today_completion;
  const isDoneToday = Boolean(completion);
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

  // Quick 1-tap fraction logging
  const handleQuickLogFraction = async (presetValue) => {
    if (!quranHabit) return;
    try {
      await habitApi.logDetails(quranHabit.id, {
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
      fetchQuranData();
    } catch (e) {
      console.error('Failed to log quick fraction:', e);
      showToast('Error', 'Failed to save recitation log.', 'error');
    }
  };

  // Quick Bookmark Setter from Surah list
  const handleSetBookmark = async (surah, ayah = 1) => {
    if (!quranHabit) return;
    try {
      await habitApi.logDetails(quranHabit.id, {
        surah_name: surah.name,
        last_surah_name: surah.name,
        last_surah_number: surah.number,
        last_ayah_number: ayah,
        ayah_end: ayah,
        target_juz_goal: targetGoal,
        juz_count: todayJuzRead > 0 ? todayJuzRead : 0.25,
      });

      showToast(
        'Bookmark Updated',
        `Remarked bookmark at Surah ${surah.name}, Ayah ${ayah}`
      );
      fetchQuranData();
    } catch (e) {
      console.error('Failed to set bookmark:', e);
    }
  };

  // Filter 114 Surahs
  const filteredSurahs = useMemo(() => {
    return QURAN_SURAHS.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.arabicName.includes(searchQuery) ||
        String(s.number).includes(searchQuery);

      const matchesType = typeFilter === 'all' || s.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [searchQuery, typeFilter]);

  // Overall statistics from history
  const totalJuzHistory = completions.reduce((acc, curr) => acc + (curr.juz_count || (curr.pages_read ? curr.pages_read / 20 : 1.0)), 0);
  const totalPagesHistory = completions.reduce((acc, curr) => acc + (curr.pages_read || Math.round((curr.juz_count || 1.0) * 20)), 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* 1. Quran Hero Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#076e9d] via-[#0b5d81] to-[#0a3147] border border-[#3dc3f3]/30 text-white shadow-2xl relative overflow-hidden">
        {/* Background Islamic Watermark */}
        <div className="absolute top-1 right-6 text-7xl sm:text-9xl font-arabic font-bold text-white/[0.06] select-none pointer-events-none">
          القرآن
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0a3147]/70 border border-[#3dc3f3]/40 text-xs font-bold text-[#bce8fb]">
              <span className="font-arabic text-sm">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
            </div>

            {quranHabit?.current_streak > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-xs font-bold text-amber-300">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{quranHabit.current_streak} Days Tilawah Streak</span>
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Noble Qur’an & Daily Tilawah Hub
            </h1>
            <p className="text-xs sm:text-sm text-[#bce8fb] max-w-2xl mt-1.5 leading-relaxed">
              Maintain an unbroken connection with the Book of Allah. Track your daily Juz recitation, set Khatm goals, and keep accurate ayah bookmarks.
            </p>
          </div>

          {/* Quick Stat Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="p-3 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/10">
              <span className="text-[10px] font-bold text-[#81d7f8] uppercase tracking-wider block">Daily Goal</span>
              <span className="text-lg sm:text-xl font-extrabold font-mono text-white">{targetGoal} Juz</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/10">
              <span className="text-[10px] font-bold text-[#81d7f8] uppercase tracking-wider block">Today's Progress</span>
              <span className="text-lg sm:text-xl font-extrabold font-mono text-white">{todayJuzRead} Juz</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/10">
              <span className="text-[10px] font-bold text-[#81d7f8] uppercase tracking-wider block">Total Logged</span>
              <span className="text-lg sm:text-xl font-extrabold font-mono text-white">{totalJuzHistory.toFixed(1)} Juz</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/10">
              <span className="text-[10px] font-bold text-[#81d7f8] uppercase tracking-wider block">Completed Days</span>
              <span className="text-lg sm:text-xl font-extrabold font-mono text-white">{completions.length} Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Command Center: Active Bookmark Card & Today's Juz Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Active Bookmark Position (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl p-5 sm:p-6 bg-white dark:bg-islamic-card-dark border border-islamic-border-light dark:border-islamic-border-dark shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#e1f3fd] dark:bg-[#0f4d6b]/50 flex items-center justify-center text-[#088ac1] dark:text-[#3dc3f3]">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Current Bookmark
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Your last recorded recitation point
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#e1f3fd] dark:bg-[#0f4d6b]/60 text-[#076e9d] dark:text-[#81d7f8]">
                Surah {currentSurahObj.number} of 114
              </span>
            </div>

            {/* Surah Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#f0faff] to-[#e1f3fd] dark:from-[#0a2333] dark:to-[#091b26] border border-[#bce8fb] dark:border-[#0b5d81]/60 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#088ac1] dark:text-[#3dc3f3]">
                  {currentSurahObj.type} • {currentSurahObj.ayahCount} Ayahs • Page ~{currentSurahObj.page || 1}
                </span>
                <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  Surah {currentSurahObj.name}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {currentSurahObj.englishName}
                </p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-arabic font-bold text-[#088ac1] dark:text-[#3dc3f3] block">
                  {currentSurahObj.arabicName}
                </span>
              </div>
            </div>

            {/* Ayah & Progress Bar within this Surah */}
            <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Current Position:
                </span>
                <span className="font-extrabold text-[#088ac1] dark:text-[#3dc3f3] text-sm">
                  Ayah {currentAyah} <span className="text-xs text-slate-400 font-normal">/ {currentSurahObj.ayahCount}</span>
                </span>
              </div>

              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#088ac1] to-[#3dc3f3] rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.round((currentAyah / currentSurahObj.ayahCount) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSetBookmark(currentSurahObj, Math.min(currentSurahObj.ayahCount, currentAyah + 1))}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Advance 1 Ayah"
              >
                +1 Ayah
              </button>
              <button
                type="button"
                onClick={() => handleSetBookmark(currentSurahObj, Math.min(currentSurahObj.ayahCount, currentAyah + 5))}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Advance 5 Ayahs"
              >
                +5 Ayahs
              </button>
            </div>

            <Button
              variant="primary"
              icon={Sparkles}
              onClick={() => setIsLogModalOpen(true)}
              className="text-xs"
            >
              Open Recitation Log & Remark
            </Button>
          </div>
        </div>

        {/* Daily Tilawah Goal & Quick Fractions (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl p-5 sm:p-6 bg-white dark:bg-islamic-card-dark border border-islamic-border-light dark:border-islamic-border-dark shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#e1f3fd] dark:bg-[#0f4d6b]/50 flex items-center justify-center text-[#088ac1] dark:text-[#3dc3f3]">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Today's Tilawah Goal
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Daily Juz recitation progression
                  </p>
                </div>
              </div>

              {isDoneToday ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#076e9d] dark:text-[#3dc3f3] px-2 py-0.5 rounded-md bg-[#e1f3fd] dark:bg-[#0f4d6b]/60">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                </span>
              ) : (
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  Pending
                </span>
              )}
            </div>

            {/* Target Display */}
            <div className="p-4 rounded-2xl bg-[#f0faff] dark:bg-[#0a2333]/80 border border-[#bce8fb] dark:border-[#0b5d81]/60">
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                    {todayJuzRead}
                  </span>
                  <span className="text-xs text-slate-400 font-medium ml-1">/ {targetGoal} Juz</span>
                </div>
                <span className="text-sm font-extrabold text-[#088ac1] dark:text-[#3dc3f3]">
                  {progressPercent}%
                </span>
              </div>

              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-[#088ac1] to-[#3dc3f3] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <p className="text-[11px] text-[#076e9d] dark:text-[#81d7f8]">
                {targetGoal === 1.0
                  ? '🎯 At 1 Juz/day: Complete 1 Khatm every month (30 days)'
                  : targetGoal === 0.5
                  ? '🎯 At ½ Juz/day: Complete 1 Khatm every 60 days'
                  : `🎯 At ${targetGoal} Juz/day: Khatm estimated in ${Math.round(30 / (targetGoal || 1))} days`}
              </p>
            </div>

            {/* Quick 1-Tap Fractions */}
            <div className="mt-4 space-y-2">
              <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Log Quick Recitation Fraction:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {JUZ_PRESETS.map((preset) => {
                  const isCurrent = Math.abs(todayJuzRead - preset.value) < 0.01;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleQuickLogFraction(preset.value)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                        isCurrent
                          ? 'bg-[#088ac1] text-white border-[#088ac1] shadow-md shadow-[#088ac1]/30 ring-2 ring-[#3dc3f3]'
                          : 'bg-white dark:bg-slate-800 hover:bg-[#e1f3fd] dark:hover:bg-[#0f4d6b]/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                      title={preset.desc}
                    >
                      <span>{preset.label}</span>
                      <span className="block text-[9px] opacity-75 font-normal">{preset.value} Juz</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Standard Mus'haf: ~20 pages / Juz • Total 30 Juz
            </p>
          </div>
        </div>
      </div>

      {/* 3. 114 Surahs Directory & Explorer */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-islamic-card-dark border border-islamic-border-light dark:border-islamic-border-dark shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#088ac1] dark:text-[#3dc3f3]" />
              114 Surahs Directory & Explorer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Browse Surahs, search by name or verse count, and set active bookmarks
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Surah..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1eb4eb] w-40 sm:w-52"
              />
            </div>

            <div className="inline-flex p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {['all', 'Makki', 'Madani'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    typeFilter === t
                      ? 'bg-white dark:bg-slate-900 text-[#088ac1] dark:text-[#3dc3f3] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t === 'all' ? 'All (114)' : t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Surahs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[480px] overflow-y-auto pr-1">
          {filteredSurahs.map((surah) => {
            const isCurrentBookmark = currentSurahObj.number === surah.number;
            return (
              <div
                key={surah.number}
                className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isCurrentBookmark
                    ? 'bg-[#f0faff] dark:bg-[#0f4d6b]/35 border-[#3dc3f3] shadow-md shadow-[#088ac1]/15 ring-2 ring-[#3dc3f3]/50'
                    : 'bg-slate-50/70 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800/80 border-slate-200/80 dark:border-slate-800 hover:border-[#bce8fb]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-lg bg-[#e1f3fd] dark:bg-[#0f4d6b]/60 text-[#076e9d] dark:text-[#81d7f8] font-bold text-xs flex items-center justify-center">
                      {surah.number}
                    </span>
                    <span className="font-arabic font-bold text-base text-[#088ac1] dark:text-[#3dc3f3]">
                      {surah.arabicName}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {surah.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {surah.englishName}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400">
                    {surah.type} • {surah.ayahCount} ayahs
                  </span>

                  <button
                    type="button"
                    onClick={() => handleSetBookmark(surah, 1)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      isCurrentBookmark
                        ? 'bg-[#088ac1] text-white'
                        : 'text-[#088ac1] dark:text-[#3dc3f3] hover:bg-[#e1f3fd] dark:hover:bg-[#0f4d6b]/50'
                    }`}
                  >
                    {isCurrentBookmark ? 'Bookmarked' : 'Bookmark'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Tilawah History & Reflection Log */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-islamic-card-dark border border-islamic-border-light dark:border-islamic-border-dark shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#088ac1] dark:text-[#3dc3f3]" />
              Recent Recitation Entries & Reflections
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Timestamped logs and Tadabbur notes from your Qur'an sessions
            </p>
          </div>

          <span className="text-xs font-bold text-slate-400">
            {completions.length} Sessions Logged
          </span>
        </div>

        {completions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            No recitation entries recorded yet. Begin your first session with Bismillah!
          </div>
        ) : (
          <div className="space-y-2.5">
            {completions.slice(0, 8).map((comp) => {
              const dt = comp.completed_at ? new Date(comp.completed_at) : new Date(comp.date);
              const formattedDate = dt.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
              const formattedTime = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={comp.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#e1f3fd] dark:bg-[#0f4d6b]/50 text-[#088ac1] dark:text-[#3dc3f3] flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Surah {comp.surah_name || 'Al-Baqarah'}{' '}
                        <span className="text-xs font-normal text-slate-400">
                          (Ayah {comp.last_ayah_number || comp.ayah_end || 1})
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {comp.juz_count || (comp.pages_read ? Number((comp.pages_read / 20).toFixed(2)) : 1.0)} Juz •{' '}
                        {comp.pages_read || Math.round((comp.juz_count || 1) * 20)} pages • {comp.duration_minutes || 20}m duration
                      </p>
                      {comp.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-1">
                          "{comp.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      {formattedDate}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formattedTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recitation Modal */}
      {isLogModalOpen && quranHabit && (
        <QuranLogModal
          isOpen={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
          habit={quranHabit}
          onSaved={fetchQuranData}
        />
      )}
    </div>
  );
};

export default QuranPage;
