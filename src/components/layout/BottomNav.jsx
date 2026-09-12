import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CheckCircle2,
  Repeat,
  CheckSquare,
  CalendarDays,
  BarChart3,
} from 'lucide-react';

export const BottomNav = () => {
  const items = [
    { to: '/', label: 'Home', icon: LayoutDashboard },
    { to: '/quran', label: 'Qur’an', icon: BookOpen },
    { to: '/habits', label: 'Habits', icon: CheckCircle2 },
    { to: '/awrad', label: 'Awrad', icon: Repeat },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/calendar', label: 'Calendar', icon: CalendarDays },
    { to: '/analytics', label: 'Stats', icon: BarChart3 },
  ];

  return (
    <div className="md:hidden fixed bottom-[calc(0.85rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 flex justify-center px-3 pointer-events-none">
      <nav
        aria-label="Mobile Navigation"
        className="pointer-events-auto max-w-full overflow-x-auto scrollbar-none bg-white/95 dark:bg-[#091f2c]/95 backdrop-blur-xl border border-slate-200/90 dark:border-[#0b5d81]/60 rounded-full p-1.5 sm:p-2 flex items-center justify-between gap-1 sm:gap-1.5 shadow-[0_12px_36px_rgba(8,138,193,0.18)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.65)] select-none transition-all"
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center rounded-full transition-all duration-200 active:scale-95 shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-b from-[#e1f3fd] to-[#bce8fb]/70 dark:from-[#0f4d6b]/60 dark:to-[#088ac1]/30 text-[#088ac1] dark:text-[#3dc3f3] border border-[#81d7f8]/60 dark:border-[#1eb4eb]/40 px-3.5 sm:px-4 py-1.5 shadow-sm min-w-[58px] sm:min-w-[64px]'
                    : 'text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 px-2.5 sm:px-3 py-1.5 min-w-[48px] sm:min-w-[54px]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative flex items-center justify-center">
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isActive
                          ? 'stroke-[2.4] text-[#088ac1] dark:text-[#3dc3f3] scale-105 drop-shadow-[0_2px_8px_rgba(8,138,193,0.35)]'
                          : 'stroke-[1.8] text-slate-400 dark:text-slate-400'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap leading-tight transition-colors ${
                      isActive
                        ? 'font-extrabold text-[#076e9d] dark:text-[#81d7f8]'
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
      </nav>
    </div>
  );
};
