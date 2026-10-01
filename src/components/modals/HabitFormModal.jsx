import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../common/UIComponents';
import { TimePickerField } from '../common/TimePickerField';
import { habitApi } from '../../api/habitApi';
import { useNotification } from '../../context/NotificationContext';
import { QURAN_SURAHS, JUZ_PRESETS } from '../../data/quranData';

export const HabitFormModal = ({ isOpen, onClose, habit, onSaved }) => {
  const { showToast } = useNotification();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('quran');
  const [selectedSurahNumber, setSelectedSurahNumber] = useState('');
  const [startingAyah, setStartingAyah] = useState(1);
  const [targetJuzGoal, setTargetJuzGoal] = useState(1.0);
  const [frequency, setFrequency] = useState('daily');
  const [specificDays, setSpecificDays] = useState([4]); // Default to Friday (4)
  const [duration, setDuration] = useState(20);
  const [reminderTime, setReminderTime] = useState('07:00 AM');
  const [submitting, setSubmitting] = useState(false);

  const DAYS_OF_WEEK = [
    { id: 0, label: 'Mon', full: 'Monday' },
    { id: 1, label: 'Tue', full: 'Tuesday' },
    { id: 2, label: 'Wed', full: 'Wednesday' },
    { id: 3, label: 'Thu', full: 'Thursday' },
    { id: 4, label: 'Fri', full: 'Friday', badge: 'Jumu‘ah' },
    { id: 5, label: 'Sat', full: 'Saturday' },
    { id: 6, label: 'Sun', full: 'Sunday' },
  ];

  useEffect(() => {
    if (isOpen) {
      setName(habit?.name || '');
      setCategory(habit?.category || 'quran');
      setSelectedSurahNumber(
        habit?.last_surah_number !== undefined && habit?.last_surah_number !== null
          ? String(habit.last_surah_number)
          : ''
      );
      setStartingAyah(habit?.last_ayah_number || 1);
      setTargetJuzGoal(habit?.target_juz_goal || 1.0);
      setFrequency(habit?.frequency || 'daily');
      setSpecificDays(
        Array.isArray(habit?.specific_days) && habit.specific_days.length > 0
          ? habit.specific_days
          : [4]
      );
      setDuration(habit?.target_duration_minutes || 20);
      setReminderTime(habit?.reminder_time || '07:00 AM');
    }
  }, [isOpen, habit]);

  const handleDaySelect = (dayId) => {
    if (frequency === 'weekly_once' || frequency === 'weekly_target') {
      setSpecificDays([dayId]);
    } else {
      // Toggle for specific_days multi-select
      if (specificDays.includes(dayId)) {
        if (specificDays.length > 1) {
          setSpecificDays(specificDays.filter((d) => d !== dayId));
        }
      } else {
        setSpecificDays([...specificDays, dayId].sort((a, b) => a - b));
      }
    }
  };

  const handleSurahSelect = (surahNumStr) => {
    setSelectedSurahNumber(surahNumStr);
    if (surahNumStr) {
      const num = parseInt(surahNumStr, 10);
      const surahObj = QURAN_SURAHS.find((s) => s.number === num);
      if (surahObj) {
        // Auto-populate or update name if empty or generic
        if (!name || name === 'Qur’an Recitation' || name.startsWith('Surah ') || name.startsWith('Qur’an')) {
          setName(`Surah ${surahObj.name}`);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);

    let daysToSave = [];
    if (frequency === 'weekly_once' || frequency === 'weekly_target' || frequency === 'specific_days') {
      daysToSave = specificDays;
    } else if (frequency === 'weekdays') {
      daysToSave = [0, 1, 2, 3, 4];
    } else {
      daysToSave = [];
    }

    let surahName = '';
    let surahNum = null;
    if (category === 'quran' && selectedSurahNumber) {
      const num = parseInt(selectedSurahNumber, 10);
      const surahObj = QURAN_SURAHS.find((s) => s.number === num);
      if (surahObj) {
        surahName = surahObj.name;
        surahNum = surahObj.number;
      }
    }

    const finalTargetJuzGoal = category === 'quran'
      ? (selectedSurahNumber ? null : (targetJuzGoal !== null && targetJuzGoal !== undefined ? parseFloat(targetJuzGoal) : null))
      : 1.0;

    const payload = {
      name: name.trim(),
      category,
      frequency,
      specific_days: daysToSave,
      target_duration_minutes: parseInt(duration) || 15,
      target_juz_goal: finalTargetJuzGoal,
      last_surah_name: surahName,
      last_surah_number: surahNum,
      last_ayah_number: category === 'quran' && surahNum ? (parseInt(startingAyah, 10) || 1) : null,
      icon: category === 'quran' ? 'BookOpen' : (habit?.icon || 'CheckCircle2'),
      reminder_time: reminderTime,
    };

    try {
      if (habit?.id) {
        await habitApi.updateHabit(habit.id, payload);
        showToast('Habit Updated', `${name} updated successfully.`);
      } else {
        await habitApi.createHabit(payload);
        showToast('Habit Created', `✓ ${name} added to your tracker.`);
      }
      if (onSaved) onSaved();
      onClose();
    } catch (e) {
      console.error('Failed to save habit:', e);
      showToast('Error', 'Failed to save habit.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDayName = DAYS_OF_WEEK.find((d) => d.id === specificDays[0])?.full || 'Friday';
  const selectedSurahObj = selectedSurahNumber
    ? QURAN_SURAHS.find((s) => s.number === parseInt(selectedSurahNumber, 10))
    : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={habit?.id ? 'Edit Habit' : 'Create New Habit'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Habit Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Habit Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              category === 'quran'
                ? 'e.g. Surah Al-Kahf (Fridays), Daily Qur’an Tilawah, Surah Al-Mulk'
                : 'e.g. Duha Prayer, Morning Adhkar, Daily Sadaqah'
            }
            className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1eb4eb]"
          />
        </div>

        {/* Category & Frequency Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                const newCat = e.target.value;
                setCategory(newCat);
                if (newCat === 'quran' && !name) {
                  setName('Qur’an Recitation');
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#1eb4eb]"
            >
              <option value="quran">📖 Noble Qur’an & Tilawah</option>
              <option value="sunnah">🤲 Sunnah Prayers & Acts</option>
              <option value="dhikr">📿 Adhkar / Dhikr</option>
              <option value="sadaqah">💖 Sadaqah & Charity</option>
              <option value="study">📚 Islamic Study & Knowledge</option>
              <option value="health">🏃 Physical Health</option>
              <option value="custom">🎯 Personal Goal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => {
                const newFreq = e.target.value;
                setFrequency(newFreq);
                if (newFreq === 'weekly_once' || newFreq === 'weekly_target') {
                  setSpecificDays([4]); // Default to Friday
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-[#1eb4eb]"
            >
              <option value="daily">Every Day</option>
              <option value="weekdays">Weekdays (Mon – Fri)</option>
              <option value="weekly_once">Weekly Once (Specific Day)</option>
              <option value="specific_days">Specific Days (Multiple)</option>
            </select>
          </div>
        </div>

        {/* Dedicated Quran Specific Section: Surah Selector, Starting Ayah, and Reading Goal */}
        {category === 'quran' && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#e1f3fd]/80 dark:bg-[#0f4d6b]/25 border border-[#bce8fb] dark:border-[#0b5d81]/60 space-y-3 animate-fade-in">
            {/* Surah Dropdown Picker */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#076e9d] dark:text-[#81d7f8]">
                  📖 Which Surah is this habit for?
                </label>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  114 Surahs
                </span>
              </div>
              <select
                value={selectedSurahNumber}
                onChange={(e) => handleSurahSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#bce8fb] dark:border-[#0b5d81] bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#1eb4eb]"
              >
                <option value="">✨ General Tilawah / Whole Qur’an Progression</option>
                <optgroup label="🌟 Frequently Recited & Virtuous Surahs">
                  <option value="18">18. Surah Al-Kahf (الكهف) — Friday Recitation</option>
                  <option value="67">67. Surah Al-Mulk (الملك) — Nightly Protection</option>
                  <option value="36">36. Surah Ya-Sin (يس) — Heart of the Qur'an</option>
                  <option value="56">56. Surah Al-Waqi'ah (الواقعة) — Surah of Provision</option>
                  <option value="55">55. Surah Ar-Rahman (الرحمن) — Favors of Lord</option>
                  <option value="2">2. Surah Al-Baqarah (البقرة) — Protection & Blessing</option>
                  <option value="1">1. Surah Al-Fatihah (الفاتحة) — The Opening</option>
                </optgroup>
                <optgroup label="📜 Complete 114 Surahs (Surah 1 to 114)">
                  {QURAN_SURAHS.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. Surah {s.name} ({s.arabicName}) — {s.ayahCount} Ayahs • {s.type}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* If Specific Surah is selected: Bookmark info & Starting Ayah */}
            {selectedSurahObj ? (
              <div className="space-y-2 pt-1 border-t border-[#bce8fb]/60 dark:border-[#0b5d81]/40">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#076e9d] dark:text-[#81d7f8] mb-1">
                      Starting Verse / Ayah Bookmark
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedSurahObj.ayahCount}
                      value={startingAyah}
                      onChange={(e) => setStartingAyah(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#bce8fb] dark:border-[#0b5d81] bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#1eb4eb]"
                      placeholder="e.g. 1"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#076e9d] dark:text-[#81d7f8] mb-1">
                      Surah Information
                    </label>
                    <div className="px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-[#bce8fb]/60 dark:border-[#0b5d81]/40 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                      <span>{selectedSurahObj.ayahCount} Total Ayahs</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#bce8fb] dark:bg-[#0f4d6b] text-[#076e9d] dark:text-[#81d7f8]">
                        {selectedSurahObj.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-[#bce8fb]/50 dark:border-[#0b5d81]/40 text-[11px] text-[#076e9d] dark:text-[#81d7f8] flex items-center gap-1.5 font-medium">
                  <span>✨</span>
                  <span>Specific Surah habit — tracked as a dedicated recitation habit (does not count as daily Juz Tilawah goal).</span>
                </div>
              </div>
            ) : (
              /* Reading Goal (Juz) for General Tilawah with Interactive Preset Buttons */
              <div className="pt-1 border-t border-[#bce8fb]/60 dark:border-[#0b5d81]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#076e9d] dark:text-[#81d7f8]">
                    Daily Tilawah Target (Juz)
                  </label>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    {targetJuzGoal ? `${targetJuzGoal} Juz (~${Math.round(targetJuzGoal * 20)} pages)` : 'No goal selected (Optional)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {JUZ_PRESETS.map((preset) => {
                    const isSelected =
                      targetJuzGoal !== null &&
                      targetJuzGoal !== undefined &&
                      Math.abs(targetJuzGoal - preset.value) < 0.01;
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            // Click once more unclicks / deselects that button
                            setTargetJuzGoal(null);
                          } else {
                            setTargetJuzGoal(preset.value);
                          }
                        }}
                        className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                          isSelected
                            ? 'bg-[#088ac1] text-white border-[#088ac1] shadow-md shadow-[#088ac1]/30 ring-2 ring-[#3dc3f3]'
                            : 'bg-white dark:bg-slate-800 hover:bg-[#e1f3fd] dark:hover:bg-[#0f4d6b]/40 border-[#bce8fb] dark:border-[#0b5d81] text-slate-700 dark:text-slate-300'
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
            )}
          </div>
        )}

        {/* Which Day of the Week Picker (for Weekly Once & Specific Days) */}
        {(frequency === 'weekly_once' || frequency === 'weekly_target' || frequency === 'specific_days') && (
          <div className="p-3 sm:p-3.5 rounded-2xl bg-[#f0faff] dark:bg-[#0f4d6b]/20 border border-[#bce8fb] dark:border-[#0b5d81]/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#076e9d] dark:text-[#81d7f8]">
                {frequency === 'weekly_once' || frequency === 'weekly_target'
                  ? `Which Day of the Week? (${selectedDayName})`
                  : 'Select Days of the Week'}
              </label>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Shows on that day only
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = specificDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleDaySelect(day.id)}
                    className={`py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all text-center cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#088ac1] text-white shadow-md shadow-[#088ac1]/30 ring-2 ring-[#3dc3f3]'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#088ac1]'
                    }`}
                  >
                    <span>{day.label}</span>
                    {day.badge && (
                      <span className="block text-[7px] sm:text-[8px] font-extrabold text-amber-500 leading-none mt-0.5">
                        ★ Fri
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] sm:text-[11px] text-[#076e9d] dark:text-[#81d7f8] font-medium">
              💡 This habit will appear on your Home schedule every{' '}
              <strong>
                {specificDays.map((d) => DAYS_OF_WEEK.find((item) => item.id === d)?.full).join(', ')}
              </strong>.
            </p>
          </div>
        )}

        {/* Target Duration & Clock Reminder Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Target Duration (Mins)
            </label>
            <input
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-islamic-primary-500"
            />
          </div>

          {/* Interactive Clock Model for Habit Time Setting */}
          <TimePickerField
            value={reminderTime}
            onChange={(newTime) => setReminderTime(newTime)}
            label="Reminder Time (Clock)"
            modalTitle={habit?.id ? `Set Reminder for ${name || 'Habit'}` : 'Set Habit Reminder Time'}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Saving...' : habit?.id ? 'Update Habit' : 'Create Habit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default HabitFormModal;
