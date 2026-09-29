import React, { useState } from 'react';
import {
  KanbanSquare,
  ListFilter,
  CalendarDays,
  GitBranch,
  Plus,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  AlertCircle,
  Folder,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Task, TaskStatus, Priority } from '../../types/index.ts';
import { useTask } from '../../context/TaskContext.tsx';

interface TasksViewProps {
  initialTab?: 'kanban' | 'list' | 'timeline' | 'dependencies';
  onSelectTask: (task: Task) => void;
  onOpenTaskModal: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  initialTab = 'kanban',
  onSelectTask,
  onOpenTaskModal,
}) => {
  const {
    tasks,
    projects,
    activeProjectId,
    updateTaskStatus,
    searchQuery,
    selectedPriority,
    setSelectedPriority,
  } = useTask();

  const [activeTab, setActiveTab] = useState<'kanban' | 'list' | 'timeline' | 'dependencies'>(initialTab);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);

  // Filter tasks by active project, search query, priority
  const filteredTasks = tasks.filter((t) => {
    if (activeProjectId && t.projectId !== activeProjectId) return false;
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    }
    return true;
  });

  const columns: Array<{ id: TaskStatus; label: string; color: string }> = [
    { id: 'backlog', label: 'BACKLOG', color: 'border-slate-500/30' },
    { id: 'planned', label: 'PLANNED', color: 'border-blue-500/30' },
    { id: 'in_progress', label: 'IN PROGRESS', color: 'border-amber-500/30' },
    { id: 'review', label: 'REVIEW', color: 'border-violet-500/30' },
    { id: 'completed', label: 'COMPLETED', color: 'border-emerald-500/30' },
  ];

  // Drag and Drop handlers
  const handleDragStart = (taskId: number) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (status: TaskStatus) => {
    if (draggedTaskId) {
      await updateTaskStatus(draggedTaskId, status);
      setDraggedTaskId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* View Switcher & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.08] w-fit">
          {[
            { id: 'kanban', label: 'Kanban', icon: KanbanSquare },
            { id: 'list', label: 'List', icon: ListFilter },
            { id: 'timeline', label: 'Timeline', icon: CalendarDays },
            { id: 'dependencies', label: 'Dependency Map', icon: GitBranch },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/30 text-white border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {/* Priority filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">🔴 Urgent</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>

          <button
            onClick={onOpenTaskModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* 1. KANBAN VIEW */}
      {activeTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4 min-w-[900px]">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(col.id)}
                className={`p-3.5 rounded-3xl glass-panel border ${col.color} flex flex-col min-h-[550px]`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
                  <span className="text-[11px] font-black tracking-wider text-slate-300">
                    {col.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.06] text-slate-400 font-mono">
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {colTasks.map((t) => {
                    const proj = projects.find((p) => p.id === t.projectId);
                    return (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={() => handleDragStart(t.id)}
                        onClick={() => onSelectTask(t)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-grab active:cursor-grabbing hover:-translate-y-0.5 group shadow-lg ${
                          t.isBlocked
                            ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
                            : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-indigo-500/40'
                        }`}
                      >
                        {/* Project Badge & Blocked State */}
                        <div className="flex items-center justify-between mb-2">
                          {proj && (
                            <span
                              className="px-2 py-0.5 rounded text-[9px] font-bold uppercase truncate max-w-[120px]"
                              style={{
                                backgroundColor: `${proj.color}20`,
                                color: proj.color,
                              }}
                            >
                              {proj.name}
                            </span>
                          )}

                          {t.isBlocked && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[9px] font-bold flex items-center gap-1 border border-rose-500/30 animate-pulse">
                              <Lock className="w-2.5 h-2.5" /> BLOCKED
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug mb-1.5">
                          {t.title}
                        </h4>

                        {/* Blocked reason detail if blocked */}
                        {t.isBlocked && t.prerequisites && (
                          <div className="mb-2 p-1.5 rounded-lg bg-rose-900/30 border border-rose-500/20 text-[10px] text-rose-300">
                            Waiting for:{' '}
                            <strong className="underline">
                              {t.prerequisites.filter((p) => !p.isCompleted)[0]?.title || 'Prerequisite'}
                            </strong>
                          </div>
                        )}

                        {/* Subtasks Progress if any */}
                        {t.subtasks && t.subtasks.length > 0 && (
                          <div className="mb-2.5">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                              <span>Subtasks</span>
                              <span className="font-mono">
                                {t.subtasks.filter((s) => s.isCompleted).length}/{t.subtasks.length}
                              </span>
                            </div>
                            <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{
                                  width: `${
                                    (t.subtasks.filter((s) => s.isCompleted).length / t.subtasks.length) * 100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Footer tags & metadata */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px] text-slate-400">
                          <span
                            className={`px-1.5 py-0.5 rounded font-semibold uppercase ${
                              t.priority === 'urgent'
                                ? 'text-rose-400 bg-rose-500/10'
                                : t.priority === 'high'
                                ? 'text-amber-400 bg-amber-500/10'
                                : 'text-slate-400'
                            }`}
                          >
                            {t.priority}
                          </span>
                          <span className="font-mono">{t.estimatedDuration}m</span>
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-white/[0.06] rounded-2xl">
                      Empty column
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. LIST VIEW */}
      {activeTab === 'list' && (
        <div className="glass-panel rounded-3xl border border-white/[0.08] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/[0.03] text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/[0.08]">
                <tr>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Task Title</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Dependencies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredTasks.map((t) => {
                  const proj = projects.find((p) => p.id === t.projectId);
                  return (
                    <tr
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            t.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : t.status === 'in_progress'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-white/[0.06] text-slate-300'
                          }`}
                        >
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        <div className="flex items-center gap-2">
                          {t.isBlocked && <Lock className="w-3.5 h-3.5 text-rose-400" />}
                          <span>{t.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {proj && (
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: proj.color }} />
                            <span>{proj.name}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 capitalize font-medium">{t.priority}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{t.dueDate || '—'}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{t.estimatedDuration}m</td>
                      <td className="py-3 px-4">
                        {t.isBlocked ? (
                          <span className="text-rose-400 font-bold text-[11px]">Blocked</span>
                        ) : t.blocksCount && t.blocksCount > 0 ? (
                          <span className="text-amber-400 font-semibold text-[11px]">Blocks {t.blocksCount}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. TIMELINE VIEW */}
      {activeTab === 'timeline' && (
        <div className="glass-panel rounded-3xl p-6 border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Chronological Task Horizons
            </h3>
            <span className="text-xs text-slate-400 font-mono">Next 14 Days</span>
          </div>

          <div className="space-y-3">
            {filteredTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTask(t)}
                className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/40 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2 text-xs">
                  <div className="flex items-center gap-2">
                    {t.isBlocked ? <Lock className="w-3.5 h-3.5 text-rose-400" /> : <Clock className="w-3.5 h-3.5 text-indigo-400" />}
                    <span className="font-bold text-white">{t.title}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Target: {t.dueDate || 'Upcoming'}
                  </span>
                </div>
                {/* Visual Gantt Bar */}
                <div className="w-full h-3 bg-white/[0.06] rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-full ${
                      t.status === 'completed'
                        ? 'bg-emerald-500'
                        : t.isBlocked
                        ? 'bg-rose-500/60'
                        : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(25, t.estimatedDuration * 1.2))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SIGNATURE FEATURE 8: DEPENDENCY MAP */}
      {activeTab === 'dependencies' && (
        <div className="glass-panel rounded-3xl p-6 border border-white/[0.08] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div>
              <h3 className="text-sm font-bold text-white">Visual Dependency Directed Graph</h3>
              <p className="text-xs text-slate-400">
                Prerequisite tasks flow left-to-right. Downstream tasks stay locked until prerequisites reach completed state.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-500/10 border border-violet-500/30 text-violet-300">
              DAG Visualizer
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-2xl bg-[#0a0d17] border border-white/[0.06]">
            {filteredTasks.map((t) => {
              const isBlocked = t.isBlocked;
              const isResolved = t.status === 'completed';

              return (
                <div
                  key={t.id}
                  onClick={() => onSelectTask(t)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isBlocked
                      ? 'bg-rose-950/20 border-rose-500/40 ring-1 ring-rose-500/20'
                      : isResolved
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-white/[0.03] border-white/[0.08] hover:border-indigo-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-slate-400 font-mono">NODE #{t.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isResolved
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : isBlocked
                          ? 'bg-rose-500/20 text-rose-300 animate-pulse'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {isResolved ? 'Resolved ✓' : isBlocked ? 'Locked 🔒' : 'Actionable ⚡'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white mb-2 leading-tight">{t.title}</h4>

                  {t.prerequisites && t.prerequisites.length > 0 && (
                    <div className="pt-2 border-t border-white/[0.06] text-[10px] text-slate-400">
                      <span>Depends on: </span>
                      <strong className="text-slate-200">
                        {t.prerequisites.map((p) => p.title).join(', ')}
                      </strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
