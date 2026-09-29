import React from 'react';
import {
  LayoutDashboard,
  KanbanSquare,
  Timer,
  BarChart3,
  User,
  Plus,
} from 'lucide-react';

interface MobileNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenTaskModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  onNavigate,
  onOpenTaskModal,
}) => {
  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: KanbanSquare },
    { id: 'focus', label: 'Focus', icon: Timer },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-white/[0.1] px-4 py-2 flex items-center justify-around shadow-2xl">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        );
      })}

      {/* Floating touch-optimized Quick Add */}
      <button
        onClick={onOpenTaskModal}
        className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 -mt-5 border-2 border-[#090a10] active:scale-95"
        title="Add Task"
      >
        <Plus className="w-5 h-5" />
      </button>
    </nav>
  );
};
