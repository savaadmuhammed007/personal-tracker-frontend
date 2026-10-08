import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BellRing,
  Clock,
  Infinity as InfinityIcon,
  Globe,
  Sun,
  X,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../common/UIComponents';

const NOTIFICATION_OPTIONS = [
  {
    id: 'forever',
    title: 'Forever (Always On)',
    badge: 'Recommended',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    description: 'Continuous prayer Adhan calls, morning/evening Adhkar, and habit reminders on this device.',
    icon: InfinityIcon,
    iconColor: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
  },
  {
    id: '1_hour',
    title: 'For 1 Hour',
    badge: '60 Mins',
    badgeColor: 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    description: 'Temporary reminder session for the next 1 hour. Ideal for study, focus, or Tahajjud sessions.',
    icon: Clock,
    iconColor: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60',
  },
  {
    id: 'close_site',
    title: 'Until I Close Site',
    badge: 'Session Only',
    badgeColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    description: 'Alerts stay active only while this browser tab or app is open. Automatically stops when you exit.',
    icon: Globe,
    iconColor: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
  },
  {
    id: 'prayer_only',
    title: 'Prayer Times Only',
    badge: '5 Prayers',
    badgeColor: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    description: 'Silences all generic habit check-ins and only sounds for the 5 daily obligatory prayers.',
    icon: Sun,
    iconColor: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60',
  },
];

export const NotificationPermissionModal = ({ isOpen, onClose }) => {
  const {
    notificationPermission,
    notificationDuration,
    enableNotificationsWithDuration,
  } = useNotification();

  const [selectedDuration, setSelectedDuration] = useState(notificationDuration || 'forever');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const isAlreadyGranted = notificationPermission === 'granted';

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await enableNotificationsWithDuration(selectedDuration);
      onClose();
    } catch (err) {
      console.error('Failed to enable notifications:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const modalNode = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4 pointer-events-auto overscroll-contain">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity -z-10 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Sheet Container - Centered card */}
      <div className="relative w-full max-w-lg max-h-[86vh] max-h-[86dvh] min-h-0 flex flex-col p-5 sm:p-6 text-left align-middle transition-all bg-white dark:bg-islamic-card-dark rounded-3xl shadow-2xl border border-islamic-border-light dark:border-islamic-border-dark z-20 animate-scale-up overflow-hidden">

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-3.5 mb-5 pr-8">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#088ac1] to-[#044c6d] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#088ac1]/30">
              <BellRing className="w-5 h-5 animate-wiggle" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                {isAlreadyGranted ? 'Notification Alert Preferences' : 'Enable Device Notifications'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Choose how long you want to receive timely Adhan and Dhikr alerts on this device.
              </p>
            </div>
          </div>

          {/* Radio Options List */}
          <div className="space-y-2.5 mb-6">
            {NOTIFICATION_OPTIONS.map((opt) => {
              const isSelected = selectedDuration === opt.id;
              const Icon = opt.icon;

              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedDuration(opt.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    isSelected
                      ? 'border-[#088ac1] dark:border-[#3dc3f3] bg-[#e1f3fd]/60 dark:bg-[#0f4d6b]/30 ring-2 ring-[#088ac1]/20 dark:ring-[#3dc3f3]/20 shadow-xs'
                      : 'border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Custom Radio Button */}
                  <div className="pt-0.5 shrink-0">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-[#088ac1] dark:border-[#3dc3f3] bg-[#088ac1] dark:bg-[#3dc3f3]'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white dark:text-slate-900 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Icon & Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded-lg border ${opt.iconColor}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-[#076e9d] dark:text-[#81d7f8]' : 'text-slate-900 dark:text-white'}`}>
                          {opt.title}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${opt.badgeColor}`}>
                        {opt.badge}
                      </span>
                    </div>

                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed pl-7">
                      {opt.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Explanatory security/privacy banner */}
          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 flex items-center gap-2.5 text-[11px] mb-5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Alerts are generated directly on your device based on calculated astronomical prayer times.</span>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              Not Now
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleConfirm}
              disabled={submitting}
              className="w-full sm:w-auto shadow-md shadow-[#088ac1]/25"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </span>
              ) : isAlreadyGranted ? (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Save Preference
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <BellRing className="w-4 h-4" />
                  Enable Notifications
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};
