import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  Coffee,
  CheckCircle2,
  Play,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { DayScheduleItem, Task } from '../types/index.ts';
import { api } from '../lib/api.ts';
import { useTask } from '../context/TaskContext.tsx';

interface DayPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTaskInFocus: (task: Task) => void;
}

export const DayPlannerModal: React.FC<DayPlannerModalProps> = ({
  isOpen,
  onClose,
  onStartTaskInFocus,
}) => {
  const { tasks } = useTask();
  const [schedule, setSchedule] = useState<DayScheduleItem[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadPlanner();
    }
  }, [isOpen]);

  const loadPlanner = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDayPlanner();
      setSchedule(data.schedule);
      setTotalHours(data.totalPlannedHours);
    } catch (err) {
      console.error('Failed to generate day plan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/[0.1] text-slate-100 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            FlowState Intelligence
          </span>
        </div>

        <h2 className="text-2xl font-black text-white mb-1">Plan My Day</h2>
        <p className="text-xs text-slate-400 mb-6">
          Optimized chronological time-blocks synthesized from your priorities, estimated durations, and cognitive rest intervals.
        </p>

        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Synthesizing time-blocked trajectory...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs">
              <span className="text-indigo-200">
                Total Planned Effort:{' '}
                <strong className="text-white font-mono">{totalHours} hours</strong>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-semibold">
                Tuned to Energy Level
              </span>
            </div>

            <div className="relative pl-6 space-y-3 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/[0.08]">
              {schedule.map((item, idx) => {
                const isBreak = item.type === 'break';
                const associatedTask = item.taskId ? tasks.find((t) => t.id === item.taskId) : null;

                return (
                  <div
                    key={idx}
                    className={`relative p-3.5 rounded-2xl border transition-all ${
                      isBreak
                        ? 'bg-white/[0.02] border-dashed border-white/[0.08] text-slate-400'
                        : 'bg-white/[0.04] border-white/[0.08] text-slate-200 hover:border-indigo-500/40'
                    }`}
                  >
                    <span
                      className={`absolute -left-6 top-4 w-2.5 h-2.5 rounded-full ring-4 ring-[#090a10] ${
                        isBreak ? 'bg-amber-400' : 'bg-indigo-400'
                      }`}
                    />

                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-indigo-400 font-bold">
                            {item.time} — {item.endTime}
                          </span>
                          <span className="text-[10px] text-slate-400">({item.duration}m)</span>
                        </div>
                        <p className={`text-xs font-semibold ${isBreak ? 'text-slate-400 italic' : 'text-white'}`}>
                          {item.title}
                        </p>
                      </div>

                      {!isBreak && associatedTask && (
                        <button
                          onClick={() => {
                            onClose();
                            onStartTaskInFocus(associatedTask);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-xs font-bold text-indigo-300 transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Start</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 transition-colors"
              >
                Close Schedule
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
