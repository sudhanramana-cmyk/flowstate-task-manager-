import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  CheckCircle2,
  Folder,
  Zap,
  Timer,
  CalendarDays,
  Sparkles,
  BarChart3,
  X,
  ArrowRight,
} from 'lucide-react';
import { useTask } from '../context/TaskContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Task, Project } from '../types/index.ts';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask: (task: Task) => void;
  onNavigate: (view: string) => void;
  onOpenTaskModal: () => void;
  onOpenDayPlanner: () => void;
  onOpenFocusMode: (task?: Task) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTask,
  onNavigate,
  onOpenTaskModal,
  onOpenDayPlanner,
  onOpenFocusMode,
}) => {
  const { tasks, projects, setActiveProjectId } = useTask();
  const { updateEnergyLevel } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter tasks & projects
  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  // Quick action commands
  const quickActions = [
    { id: 'new-task', label: 'Create new task', icon: Sparkles, action: () => { onClose(); onOpenTaskModal(); } },
    { id: 'plan-day', label: 'Smart Day Planner (Plan My Day)', icon: CalendarDays, action: () => { onClose(); onOpenDayPlanner(); } },
    { id: 'focus-mode', label: 'Enter Pomodoro Focus Mode', icon: Timer, action: () => { onClose(); onOpenFocusMode(); } },
    { id: 'view-analytics', label: 'Open Productivity Analytics', icon: BarChart3, action: () => { onClose(); onNavigate('analytics'); } },
    { id: 'view-deps', label: 'Open Dependency Map', icon: Zap, action: () => { onClose(); onNavigate('dependencies'); } },
    { id: 'energy-high', label: 'Set Energy: ⚡ High Energy', icon: Zap, action: () => { updateEnergyLevel('high'); onClose(); } },
    { id: 'energy-low', label: 'Set Energy: 🪫 Low Energy', icon: Zap, action: () => { updateEnergyLevel('low'); onClose(); } },
  ].filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl glass-panel rounded-2xl shadow-2xl border border-white/[0.12] overflow-hidden text-slate-100">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08]">
          <Search className="w-5 h-5 text-indigo-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a task, project, command, or hotkey..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick Actions
              </div>
              <div className="space-y-0.5">
                {quickActions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.id}
                      onClick={act.action}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-indigo-600/20 hover:text-white transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300" />
                        <span>{act.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-indigo-400 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tasks */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Tasks
              </div>
              <div className="space-y-0.5">
                {filteredTasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onClose();
                      onSelectTask(t);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/[0.06] transition-all group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <CheckCircle2
                        className={`w-4 h-4 flex-shrink-0 ${
                          t.status === 'completed' ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{t.title}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-400 font-mono">
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Workspaces & Projects
              </div>
              <div className="space-y-0.5">
                {filteredProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveProjectId(p.id);
                      onNavigate('tasks');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/[0.06] transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: p.color || '#6366f1' }}
                      />
                      <span>{p.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{p.progress}%</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {quickActions.length === 0 && filteredTasks.length === 0 && filteredProjects.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching tasks or actions found for "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>Navigation: <kbd className="px-1 py-0.5 rounded bg-white/[0.06] font-mono">Esc</kbd> to close</span>
          </div>
          <span>FlowState OmniSearch</span>
        </div>
      </div>
    </div>
  );
};
