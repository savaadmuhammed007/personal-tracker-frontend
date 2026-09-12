import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  CheckCircle2,
  Repeat,
  CheckSquare,
  BarChart3,
  RotateCcw,
  Settings,
  LogOut,
  Sun,
  Moon,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LiquidDimensionalNav } from '../liquid-dimensional-nav';

export const Sidebar = () => {
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine current active navigation item ID from URL path
  const getActiveNavId = (pathname) => {
    if (pathname === '/') return 'dashboard';
    if (pathname.startsWith('/quran')) return 'quran';
    if (pathname.startsWith('/calendar')) return 'calendar';
    if (pathname.startsWith('/habits')) return 'habits';
    if (pathname.startsWith('/awrad')) return 'awrad';
    if (pathname.startsWith('/tasks')) return 'tasks';
    if (pathname.startsWith('/analytics')) return 'analytics';
    if (pathname.startsWith('/missed')) return 'missed';
    if (pathname.startsWith('/settings')) return 'settings';
    return 'dashboard';
  };

  const activeNavId = getActiveNavId(location.pathname);

  // 8 Liquid Dimensional Navigation Items
  const navItems = [
    {
      id: 'dashboard',
      label: 'Home Dashboard',
      to: '/',
      color: '#1eb4eb',
      icon: <LayoutDashboard className="w-5 h-5" />,
      content: (
        <div className="h-full w-full flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#088ac1] dark:text-[#3dc3f3] uppercase tracking-widest">
              Daily Progression
            </span>
            <h3 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight mt-0.5">
              Home Dashboard
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Real-time progression of the 5 daily prayers, active habit streaks, digital tasbih, and chronological daily ledger.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-lg font-bold font-mono text-[#088ac1] dark:text-[#3dc3f3]">5 Salah</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Daily Goal</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-lg font-bold font-mono text-[#076e9d] dark:text-[#81d7f8]">Live IST</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Chronology</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#088ac1] to-[#076e9d] hover:from-[#1eb4eb] hover:to-[#088ac1] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#088ac1]/30 transition-all cursor-pointer active:scale-[0.98]"
          >
            Launch Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ),
    },
    {
      id: 'quran',
      label: 'Noble Qur’an',
      to: '/quran',
      color: '#1eb4eb',
      icon: <BookOpen className="w-5 h-5" />,
      content: (
        <div className="h-full w-full flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#088ac1] dark:text-[#3dc3f3] uppercase tracking-widest">
              Divine Tilawah
            </span>
            <h3 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight mt-0.5">
              Noble Qur’an Hub
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              114 Surahs explorer, dynamic Ayah bookmarks, daily Juz goal tracking (¼, ½, ¾, 1 Juz), and Tadabbur notes.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-lg font-bold font-mono text-[#088ac1] dark:text-[#3dc3f3]">114</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Surahs</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-lg font-bold font-mono text-[#076e9d] dark:text-[#81d7f8]">30 Juz</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Khatm Goal</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/quran')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#088ac1] to-[#076e9d] hover:from-[#1eb4eb] hover:to-[#088ac1] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#088ac1]/30 transition-all cursor-pointer active:scale-[0.98]"
          >
            Open Qur’an Hub <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ),
    },
    {
      id: 'calendar',
      label: 'Calendar & Time Grid',
      to: '/calendar',
      color: '#06b6d4',
      icon: <CalendarDays className="w-5 h-5" />,
      content: (
        <div className="h-full w-full flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
              Ledger & Matrix
            </span>
            <h3 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight mt-0.5">
              Calendar & Time Grid
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Explore month-by-month consistency rings and inspect exact timestamped database records for any selected date.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-lg font-bold font-mono text-cyan-600 dark:text-cyan-400">30d</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Matrix View</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-lg font-bold font-mono text-[#088ac1] dark:text-[#3dc3f3]">Exact</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Time Ledger</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/calendar')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-950/40 transition-all cursor-pointer active:scale-[0.98]"
          >
            Open Calendar <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ),
    },
    {
      id: 'habits',
      label: 'Islamic Habits',
      to: '/habits',
      color: '#8b5cf6',
      icon: <CheckCircle2 className="w-5 h-5" />,
      content: (
        <div className="h-full w-full flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
              Sunnah & Routines
            </span>
            <h3 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight mt-0.5">
              Daily Islamic Habits
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Track Sunnah prayers, morning routines, charity, Islamic study, and custom virtuous habits with streak analytics.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-lg font-bold font-mono text-purple-600 dark:text-purple-400">Sunnah</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Routines</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">Streak</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Consistency</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/habits')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-950/40 transition-all cursor-pointer active:scale-[0.98]"
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
      icon: <Repeat className="w-5 h-5" />,
      content: (
        <div className="h-full w-full flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#088ac1] dark:text-[#3dc3f3] uppercase tracking-widest">
              Divine Remembrance
            </span>
            <h3 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight mt-0.5">
              Daily Awrad & Tasbih
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Tactile digital counter with acoustic clicks, vibrations, preloaded Dhikr, and custom target counters.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-lg font-bold font-mono text-[#088ac1] dark:text-[#3dc3f3]">33 / 100</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Step Counter</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-lg font-bold font-mono text-[#088ac1] dark:text-[#3dc3f3]">Audio</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Tick Feedback</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/awrad')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#088ac1] to-[#076e9d] hover:from-[#3dc3f3] hover:to-[#088ac1] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#088ac1]/30 transition-all cursor-pointer active:scale-[0.98]"
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
      icon: <CheckSquare className="w-5 h-5" />,
      content: (
        <div className="h-full w-full flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              Action Items
            </span>
            <h3 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight mt-0.5">
              Priority Tasks
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Organize daily, work, and Islamic tasks with interactive clock due times, urgency filters, and reminders.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">Clock</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Time Picker</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">Urgent</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Priority Sort</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-950/40 transition-all cursor-pointer active:scale-[0.98]"
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
      color: '#3b82f6',
      icon: <BarChart3 className="w-5 h-5" />,
      content: (
        <div className="h-full w-full flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              Visual Analytics
            </span>
            <h3 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight mt-0.5">
              Annual Consistency
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              365-day GitHub-style consistency heatmaps, Salah category distributions, and monthly growth trends.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">365d</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Heatmap</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-lg font-bold font-mono text-[#088ac1] dark:text-[#3dc3f3]">Charts</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Breakdown</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/analytics')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-950/40 transition-all cursor-pointer active:scale-[0.98]"
          >
            Explore Analytics <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ),
    },
    {
      id: 'missed',
      label: 'Reflect & Realign',
      to: '/missed',
      color: '#f43f5e',
      icon: <RotateCcw className="w-5 h-5" />,
      content: (
        <div className="h-full w-full flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">
              Qada & Reflection
            </span>
            <h3 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight mt-0.5">
              Reflect & Realign
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Track and fulfill missed prayers (Qada), calculate makeup plans, and cultivate renewed spiritual focus.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">Qada</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Recovery</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-lg font-bold font-mono text-[#088ac1] dark:text-[#3dc3f3]">Tawbah</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Renewal</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/missed')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-950/40 transition-all cursor-pointer active:scale-[0.98]"
          >
            Open Qada Tracker <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      to: '/settings',
      color: '#ec4899',
      icon: <Settings className="w-5 h-5" />,
      content: (
        <div className="h-full w-full flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-widest">
              Preferences
            </span>
            <h3 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight mt-0.5">
              Settings & Location
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Live GPS auto-detection, Hijri lunar date +/-2 day adjustments, prayer calculation methods, and notification sounds.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-lg font-bold font-mono text-pink-600 dark:text-pink-400">GPS</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Location</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 flex flex-col items-center text-center">
              <span className="text-lg font-bold font-mono text-[#088ac1] dark:text-[#3dc3f3]">+/- 2d</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Hijri Sync</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-pink-950/40 transition-all cursor-pointer active:scale-[0.98]"
          >
            Open Settings <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <aside className="hidden md:flex flex-col items-center justify-between w-20 lg:w-22 bg-white/95 dark:bg-[#060e14]/95 border-r border-slate-200 dark:border-slate-800/80 shrink-0 h-screen sticky top-0 z-40 select-none py-4 px-2">
      {/* Brand Header */}
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#3dc3f3] to-[#076e9d] flex items-center justify-center text-white shadow-md shadow-[#088ac1]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Islamic Daily OS"
        >
          <span className="text-2xl font-bold font-arabic">☪</span>
        </button>
      </div>

      {/* MelonUI Liquid Dimensional Navigation Component as the Native Sidebar */}
      <div className="my-auto w-full flex items-center justify-center">
        <LiquidDimensionalNav
          items={navItems}
          activeId={activeNavId}
          primaryColor="#1eb4eb"
          accentColor="#3dc3f3"
          bg="transparent"
          borderColor="rgba(255, 255, 255, 0.08)"
          onNavigate={(path) => navigate(path)}
          className="!min-h-0 !h-auto !p-0 !rounded-none !bg-transparent"
        />
      </div>

      {/* Footer: Theme Switcher & Profile Avatar */}
      <div className="flex flex-col items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 w-full">
        {/* Quick Theme Switch */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Profile Avatar with Logout */}
        <div className="relative group">
          <div className="w-9 h-9 rounded-xl bg-[#e1f3fd] dark:bg-[#1eb4eb]/20 border border-[#bce8fb] dark:border-[#1eb4eb]/30 text-[#076e9d] dark:text-[#3dc3f3] flex items-center justify-center font-bold text-xs cursor-pointer shadow-xs">
            {(profile?.display_name || user?.username || 'U')[0].toUpperCase()}
          </div>

          {/* Quick Logout Popover on Hover */}
          <div className="absolute left-full bottom-0 ml-2 hidden group-hover:flex items-center gap-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 whitespace-nowrap">
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {profile?.display_name || user?.username || 'User'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {profile?.city || 'Mecca'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-rose-500 hover:text-white hover:bg-rose-600 transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
