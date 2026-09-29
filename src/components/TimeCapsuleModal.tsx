import React, { useState, useEffect } from 'react';
import {
  X,
  Hourglass,
  Sparkles,
  Lock,
  Unlock,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { TimeCapsule } from '../types/index.ts';
import { api } from '../lib/api.ts';
import { useTask } from '../context/TaskContext.tsx';

interface TimeCapsuleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TimeCapsuleModal: React.FC<TimeCapsuleModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { projects } = useTask();
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [goalStatement, setGoalStatement] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Default target date is 30 days from now
  useEffect(() => {
    if (isOpen) {
      const d = new Date(Date.now() + 30 * 86400000);
      setTargetDate(d.toISOString().split('T')[0]);
      loadCapsules();
    }
  }, [isOpen]);

  const loadCapsules = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTimeCapsules();
      setCapsules(data);
    } catch (err) {
      console.error('Failed to load time capsules:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSealCapsule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalStatement.trim() || !targetDate) return;

    try {
      const created = await api.createTimeCapsule({
        goalStatement: goalStatement.trim(),
        targetDate,
        reflectionNotes: reflectionNotes.trim(),
      });
      setCapsules([created, ...capsules]);
      setGoalStatement('');
      setReflectionNotes('');
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to seal time capsule:', err);
    }
  };

  if (!isOpen) return null;

  // Average progress across all projects right now
  const currentAvgProgress =
    projects.length > 0
      ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)
      : 50;

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
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-md">
            <Hourglass className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">
            FlowState Ambition Lockbox
          </span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-white">Time Capsule</h2>
            <p className="text-xs text-slate-400">
              Commit your future ambition today. Seal it in time and compare intent vs reality.
            </p>
          </div>
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Seal New Capsule</span>
            </button>
          )}
        </div>

        {/* Create form */}
        {isCreating && (
          <form onSubmit={handleSealCapsule} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] mb-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                "What I want to accomplish by this target date..."
              </label>
              <textarea
                required
                rows={2}
                value={goalStatement}
                onChange={(e) => setGoalStatement(e.target.value)}
                placeholder="e.g. Complete core API security, launch public beta with 50 active users..."
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-violet-500 text-xs text-white placeholder-slate-400 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">Unsealing Target Date</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#121624] border border-white/[0.08] focus:border-violet-500 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">Reflection & Notes</label>
                <input
                  type="text"
                  value={reflectionNotes}
                  onChange={(e) => setReflectionNotes(e.target.value)}
                  placeholder="Mental state or motivation..."
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-violet-500 text-xs text-white placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-violet-500/25"
              >
                Seal Capsule 🔒
              </button>
            </div>
          </form>
        )}

        {/* Existing Capsules List */}
        <div className="space-y-4">
          {capsules.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No time capsules sealed yet. Seal your first milestone ambition!
            </div>
          ) : (
            capsules.map((cap) => {
              const createdDate = new Date(cap.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
              return (
                <div
                  key={cap.id}
                  className="p-5 rounded-2xl bg-gradient-to-br from-violet-950/30 to-indigo-950/20 border border-violet-500/30 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Sealed on {createdDate}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Target: {cap.targetDate}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-white mb-4 italic">
                    "{cap.goalStatement}"
                  </p>

                  <div className="pt-3 border-t border-white/[0.08] grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Snapshot at sealing:</span>
                      <span className="font-mono text-slate-300 font-semibold">{cap.snapshotProgress}% Complete</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Today's Progress:</span>
                      <span className="font-mono text-emerald-400 font-bold">{currentAvgProgress}% Overall</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
