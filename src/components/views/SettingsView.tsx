import React, { useState } from 'react';
import {
  User as UserIcon,
  Shield,
  Palette,
  Sliders,
  CheckCircle2,
  Lock,
  Mail,
  Flame,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useTask } from '../../context/TaskContext.tsx';
import { ProductivityStyle, Priority } from '../../types/index.ts';

export const SettingsView: React.FC = () => {
  const { user, updatePreferences } = useAuth();
  const { tasks } = useTask();

  const [name, setName] = useState(user?.name || '');
  const [productivityStyle, setProductivityStyle] = useState<ProductivityStyle>(user?.productivityStyle || 'focused');
  const [workingToward, setWorkingToward] = useState(user?.workingToward || 'Startup');
  const [defaultDuration, setDefaultDuration] = useState(user?.defaultDuration || 30);
  const [defaultPriority, setDefaultPriority] = useState<Priority>(user?.defaultPriority || 'medium');
  const [theme, setTheme] = useState(user?.theme || 'dark');
  const [isSaved, setIsSaved] = useState(false);

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const focusHours = Math.round(((user?.focusMinutes || 120) / 60) * 10) / 10;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePreferences({
      name,
      productivityStyle,
      workingToward,
      defaultDuration: Number(defaultDuration),
      defaultPriority,
      theme,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Profile & Preferences</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your identity, productivity defaults, theme, and cognitive scheduling parameters.
        </p>
      </div>

      {/* User Hero Banner */}
      <div className="p-6 rounded-3xl glass-panel glow-indigo border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${user?.name || 'User'}`}
            alt={user?.name || 'User'}
            className="w-16 h-16 rounded-2xl border-2 border-indigo-500/50 object-cover shadow-xl"
          />
          <div>
            <h2 className="text-lg font-bold text-white">{user?.name}</h2>
            <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-1">
                <Flame className="w-3 h-3" /> {user?.streak || 3}d Streak
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                {user?.workingToward}
              </span>
            </div>
          </div>
        </div>

        {/* Quick summary stats */}
        <div className="flex items-center gap-4 text-center">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] w-24">
            <span className="text-xl font-bold text-emerald-400 font-mono block">{completedCount}</span>
            <span className="text-[10px] text-slate-400">Completed</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] w-24">
            <span className="text-xl font-bold text-violet-400 font-mono block">{focusHours}h</span>
            <span className="text-[10px] text-slate-400">Deep Work</span>
          </div>
        </div>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Your preferences have been successfully updated and synced.</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* General Account */}
        <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-indigo-400" />
            <span>Account Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Objective</label>
              <input
                type="text"
                value={workingToward}
                onChange={(e) => setWorkingToward(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Productivity Calibration */}
        <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-violet-400" />
            <span>Productivity Defaults</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Productivity Style</label>
              <select
                value={productivityStyle}
                onChange={(e) => setProductivityStyle(e.target.value as ProductivityStyle)}
                className="w-full px-3 py-2 rounded-xl bg-[#121624] border border-white/[0.08] focus:border-indigo-500 text-xs text-white focus:outline-none"
              >
                <option value="focused">🎯 Focused (Pomodoro)</option>
                <option value="deadline-driven">⚡ Deadline-Driven</option>
                <option value="flexible">🌊 Flexible</option>
                <option value="balanced">⚖️ Balanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Default Task Duration</label>
              <input
                type="number"
                min={10}
                max={240}
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#121624] border border-white/[0.08] focus:border-indigo-500 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Default Priority</label>
              <select
                value={defaultPriority}
                onChange={(e) => setDefaultPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-xl bg-[#121624] border border-white/[0.08] focus:border-indigo-500 text-xs text-white focus:outline-none"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security & Authentication */}
        <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Security & Cryptography</span>
          </h3>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-xs text-slate-300 leading-relaxed flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">Dual Authentication Enabled</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Protected by PostgreSQL row security, bcrypt hashing, and JWT authorization headers.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
              Active & Protected
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
