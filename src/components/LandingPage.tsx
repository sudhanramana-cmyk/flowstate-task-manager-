import React, { useState, useEffect } from 'react';
import {
  Zap,
  ArrowRight,
  Sparkles,
  Shield,
  Layers,
  GitBranch,
  Timer,
  CheckCircle2,
  Users2,
  TrendingUp,
  Brain,
  Lock,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface LandingPageProps {
  onOpenAuth: (initialMode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const { demoLogin, isLoading } = useAuth();
  const [activeStage, setActiveStage] = useState(2); // In Progress

  const stages = [
    { name: 'IDEA', color: 'from-slate-500 to-slate-400', desc: 'Raw intention captured' },
    { name: 'PLANNED', color: 'from-blue-500 to-cyan-400', desc: 'Dependencies mapped' },
    { name: 'IN PROGRESS', color: 'from-amber-500 to-yellow-400', desc: 'Active focus mode' },
    { name: 'REVIEW', color: 'from-purple-500 to-violet-400', desc: 'Quality checked' },
    { name: 'COMPLETED', color: 'from-emerald-500 to-teal-400', desc: 'Milestone achieved' },
  ];

  // Animated pipeline simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % stages.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [stages.length]);

  return (
    <div className="min-h-screen bg-[#090a10] text-slate-100 overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/15 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-1/2 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-cyan-600/10 to-transparent blur-[140px] rounded-full" />
      </div>

      {/* Header */}
      <nav className="relative z-20 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            FlowState
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAuth('login')}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => demoLogin()}
            disabled={isLoading}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-semibold text-slate-200 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Explore Demo</span>
          </button>
          <button
            onClick={() => onOpenAuth('register')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Next-Generation Productivity OS with Real-Time Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6">
          Your work.{' '}
          <span className="block mt-2 bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-300 bg-clip-text text-transparent">
            Organized by intelligence.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 mb-10 leading-relaxed font-normal">
          FlowState transforms scattered tasks into a clear path from intention to completion. Discover your next best action, eliminate blocking dependencies, and preserve unshakeable momentum.
        </p>

        {/* CTA Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={() => onOpenAuth('register')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/45 transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => demoLogin()}
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-card hover:bg-white/[0.08] text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/[0.1]"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isLoading ? 'Booting Demo Workspace...' : 'Explore Live Demo'}</span>
          </button>
        </div>

        {/* Interactive Animated Pipeline Preview */}
        <div className="relative mx-auto max-w-4xl p-6 sm:p-8 rounded-3xl glass-panel glow-indigo border border-indigo-500/20 text-left shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-xs font-mono text-slate-400">FlowState Intelligence Engine v2.0</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-indigo-300 font-medium">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>78% Daily Momentum</span>
            </div>
          </div>

          {/* Pipeline stages */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
            {stages.map((stage, idx) => {
              const isCurrent = activeStage === idx;
              return (
                <div
                  key={stage.name}
                  className={`p-3 rounded-2xl border transition-all duration-300 ${
                    isCurrent
                      ? 'bg-indigo-600/20 border-indigo-500/60 ring-2 ring-indigo-500/30'
                      : 'bg-white/[0.02] border-white/[0.06] opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold tracking-wider text-slate-300">{stage.name}</span>
                    {isCurrent && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{stage.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Active Animated Task Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/70 to-slate-900/80 border border-indigo-500/40 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3" /> High Energy • Urgent
              </span>
              <span className="text-xs text-slate-400 font-mono">Stage: {stages[activeStage].name}</span>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">
              Finish API Authentication & Session Security
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              "High priority + blocks 2 other tasks + due today. Recommendation confidence: 94%."
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.08] text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <GitBranch className="w-3.5 h-3.5 text-violet-400" />
                <span>Blocks: Smart Next Action Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                  Prerequisite: PostgreSQL Schema (Done)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY FLOWSTATE Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 border-t border-white/[0.08]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">
            WHY FLOWSTATE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4">
            Built for thinkers who execute
          </h2>
          <p className="text-sm text-slate-400">
            Traditional todo apps leave you guessing what to do next. FlowState calculates it mathematically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Brain,
              title: 'Smart Planning',
              desc: 'Intelligent heuristic engine analyzes priority, deadlines, and workload to surface your highest-leverage task.',
              color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
            },
            {
              icon: GitBranch,
              title: 'Visual Workflows',
              desc: 'True relational dependency mapping prevents you from starting tasks that are blocked by prerequisites.',
              color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
            },
            {
              icon: Users2,
              title: 'Real-Time Sync',
              desc: 'Full-duplex WebSocket collaboration updates status changes, comments, and presence instantaneously.',
              color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
            },
            {
              icon: TrendingUp,
              title: 'Productivity Intel',
              desc: 'Dynamic momentum scoring, 30-day activity heatmaps, and focus duration analytics that reward consistency.',
              color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-3xl glass-card border border-white/[0.06] hover:border-white/[0.15] transition-all group"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-5 ${feature.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 border-t border-white/[0.08]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-violet-400 tracking-wider uppercase">
            THE 5-STEP PROTOCOL
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4">
            How FlowState works
          </h2>
          <p className="text-sm text-slate-400">
            A frictionless cycle designed to transform chaotic backlog into clear daily momentum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { step: '01', title: 'Capture', desc: 'Dump goals and tasks with subtasks and time estimates.' },
            { step: '02', title: 'Organize', desc: 'Link blockers and dependencies in Kanban or Timeline.' },
            { step: '03', title: 'Focus', desc: 'Enter fullscreen Pomodoro with synthesized soundscapes.' },
            { step: '04', title: 'Complete', desc: 'Automatically unblock downstream tasks and log achievements.' },
            { step: '05', title: 'Understand', desc: 'Review velocity trends, 30-day heatmaps, and time capsules.' },
          ].map((item, i) => (
            <div key={i} className="p-5 rounded-2xl glass-card border border-white/[0.06] relative">
              <span className="text-2xl font-black text-indigo-400/40 block mb-2 font-mono">{item.step}</span>
              <h4 className="text-sm font-bold text-white mb-1.5">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Animated Statistics */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16 border-t border-white/[0.08]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-6 rounded-2xl glass-card">
            <p className="text-3xl sm:text-4xl font-black text-indigo-400 mb-1 font-mono">98.4%</p>
            <p className="text-xs text-slate-400 font-medium">Daily Flow Completion</p>
          </div>
          <div className="p-6 rounded-2xl glass-card">
            <p className="text-3xl sm:text-4xl font-black text-violet-400 mb-1 font-mono">4.2x</p>
            <p className="text-xs text-slate-400 font-medium">Faster Delivery Velocity</p>
          </div>
          <div className="p-6 rounded-2xl glass-card">
            <p className="text-3xl sm:text-4xl font-black text-cyan-400 mb-1 font-mono">0</p>
            <p className="text-xs text-slate-400 font-medium">Bottleneck Surprises</p>
          </div>
          <div className="p-6 rounded-2xl glass-card">
            <p className="text-3xl sm:text-4xl font-black text-emerald-400 mb-1 font-mono">100%</p>
            <p className="text-xs text-slate-400 font-medium">Real-Time Synchronized</p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-b from-indigo-950/60 to-slate-900/90 border border-indigo-500/30 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Ready to find your FlowState?
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-8">
            Experience the productivity OS engineered to turn complex workflows into serene focus.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onOpenAuth('register')}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition-all cursor-pointer"
            >
              Get Started Now
            </button>
            <button
              onClick={() => demoLogin()}
              disabled={isLoading}
              className="px-8 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-semibold text-sm transition-all border border-white/[0.1] cursor-pointer"
            >
              Explore Live Demo
            </button>
          </div>
        </div>
      </section>

      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <p>© 2026 FlowState Platform. Built for ambitious builders.</p>
        <div className="flex items-center gap-6">
          <span>PostgreSQL Relational Storage</span>
          <span>WebSocket Real-Time Sync</span>
          <span>Pomodoro Audio Engine</span>
        </div>
      </footer>
    </div>
  );
};
