import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Volume2,
  VolumeX,
  Sparkles,
  Flame,
  Coffee,
  Brain,
  Headphones,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task } from '../types/index.ts';
import { useTask } from '../context/TaskContext.tsx';
import { api } from '../lib/api.ts';

interface FocusModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
}

export const FocusModeModal: React.FC<FocusModeModalProps> = ({
  isOpen,
  onClose,
  task,
}) => {
  const { updateTaskStatus, refreshWorkspace } = useTask();

  // Timer states (in seconds)
  const DEFAULT_FOCUS_TIME = 25 * 60;
  const DEFAULT_BREAK_TIME = 5 * 60;

  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundscape, setSoundscape] = useState<'off' | 'binaural' | 'rain' | 'whitenoise'>('off');

  // Web Audio Context for pure client-side sound synthesis
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioNode | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode('focus');
      setTimeLeft(DEFAULT_FOCUS_TIME);
      setIsRunning(true);
      setIsCompleted(false);
    } else {
      stopAudio();
    }
  }, [isOpen, task?.id]);

  // Timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      handleSessionEnd();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  // Audio synthesis handlers
  const startAudio = (type: 'binaural' | 'rain' | 'whitenoise') => {
    stopAudio();
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.value = 0.05; // Gentle ambient volume
      gain.connect(ctx.destination);
      gainNodeRef.current = gain;

      if (type === 'binaural') {
        // 40Hz Gamma Focus Frequency (196Hz base + 236Hz)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.value = 200;
        osc2.frequency.value = 240;
        osc1.connect(gain);
        osc2.connect(gain);
        osc1.start();
        osc2.start();
        oscillatorRef.current = osc1;
      } else {
        // White / Pink Noise generator
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Pink/rain filter
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        whiteNoise.connect(gain);
        whiteNoise.start();
        noiseSourceRef.current = whiteNoise;
      }
    } catch (err) {
      console.error('Audio synthesis error:', err);
    }
  };

  const stopAudio = () => {
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
  };

  const handleToggleSound = (type: 'binaural' | 'rain' | 'whitenoise') => {
    if (soundscape === type) {
      setSoundscape('off');
      stopAudio();
    } else {
      setSoundscape(type);
      startAudio(type);
    }
  };

  const handleSessionEnd = async () => {
    stopAudio();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    try {
      const durationMins = mode === 'focus' ? 25 : 5;
      await api.endFocusSession({
        taskId: task?.id,
        durationMinutes: durationMins,
        completedSuccessfully: true,
      });
      await refreshWorkspace();
    } catch (err) {
      console.error('Failed to log focus session:', err);
    }

    setIsCompleted(true);
  };

  const handleCompleteTask = async () => {
    if (task) {
      await updateTaskStatus(task.id, 'completed');
    }
    handleSessionEnd();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const totalTime = mode === 'focus' ? DEFAULT_FOCUS_TIME : DEFAULT_BREAK_TIME;
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090e]/95 backdrop-blur-2xl text-slate-100 p-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-xl flex flex-col items-center text-center">
        {/* Top bar */}
        <div className="w-full flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
              FlowState Deep Focus
            </span>
          </div>

          <button
            onClick={() => {
              stopAudio();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Title */}
        <div className="mb-6">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.05] border border-white/[0.08] text-slate-300 mb-3">
            {mode === 'focus' ? '🎯 Active Focus Target' : '☕ Restorative Break'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white max-w-md mx-auto leading-snug">
            {task ? task.title : 'Autonomous Deep Work Session'}
          </h1>
          {task?.description && (
            <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Big Circular Progress Timer */}
        <div className="relative w-72 h-72 my-4 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="144"
              cy="144"
              r="120"
              className="stroke-white/[0.06]"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="144"
              cy="144"
              r="120"
              className="stroke-indigo-500 transition-all duration-1000 ease-linear"
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={2 * Math.PI * 120 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-6xl font-black text-white font-mono tracking-tight">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs text-indigo-300 font-medium mt-2 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              {mode === 'focus' ? 'Pomodoro Interval' : 'Rest Phase'}
            </span>
          </div>
        </div>

        {/* Completion Celebration Message */}
        {isCompleted && (
          <div className="my-4 p-4 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-sm text-indigo-200 animate-in fade-in slide-in-from-bottom-2">
            <span className="font-bold block text-white text-base mb-1">
              Focus session complete! 🔥
            </span>
            <span>Productivity score and streak calibrated. Outstanding work.</span>
          </div>
        )}

        {/* Primary Controls */}
        <div className="flex items-center gap-4 my-6">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white flex items-center justify-center shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>

          <button
            onClick={() => {
              setTimeLeft(mode === 'focus' ? DEFAULT_FOCUS_TIME : DEFAULT_BREAK_TIME);
              setIsRunning(false);
            }}
            className="p-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {task && task.status !== 'completed' && (
            <button
              onClick={handleCompleteTask}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs font-bold transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Mark Done</span>
            </button>
          )}

          <button
            onClick={() => {
              const newMode = mode === 'focus' ? 'break' : 'focus';
              setMode(newMode);
              setTimeLeft(newMode === 'focus' ? DEFAULT_FOCUS_TIME : DEFAULT_BREAK_TIME);
              setIsRunning(true);
            }}
            className="p-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 transition-colors"
            title={mode === 'focus' ? 'Switch to Break' : 'Switch to Focus'}
          >
            <Coffee className="w-5 h-5 text-amber-400" />
          </button>
        </div>

        {/* Ambient Sound Generator (Web Audio API) */}
        <div className="pt-4 border-t border-white/[0.08] w-full flex items-center justify-center gap-2 text-xs text-slate-400">
          <Headphones className="w-4 h-4 text-indigo-400 mr-1" />
          <span>Ambient Audio:</span>
          {(['binaural', 'rain', 'whitenoise'] as const).map((type) => (
            <button
              key={type}
              onClick={() => handleToggleSound(type)}
              className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
                soundscape === type
                  ? 'bg-indigo-600/30 border-indigo-500 text-white'
                  : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-slate-200'
              }`}
            >
              {type === 'binaural' ? '40Hz Binaural' : type === 'rain' ? 'Rain' : 'White Noise'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
