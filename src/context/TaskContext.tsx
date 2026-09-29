import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Task,
  Project,
  Notification,
  OnlineUser,
  NextActionResponse,
  TaskStatus,
  Priority,
  EnergyLevel,
} from '../types/index.ts';
import { api } from '../lib/api.ts';
import { useAuth } from './AuthContext.tsx';

interface TaskContextType {
  tasks: Task[];
  projects: Project[];
  notifications: Notification[];
  onlineUsers: OnlineUser[];
  activeViewingTask: { userName: string; taskId: number } | null;
  nextAction: NextActionResponse | null;
  activeProjectId: number | null;
  searchQuery: string;
  selectedPriority: Priority | 'all';
  selectedStatus: TaskStatus | 'all';
  isLoading: boolean;
  setActiveProjectId: (id: number | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedPriority: (priority: Priority | 'all') => void;
  setSelectedStatus: (status: TaskStatus | 'all') => void;
  refreshWorkspace: () => Promise<void>;
  refreshNextAction: () => Promise<void>;
  updateTaskStatus: (taskId: number, status: TaskStatus) => Promise<void>;
  toggleSubtask: (subtaskId: number) => Promise<void>;
  createTask: (payload: any) => Promise<Task>;
  deleteTask: (taskId: number) => Promise<void>;
  createProject: (payload: any) => Promise<Project>;
  markNotificationRead: (id: number) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  notifyViewingTask: (taskId: number | null) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [activeViewingTask, setActiveViewingTask] = useState<{ userName: string; taskId: number } | null>(null);
  const [nextAction, setNextAction] = useState<NextActionResponse | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);

  const refreshNextAction = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.getNextAction();
      setNextAction(data);
    } catch (err) {
      console.error('Failed to refresh next action:', err);
    }
  }, [token]);

  const refreshWorkspace = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [fetchedTasks, fetchedProjects, fetchedNotifs] = await Promise.all([
        api.getTasks(),
        api.getProjects(),
        api.getNotifications(),
      ]);
      setTasks(fetchedTasks);
      setProjects(fetchedProjects);
      setNotifications(fetchedNotifs);
      await refreshNextAction();
    } catch (err) {
      console.error('Failed to load workspace data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, refreshNextAction]);

  useEffect(() => {
    if (token && user) {
      refreshWorkspace();
    } else {
      setTasks([]);
      setProjects([]);
      setNotifications([]);
      setNextAction(null);
    }
  }, [token, user?.id, refreshWorkspace]);

  // WebSocket real-time connection
  useEffect(() => {
    if (!token || !user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      // Send user identification
      ws.send(
        JSON.stringify({
          type: 'IDENTIFY',
          userId: user.id,
          userName: user.name,
          avatar: user.avatar,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'PRESENCE_UPDATE') {
          setOnlineUsers(data.users || []);
        } else if (data.type === 'TASK_VIEWER') {
          if (data.taskId) {
            setActiveViewingTask({ userName: data.userName, taskId: data.taskId });
          } else {
            setActiveViewingTask(null);
          }
        } else if (
          data.type === 'TASK_CREATED' ||
          data.type === 'TASK_UPDATED' ||
          data.type === 'TASK_STATUS_CHANGED' ||
          data.type === 'TASK_DELETED' ||
          data.type === 'DEPENDENCY_CREATED' ||
          data.type === 'DEPENDENCY_DELETED'
        ) {
          // Re-sync workspace softly
          api.getTasks().then(setTasks).catch(console.error);
          api.getProjects().then(setProjects).catch(console.error);
          api.getNotifications().then(setNotifications).catch(console.error);
          refreshNextAction();
        }
      } catch (err) {
        console.error('WS message handling error:', err);
      }
    };

    ws.onerror = () => {
      // Ignore or let retry
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [token, user, refreshNextAction]);

  const notifyViewingTask = (taskId: number | null) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      if (taskId) {
        wsRef.current.send(JSON.stringify({ type: 'VIEWING_TASK', taskId }));
      } else {
        wsRef.current.send(JSON.stringify({ type: 'LEAVING_TASK' }));
      }
    }
  };

  const updateTaskStatus = async (taskId: number, status: TaskStatus) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status, completedAt: status === 'completed' ? new Date().toISOString() : undefined } : t))
    );

    try {
      await api.updateTaskStatus(taskId, status);
      await refreshWorkspace();
    } catch (err) {
      console.error('Failed to update task status:', err);
      refreshWorkspace();
    }
  };

  const toggleSubtask = async (subtaskId: number) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => {
        if (!t.subtasks) return t;
        const hasSub = t.subtasks.some((s) => s.id === subtaskId);
        if (!hasSub) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((s) => (s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s)),
        };
      })
    );

    try {
      await api.toggleSubtask(subtaskId);
    } catch (err) {
      console.error('Failed to toggle subtask:', err);
      refreshWorkspace();
    }
  };

  const createTask = async (payload: any) => {
    const newTask = await api.createTask(payload);
    await refreshWorkspace();
    return newTask;
  };

  const deleteTask = async (taskId: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await api.deleteTask(taskId);
    await refreshWorkspace();
  };

  const createProject = async (payload: any) => {
    const newProj = await api.createProject(payload);
    await refreshWorkspace();
    return newProj;
  };

  const markNotificationRead = async (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await api.markNotificationRead(id);
    } catch {
      // ignore
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await api.markAllNotificationsRead();
    } catch {
      // ignore
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        projects,
        notifications,
        onlineUsers,
        activeViewingTask,
        nextAction,
        activeProjectId,
        searchQuery,
        selectedPriority,
        selectedStatus,
        isLoading,
        setActiveProjectId,
        setSearchQuery,
        setSelectedPriority,
        setSelectedStatus,
        refreshWorkspace,
        refreshNextAction,
        updateTaskStatus,
        toggleSubtask,
        createTask,
        deleteTask,
        createProject,
        markNotificationRead,
        markAllNotificationsRead,
        notifyViewingTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
