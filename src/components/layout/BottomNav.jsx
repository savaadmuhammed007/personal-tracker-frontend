import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CheckCircle2,
  Repeat,
  CheckSquare,
  CalendarDays,
  BarChart3,
  RotateCcw,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const BottomNav = () => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Close the sheet when changing location
  useEffect(() => {
    setIsMoreOpen(false);
  }, [location.pathname]);

  // Handle ESC key to close sheet
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsMoreOpen(false);
    };
    if (isMoreOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMoreOpen]);

  // Primary 4 tabs that fit effortlessly on every mobile device width without horizontal scroll
  const primaryTabs = [
    { to: '/', label: 'Home', icon: LayoutDashboard },
    { to: '/habits', label: 'Habits', icon: CheckCircle2 },
    { to: '/quran', label: 'Qur’an', icon: BookOpen },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },

  ];

  // Secondary items accessible via the sleek "More" sheet
  const secondaryItems = [
    {
      to: '/awrad',
      label: 'Awrad',
      desc: 'Daily Awrad',
      icon: Repeat,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
    },
    {
      to: '/calendar',
      label: 'Calendar',
      desc: 'Prayers & streaks',
      icon: CalendarDays,
      color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60',
    },
    {
      to: '/analytics',
      label: 'Analytics',
      desc: 'Charts & statistics',
      icon: BarChart3,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
    },
    {
      to: '/missed',
      label: 'Missed Prayers',
      desc: 'Qada tracker & logs',
      icon: RotateCcw,
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60',
    },
    {
      to: '/settings',
      label: 'Settings',
      desc: 'Preferences & prayer calc',
      icon: Settings,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60',
    },
  ];

  // Check if current route is in the secondary list
  const isSecondaryActive = secondaryItems.some((item) =>
    item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
  );

  const handleLogout = () => {
    setIsMoreOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Primary Fixed Bottom Navigation Bar (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#071924]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-[#0f344a]/80 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.45)] select-none">
        <nav
          aria-label="Mobile Navigation"
          className="max-w-md mx-auto grid grid-cols-5 items-center px-1.5 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]"
        >
          {primaryTabs.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-90 group relative ${isActive
                    ? 'text-[#088ac1] dark:text-[#3dc3f3]'
                    : 'text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`relative flex items-center justify-center w-9 h-7 rounded-xl transition-colors duration-200 ${isActive
                        ? 'bg-[#e1f3fd] dark:bg-[#0c4059]/60 shadow-xs'
                        : 'group-hover:bg-slate-100/60 dark:group-hover:bg-slate-800/40'
                        }`}
                    >
                      <Icon
                        className={`w-5 h-5 transition-transform duration-200 ${isActive
                          ? 'stroke-[2.3] text-[#088ac1] dark:text-[#3dc3f3] scale-105'
                          : 'stroke-[1.8]'
                          }`}
                      />
                      {isActive && (
                        <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-[#088ac1] dark:bg-[#3dc3f3]" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] sm:text-[11px] tracking-tight mt-0.5 whitespace-nowrap leading-tight transition-colors ${isActive
                        ? 'font-bold text-[#076e9d] dark:text-[#3dc3f3]'
                        : 'font-medium text-slate-500 dark:text-slate-400'
                        }`}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}

          {/* 5th Tab: "More" Menu Button */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            aria-expanded={isMoreOpen}
            aria-label="More options"
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-90 group relative cursor-pointer ${isSecondaryActive || isMoreOpen
              ? 'text-[#088ac1] dark:text-[#3dc3f3]'
              : 'text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
          >
            <div
              className={`relative flex items-center justify-center w-9 h-7 rounded-xl transition-colors duration-200 ${isSecondaryActive || isMoreOpen
                ? 'bg-[#e1f3fd] dark:bg-[#0c4059]/60 shadow-xs'
                : 'group-hover:bg-slate-100/60 dark:group-hover:bg-slate-800/40'
                }`}
            >
              <Menu
                className={`w-5 h-5 transition-transform duration-200 ${isSecondaryActive || isMoreOpen
                  ? 'stroke-[2.3] text-[#088ac1] dark:text-[#3dc3f3] scale-105'
                  : 'stroke-[1.8]'
                  }`}
              />
              {isSecondaryActive && (
                <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-[#088ac1] dark:bg-[#3dc3f3]" />
              )}
            </div>
            <span
              className={`text-[10px] sm:text-[11px] tracking-tight mt-0.5 whitespace-nowrap leading-tight transition-colors ${isSecondaryActive || isMoreOpen
                ? 'font-bold text-[#076e9d] dark:text-[#3dc3f3]'
                : 'font-medium text-slate-500 dark:text-slate-400'
                }`}
            >
              More
            </span>
          </button>
        </nav>
      </div>

      {/* "More" Bottom Sheet Overlay */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setIsMoreOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-up Sheet */}
          <div className="relative z-10 w-full max-w-lg mx-auto bg-white dark:bg-[#081a26] border-t border-slate-200 dark:border-[#0f3b54] rounded-t-3xl shadow-2xl p-4 sm:p-5 pb-[max(1.2rem,env(safe-area-inset-bottom,0px))] animate-slide-up">
            {/* Grab Handle */}
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600 mx-auto mb-3.5" />

            {/* Header: User Profile & Quick Actions */}
            <div className="flex items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#088ac1] to-[#3dc3f3] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  {(profile?.display_name || user?.username || 'U')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {profile?.display_name || user?.username || 'Believer'}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-400 truncate">
                    {profile?.city || 'Mecca'}
                  </p>
                </div>
              </div>

              {/* Theme Toggle & Close */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Toggle Light/Dark Theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsMoreOpen(false)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Close Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Navigation Items Grid */}
            <div className="space-y-1.5 mb-4">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider px-1">
                More Sections
              </span>
              <div className="grid grid-cols-1 gap-1.5 pt-1">
                {secondaryItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.to);
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMoreOpen(false)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-150 active:scale-[0.98] ${isActive
                        ? 'bg-[#e1f3fd]/80 dark:bg-[#0a354c]/70 border-[#81d7f8]/80 dark:border-[#1eb4eb]/50 text-[#076e9d] dark:text-[#3dc3f3]'
                        : 'bg-slate-50/70 dark:bg-[#0b2130]/60 border-slate-200/70 dark:border-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#0f2a3d]'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border ${item.color}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold leading-tight">{item.label}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-400 leading-tight">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 ${isActive
                          ? 'text-[#088ac1] dark:text-[#3dc3f3]'
                          : 'text-slate-400 dark:text-slate-400'
                          }`}
                      />
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 font-semibold text-xs hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-pointer active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
