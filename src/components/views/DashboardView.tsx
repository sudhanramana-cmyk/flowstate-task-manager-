import React from 'react';
import {
  Flame,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Sparkles,
  ArrowRight,
  Play,
  Lock,
  GitBranch,
  Timer,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useTask } from '../../context/TaskContext.tsx';
import { Task } from '../../types/index.ts';

interface DashboardViewProps {
  onOpenTaskModal: () => void;
  onSelectTask: (task: Task) => void;
  onOpenFocusMode: (task?: Task) => void;
  onOpenDayPlanner: () => void;
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenTaskModal,
  onSelectTask,
  onOpenFocusMode,
  onOpenDayPlanner,
  onNavigate,
}) => {
  const { user } = useAuth();
  const { tasks, nextAction, projects } = useTask();

  // Dynamic greeting based on current local hour
  const currentHour = new Date().getHours();
  let greetingTime = 'Good morning';
  if (currentHour >= 12 && currentHour < 17) greetingTime = 'Good afternoon';
  else if (currentHour >= 17) greetingTime = 'Good evening';

  const todayStr = new Date().toISOString().split('T')[0];

  const todayTasks = tasks.filter((t) => t.dueDate === todayStr || t.status === 'in_progress');
  const highPriorityCount = todayTasks.filter((t) => t.priority === 'urgent' || t.priority === 'high').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const remainingCount = tasks.filter((t) => t.status !== 'completed').length;
  const overdueCount = tasks.filter((t) => t.status !== 'completed' && t.dueDate && t.dueDate < todayStr).length;

  // Workload estimation: sum of estimated durations of incomplete tasks due today or tomorrow
  const upcomingEstimatedMinutes = tasks
    .filter((t) => t.status !== 'completed')
    .reduce((acc, t) => acc + (t.estimatedDuration || 30), 0);
  const upcomingEstimatedHours = Math.round((upcomingEstimatedMinutes / 60) * 10) / 10;

  // Daily Momentum calculation
  const total = tasks.length;
  const momentumRate = total > 0 ? Math.min(100, Math.round((completedCount / total) * 100) + 15) : 78;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Dynamic Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {greetingTime}, {user?.name || 'Commander'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            You have <strong className="text-indigo-300">{todayTasks.length} tasks</strong> active today.{' '}
            {highPriorityCount > 0 && <span><strong className="text-amber-300">{highPriorityCount} are high priority</strong>. </span>}
            {overdueCount > 0 && <span className="text-rose-300 font-semibold">{overdueCount} require urgent resolution.</span>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDayPlanner}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-200 transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Plan My Day</span>
          </button>
          <button
            onClick={onOpenTaskModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <span>+ Quick Task</span>
          </button>
        </div>
      </div>

      {/* Workload Warning Notice */}
      {upcomingEstimatedHours >= 4 && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Workload Horizon:</strong> You have approximately{' '}
              <strong className="text-amber-100 font-mono">{upcomingEstimatedHours} hours</strong> of estimated focus work queued.
            </span>
          </div>
          <button
            onClick={onOpenDayPlanner}
            className="text-[11px] underline font-bold text-amber-300 hover:text-white"
          >
            Schedule Day
          </button>
        </div>
      )}

      {/* Top Grid: TODAY'S MOMENTUM & WHAT SHOULD I DO NEXT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* TODAY'S MOMENTUM (Large Circular Indicator) */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-panel glow-indigo border border-indigo-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">
              TODAY'S MOMENTUM
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-1">
              <Flame className="w-3 h-3" /> {user?.streak || 3} Day Streak
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
            {/* Big Radial Progress */}
            <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  className="stroke-white/[0.06]"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  className="stroke-indigo-500 transition-all duration-1000"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 58}
                  strokeDashoffset={2 * Math.PI * 58 * (1 - momentumRate / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-white font-mono">{momentumRate}%</span>
                <span className="text-[10px] text-slate-400 font-medium">Velocity</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 w-full text-xs">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[10px] text-slate-400 block mb-0.5">Completed</span>
                <span className="text-base font-bold text-emerald-400 font-mono">{completedCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[10px] text-slate-400 block mb-0.5">Remaining</span>
                <span className="text-base font-bold text-slate-200 font-mono">{remainingCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[10px] text-slate-400 block mb-0.5">Overdue</span>
                <span className="text-base font-bold text-rose-400 font-mono">{overdueCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[10px] text-slate-400 block mb-0.5">Deep Focus</span>
                <span className="text-base font-bold text-violet-400 font-mono">
                  {Math.round(((user?.focusMinutes || 120) / 60) * 10) / 10}h
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
            <span>Productivity Style: <strong>{user?.productivityStyle}</strong></span>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>View Analytics</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* SIGNATURE FEATURE 1: WHAT SHOULD I DO NEXT? */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-violet-950/60 border border-indigo-500/40 glow-violet shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-xs font-bold text-amber-300 tracking-wider uppercase">
                  WHAT SHOULD I DO NEXT?
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Heuristic Synthesis Engine
              </span>
            </div>

            {nextAction?.hasAction && nextAction.task ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        nextAction.task.priority === 'urgent'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {nextAction.task.priority} Priority
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.05] text-slate-300">
                      ⚡ {nextAction.task.energyRequired} energy match
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {nextAction.task.title}
                  </h2>
                </div>

                {/* AI / Heuristic Reason explanation */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs text-indigo-200 leading-relaxed">
                  <span className="font-semibold text-white">Why this now: </span>
                  "{nextAction.reason}"
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Est. {nextAction.task.estimatedDuration} mins</span>
                  </span>
                  {nextAction.task.blocksCount && nextAction.task.blocksCount > 0 && (
                    <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                      <GitBranch className="w-3.5 h-3.5 text-amber-400" />
                      <span>Unblocks {nextAction.task.blocksCount} downstream items</span>
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                {nextAction?.message || 'No pending tasks found. All caught up!'}
              </div>
            )}
          </div>

          <div className="pt-6 mt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              Confidence Score: <strong>{nextAction?.score ? `${Math.min(99, nextAction.score)}%` : '96%'}</strong>
            </span>

            {nextAction?.task && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectTask(nextAction.task!)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => onOpenFocusMode(nextAction.task!)}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition-all cursor-pointer active:scale-95"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>START TASK NOW</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active High-Priority Tasks Strip */}
      <div className="p-6 rounded-3xl glass-panel border border-white/[0.08]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Active Operational Queue</h3>
          </div>
          <button
            onClick={() => onNavigate('tasks')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Open Full Kanban</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {tasks.slice(0, 3).map((t) => {
            const project = projects.find((p) => p.id === t.projectId);
            return (
              <div
                key={t.id}
                onClick={() => onSelectTask(t)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                  t.isBlocked
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${project?.color || '#6366f1'}20`,
                      color: project?.color || '#6366f1',
                    }}
                  >
                    {project?.name || 'Project'}
                  </span>
                  {t.isBlocked && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400">
                      <Lock className="w-3 h-3" /> Blocked
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1">
                  {t.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
                  {t.description || 'No description provided.'}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/[0.06]">
                  <span>Status: <strong className="text-slate-300 capitalize">{t.status.replace('_', ' ')}</strong></span>
                  <span>{t.estimatedDuration}m</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
