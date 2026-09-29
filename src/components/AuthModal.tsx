import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Zap,
  Target,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { ProductivityStyle } from '../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register, demoLogin, isLoading } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [step, setStep] = useState<'credentials' | 'onboarding_goal' | 'onboarding_style'>('credentials');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [workingToward, setWorkingToward] = useState('Startup');
  const [productivityStyle, setProductivityStyle] = useState<ProductivityStyle>('focused');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync mode if initialMode changes
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setStep('credentials');
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const goalOptions = [
    { id: 'Startup', label: 'Startup & SaaS', desc: 'Building high-velocity ventures and shipping products.' },
    { id: 'College', label: 'College & Academics', desc: 'Managing coursework, research papers, and exam sprints.' },
    { id: 'Freelancing', label: 'Freelancing & Client Work', desc: 'Delivering contracts and juggling multiple client milestones.' },
    { id: 'Personal projects', label: 'Personal Passion Projects', desc: 'Creating open-source apps, art, or hardware.' },
    { id: 'Career', label: 'Career & Engineering Leadership', desc: 'Strategic OKRs, system redesigns, and team leadership.' },
    { id: 'Team projects', label: 'Collaborative Team Initiatives', desc: 'Synchronizing cross-functional sprints in real time.' },
  ];

  const styleOptions: Array<{ id: ProductivityStyle; label: string; desc: string; icon: string }> = [
    { id: 'focused', label: 'Deep Work Focused', desc: 'Long uninterrupted Pomodoro blocks with ambient audio isolation.', icon: '🎯' },
    { id: 'deadline-driven', label: 'Deadline-Driven', desc: 'Aggressive countdown prioritization and proactive blocker warnings.', icon: '⚡' },
    { id: 'flexible', label: 'Agile & Flexible', desc: 'Fluid task shifts with dynamic energy alignment and Kanban fluidity.', icon: '🌊' },
    { id: 'balanced', label: 'Sustained Balanced Pace', desc: 'Structured day planner intervals with mindful cognitive resets.', icon: '⚖️' },
  ];

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'login') {
      try {
        await login(email, password);
        onClose();
      } catch (err: any) {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } else if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      // Advance to personalized onboarding step
      setStep('onboarding_goal');
    } else if (mode === 'forgot') {
      try {
        setSuccessMsg(`A temporary recovery code (FLOW-8921) has been sent to ${email}. You can reset your password.`);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleFinishOnboarding = async () => {
    setError(null);
    try {
      await register({
        name,
        email,
        password,
        workingToward,
        productivityStyle,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setStep('credentials');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/[0.1] text-slate-100 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* STEP 1: CREDENTIALS */}
        {step === 'credentials' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-slate-300">FlowState Identity</span>
            </div>

            <h2 className="text-2xl font-black text-white mb-1">
              {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create your workspace' : 'Reset password'}
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              {mode === 'login'
                ? 'Sign in to access your intelligence dashboard and active projects.'
                : mode === 'register'
                ? 'Begin your personalized journey toward unshakeable focus.'
                : 'Enter your email address to receive password reset instructions.'}
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500 focus:outline-none text-xs text-white placeholder-slate-400 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500 focus:outline-none text-xs text-white placeholder-slate-400 transition-colors"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setError(null);
                        }}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500 focus:outline-none text-xs text-white placeholder-slate-400 transition-colors"
                    />
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500 focus:outline-none text-xs text-white placeholder-slate-400 transition-colors"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>
                  {isLoading
                    ? 'Processing...'
                    : mode === 'login'
                    ? 'Sign In'
                    : mode === 'register'
                    ? 'Continue to Onboarding'
                    : 'Send Reset Instructions'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 border-t border-white/[0.08]" />
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">or</span>
              <div className="flex-1 border-t border-white/[0.08]" />
            </div>

            {/* Quick Demo Access Button */}
            <button
              type="button"
              onClick={async () => {
                await demoLogin();
                onClose();
              }}
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Launch 1-Click Interactive Demo</span>
            </button>

            <div className="mt-5 text-center text-xs text-slate-400">
              {mode === 'login' ? (
                <>
                  Don't have an account yet?{' '}
                  <button
                    onClick={() => {
                      setMode('register');
                      setError(null);
                    }}
                    className="text-indigo-400 font-semibold hover:underline ml-1"
                  >
                    Register free
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="text-indigo-400 font-semibold hover:underline ml-1"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: PERSONALIZED ONBOARDING - GOAL */}
        {step === 'onboarding_goal' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                Step 1 of 2
              </span>
              <span className="text-xs text-slate-400 font-medium">Personalized Calibration</span>
            </div>

            <h2 className="text-2xl font-black text-white mb-2">
              What are you working toward?
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              FlowState tailors your default templates, milestone velocities, and AI recommendations to match your objective.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
              {goalOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setWorkingToward(opt.id)}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    workingToward === opt.id
                      ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{opt.label}</span>
                    {workingToward === opt.id && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{opt.desc}</p>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setStep('credentials')}
                className="px-4 py-2.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep('onboarding_style')}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-violet-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next: Productivity Style</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PERSONALIZED ONBOARDING - PRODUCTIVITY STYLE */}
        {step === 'onboarding_style' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300">
                Step 2 of 2
              </span>
              <span className="text-xs text-slate-400 font-medium">Cadence Engine</span>
            </div>

            <h2 className="text-2xl font-black text-white mb-2">
              How do you like to execute?
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              Select your preferred mental flow. This tunes the "What Should I Do Next?" recommendation engine.
            </p>

            <div className="space-y-2.5 mb-6">
              {styleOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setProductivityStyle(opt.id)}
                  className={`w-full p-3 rounded-2xl text-left border transition-all flex items-start gap-3 ${
                    productivityStyle === opt.id
                      ? 'bg-violet-600/25 border-violet-500 text-white shadow-lg shadow-violet-500/10 ring-1 ring-violet-500/50'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  <span className="text-xl p-1 bg-white/[0.04] rounded-xl">{opt.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-white">{opt.label}</span>
                      {productivityStyle === opt.id && <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setStep('onboarding_goal')}
                className="px-4 py-2.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleFinishOnboarding}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/30 hover:from-indigo-600 hover:to-violet-700 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isLoading ? 'Creating Workspace...' : 'Initialize My Workspace'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
