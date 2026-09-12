import React, { useState } from 'react';
import { Modal, Button } from '../common/UIComponents';
import { awradApi } from '../../api/awradApi';
import { useNotification } from '../../context/NotificationContext';

export const AddAwradModal = ({ isOpen, onClose, onSaved }) => {
  const { showToast } = useNotification();
  const [name, setName] = useState('');
  const [arabicText, setArabicText] = useState('');
  const [transliteration, setTransliteration] = useState('');
  const [targetCount, setTargetCount] = useState(100);
  const [category, setCategory] = useState('daily');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);

    try {
      await awradApi.createAwrad({
        name,
        arabic_text: arabicText,
        transliteration,
        target_count: parseInt(targetCount) || 100,
        category,
      });
      showToast('Awrad Created', `Added ${name} to digital counter.`);
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
              Target Count
            </label>
            <input
              type="number"
              min="1"
              value={targetCount}
              onChange={(e) => setTargetCount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500"
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
