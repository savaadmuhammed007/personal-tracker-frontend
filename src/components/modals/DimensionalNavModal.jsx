import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  CheckCircle2,
  Repeat,
  CheckSquare,
  BarChart3,
  RotateCcw,
  Settings,
  X,
  Sparkles,
  ArrowRight,
  Sun,
  Flame,
  BookOpen,
} from 'lucide-react';
import { LiquidDimensionalNav } from '../liquid-dimensional-nav';

export const DimensionalNavModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Home Dashboard',
      to: '/',
      color: '#088ac1',
      icon: <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6" />,
      content: (
        <div className="h-full w-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#088ac1] dark:text-[#3dc3f3] uppercase tracking-widest">
                Overview & Progression
              </span>
            </div>
            <h3 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
              Home Dashboard
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Live progression of the 5 daily prayers, active streaks, digital tasbih, and chronological daily activity ledger.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-xl font-bold font-mono text-[#088ac1] dark:text-[#3dc3f3]">5/5</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Daily Salah</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400">100%</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Real-Time IST</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleNavigate('/')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#088ac1] to-[#0f4d6b] hover:from-[#3dc3f3] hover:to-[#088ac1] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#088ac1]/30 transition-all cursor-pointer active:scale-[0.98]"
          >
            Launch Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ),
    },
    {
      id: 'calendar',
      label: 'Calendar & Time Grid',
      to: '/calendar',
      color: '#06b6d4',
      icon: <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6" />,
      content: (
        <div className="h-full w-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
                Section 12 Ledger
              </span>
            </div>
            <h3 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
              Calendar & Time Grid
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Explore month-by-month consistency rings and inspect exact timestamped database records for any chosen date.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400">30d</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Matrix View</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-xl font-bold font-mono text-[#088ac1] dark:text-[#3dc3f3]">Exact</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Time Log</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleNavigate('/calendar')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/30 transition-all cursor-pointer active:scale-[0.98]"
          >
            Open Calendar <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ),
    },
    {
      id: 'habits',
      label: 'Habits & Qur’an',
      to: '/habits',
      color: '#8b5cf6',
      icon: <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />,
      content: (
        <div className="h-full w-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                Sunnah & Tilawah
              </span>
            </div>
            <h3 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
              Habits & Qur'an
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Track Sunnah habits, morning exercise, and log Surah recitations, ayah spans, and Tadabbur reflection notes.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400">114</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Surahs</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">Streaks</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Consecutive</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleNavigate('/habits')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950/30 transition-all cursor-pointer active:scale-[0.98]"
          >
            Manage Habits <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ),
    },
    {
      id: 'awrad',
      label: 'Daily Awrad',
      to: '/awrad',
      color: '#1eb4eb',
      icon: <Repeat className="w-5 h-5 sm:w-6 sm:h-6" />,
      content: (
        <div className="h-full w-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#088ac1] dark:text-[#3dc3f3] uppercase tracking-widest">
                Divine Remembrance
              </span>
            </div>
            <h3 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
              Daily Awrad & Tasbih
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Tactile digital counter with acoustic clicks, vibrations, preloaded Dhikr, and custom target counters.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-xl font-bold font-mono text-[#088ac1] dark:text-[#3dc3f3]">33 / 100</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Step Counter</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-xl font-bold font-mono text-[#076e9d] dark:text-[#81d7f8]">Audio</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Feedback</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleNavigate('/awrad')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#088ac1] to-[#076e9d] hover:from-[#3dc3f3] hover:to-[#088ac1] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#088ac1]/30 transition-all cursor-pointer active:scale-[0.98]"
          >
            Open Tasbih Counter <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ),
    },
    {
      id: 'tasks',
      label: 'Tasks',
      to: '/tasks',
      color: '#f59e0b',
      icon: <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6" />,
      content: (
        <div className="h-full w-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                Action Items
              </span>
            </div>
            <h3 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
              Priority Tasks
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Organize daily, work, and Islamic tasks with interactive clock due times, urgency filters, and reminders.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">Clock</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Time Picker</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">Urgent</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Priority Sort</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleNavigate('/tasks')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/30 transition-all cursor-pointer active:scale-[0.98]"
          >
            View Tasks <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ),
    },
    {
      id: 'analytics',
      label: 'Analytics',
      to: '/analytics',
      color: '#088ac1',
      icon: <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />,
      content: (
        <div className="h-full w-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#088ac1] dark:text-[#3dc3f3] uppercase tracking-widest">
                Visual Analytics
              </span>
            </div>
            <h3 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
              Annual Consistency
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              365-day GitHub-style consistency heatmaps, Salah category distributions, and monthly growth trends.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-xl font-bold font-mono text-[#088ac1] dark:text-[#3dc3f3]">365d</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Heatmap</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400">Charts</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Breakdown</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleNavigate('/analytics')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#088ac1] to-cyan-600 hover:from-[#3dc3f3] hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#088ac1]/30 transition-all cursor-pointer active:scale-[0.98]"
          >
            Explore Analytics <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      to: '/settings',
      color: '#ec4899',
      icon: <Settings className="w-5 h-5 sm:w-6 sm:h-6" />,
      content: (
        <div className="h-full w-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-widest">
                System Customization
              </span>
            </div>
            <h3 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
              Settings & Location
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Configure 1-click live GPS coordinates, Hijri lunar date +/-2 day offsets, Asr calculation school, and prayer calculation methods.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-xl font-bold font-mono text-pink-600 dark:text-pink-400">GPS</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Live Sync</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-xl font-bold font-mono text-[#088ac1] dark:text-[#3dc3f3]">+/- 2d</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Hijri Offset</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleNavigate('/settings')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-950/30 transition-all cursor-pointer active:scale-[0.98]"
          >
            Open Settings <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white/95 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Top Close Bar */}
        <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1eb4eb] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#088ac1] dark:text-[#3dc3f3]">
              Liquid Dimensional Navigation
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Close Nav"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MelonUI Liquid Dimensional Nav Component */}
        <div className="p-4 sm:p-6 flex items-center justify-center">
          <LiquidDimensionalNav
            items={navItems}
            primaryColor="#088ac1"
            accentColor="#3dc3f3"
            onNavigate={(path) => handleNavigate(path)}
          />
        </div>
      </div>
    </div>
  );
};
