import React, { useState, useEffect, useCallback } from 'react';
import {
  Repeat,
  Plus,
  Minus,
  RotateCcw,
  Sparkles,
  Check,
  Volume2,
  VolumeX,
  Smartphone,
  Trash2,
} from 'lucide-react';
import { awradApi } from '../api/awradApi';
import { AddAwradModal } from '../components/modals/AddAwradModal';
import { useNotification } from '../context/NotificationContext';
import { Button, Badge } from '../components/common/UIComponents';
import { ProgressRing } from '../components/common/ProgressRing';

export const AwradPage = () => {
  const [awradList, setAwradList] = useState([]);
  const [activeAwrad, setActiveAwrad] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [soundActive, setSoundActive] = useState(true);
  const [stepSize, setStepSize] = useState(1);
  const [loading, setLoading] = useState(true);
  const { showToast, playChime, triggerHaptic } = useNotification();

  const fetchAwrad = useCallback(async () => {
    setLoading(true);
    try {
      const res = await awradApi.getAwrad();
      const list = res.data || [];
      setAwradList(list);
      if (list.length > 0) {
        // Keep current active or default to first
        setActiveAwrad((prev) => {
          if (!prev) return list[0];
          const found = list.find((x) => x.id === prev.id);
          return found || list[0];
        });
      }
    } catch (e) {
      console.error('Failed to load awrad list:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAwrad();
  }, [fetchAwrad]);

  const handleTap = async () => {
    if (!activeAwrad) return;
    if (soundActive) playChime('tap');
    triggerHaptic(25);

    try {
      const res = await awradApi.increment(activeAwrad.id, { delta: stepSize });
      const updatedCount = res.data.current_count;
      const targetCount = activeAwrad.target_count;

      setActiveAwrad((prev) => ({
        ...prev,
        today_count: updatedCount,
        is_completed: res.data.is_completed,
        progress_percentage: res.data.progress_percentage,
      }));

      // Update in awradList state
      setAwradList((prev) =>
        prev.map((item) =>
          item.id === activeAwrad.id
            ? {
                ...item,
                today_count: updatedCount,
                is_completed: res.data.is_completed,
                progress_percentage: res.data.progress_percentage,
              }
            : item
        )
      );

      if (res.data.is_completed && updatedCount - stepSize < targetCount) {
        showToast('Target Achieved', `Alhamdulillah! Completed ${targetCount}x ${activeAwrad.name}`, 'success');
      }
    } catch (e) {
      console.error('Failed to increment:', e);
    }
  };

  const handleReset = async (id, name) => {
    try {
      await awradApi.reset(id);
      fetchAwrad();
      showToast('Counter Reset', `Reset counter for ${name}`, 'neutral');
    } catch (e) {
      console.error('Failed to reset:', e);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" Dhikr counter?`)) return;
    try {
      await awradApi.deleteAwrad(id);
      showToast('Deleted', `Removed ${name}`, 'neutral');
      fetchAwrad();
    } catch (e) {
      console.error('Failed to delete awrad:', e);
    }
  };

  const activePct = activeAwrad ? activeAwrad.progress_percentage || 0 : 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Repeat className="w-6 h-6 text-islamic-primary-600" />
            Digital Tasbih & Daily Awrad
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Count remembrance with target tracking, audio feedback, and persistent logs
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsAddModalOpen(true)}
        >
          Create Custom Dhikr
        </Button>
      </div>

      {/* Main Focus: Digital Tasbih Counter Studio */}
      {activeAwrad && (
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-10 shadow-soft-lg flex flex-col items-center text-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 w-full h-full bg-gradient-to-b from-islamic-primary-500/5 to-transparent pointer-events-none" />

          {/* Top Controls: Sound toggle, Step selector, Reset */}
          <div className="w-full flex items-center justify-between max-w-md mb-4 sm:mb-6 z-10 gap-2">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              {[1, 10, 33].map((step) => (
                <button
                  key={step}
                  onClick={() => setStepSize(step)}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg transition-colors text-[11px] sm:text-xs ${
                    stepSize === step
                      ? 'bg-islamic-primary-700 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  +{step}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setSoundActive((s) => !s)}
                className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-islamic-card-dark text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Toggle Click Audio"
              >
                {soundActive ? <Volume2 className="w-4 h-4 text-islamic-primary-600 dark:text-islamic-primary-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              </button>

              <button
                onClick={() => handleReset(activeAwrad.id, activeAwrad.name)}
                className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-islamic-card-dark text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Reset Counter to 0"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Dhikr Title & Arabic Calligraphy */}
          <div className="max-w-lg mb-4 sm:mb-6 z-10 space-y-1 sm:space-y-2">
            <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
              {activeAwrad.name}
            </h3>

            {activeAwrad.arabic_text && (
              <p className="font-arabic text-2xl sm:text-3xl md:text-4xl text-islamic-primary-700 dark:text-islamic-primary-400 font-bold py-1 sm:py-2">
                {activeAwrad.arabic_text}
              </p>
            )}

            {activeAwrad.transliteration && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic">
                "{activeAwrad.transliteration}"
              </p>
            )}
          </div>

          {/* Giant Tactile Tap Button with SVG Progress Ring */}
          <div className="relative my-2 sm:my-4 z-10 flex items-center justify-center">
            <ProgressRing
              radius={96}
              stroke={10}
              progress={activePct}
              strokeColor="#1eb4eb"
              bgColor="rgba(30, 180, 235, 0.15)"
            >
              <button
                onClick={handleTap}
                className="w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-[#088ac1] to-[#0a3147] text-white shadow-picton-glow active:scale-95 transition-transform duration-100 flex flex-col items-center justify-center select-none border-4 border-[#3dc3f3]/40"
              >
                <span className="text-3xl sm:text-4xl md:text-5xl font-black font-mono tracking-tight">
                  {activeAwrad.today_count}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-[#bce8fb] uppercase tracking-widest mt-0.5">
                  / {activeAwrad.target_count}
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#81d7f8]/90 mt-0.5 font-medium">
                  TAP TO COUNT
                </span>
              </button>
            </ProgressRing>
          </div>

          {/* Target & Status Footer */}
          <div className="mt-3 sm:mt-4 z-10 flex items-center gap-3">
            {activeAwrad.is_completed ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#bce8fb]/60 dark:bg-[#0f4d6b]/80 text-[#076e9d] dark:text-[#81d7f8] font-bold text-xs sm:text-sm border border-[#81d7f8]/40 dark:border-[#0b5d81]">
                <Check className="w-4 h-4 stroke-[3]" /> Target Reached (100%)
              </span>
            ) : (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {activeAwrad.target_count - activeAwrad.today_count} counts remaining to reach target
              </span>
            )}
          </div>
        </div>
      )}

      {/* Grid of all Dhikr counters */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          All Daily Awrad & Dhikr Collection
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {awradList.map((item) => {
            const isSelected = activeAwrad?.id === item.id;
            const isDone = item.is_completed;
            const pct = item.progress_percentage || 0;

            return (
              <div
                key={item.id}
                onClick={() => setActiveAwrad(item)}
                className={`cursor-pointer rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'ring-2 ring-islamic-primary-500 bg-islamic-primary-50/70 dark:bg-islamic-primary-950/30 border-islamic-primary-400 shadow-soft'
                    : isDone
                    ? 'bg-[#e1f3fd]/50 dark:bg-[#0f4d6b]/20 border-[#bce8fb] dark:border-[#0b5d81]'
                    : 'glass-card hover:shadow-soft border-islamic-border-light dark:border-islamic-border-dark'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-1">
                      {isDone && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#076e9d] dark:text-[#81d7f8] px-2 py-0.5 rounded-full bg-[#bce8fb]/60 dark:bg-[#0f4d6b]/60 border border-[#81d7f8]/30">
                          <Check className="w-3 h-3 stroke-[3]" /> Done
                        </span>
                      )}
                      {item.category === 'custom' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id, item.name);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Custom Dhikr"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {item.arabic_text && (
                    <p className="font-arabic text-xl text-islamic-primary-700 dark:text-islamic-primary-400 font-bold my-1 text-right">
                      {item.arabic_text}
                    </p>
                  )}

                  {item.transliteration && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic truncate mb-2">
                      {item.transliteration}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {item.today_count} <span className="text-xs text-slate-400 font-medium">/ {item.target_count}</span>
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {pct}%
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-islamic-primary-600 dark:bg-islamic-primary-500 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AddAwradModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaved={fetchAwrad}
      />
    </div>
  );
};
