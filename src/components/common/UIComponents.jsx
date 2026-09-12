import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const variants = {
    primary: 'bg-islamic-primary-700 hover:bg-islamic-primary-800 text-white shadow-sm focus:ring-islamic-primary-500',
    gold: 'bg-islamic-gold-600 hover:bg-islamic-gold-700 text-white shadow-sm focus:ring-islamic-gold-500',
    secondary: 'bg-islamic-subtle-light dark:bg-islamic-subtle-dark text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 focus:ring-slate-400',
    outline: 'border border-islamic-border-light dark:border-islamic-border-dark hover:bg-islamic-subtle-light dark:hover:bg-islamic-subtle-dark text-slate-700 dark:text-slate-200',
    ghost: 'text-slate-600 dark:text-slate-300 hover:bg-islamic-subtle-light dark:hover:bg-islamic-subtle-dark',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </button>
  );
};

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-3 sm:px-4 py-4 text-center flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal Box */}
        <div
          className={`inline-block w-full ${maxWidth} max-h-[92vh] overflow-y-auto p-4 sm:p-6 my-auto text-left align-middle transition-all transform bg-white dark:bg-islamic-card-dark rounded-2xl sm:rounded-3xl shadow-2xl border border-islamic-border-light dark:border-islamic-border-dark relative z-10 animate-slide-up`}
        >
          <div className="flex items-center justify-between pb-3.5 border-b border-islamic-border-light/60 dark:border-islamic-border-dark/60 sticky top-0 bg-white/95 dark:bg-islamic-card-dark/95 backdrop-blur-sm z-20">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-islamic-subtle-light dark:hover:bg-islamic-subtle-dark transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    emerald: 'bg-[#e1f3fd] dark:bg-[#0f4d6b]/60 text-[#076e9d] dark:text-[#81d7f8] border-[#bce8fb] dark:border-[#0b5d81]',
    picton: 'bg-[#e1f3fd] dark:bg-[#0f4d6b]/60 text-[#076e9d] dark:text-[#81d7f8] border-[#bce8fb] dark:border-[#0b5d81]',
    gold: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    rose: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-islamic-border-light dark:border-islamic-border-dark bg-islamic-subtle-light/40 dark:bg-islamic-subtle-dark/40 ${className}`}>
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-islamic-primary-100 dark:bg-islamic-primary-950/80 text-islamic-primary-700 dark:text-islamic-primary-400 flex items-center justify-center mb-4">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
        {title}
      </h4>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'picton' }) => {
  const colorMap = {
    picton: 'bg-[#e1f3fd] dark:bg-[#0f4d6b]/40 text-[#088ac1] dark:text-[#3dc3f3] border-[#bce8fb] dark:border-[#0b5d81]',
    emerald: 'bg-[#e1f3fd] dark:bg-[#0f4d6b]/40 text-[#088ac1] dark:text-[#3dc3f3] border-[#bce8fb] dark:border-[#0b5d81]',
    gold: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50',
    rose: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50',
  };

  return (
    <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
          {title}
        </p>
        <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
          {value}
        </p>
        {subtitle && (
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>
      {Icon && (
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border ${colorMap[color]}`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      )}
    </div>
  );
};
