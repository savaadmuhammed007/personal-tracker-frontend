import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../common/UIComponents';
import { TimePickerField } from '../common/TimePickerField';
import { taskApi } from '../../api/taskApi';
import { useNotification } from '../../context/NotificationContext';

export const TaskFormModal = ({ isOpen, onClose, task, onSaved }) => {
  const { showToast } = useNotification();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Personal');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('06:00 PM');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(task?.title || '');
      setDescription(task?.description || '');
      setPriority(task?.priority || 'medium');
      setCategory(task?.category || 'Personal');
      setDueDate(task?.due_date || new Date().toISOString().split('T')[0]);
      setDueTime(task?.due_time || '06:00 PM');
    }
  }, [isOpen, task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);

    const payload = {
      title,
      description,
      priority,
      category,
      due_date: dueDate || null,
      due_time: dueTime,
    };

    try {
      if (task?.id) {
        await taskApi.updateTask(task.id, payload);
        showToast('Task Updated', `Saved changes to ${title}`);
      } else {
        await taskApi.createTask(payload);
        showToast('Task Created', `✓ Added "${title}" to your tasks.`);
      }
      if (onSaved) onSaved();
      onClose();
    } catch (e) {
      console.error('Failed to save task:', e);
      showToast('Error', 'Failed to save task.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task?.id ? 'Edit Task' : 'Create New Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Task Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Finish reading Tafsir, Prepare Sadaqah donation"
            className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Description / Notes (Optional)
          </label>
          <textarea
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details, links, or notes..."
            className="w-full px-3.5 py-2 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
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
              <option value="Islamic">Islamic</option>
              <option value="Personal">Personal</option>
              <option value="Work">Work / Study</option>
              <option value="Charity">Charity</option>
              <option value="Family">Family</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500"
            />
          </div>

          <TimePickerField
            value={dueTime}
            onChange={(newTime) => setDueTime(newTime)}
            label="Due Time (Clock)"
            modalTitle={task?.id ? `Set Due Time for ${title || 'Task'}` : 'Set Task Due Time'}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Saving...' : task?.id ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
