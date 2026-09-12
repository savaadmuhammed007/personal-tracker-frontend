import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, CheckSquare, Plus, ArrowRight } from 'lucide-react';
import { taskApi } from '../../api/taskApi';
import { useNotification } from '../../context/NotificationContext';

export const DailyTasksSummary = ({ tasksList, onTaskUpdated, onToggleTask, onOpenAddModal }) => {
  const { showToast } = useNotification();
  const [pendingTaskIds, setPendingTaskIds] = useState(new Set());

  const handleToggle = async (task) => {
    if (pendingTaskIds.has(task.id)) return;
    setPendingTaskIds((prev) => new Set(prev).add(task.id));

    const isCompleted = task.status === 'completed';
    if (!isCompleted) {
      showToast('Task Completed', `✓ ${task.title} finished!`);
    }

    try {
      if (onToggleTask) {
        await onToggleTask(task);
      } else {
        const nextStatus = isCompleted ? 'pending' : 'completed';
        await taskApi.toggleTask(task.id, {
          status: nextStatus,
          is_completed: nextStatus === 'completed',
        });
        if (onTaskUpdated) onTaskUpdated();
      }
    } catch (e) {
      console.error('Failed to toggle task:', e);
    } finally {
      setPendingTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }
  };

  const priorityColors = {
    urgent: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900',
    high: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900',
    medium: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900',
    low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  const safeTasks = Array.isArray(tasksList) ? tasksList : [];

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Priority Tasks & Actions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Keep track of personal and Islamic tasks with deadlines
          </p>
        </div>
        <div className="flex items-center gap-3">
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1 text-xs font-bold text-islamic-primary-700 dark:text-islamic-primary-400 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Add Task
            </button>
          )}
          <Link
            to="/tasks"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {safeTasks.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400 bg-islamic-subtle-light/40 dark:bg-islamic-subtle-dark/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          No tasks pending for today.
        </div>
      ) : (
        <div className="space-y-2.5">
          {safeTasks.slice(0, 5).map((task) => {
            const isCompleted = task.status === 'completed';
            return (
              <div
                key={task.id}
                onClick={() => handleToggle(task)}
                className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer select-none ${
                  isCompleted
                    ? 'bg-slate-50/60 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-white dark:bg-islamic-card-dark border-islamic-border-light/80 dark:border-islamic-border-dark/80 hover:shadow-soft'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                      isCompleted
                        ? 'bg-[#088ac1] text-white shadow-xs'
                        : 'border-2 border-slate-300 dark:border-slate-600 hover:border-[#1eb4eb]'
                    }`}
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div className="truncate">
                    <p
                      className={`text-sm font-semibold truncate ${
                        isCompleted
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.due_time && (
                      <p className="text-[11px] text-slate-400">
                        Due: {task.due_time}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                      priorityColors[task.priority] || priorityColors.medium
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    {task.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
