import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../common/UIComponents';
import { TimePickerField } from '../common/TimePickerField';
import { taskApi } from '../../api/taskApi';
import { awradApi } from '../../api/awradApi';
import { useNotification } from '../../context/NotificationContext';
import { getLocalDateString } from '../../utils/dateUtils';
import { Repeat, CheckSquare, Sparkles } from 'lucide-react';

const PRESET_DHIKR_OPTIONS = [
  { name: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ اللَّهَ', meaning: 'I seek forgiveness from Allah' },
  { name: 'Salawat on the Prophet ﷺ', arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', meaning: 'Allahumma Salli Ala Muhammad' },
  { name: 'SubhanAllah wa Bihamdihi', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', meaning: 'Glory be to Allah and His is the praise' },
  { name: 'La ilaha illallah', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ', meaning: 'None has the right to be worshipped but Allah' },
  { name: 'SubhanAllah, Alhamdulillah, Allahu Akbar', arabic: 'سُبْحَانَ اللَّهِ ، وَالْحَمْدُ لِلَّهِ ، وَاللَّهُ أَكْبَرُ', meaning: 'Glory, praise, and greatness be to Allah' },
  { name: 'La hawla wa la quwwata illa billah', arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', meaning: 'There is no power and no strength except with Allah' },
  { name: 'HasbunAllahu wa ni\'mal wakeel', arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', meaning: 'Allah is sufficient for us, the best Disposer of affairs' },
  { name: 'Custom Dhikr', arabic: '', meaning: '' },
];

const QUICK_COUNTS = [100, 300, 500, 1000, 2000, 5000, 10000];

export const AddDhikrTaskModal = ({
  isOpen,
  onClose,
  initialDhikrName = '',
  initialArabicText = '',
  initialTargetCount = 2000,
  onTaskCreated,
}) => {
  const { showToast } = useNotification();
  const [selectedPreset, setSelectedPreset] = useState(initialDhikrName || 'Astaghfirullah');
  const [customDhikrName, setCustomDhikrName] = useState('');
  const [arabicText, setArabicText] = useState(initialArabicText || '');
  const [targetCount, setTargetCount] = useState(initialTargetCount || 2000);
  const [taskTitle, setTaskTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(getLocalDateString());
  const [dueTime, setDueTime] = useState('09:00 PM');
  const [priority, setPriority] = useState('high');
  const [createCounterInTasbih, setCreateCounterInTasbih] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const presetFound = PRESET_DHIKR_OPTIONS.find(
        (p) => p.name.toLowerCase() === (initialDhikrName || '').toLowerCase()
      );
      if (presetFound) {
        setSelectedPreset(presetFound.name);
        setArabicText(presetFound.arabic);
        setCustomDhikrName('');
      } else if (initialDhikrName) {
        setSelectedPreset('Custom Dhikr');
        setCustomDhikrName(initialDhikrName);
        setArabicText(initialArabicText || '');
      } else {
        setSelectedPreset('Astaghfirullah');
        setArabicText('أَسْتَغْفِرُ اللَّهَ');
        setCustomDhikrName('');
      }

      const count = initialTargetCount || 2000;
      setTargetCount(count);
      setDueDate(getLocalDateString());
      setDueTime('09:00 PM');
      setPriority('high');
      setCreateCounterInTasbih(true);
    }
  }, [isOpen, initialDhikrName, initialArabicText, initialTargetCount]);

  // Sync title whenever dhikr name or count changes
  useEffect(() => {
    const activeName = selectedPreset === 'Custom Dhikr' ? (customDhikrName || 'Custom Dhikr') : selectedPreset;
    const countFormatted = Number(targetCount || 0).toLocaleString();
    setTaskTitle(`Complete ${countFormatted}x ${activeName}`);
    setDescription(`Goal: Recite ${countFormatted} counts of ${activeName}. Earn immense reward and remembrance.`);
  }, [selectedPreset, customDhikrName, targetCount]);

  const handlePresetChange = (presetName) => {
    setSelectedPreset(presetName);
    const found = PRESET_DHIKR_OPTIONS.find((p) => p.name === presetName);
    if (found && presetName !== 'Custom Dhikr') {
      setArabicText(found.arabic);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalDhikrName = selectedPreset === 'Custom Dhikr' ? customDhikrName.trim() : selectedPreset;
    if (!finalDhikrName) {
      showToast('Validation Error', 'Please specify a Dhikr name.', 'error');
      return;
    }

    const countNum = parseInt(targetCount, 10) || 2000;
    setSubmitting(true);

    try {
      // 1. Create the Task under category 'Dhikr'
      await taskApi.createTask({
        title: taskTitle.trim() || `Complete ${countNum}x ${finalDhikrName}`,
        description: description.trim(),
        priority,
        category: 'Dhikr',
        due_date: dueDate || null,
        due_time: dueTime || '',
      });

      // 2. Optionally create/ensure Awrad counter in digital Tasbih
      if (createCounterInTasbih) {
        try {
          await awradApi.createAwrad({
            name: `${finalDhikrName} (${countNum}x)`,
            arabic_text: arabicText || '',
            transliteration: `Target: ${countNum.toLocaleString()} Dhikr`,
            target_count: countNum,
            category: 'custom',
          });
        } catch (counterErr) {
          console.warn('Awrad counter creation note:', counterErr);
        }
      }

      showToast('Dhikr Task Created', `✓ Added "${taskTitle}" to your Tasks.`);
      if (onTaskCreated) onTaskCreated();
      onClose();
    } catch (err) {
      console.error('Failed to create Dhikr task:', err);
      showToast('Error', 'Failed to create Dhikr task.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Custom Dhikr Task" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
        {/* Banner */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#088ac1]/15 via-[#1eb4eb]/10 to-transparent border border-[#3dc3f3]/30 flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#088ac1] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Dhikr Milestone & Task Tracker
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate sm:whitespace-normal">
              Set high-volume Dhikr goals (e.g. 2,000 Astaghfirullah) to complete by a target time.
            </p>
          </div>
        </div>

        {/* 1. Dhikr Type Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Choose Dhikr
          </label>
          <select
            value={selectedPreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-[#1eb4eb]"
          >
            {PRESET_DHIKR_OPTIONS.map((opt) => (
              <option key={opt.name} value={opt.name}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>

        {selectedPreset === 'Custom Dhikr' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Custom Dhikr Name
            </label>
            <input
              type="text"
              required
              value={customDhikrName}
              onChange={(e) => setCustomDhikrName(e.target.value)}
              placeholder="e.g. Ya Hayyu Ya Qayyum, Ayah al-Kursi"
              className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-[#1eb4eb]"
            />
          </div>
        )}

        {/* Arabic text display/edit */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Arabic Calligraphy (Optional)
          </label>
          <input
            type="text"
            value={arabicText}
            onChange={(e) => setArabicText(e.target.value)}
            placeholder="أَسْتَغْفِرُ اللَّهَ"
            dir="rtl"
            className="w-full px-3.5 py-2 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm sm:text-base font-arabic focus:ring-2 focus:ring-[#1eb4eb]"
          />
        </div>

        {/* 2. Target Dhikr Count & Quick Preset Pills */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Target Dhikr Count
            </label>
            <span className="text-xs font-extrabold text-[#088ac1] dark:text-[#3dc3f3]">
              {Number(targetCount || 0).toLocaleString()} times
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {QUICK_COUNTS.map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => setTargetCount(cnt)}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                  Number(targetCount) === cnt
                    ? 'bg-[#088ac1] text-white shadow-xs scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cnt.toLocaleString()}
              </button>
            ))}
          </div>

          <input
            type="number"
            min="1"
            max="1000000"
            required
            value={targetCount}
            onChange={(e) => setTargetCount(e.target.value)}
            placeholder="e.g. 2000"
            className="w-full px-3.5 py-2 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-[#1eb4eb]"
          />
        </div>

        {/* 3. Task Title (Auto-generated & editable) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Task Display Title
          </label>
          <input
            type="text"
            required
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-[#1eb4eb]"
          />
        </div>

        {/* 4. Due Date, Time & Priority in Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-[#1eb4eb]"
            />
          </div>

          <TimePickerField
            value={dueTime}
            onChange={(newTime) => setDueTime(newTime)}
            label="Target Time (Clock)"
            modalTitle="Set Dhikr Task Deadline"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 items-center">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-[#1eb4eb]"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="flex items-center pt-1 sm:pt-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={createCounterInTasbih}
                onChange={(e) => setCreateCounterInTasbih(e.target.checked)}
                className="w-4 h-4 rounded text-[#088ac1] focus:ring-[#1eb4eb] border-slate-300 dark:border-slate-600"
              />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Add to Tasbih Counter
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={submitting}>
            {submitting ? 'Creating Task...' : `Add Dhikr Task (${Number(targetCount || 0).toLocaleString()}x)`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
