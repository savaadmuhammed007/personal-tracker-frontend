import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Header } from './Header';

export const Layout = () => {
  return (
    <div className="flex min-h-screen bg-islamic-bg-light dark:bg-islamic-bg-dark text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-28 sm:pb-32 md:pb-8">
        <Header />
        <main className="flex-1 px-3 sm:px-6 md:px-8 py-4 sm:py-6 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
