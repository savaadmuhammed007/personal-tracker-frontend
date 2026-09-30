import React, { useState } from 'react';
import { Modal, Button } from '../common/UIComponents';
import { awradApi } from '../../api/awradApi';
import { taskApi } from '../../api/taskApi';
import { useNotification } from '../../context/NotificationContext';
import { getLocalDateString } from '../../utils/dateUtils';
import { CheckSquare } from 'lucide-react';

export const AddAwradModal = ({ isOpen, onClose, onSaved }) => {
  const { showToast } = useNotification();
  const [name, setName] = useState('');
  const [arabicText, setArabicText] = useState('');
  const [transliteration, setTransliteration] = useState('');
  const [targetCount, setTargetCount] = useState(100);
  const [category, setCategory] = useState('daily');
  const [alsoCreateTask, setAlsoCreateTask] = useState(false);
  const [taskDueDate, setTaskDueDate] = useState(getLocalDateString());
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);

    const countNum = parseInt(targetCount, 10) || 100;

    try {
      // 1. Create Awrad item
      await awradApi.createAwrad({
        name,
        arabic_text: arabicText,
        transliteration,
        target_count: countNum,
        category,
      });

      // 2. If user checked "Also create task"
      if (alsoCreateTask) {
        try {
          await taskApi.createTask({
            title: `Complete ${countNum.toLocaleString()}x ${name}`,
            description: `Dhikr target: ${countNum.toLocaleString()} counts of ${name}`,
            category: 'Dhikr',
            priority: 'high',
            due_date: taskDueDate || getLocalDateString(),
            due_time: '09:00 PM',
          });
        } catch (taskErr) {
          console.warn('Task creation from Awrad modal error:', taskErr);
        }
      }

      showToast(
        'Awrad Created',
        alsoCreateTask
          ? `Added ${name} (${countNum.toLocaleString()}x) to counter and tasks list.`
          : `Added ${name} to digital counter.`
      );
      if (onSaved) onSaved();
      onClose();
    } catch (e) {
      console.error('Failed to create awrad:', e);
      showToast('Error', 'Failed to create Awrad.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Custom Awrad / Dhikr">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Dhikr Name / Title
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. HasbunAllahu wa ni'mal wakeel"
            className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Arabic Calligraphy / Text (Optional)
          </label>
          <input
            type="text"
            value={arabicText}
            onChange={(e) => setArabicText(e.target.value)}
            placeholder="حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ"
            dir="rtl"
            className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-base font-arabic focus:ring-2 focus:ring-islamic-primary-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Transliteration / Translation (Optional)
          </label>
          <input
            type="text"
            value={transliteration}
            onChange={(e) => setTransliteration(e.target.value)}
            placeholder="Allah is sufficient for us, and He is the best Disposer of affairs"
            className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Target Count (e.g. 100, 2000)
            </label>
            <input
              type="number"
              min="1"
              max="1000000"
              value={targetCount}
              onChange={(e) => setTargetCount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-islamic-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500"
            >
              <option value="daily">Daily Adhkar</option>
              <option value="morning">Morning Routine</option>
              <option value="evening">Evening Routine</option>
              <option value="forgiveness">Istighfar</option>
              <option value="salawat">Salawat</option>
              <option value="custom">Personal</option>
            </select>
          </div>
        </div>

        {/* Option to also create a scheduled task on tasks list */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={alsoCreateTask}
              onChange={(e) => setAlsoCreateTask(e.target.checked)}
              className="w-4 h-4 rounded text-[#088ac1] focus:ring-[#1eb4eb] border-slate-300 dark:border-slate-600"
            />
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-[#088ac1] dark:text-[#3dc3f3]" />
                Also add to my Tasks list
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Creates a dedicated milestone task under Dhikr tasks with a due date.
              </p>
            </div>
          </label>

          {alsoCreateTask && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                Task Due Date
              </label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#1eb4eb]"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Dhikr Counter'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
