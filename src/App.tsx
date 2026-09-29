import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { TaskProvider, useTask } from './context/TaskContext.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { MobileNav } from './components/MobileNav.tsx';
import { CommandPalette } from './components/CommandPalette.tsx';
import { TaskModal } from './components/TaskModal.tsx';
import { TaskDetailDrawer } from './components/TaskDetailDrawer.tsx';
import { FocusModeModal } from './components/FocusModeModal.tsx';
import { DayPlannerModal } from './components/DayPlannerModal.tsx';
import { TimeCapsuleModal } from './components/TimeCapsuleModal.tsx';
import { ProjectModal } from './components/ProjectModal.tsx';

import { DashboardView } from './components/views/DashboardView.tsx';
import { TasksView } from './components/views/TasksView.tsx';
import { AnalyticsView } from './components/views/AnalyticsView.tsx';
import { AchievementsView } from './components/views/AchievementsView.tsx';
import { SettingsView } from './components/views/SettingsView.tsx';
import { Task } from './types/index.ts';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<string>('dashboard');

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDayPlannerOpen, setIsDayPlannerOpen] = useState(false);
  const [isTimeCapsuleOpen, setIsTimeCapsuleOpen] = useState(false);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);

  // Selected task for detail drawer or focus mode
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [focusTask, setFocusTask] = useState<Task | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090a10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 animate-spin flex items-center justify-center shadow-lg shadow-indigo-500/30" />
          <span className="text-xs font-mono text-indigo-400 tracking-wider uppercase">
            Initializing FlowState OS...
          </span>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Landing Page
  if (!user) {
    return (
      <>
        <LandingPage
          onOpenAuth={(mode) => {
            setAuthMode(mode);
            setIsAuthOpen(true);
          }}
        />
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          initialMode={authMode}
        />
      </>
    );
  }

  const handleOpenFocusMode = (t?: Task) => {
    setFocusTask(t || null);
    setIsFocusModeOpen(true);
  };

  const handleNavigate = (view: string) => {
    if (view === 'time-capsule') {
      setIsTimeCapsuleOpen(true);
      return;
    }
    if (view === 'day-planner') {
      setIsDayPlannerOpen(true);
      return;
    }
    if (view === 'focus') {
      handleOpenFocusMode();
      return;
    }
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-[#090a10] text-slate-100 flex flex-col md:flex-row selection:bg-indigo-500 selection:text-white pb-16 md:pb-0">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenProjectModal={() => setIsProjectModalOpen(true)}
        onOpenDayPlanner={() => setIsDayPlannerOpen(true)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Navbar
          onOpenTaskModal={() => setIsTaskModalOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onNavigate={handleNavigate}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              onOpenTaskModal={() => setIsTaskModalOpen(true)}
              onSelectTask={(t) => setSelectedTask(t)}
              onOpenFocusMode={handleOpenFocusMode}
              onOpenDayPlanner={() => setIsDayPlannerOpen(true)}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'tasks' && (
            <TasksView
              initialTab="kanban"
              onSelectTask={(t) => setSelectedTask(t)}
              onOpenTaskModal={() => setIsTaskModalOpen(true)}
            />
          )}

          {currentView === 'dependencies' && (
            <TasksView
              initialTab="dependencies"
              onSelectTask={(t) => setSelectedTask(t)}
              onOpenTaskModal={() => setIsTaskModalOpen(true)}
            />
          )}

          {currentView === 'analytics' && <AnalyticsView />}

          {currentView === 'achievements' && <AchievementsView />}

          {(currentView === 'settings' || currentView === 'profile') && <SettingsView />}
        </main>
      </div>

      {/* Dedicated Mobile Navigation Bottom Bar */}
      <MobileNav
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenTaskModal={() => setIsTaskModalOpen(true)}
      />

      {/* Global Modals & Drawers */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTask={(t) => setSelectedTask(t)}
        onNavigate={handleNavigate}
        onOpenTaskModal={() => setIsTaskModalOpen(true)}
        onOpenDayPlanner={() => setIsDayPlannerOpen(true)}
        onOpenFocusMode={handleOpenFocusMode}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />

      <TaskDetailDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onOpenFocusMode={handleOpenFocusMode}
      />

      <FocusModeModal
        isOpen={isFocusModeOpen}
        onClose={() => setIsFocusModeOpen(false)}
        task={focusTask}
      />

      <DayPlannerModal
        isOpen={isDayPlannerOpen}
        onClose={() => setIsDayPlannerOpen(false)}
        onStartTaskInFocus={handleOpenFocusMode}
      />

      <TimeCapsuleModal
        isOpen={isTimeCapsuleOpen}
        onClose={() => setIsTimeCapsuleOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </AuthProvider>
  );
}
