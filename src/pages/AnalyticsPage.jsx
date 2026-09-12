import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Flame,
  CheckCircle2,
  Sun,
  Clock,
  BookOpen,
  Repeat,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { analyticsApi } from '../api/analyticsApi';
import { StatCard } from '../components/common/UIComponents';

export const AnalyticsPage = () => {
  const [summary, setSummary] = useState(null);
  const [prayerStats, setPrayerStats] = useState([]);
  const [habitStats, setHabitStats] = useState([]);
  const [timeStats, setTimeStats] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllAnalytics = async () => {
      try {
        const [sumRes, prayerRes, habitRes, timeRes, heatRes] = await Promise.all([
          analyticsApi.getSummary(),
          analyticsApi.getPrayers(30),
          analyticsApi.getHabits(),
          analyticsApi.getActivityTime(),
          analyticsApi.getHeatmap(),
        ]);
        setSummary(sumRes.data);
        setPrayerStats(prayerRes.data || []);
        setHabitStats(habitRes.data || []);
        setTimeStats(timeRes.data || []);
        setHeatmapData(heatRes.data || []);
      } catch (e) {
        console.error('Failed to load analytics:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAllAnalytics();
  }, []);

  const heatmapColors = {
    0: 'bg-slate-100 dark:bg-slate-800 border-slate-200/50 dark:border-slate-700/50',
    1: 'bg-[#bce8fb] dark:bg-[#0f4d6b]/60 border-[#81d7f8] dark:border-[#0b5d81]',
    2: 'bg-[#81d7f8] dark:bg-[#076e9d]/80 border-[#3dc3f3] dark:border-[#088ac1]',
    3: 'bg-[#1eb4eb] dark:bg-[#1eb4eb] border-[#088ac1] dark:border-[#3dc3f3]',
    4: 'bg-[#076e9d] dark:bg-[#3dc3f3] border-[#0b5d81] dark:border-[#81d7f8]',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-islamic-primary-600" />
          Analytics & Consistency Insights
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Visual metrics on prayer punctuality, habit trends, time analysis, and 365-day consistency
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Activities"
          value={summary?.total_activities || 0}
          subtitle="Timestamped records"
          icon={CheckCircle2}
          color="picton"
        />
        <StatCard
          title="30-Day Consistency"
          value={`${summary?.completion_percentage || 0}%`}
          subtitle="Overall completion"
          icon={TrendingUp}
          color="gold"
        />
        <StatCard
          title="Qur'an Pages"
          value={summary?.total_quran_pages || 0}
          subtitle="Total recited"
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Prayers Completed"
          value={summary?.total_prayers || 0}
          subtitle="Salah performed"
          icon={Sun}
          color="picton"
        />
      </div>

      {/* 365-Day Consistency Contribution Heatmap (GitHub Style) */}
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
              <span>365-Day Consistency Heatmap</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daily habit and prayer density over the past 52 weeks
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 self-start sm:self-auto">
            <span>Less</span>
            <span className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800 border" />
            <span className="w-3 h-3 rounded-sm bg-[#bce8fb] dark:bg-[#0f4d6b]/60" />
            <span className="w-3 h-3 rounded-sm bg-[#81d7f8] dark:bg-[#076e9d]/80" />
            <span className="w-3 h-3 rounded-sm bg-[#1eb4eb] dark:bg-[#1eb4eb]" />
            <span className="w-3 h-3 rounded-sm bg-[#076e9d] dark:bg-[#3dc3f3]" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid Scroll Container */}
        <div className="overflow-x-auto pb-2 scrollbar-none -mx-2 sm:mx-0 px-2 sm:px-0">
          <div className="grid grid-rows-7 grid-flow-col gap-1.5 min-w-[720px]">
            {heatmapData.map((cell) => (
              <div
                key={cell.date}
                title={`${cell.date}: ${cell.count} activities`}
                className={`w-3.5 h-3.5 rounded-sm border transition-transform hover:scale-125 cursor-pointer ${
                  heatmapColors[cell.level] || heatmapColors[0]
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section: Prayer Comparison & Time of Day Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 1. Prayer Completion Rate Bar Chart */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
              <span>Prayer Completion Rates (30 Days)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 sm:mb-6 mt-0.5">
              Consistency percentage across the 5 daily prayers
            </p>
          </div>

          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prayerStats}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="prayer" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Completion Rate']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="rate" fill="#088ac1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Time of Day Activity Distribution */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#088ac1] dark:text-[#3dc3f3] shrink-0" />
              <span>Time-of-Day Activity Breakdown</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 sm:mb-6 mt-0.5">
              When you are most active in prayer and remembrance
            </p>
          </div>

          <div className="space-y-3.5 sm:space-y-4">
            {timeStats.map((slot) => (
              <div key={slot.time_slot}>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">
                    {slot.time_slot} <span className="text-[10px] text-slate-400 font-normal">({slot.range})</span>
                  </span>
                  <span className="text-slate-900 dark:text-white font-extrabold">
                    {slot.percentage}% ({slot.count})
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${slot.percentage}%`,
                      backgroundColor: slot.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Habit Consistency Ranking */}
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-soft">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
          Habits & Routines Performance
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 sm:mb-6">
          30-day completion frequency and all-time logs
        </p>

        <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0 scrollbar-none">
          <table className="w-full text-left text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-islamic-border-light/80 dark:border-islamic-border-dark/80 text-[11px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                <th className="py-3 px-3 sm:px-4">Habit</th>
                <th className="py-3 px-3 sm:px-4">Category</th>
                <th className="py-3 px-3 sm:px-4">Last 30 Days</th>
                <th className="py-3 px-3 sm:px-4">All-Time Completed</th>
                <th className="py-3 px-3 sm:px-4">30-Day Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-islamic-border-light/50 dark:divide-islamic-border-dark/50">
              {habitStats.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                  <td className="py-3 px-3 sm:px-4 font-bold text-slate-900 dark:text-white">
                    {h.name}
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {h.category}
                  </td>
                  <td className="py-3 px-3 sm:px-4 font-bold text-slate-800 dark:text-slate-200">
                    {h.completed_last_30} / 30 days
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-slate-600 dark:text-slate-300">
                    {h.total_completed} times
                  </td>
                  <td className="py-3 px-3 sm:px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#e1f3fd] dark:bg-[#0f4d6b]/60 text-[#076e9d] dark:text-[#81d7f8] border border-[#bce8fb] dark:border-[#0b5d81]">
                      {h.completion_rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
