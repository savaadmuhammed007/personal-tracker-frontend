import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckSquare,
  Plus,
  Check,
  Clock,
  Calendar,
  AlertCircle,
  Edit2,
  Trash2,
  Filter,
} from 'lucide-react';
import { taskApi } from '../api/taskApi';
import { TaskFormModal } from '../components/modals/TaskFormModal';
import { useNotification } from '../context/NotificationContext';
import { Button, Badge } from '../components/common/UIComponents';

export const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotification();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeFilter !== 'all') params.filter = activeFilter;
      if (activeCategory !== 'all') params.category = activeCategory;

      const res = await taskApi.getTasks(params);
      const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setTasks(list);
    } catch (e) {
      console.error('Failed to load tasks:', e);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, activeCategory]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleToggle = async (task) => {
    try {
      const res = await taskApi.toggleTask(task.id);
      fetchTasks();
      if (res.data.task.status === 'completed') {
        showToast('Task Completed', `✓ Finished "${task.title}"`);
      }
    } catch (e) {
      console.error('Failed to toggle task:', e);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete task "${title}"?`)) return;
    try {
      await taskApi.deleteTask(id);
      showToast('Task Deleted', `Removed "${title}"`, 'neutral');
      fetchTasks();
    } catch (e) {
      console.error('Failed to delete task:', e);
    }
  };

  const priorityBadgeVariant = {
    urgent: 'rose',
    high: 'gold',
    medium: 'indigo',
    low: 'default',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-islamic-primary-600" />
            Task Management & Actions
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Organize personal, Islamic, study, and charity milestones with due dates
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
        >
          Add Task
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All' },
            { id: 'today', label: 'Due Today' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Completed' },
            { id: 'overdue', label: 'Overdue' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeFilter === tab.id
                  ? 'bg-islamic-primary-700 text-white'
                  : 'bg-white dark:bg-islamic-card-dark text-slate-600 dark:text-slate-300 border border-islamic-border-light dark:border-islamic-border-dark hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Categories</option>
            <option value="Islamic">Islamic</option>
            <option value="Personal">Personal</option>
            <option value="Work">Work / Study</option>
            <option value="Charity">Charity</option>
            <option value="Family">Family</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-400 bg-islamic-subtle-light/40 dark:bg-islamic-subtle-dark/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <p className="font-semibold text-slate-600 dark:text-slate-300">No tasks in this view.</p>
          <p className="text-xs text-slate-400 mt-1">Keep yourself organized with clear goals.</p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
          >
            + Create New Task
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isCompleted = task.status === 'completed';
            let compTime = null;
            if (task.completed_at) {
              try {
                const dt = new Date(task.completed_at);
                compTime = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              } catch (e) {
                compTime = null;
              }
            }

            return (
              <div
                key={task.id}
                className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? 'bg-slate-50/60 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-60'
                    : task.is_overdue
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                    : 'glass-card border-islamic-border-light dark:border-islamic-border-dark hover:shadow-soft'
                }`}
              >
                {/* Checkbox + Title + Meta */}
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <button
                    onClick={() => handleToggle(task)}
                    className={`mt-0.5 sm:mt-0 w-6 h-6 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                      isCompleted
                        ? 'bg-[#088ac1] text-white shadow-sm'
                        : 'border-2 border-slate-300 dark:border-slate-600 hover:border-[#1eb4eb]'
                    }`}
                  >
                    {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="min-w-0">
                    <p
                      className={`text-sm font-bold ${
                        isCompleted
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {task.title}
                    </p>

                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-1">
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {task.due_date} {task.due_time && `@ ${task.due_time}`}
                        </span>
                      )}
                      {task.is_overdue && (
                        <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-0.5">
                          <AlertCircle className="w-3 h-3" /> Overdue
                        </span>
                      )}
                      {isCompleted && compTime && (
                        <span className="text-[#076e9d] dark:text-[#3dc3f3] font-semibold">
                          Completed at {compTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Badges & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60 shrink-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={priorityBadgeVariant[task.priority] || 'default'}>
                      {task.priority.toUpperCase()}
                    </Badge>

                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {task.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(task.id, task.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onSaved={fetchTasks}
      />
    </div>
  );
};
