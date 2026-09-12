import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../common/UIComponents';
import { TimePickerField } from '../common/TimePickerField';
import { habitApi } from '../../api/habitApi';
import { useNotification } from '../../context/NotificationContext';

export const HabitFormModal = ({ isOpen, onClose, habit, onSaved }) => {
  const { showToast } = useNotification();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('custom');
  const [frequency, setFrequency] = useState('daily');
  const [specificDays, setSpecificDays] = useState([4]); // Default to Friday (4)
  const [duration, setDuration] = useState(15);
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
      setCategory(habit?.category || 'custom');
      setFrequency(habit?.frequency || 'daily');
      setSpecificDays(
        Array.isArray(habit?.specific_days) && habit.specific_days.length > 0
          ? habit.specific_days
          : [4]
      );
      setDuration(habit?.target_duration_minutes || 15);
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

    const payload = {
      name,
      category,
      frequency,
      specific_days: daysToSave,
      target_duration_minutes: parseInt(duration) || 15,
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={habit?.id ? 'Edit Habit' : 'Create New Habit'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Habit Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Surah Al-Kahf, Jummah Ghusl, Duha Prayer"
            className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1eb4eb]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1eb4eb]"
            >
              <option value="sunnah">Sunnah Prayers & Acts</option>
              <option value="dhikr">Adhkar / Dhikr</option>
              <option value="sadaqah">Sadaqah & Charity</option>
              <option value="study">Islamic Study</option>
              <option value="health">Physical Health</option>
              <option value="custom">Personal Goal</option>
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1eb4eb]"
            >
              <option value="daily">Every Day</option>
              <option value="weekdays">Weekdays (Mon – Fri)</option>
              <option value="weekly_once">Weekly Once (Specific Day)</option>
              <option value="specific_days">Specific Days (Multiple)</option>
            </select>
          </div>
        </div>

        {/* Which Day of the Week Picker (for Weekly Once & Specific Days) */}
        {(frequency === 'weekly_once' || frequency === 'weekly_target' || frequency === 'specific_days') && (
          <div className="p-3.5 rounded-2xl bg-[#f0faff] dark:bg-[#0f4d6b]/20 border border-[#bce8fb] dark:border-[#0b5d81]/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#076e9d] dark:text-[#81d7f8]">
                {frequency === 'weekly_once' || frequency === 'weekly_target'
                  ? `Which Day of the Week? (${selectedDayName})`
                  : 'Select Days of the Week'}
              </label>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Shows on that day only
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = specificDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleDaySelect(day.id)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#088ac1] text-white shadow-md shadow-[#088ac1]/30 ring-2 ring-[#3dc3f3]'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#088ac1]'
                    }`}
                  >
                    <span>{day.label}</span>
                    {day.badge && (
                      <span className="block text-[8px] font-extrabold text-amber-500 leading-none mt-0.5">
                        ★ Fri
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-[#076e9d] dark:text-[#81d7f8] font-medium">
              💡 This habit will appear on your Home schedule every{' '}
              <strong>
                {specificDays.map((d) => DAYS_OF_WEEK.find((item) => item.id === d)?.full).join(', ')}
              </strong>.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Target Duration (Mins)
            </label>
            <input
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500"
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
