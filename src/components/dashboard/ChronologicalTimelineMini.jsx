import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Repeat, Sun, CheckSquare, Sparkles } from 'lucide-react';
import { timelineApi } from '../../api/timelineApi';

export const ChronologicalTimelineMini = ({ refreshTrigger }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const res = await timelineApi.getTimeline();
        const list = Array.isArray(res.data?.timeline) ? res.data.timeline : Array.isArray(res.data) ? res.data : [];
        setTimeline(list);
      } catch (e) {
        console.error('Failed to load timeline:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, [refreshTrigger]);

  const typeIcons = {
    prayer: Sun,
    habit: CheckCircle2,
    awrad: Repeat,
    task: CheckSquare,
  };

  const formatItemTime = (item) => {
    if (item.timestamp) {
      try {
        const dt = new Date(item.timestamp);
        if (!isNaN(dt.getTime())) {
          return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      } catch (e) {}
    }
    return item.time_formatted || item.time || '';
  };

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Today's Chronological Activity Timeline
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time timestamped sequence of all prayers, dhikr, habits, and completed tasks
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{timeline.length} Activities Logged</span>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400">Loading timeline...</div>
      ) : timeline.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 bg-islamic-subtle-light/40 dark:bg-islamic-subtle-dark/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          No activities completed today yet. Begin with your first prayer or habit!
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {timeline.map((item, idx) => {
            const Icon = typeIcons[item.type] || CheckCircle2;
            const timeDisplay = formatItemTime(item);

            return (
              <div key={item.id || idx} className="relative flex items-start gap-4">
                {/* Timeline node icon dot */}
                <div className="absolute -left-6 mt-0.5 w-5 h-5 rounded-full bg-[#088ac1] dark:bg-[#1eb4eb] text-white flex items-center justify-center ring-4 ring-white dark:ring-islamic-card-dark shadow-xs">
                  <Icon className="w-3 h-3" />
                </div>

                {/* Content */}
                <div className="flex-1 p-3.5 rounded-2xl bg-islamic-subtle-light/50 dark:bg-islamic-subtle-dark/50 border border-islamic-border-light/60 dark:border-islamic-border-dark/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#e1f3fd] dark:bg-[#0f4d6b]/60 text-[#076e9d] dark:text-[#81d7f8] border border-[#bce8fb] dark:border-[#0b5d81]">
                        ✓ Done
                      </span>
                    </div>
                    {item.subtitle && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="text-xs font-bold text-slate-600 dark:text-slate-300 font-mono shrink-0">
                    {timeDisplay}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

