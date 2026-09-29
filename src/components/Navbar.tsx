import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Search,
  Plus,
  Zap,
  BatteryMedium,
  BatteryLow,
  Folder,
  ChevronDown,
  CheckCheck,
  LogOut,
  User as UserIcon,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTask } from '../context/TaskContext.tsx';
import { EnergyLevel } from '../types/index.ts';

interface NavbarProps {
  onOpenTaskModal: () => void;
  onOpenCommandPalette: () => void;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTaskModal,
  onOpenCommandPalette,
  onNavigate,
}) => {
  const { user, updateEnergyLevel, logout } = useAuth();
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    onlineUsers,
  } = useTask();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEnergyOpen, setIsEnergyOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const projectRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const energyRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter((n) => !n.isRead);
  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setIsNotifOpen(false);
      if (projectRef.current && !projectRef.current.contains(e.target as Node)) setIsProjectOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
      if (energyRef.current && !energyRef.current.contains(e.target as Node)) setIsEnergyOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const energyIcons: Record<EnergyLevel, { icon: React.ReactNode; label: string; color: string }> = {
    high: { icon: <Zap className="w-4 h-4 text-amber-400" />, label: 'High Energy', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
    medium: { icon: <BatteryMedium className="w-4 h-4 text-emerald-400" />, label: 'Medium Energy', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
    low: { icon: <BatteryLow className="w-4 h-4 text-blue-400" />, label: 'Low Energy', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  };

  const currentEnergy = user?.energyLevel || 'high';

  return (
    <header className="sticky top-0 z-30 h-16 w-full glass-panel border-b border-white/[0.08] px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Left: Project Selector */}
      <div className="flex items-center gap-3">
        <div className="relative" ref={projectRef}>
          <button
            onClick={() => setIsProjectOpen(!isProjectOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-sm text-slate-200 transition-all font-medium"
          >
            <Folder className="w-4 h-4 text-indigo-400" />
            <span className="max-w-[140px] truncate">
              {activeProject ? activeProject.name : 'All Workspaces'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProjectOpen && (
            <div className="absolute left-0 mt-2 w-64 glass-dropdown rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Select Workspace
              </div>
              <button
                onClick={() => {
                  setActiveProjectId(null);
                  setIsProjectOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                  activeProjectId === null
                    ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                    : 'text-slate-300 hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>All Projects & Tasks</span>
                </div>
                {activeProjectId === null && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
              </button>

              <div className="my-1 border-t border-white/[0.08]" />

              {projects.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => {
                    setActiveProjectId(proj.id);
                    setIsProjectOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                    activeProjectId === proj.id
                      ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                      : 'text-slate-300 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: proj.color || '#6366f1' }}
                    />
                    <span className="truncate">{proj.name}</span>
                  </div>
                  <span className="text-xs text-slate-400">{proj.progress}%</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Global Search Command Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-xs text-slate-400 transition-all cursor-pointer group"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
          <span>Quick command or search...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] text-[10px] text-slate-300 font-mono">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right: Energy Selector + Live Presence + Notifications + Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Real-time Collaborators Presence */}
        {onlineUsers.length > 0 && (
          <div className="hidden lg:flex items-center -space-x-1.5 mr-1" title="Real-time collaborators online">
            {onlineUsers.slice(0, 4).map((u, i) => (
              <div
                key={i}
                className="relative group cursor-pointer"
              >
                <img
                  src={u.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${u.name}`}
                  alt={u.name}
                  className="w-7 h-7 rounded-full border-2 border-[#090a10] object-cover ring-1 ring-emerald-500/50"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-black animate-pulse" />
                <div className="absolute top-8 left-1/2 -translate-x-1/2 hidden group-hover:block z-50 px-2 py-1 bg-slate-900 border border-white/[0.1] text-[11px] text-slate-200 rounded whitespace-nowrap shadow-xl">
                  {u.name} is active
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Energy Mode Pill (Signature Feature 5) */}
        <div className="relative" ref={energyRef}>
          <button
            onClick={() => setIsEnergyOpen(!isEnergyOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${energyIcons[currentEnergy].color}`}
            title="Configure current biological energy state"
          >
            {energyIcons[currentEnergy].icon}
            <span className="hidden sm:inline">{energyIcons[currentEnergy].label}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {isEnergyOpen && (
            <div className="absolute right-0 mt-2 w-48 glass-dropdown rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in duration-100">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Energy Level
              </div>
              <p className="px-3 pb-2 text-[11px] text-slate-400">
                Adjusts "What Should I Do Next?" and task scheduling.
              </p>
              {(['high', 'medium', 'low'] as EnergyLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    updateEnergyLevel(lvl);
                    setIsEnergyOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                    currentEnergy === lvl
                      ? 'bg-white/[0.1] text-white font-medium'
                      : 'text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  {energyIcons[lvl].icon}
                  <span>{energyIcons[lvl].label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-[10px] text-white font-bold flex items-center justify-center shadow-lg">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 glass-dropdown rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] mb-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">Notifications</span>
                  {unreadNotifs.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold">
                      {unreadNotifs.length} new
                    </span>
                  )}
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto space-y-1.5">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No notifications yet. You're completely up to date!
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        !n.isRead
                          ? 'bg-indigo-950/30 border-indigo-500/30 text-slate-200'
                          : 'bg-white/[0.02] border-white/[0.04] text-slate-400 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-medium text-slate-200 mb-1">
                        <span>{n.title}</span>
                        {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Add Task Button */}
        <button
          onClick={onOpenTaskModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Task</span>
        </button>

        {/* User Profile Avatar Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/[0.05] transition-colors"
          >
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${user?.name || 'Flow'}`}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-full border border-indigo-500/40 object-cover"
            />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 glass-dropdown rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in duration-100">
              <div className="px-3 py-2 border-b border-white/[0.08] mb-1">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold flex items-center gap-1">
                    🔥 {user?.streak || 1}d Streak
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-semibold">
                    {user?.productivityStyle}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onNavigate('profile');
                  setIsProfileOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/[0.06] transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Profile & Stats</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('settings');
                  setIsProfileOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/[0.06] transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>Preferences & Security</span>
              </button>

              <div className="my-1 border-t border-white/[0.08]" />

              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
