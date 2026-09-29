import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Unlock,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Zap,
  MessageSquare,
  History,
  Timer,
  Trash2,
  Send,
  AlertTriangle,
  GitBranch,
  User as UserIcon,
} from 'lucide-react';
import { Task, Comment, ActivityLog, TaskStatus, Priority } from '../types/index.ts';
import { useTask } from '../context/TaskContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../lib/api.ts';

interface TaskDetailDrawerProps {
  task: Task | null;
  onClose: () => void;
  onOpenFocusMode: (task: Task) => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  onClose,
  onOpenFocusMode,
}) => {
  const { user } = useAuth();
  const {
    updateTaskStatus,
    toggleSubtask,
    deleteTask,
    activeViewingTask,
    notifyViewingTask,
    projects,
  } = useTask();

  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity'>('details');
  const [comments, setComments] = useState<Comment[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (task) {
      notifyViewingTask(task.id);
      loadCommentsAndActivity(task.id);
    }
    return () => {
      notifyViewingTask(null);
    };
  }, [task?.id]);

  const loadCommentsAndActivity = async (taskId: number) => {
    try {
      const [fetchedComments, allLogs] = await Promise.all([
        api.getComments(taskId),
        api.getActivityLogs(),
      ]);
      setComments(fetchedComments);
      setActivity(allLogs.filter((l) => l.taskId === taskId));
    } catch (err) {
      console.error('Failed to load drawer data:', err);
    }
  };

  if (!task) return null;

  const project = projects.find((p) => p.id === task.projectId);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSendingComment(true);
    try {
      const added = await api.addComment(task.id, newComment.trim());
      setComments([...comments, added]);
      setNewComment('');
      // Reload activity
      const allLogs = await api.getActivityLogs();
      setActivity(allLogs.filter((l) => l.taskId === task.id));
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setIsSendingComment(false);
    }
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    onClose();
  };

  const isBlocked = task.isBlocked;
  const isViewingThis = activeViewingTask && activeViewingTask.taskId === task.id;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl h-full glass-panel border-l border-white/[0.1] shadow-2xl flex flex-col text-slate-100 overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            {project && (
              <span
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold truncate flex items-center gap-1.5"
                style={{
                  backgroundColor: `${project.color}20`,
                  color: project.color,
                  border: `1px solid ${project.color}40`,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: project.color }} />
                {project.name}
              </span>
            )}
            <span className="text-xs text-slate-400 font-mono">TASK-{task.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenFocusMode(task)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-xs font-semibold text-indigo-200 transition-colors"
              title="Start Pomodoro Focus Mode"
            >
              <Timer className="w-3.5 h-3.5 text-indigo-400" />
              <span>Focus Now</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real-time viewer banner */}
        {isViewingThis && activeViewingTask.userName !== user?.name && (
          <div className="px-5 py-2 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              <strong>{activeViewingTask.userName}</strong> is also viewing this task right now.
            </span>
          </div>
        )}

        {/* Blocked Alert Banner (Signature Feature) */}
        {isBlocked && (
          <div className="px-5 py-3 bg-rose-500/15 border-b border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5 animate-pulse-glow">
            <Lock className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-300 uppercase tracking-wide text-[10px]">
                🔒 BLOCKED BY PREREQUISITE
              </p>
              <p className="text-[11px] text-rose-200 mt-0.5">
                Waiting for:{' '}
                <strong>
                  {task.prerequisites
                    ?.filter((p) => !p.isCompleted)
                    .map((p) => p.title)
                    .join(', ') || 'Upstream task'}
                </strong>
                . Complete the prerequisite to unlock this task.
              </p>
            </div>
          </div>
        )}

        {/* Downstream Blocker Warning */}
        {task.blocksCount && task.blocksCount > 0 && task.status !== 'completed' && (
          <div className="px-5 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>
              This task is a critical blocker: it holds up{' '}
              <strong>{task.blocksCount} downstream task{task.blocksCount > 1 ? 's' : ''}</strong>.
            </span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-white/[0.08] px-5 bg-white/[0.01]">
          {[
            { id: 'details', label: 'Overview', icon: Zap },
            { id: 'comments', label: `Comments (${comments.length})`, icon: MessageSquare },
            { id: 'activity', label: 'Activity Timeline', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {activeTab === 'details' && (
            <>
              {/* Title & Status */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed ✓</option>
                  </select>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      task.priority === 'urgent'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : task.priority === 'high'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}
                  >
                    {task.priority} Priority
                  </span>
                </div>

                <h1 className="text-xl font-bold text-white leading-snug">{task.title}</h1>
              </div>

              {/* Description */}
              {task.description && (
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {task.description}
                </div>
              )}

              {/* Metadata Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <span className="block text-[10px] text-slate-400 mb-1">Due Date</span>
                  <div className="flex items-center gap-1.5 font-medium text-slate-200">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{task.dueDate || 'No date set'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <span className="block text-[10px] text-slate-400 mb-1">Est. Duration</span>
                  <div className="flex items-center gap-1.5 font-medium text-slate-200">
                    <Clock className="w-3.5 h-3.5 text-violet-400" />
                    <span>{task.estimatedDuration} mins</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <span className="block text-[10px] text-slate-400 mb-1">Energy Match</span>
                  <div className="flex items-center gap-1.5 font-medium text-slate-200">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span className="capitalize">{task.energyRequired} Energy</span>
                  </div>
                </div>
              </div>

              {/* Subtasks Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Subtasks Checklist ({task.subtasks?.filter((s) => s.isCompleted).length || 0}/
                    {task.subtasks?.length || 0})
                  </h3>
                </div>

                {task.subtasks && task.subtasks.length > 0 ? (
                  <div className="space-y-1.5">
                    {task.subtasks.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => toggleSubtask(st.id)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                          st.isCompleted
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-slate-400 line-through'
                            : 'bg-white/[0.02] border-white/[0.06] text-slate-200 hover:bg-white/[0.05]'
                        }`}
                      >
                        {st.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        )}
                        <span>{st.title}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No subtasks defined.</p>
                )}
              </div>

              {/* Prerequisites Chain Visualizer */}
              {task.prerequisites && task.prerequisites.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-violet-400" />
                    <span>Dependency Requirements</span>
                  </h3>
                  <div className="space-y-2">
                    {task.prerequisites.map((p) => (
                      <div
                        key={p.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                          p.isCompleted
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {p.isCompleted ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          <span>{p.title}</span>
                        </div>
                        <span className="font-semibold text-[11px]">
                          {p.isCompleted ? 'Resolved ✓' : 'Blocking'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delete Task Section */}
              <div className="pt-6 border-t border-white/[0.08]">
                {showDeleteConfirm ? (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between">
                    <span>Permanently delete this task?</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDelete}
                        className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-2 py-1 text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 text-xs text-rose-400/80 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Task</span>
                  </button>
                )}
              </div>
            </>
          )}

          {activeTab === 'comments' && (
            <div className="flex flex-col h-full space-y-4">
              <div className="flex-1 space-y-3">
                {comments.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No comments yet. Start the conversation!
                  </div>
                ) : (
                  comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={c.userAvatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${c.userName}`}
                            alt={c.userName}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="font-semibold text-slate-200">{c.userName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed pl-7">{c.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="pt-2 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment or update..."
                  className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500 text-xs text-white placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSendingComment}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Timeline History
              </h3>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/[0.08]">
                {activity.length === 0 ? (
                  <p className="text-xs text-slate-400">No activity recorded yet.</p>
                ) : (
                  activity.map((act) => (
                    <div key={act.id} className="relative text-xs">
                      <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-400 ring-4 ring-[#090a10]" />
                      <p className="font-medium text-slate-200">{act.details}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(act.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
