import React from 'react';
import {
  LayoutDashboard,
  KanbanSquare,
  CalendarDays,
  Timer,
  Hourglass,
  BarChart3,
  Trophy,
  Settings,
  FolderPlus,
  Zap,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import { useTask } from '../context/TaskContext.tsx';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenProjectModal: () => void;
  onOpenDayPlanner: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onOpenProjectModal,
  onOpenDayPlanner,
}) => {
  const { projects, activeProjectId, setActiveProjectId } = useTask();

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks & Workflows', icon: KanbanSquare },
    { id: 'dependencies', label: 'Dependency Map', icon: GitBranch },
    { id: 'day-planner', label: 'Smart Day Planner', icon: CalendarDays },
    { id: 'focus', label: 'Focus Mode', icon: Timer, badge: 'Pomodoro' },
    { id: 'time-capsule', label: 'Time Capsule', icon: Hourglass },
    { id: 'analytics', label: 'Productivity Analytics', icon: BarChart3 },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-white/[0.08] h-screen sticky top-0 py-5 px-3 z-20 select-none overflow-y-auto">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-base font-bold bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            FlowState
          </span>
          <span className="block text-[10px] text-slate-400 font-medium tracking-wide uppercase">
            Productivity OS
          </span>
        </div>
      </div>

      {/* Primary Navigation */}
      <div className="space-y-1 mb-6">
        <div className="px-3 pb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-indigo-600/20 text-white border border-indigo-500/30 shadow-md shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Plan My Day Quick Action Banner */}
      <div className="px-2 mb-6">
        <button
          onClick={onOpenDayPlanner}
          className="w-full relative group overflow-hidden rounded-2xl p-3 bg-gradient-to-br from-indigo-950/60 to-violet-950/60 border border-indigo-500/30 text-left hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg"
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="text-xs font-bold text-white">Plan My Day</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            AI-modeled schedule tuned to your energy level.
          </p>
        </button>
      </div>

      {/* Projects Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          <span>Active Projects</span>
          <button
            onClick={onOpenProjectModal}
            className="p-1 rounded hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
            title="Create Project"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-1.5 pr-1 flex-1">
          {projects.map((proj) => {
            const isSelected = activeProjectId === proj.id;
            return (
              <button
                key={proj.id}
                onClick={() => {
                  setActiveProjectId(isSelected ? null : proj.id);
                  onNavigate('tasks');
                }}
                className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-indigo-600/15 border-indigo-500/40 text-white'
                    : 'bg-white/[0.02] border-white/[0.05] text-slate-300 hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: proj.color || '#6366f1' }}
                    />
                    <span className="text-xs font-semibold truncate">{proj.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{proj.progress}%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${proj.progress}%`,
                      backgroundColor: proj.color || '#6366f1',
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
