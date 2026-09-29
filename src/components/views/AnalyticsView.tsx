import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Target,
  Brain,
} from 'lucide-react';
import { AnalyticsData } from '../../types/index.ts';
import { api } from '../../lib/api.ts';

export const AnalyticsView: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAnalytics();
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Computing productivity metrics & activity vectors...
      </div>
    );
  }

  const { scoreBreakdown } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Productivity Intelligence</h1>
        <p className="text-xs text-slate-400 mt-1">
          Algorithmic breakdown of your velocity, consistency, focus density, and delivery habits.
        </p>
      </div>

      {/* Top Hero Card: Dynamic Composite Productivity Score */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel glow-indigo border border-indigo-500/20 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">
            PRODUCTIVITY SCORE
          </span>
          <div className="text-6xl sm:text-7xl font-black text-white font-mono tracking-tight bg-gradient-to-r from-indigo-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
            {data.productivityScore}
          </div>
          <span className="text-xs text-slate-400 mt-2 font-medium">
            Elite Flow State Rating
          </span>
        </div>

        {/* 4 Pillars Breakdown */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Planning</span>
            <span className="text-2xl font-bold text-indigo-400 font-mono">{scoreBreakdown.planning}%</span>
            <p className="text-[10px] text-slate-400 mt-1">Estimates & due dates calibrated</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Consistency</span>
            <span className="text-2xl font-bold text-violet-400 font-mono">{scoreBreakdown.consistency}%</span>
            <p className="text-[10px] text-slate-400 mt-1">{data.streak}-day streak multiplier</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Completion</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono">{scoreBreakdown.completion}%</span>
            <p className="text-[10px] text-slate-400 mt-1">{data.completedCount} delivered items</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Focus</span>
            <span className="text-2xl font-bold text-cyan-400 font-mono">{scoreBreakdown.focus}%</span>
            <p className="text-[10px] text-slate-400 mt-1">{data.totalFocusHours}h deep work logged</p>
          </div>
        </div>
      </div>

      {/* GitHub-Style 30-Day Activity Heatmap */}
      <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              30-Day Activity Heatmap
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span>Less</span>
            <span className="w-3 h-3 rounded bg-white/[0.04]" />
            <span className="w-3 h-3 rounded bg-indigo-950" />
            <span className="w-3 h-3 rounded bg-indigo-700" />
            <span className="w-3 h-3 rounded bg-indigo-500" />
            <span className="w-3 h-3 rounded bg-indigo-300" />
            <span>More</span>
          </div>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 pt-2">
          {data.heatmap.map((cell, idx) => {
            const levelColors = [
              'bg-white/[0.04] border-white/[0.04]',
              'bg-indigo-950 border-indigo-900',
              'bg-indigo-800 border-indigo-700',
              'bg-indigo-600 border-indigo-500',
              'bg-indigo-400 border-indigo-300 shadow-sm shadow-indigo-400/30',
            ];
            return (
              <div
                key={idx}
                className={`h-9 rounded-xl border flex flex-col items-center justify-center p-1 transition-transform hover:scale-110 cursor-pointer ${levelColors[cell.level]}`}
                title={`${cell.date}: ${cell.count} productivity actions logged`}
              >
                <span className="text-[10px] font-mono text-white/80 font-semibold">{cell.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Grid: Weekly Velocity & Priority Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Velocity */}
        <div className="p-6 rounded-3xl glass-panel border border-white/[0.08]">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-400" />
            <span>Weekly Velocity & Focus</span>
          </h3>

          <div className="space-y-3">
            {data.weeklyTrend.map((day) => (
              <div key={day.day} className="flex items-center gap-3 text-xs">
                <span className="w-8 font-mono text-slate-400 font-semibold">{day.day}</span>
                <div className="flex-1 h-3 bg-white/[0.05] rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                    style={{ width: `${Math.min(100, day.completed * 12)}%` }}
                  />
                </div>
                <span className="font-mono text-indigo-300 font-bold w-12 text-right">
                  {day.completed} done
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="p-6 rounded-3xl glass-panel border border-white/[0.08]">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Workload by Priority</span>
          </h3>

          <div className="space-y-4">
            {[
              { label: 'Urgent', count: data.priorityDistribution.urgent, color: 'bg-rose-500', text: 'text-rose-400' },
              { label: 'High', count: data.priorityDistribution.high, color: 'bg-amber-500', text: 'text-amber-400' },
              { label: 'Medium', count: data.priorityDistribution.medium, color: 'bg-indigo-500', text: 'text-indigo-400' },
              { label: 'Low', count: data.priorityDistribution.low, color: 'bg-emerald-500', text: 'text-emerald-400' },
            ].map((p) => {
              const pct = data.totalTasks > 0 ? Math.round((p.count / data.totalTasks) * 100) : 0;
              return (
                <div key={p.label} className="text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`font-semibold ${p.text}`}>{p.label}</span>
                    <span className="font-mono text-slate-300">{p.count} tasks ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className={`h-full ${p.color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
