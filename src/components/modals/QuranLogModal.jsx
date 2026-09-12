import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../common/UIComponents';
import { habitApi } from '../../api/habitApi';
import { useNotification } from '../../context/NotificationContext';
import { BookOpen, Sparkles, Bookmark, CheckCircle2, ChevronRight, Target } from 'lucide-react';
import { QURAN_SURAHS, JUZ_PRESETS } from '../../data/quranData';
import { getLocalDateString } from '../../utils/dateUtils';

export const QuranLogModal = ({ isOpen, onClose, habit, onSaved }) => {
  const { showToast } = useNotification();

  // Initial values from habit or current completion
  const initialSurah = habit?.today_completion?.surah_name || habit?.last_surah_name || 'Al-Baqarah';
  const initialSurahObj = QURAN_SURAHS.find((s) => s.name === initialSurah) || QURAN_SURAHS[1];
  const initialAyah = habit?.today_completion?.last_ayah_number || habit?.today_completion?.ayah_end || habit?.last_ayah_number || 1;
  const initialJuzGoal = habit?.target_juz_goal || 1.0;
  const initialJuzCount = habit?.today_completion?.juz_count || 1.0;

  const [selectedSurahNumber, setSelectedSurahNumber] = useState(initialSurahObj.number);
  const [selectedAyahNumber, setSelectedAyahNumber] = useState(initialAyah);
  const [juzCount, setJuzCount] = useState(initialJuzCount);
  const [dailyJuzGoal, setDailyJuzGoal] = useState(initialJuzGoal);
  const [pagesRead, setPagesRead] = useState(habit?.today_completion?.pages_read || Math.round(initialJuzCount * 20));
  const [duration, setDuration] = useState(habit?.today_completion?.duration_minutes || 20);
  const [notes, setNotes] = useState(habit?.today_completion?.notes || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const currentSurah = habit?.today_completion?.surah_name || habit?.last_surah_name || 'Al-Baqarah';
      const surahObj = QURAN_SURAHS.find((s) => s.name === currentSurah) || QURAN_SURAHS[1];
      setSelectedSurahNumber(surahObj.number);
      setSelectedAyahNumber(habit?.today_completion?.last_ayah_number || habit?.today_completion?.ayah_end || habit?.last_ayah_number || 1);
      setDailyJuzGoal(habit?.target_juz_goal || 1.0);
      const jCount = habit?.today_completion?.juz_count !== undefined && habit?.today_completion?.juz_count !== null
        ? habit.today_completion.juz_count
        : 1.0;
      setJuzCount(jCount);
      setPagesRead(habit?.today_completion?.pages_read || Math.round((jCount || 1.0) * 20));
      setDuration(habit?.today_completion?.duration_minutes || 20);
      setNotes(habit?.today_completion?.notes || '');
    }
  }, [isOpen, habit]);

  const activeSurah = QURAN_SURAHS.find((s) => s.number === Number(selectedSurahNumber)) || QURAN_SURAHS[0];

  // Adjust ayah number if surah changes and ayah exceeds new surah count
  const handleSurahChange = (e) => {
    const newNum = Number(e.target.value);
    setSelectedSurahNumber(newNum);
    const newSurah = QURAN_SURAHS.find((s) => s.number === newNum);
    if (newSurah && selectedAyahNumber > newSurah.ayahCount) {
      setSelectedAyahNumber(newSurah.ayahCount);
    }
  };

  const handleJuzPresetSelect = (presetVal) => {
    setJuzCount(presetVal);
    setPagesRead(Math.round(presetVal * 20));
  };

  const handlePagesChange = (pages) => {
    const p = Math.max(0, parseInt(pages) || 0);
    setPagesRead(p);
    setJuzCount(Number((p / 20.0).toFixed(2)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!habit) return;
    setSubmitting(true);

    try {
      await habitApi.logDetails(habit.id, {
        date: getLocalDateString(),
        surah_name: activeSurah.name,
        last_surah_name: activeSurah.name,
        last_surah_number: activeSurah.number,
        last_ayah_number: Number(selectedAyahNumber) || 1,
        ayah_end: Number(selectedAyahNumber) || 1,
        juz_count: parseFloat(juzCount) || 1.0,
        target_juz_goal: parseFloat(dailyJuzGoal) || 1.0,
        pages_read: parseInt(pagesRead) || Math.round((parseFloat(juzCount) || 1.0) * 20),
        duration_minutes: parseInt(duration) || 20,
        notes,
      });

      showToast(
        'Qur’an Logged & Bookmarked',
        `MashaAllah! Recorded ${juzCount} Juz • Remarked Surah ${activeSurah.name}, Ayah ${selectedAyahNumber}`
      );
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to log quran details:', err);
      showToast('Error', 'Failed to save Qur\'an log.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Qur’an Recitation & Bookmark">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Daily Juz Goal Header & Quick Fraction Selection */}
        <div className="p-3.5 rounded-2xl bg-[#f0faff] dark:bg-[#0f4d6b]/20 border border-[#bce8fb] dark:border-[#0b5d81]/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#076e9d] dark:text-[#81d7f8]">
              <Target className="w-4 h-4 text-[#088ac1] dark:text-[#3dc3f3]" />
              <span>Daily Juz Goal</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={dailyJuzGoal}
                onChange={(e) => setDailyJuzGoal(parseFloat(e.target.value))}
                className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-[#0b1822] border border-[#bce8fb] dark:border-[#0b5d81] text-[#076e9d] dark:text-[#3dc3f3]"
              >
                <option value={0.25}>0.25 Juz / day (¼ Juz)</option>
                <option value={0.5}>0.50 Juz / day (½ Juz)</option>
                <option value={0.75}>0.75 Juz / day (¾ Juz)</option>
                <option value={1.0}>1.00 Juz / day (1 Khatm/month)</option>
                <option value={2.0}>2.00 Juz / day (2 Khatm/month)</option>
                <option value={3.0}>3.00 Juz / day</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Juz Read Today (Select or Tap Fraction)
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {JUZ_PRESETS.map((preset) => {
                const isSelected = Math.abs(juzCount - preset.value) < 0.01;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleJuzPresetSelect(preset.value)}
                    className={`py-2 px-1 rounded-xl text-xs font-extrabold transition-all text-center cursor-pointer ${
                      isSelected
                        ? 'bg-[#088ac1] text-white shadow-md shadow-[#088ac1]/30 ring-2 ring-[#3dc3f3]'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#088ac1]'
                    }`}
                  >
                    <span>{preset.label}</span>
                    <span className="block text-[9px] font-normal opacity-80">{preset.value} Juz</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Remark Last Recited Ayah / Bookmark Section */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Bookmark className="w-4 h-4 text-[#088ac1] dark:text-[#3dc3f3]" />
              <span>Remark Last Recited Position (Bookmark)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e1f3fd] dark:bg-[#0f4d6b]/40 text-[#076e9d] dark:text-[#81d7f8]">
              {activeSurah.arabicName}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Dropdown 1: Which Surah */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Surah Name ({QURAN_SURAHS.length} Surahs)
              </label>
              <select
                value={selectedSurahNumber}
                onChange={handleSurahChange}
                className="w-full px-3 py-2 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-[#1eb4eb]"
              >
                {QURAN_SURAHS.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.name} — {s.arabicName} ({s.ayahCount} ayahs)
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown 2: Ayah Number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Last Ayah Number (1 – {activeSurah.ayahCount})
                </label>
                <button
                  type="button"
                  onClick={() => setSelectedAyahNumber(activeSurah.ayahCount)}
                  className="text-[10px] font-bold text-[#088ac1] dark:text-[#3dc3f3] hover:underline"
                >
                  End of Surah
                </button>
              </div>
              <select
                value={selectedAyahNumber}
                onChange={(e) => setSelectedAyahNumber(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-[#1eb4eb]"
              >
                {Array.from({ length: activeSurah.ayahCount }).map((_, idx) => {
                  const ayah = idx + 1;
                  return (
                    <option key={ayah} value={ayah}>
                      Ayah {ayah} of {activeSurah.ayahCount}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="text-[11px] text-[#076e9d] dark:text-[#81d7f8] bg-[#e1f3fd]/60 dark:bg-[#0f4d6b]/30 p-2 rounded-xl border border-[#bce8fb] dark:border-[#0b5d81]/40 flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              Bookmark will be saved at: <strong>Surah {activeSurah.name} ({activeSurah.number}), Ayah {selectedAyahNumber}</strong>
            </span>
          </div>
        </div>

        {/* 3. Pages & Duration Details */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Pages Count (~{Math.round((juzCount || 0) * 20)} pages)
            </label>
            <input
              type="number"
              min="0"
              max="604"
              value={pagesRead}
              onChange={(e) => handlePagesChange(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1eb4eb]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Duration (Minutes)
            </label>
            <input
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1eb4eb]"
            />
          </div>
        </div>

        {/* 4. Reflection / Tadabbur Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Reflection / Tadabbur Notes (Optional)
          </label>
          <textarea
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Key lessons, inspirational ayahs, or reflection thoughts..."
            className="w-full px-3.5 py-2 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1eb4eb]"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            ✓ Marks Qur’an as completed for today
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save & Mark Completed'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
