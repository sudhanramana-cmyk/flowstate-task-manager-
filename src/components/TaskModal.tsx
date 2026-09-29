import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Zap,
  Tag,
  Folder,
  Layers,
  Link2,
  AlertCircle,
} from 'lucide-react';
import { useTask } from '../context/TaskContext.tsx';
import { Priority, TaskStatus, EnergyLevel } from '../types/index.ts';
import { api } from '../lib/api.ts';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStatus?: TaskStatus;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  defaultStatus = 'planned',
}) => {
  const { projects, tasks, createTask, activeProjectId } = useTask();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<number>(activeProjectId || (projects[0]?.id || 1));
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('17:00');
  const [estimatedDuration, setEstimatedDuration] = useState(45);
  const [energyRequired, setEnergyRequired] = useState<EnergyLevel>('medium');
  const [assigneeName, setAssigneeName] = useState('You');
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [dependsOnTaskIds, setDependsOnTaskIds] = useState<number[]>([]);

  const [isDecomposing, setIsDecomposing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setProjectId(activeProjectId || (projects[0]?.id || 1));
      setPriority('medium');
      setStatus(defaultStatus);
      setDueDate(new Date().toISOString().split('T')[0]);
      setEstimatedDuration(45);
      setEnergyRequired('medium');
      setSubtasks([]);
      setTags([]);
      setDependsOnTaskIds([]);
      setError(null);
    }
  }, [isOpen, activeProjectId, projects, defaultStatus]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, newSubtask.trim()]);
      setNewSubtask('');
    }
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  // Smart Task Decomposition Feature
  const handleDecompose = async () => {
    if (!title.trim()) {
      setError('Please provide a task title first to decompose it');
      return;
    }
    setIsDecomposing(true);
    setError(null);
    try {
      const res = await api.decomposeTask({ title, description });
      if (res.subtasks && res.subtasks.length > 0) {
        setSubtasks([...subtasks, ...res.subtasks]);
      }
    } catch (err: any) {
      setError('Failed to break down task');
    } finally {
      setIsDecomposing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    if (!projectId) {
      setError('Please select a project');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createTask({
        projectId,
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        dueDate: dueDate || null,
        dueTime: dueTime || null,
        estimatedDuration: Number(estimatedDuration) || 30,
        energyRequired,
        assigneeName,
        subtasks,
        tagNames: tags,
        dependsOnTaskIds,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
            Smart Creator
          </span>
          <span className="text-xs text-slate-400">Add to Workspace</span>
        </div>

        <h2 className="text-2xl font-black text-white mb-6">Create New Task</h2>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title & Smart Decompose Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Task Title</label>
              <button
                type="button"
                onClick={handleDecompose}
                disabled={isDecomposing}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors cursor-pointer group"
                title="Automatically generate subtasks for this objective"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
                <span>{isDecomposing ? 'Deconstructing...' : '✨ Break this task down'}</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build API Authentication & Session Security"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500 focus:outline-none text-sm text-white placeholder-slate-400 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description & Acceptance Criteria</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key specifications, dependencies, or links..."
              className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500 focus:outline-none text-xs text-white placeholder-slate-400 transition-colors resize-none"
            />
          </div>

          {/* Project, Priority, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Workspace Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#121624] border border-white/[0.08] focus:border-indigo-500 text-xs text-white focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-xl bg-[#121624] border border-white/[0.08] focus:border-indigo-500 text-xs text-white focus:outline-none"
              >
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Workflow Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 rounded-xl bg-[#121624] border border-white/[0.08] focus:border-indigo-500 text-xs text-white focus:outline-none"
              >
                <option value="backlog">Backlog</option>
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Due Date, Estimated Duration, Energy Required */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#121624] border border-white/[0.08] focus:border-indigo-500 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Est. Duration (mins)</label>
              <input
                type="number"
                min={5}
                max={480}
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#121624] border border-white/[0.08] focus:border-indigo-500 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Energy Required</label>
              <select
                value={energyRequired}
                onChange={(e) => setEnergyRequired(e.target.value as EnergyLevel)}
                className="w-full px-3 py-2 rounded-xl bg-[#121624] border border-white/[0.08] focus:border-indigo-500 text-xs text-white focus:outline-none"
              >
                <option value="high">⚡ High Focus (Code / Architecture)</option>
                <option value="medium">🔋 Medium (Standard tasks)</option>
                <option value="low">🪫 Low (Admin / Maintenance)</option>
              </select>
            </div>
          </div>

          {/* Dependencies System: Depends on another task */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Prerequisite Dependency (Task Blocks This One)
            </label>
            <select
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val && !dependsOnTaskIds.includes(val)) {
                  setDependsOnTaskIds([...dependsOnTaskIds, val]);
                }
              }}
              value=""
              className="w-full px-3 py-2 rounded-xl bg-[#121624] border border-white/[0.08] focus:border-indigo-500 text-xs text-white focus:outline-none mb-2"
            >
              <option value="">-- Choose prerequisite task that must finish first --</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.status})
                </option>
              ))}
            </select>

            {dependsOnTaskIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {dependsOnTaskIds.map((depId) => {
                  const prereq = tasks.find((t) => t.id === depId);
                  return (
                    <span
                      key={depId}
                      className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-1.5"
                    >
                      <Link2 className="w-3 h-3 text-indigo-400" />
                      <span>{prereq?.title || `Task #${depId}`}</span>
                      <button
                        type="button"
                        onClick={() => setDependsOnTaskIds(dependsOnTaskIds.filter((id) => id !== depId))}
                        className="hover:text-rose-400 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Subtasks Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Subtasks Checklist ({subtasks.length})
              </label>
            </div>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add subtask item..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500 text-xs text-white focus:outline-none placeholder-slate-400"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 transition-colors"
              >
                Add
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto p-1.5 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                {subtasks.map((st, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-white/[0.03] text-xs text-slate-300"
                  >
                    <span>☐ {st}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(i)}
                      className="text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="e.g. Core API, Frontend..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500 text-xs text-white focus:outline-none placeholder-slate-400"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 transition-colors"
              >
                Add Tag
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs flex items-center gap-1"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition-all cursor-pointer active:scale-95"
            >
              {isSubmitting ? 'Creating Task...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
