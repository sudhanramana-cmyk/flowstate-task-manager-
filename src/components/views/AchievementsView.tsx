import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Rocket,
  Flame,
  Zap,
  Target,
  Hourglass,
  Brain,
  Link2,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Achievement } from '../../types/index.ts';
import { api } from '../../lib/api.ts';

export const AchievementsView: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAchievements();
      setAchievements(data);
    } catch (err) {
      console.error('Failed to load achievements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const iconMap: Record<string, React.ReactNode> = {
    Rocket: <Rocket className="w-6 h-6 text-indigo-400" />,
    Flame: <Flame className="w-6 h-6 text-amber-400" />,
    Zap: <Zap className="w-6 h-6 text-cyan-400" />,
    Target: <Target className="w-6 h-6 text-rose-400" />,
    Trophy: <Trophy className="w-6 h-6 text-yellow-400" />,
    Link2: <Link2 className="w-6 h-6 text-emerald-400" />,
    Hourglass: <Hourglass className="w-6 h-6 text-violet-400" />,
    Brain: <Brain className="w-6 h-6 text-blue-400" />,
  };

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Flow Milestones & Badges</h1>
          <p className="text-xs text-slate-400 mt-1">
            Gamified productivity honors unlocked through disciplined execution and uninterrupted flow state.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl glass-panel border border-indigo-500/30 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-white">
            {unlockedCount} of {achievements.length} Unlocked
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading achievements catalog...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((ach) => {
            const isUnlocked = ach.isUnlocked;
            return (
              <div
                key={ach.id}
                className={`p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden group ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-violet-950/30 border-indigo-500/40 glow-indigo'
                    : 'bg-white/[0.02] border-white/[0.06] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                      isUnlocked
                        ? 'bg-indigo-500/10 border-indigo-500/30'
                        : 'bg-white/[0.03] border-white/[0.06]'
                    }`}
                  >
                    {iconMap[ach.icon] || <Trophy className="w-6 h-6 text-slate-400" />}
                  </div>

                  {isUnlocked ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Unlocked
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.04] text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white mb-1.5">{ach.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{ach.description}</p>

                {isUnlocked && ach.unlockedAt && (
                  <div className="pt-2 border-t border-white/[0.06] text-[10px] text-slate-400 font-mono">
                    Awarded: {new Date(ach.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
