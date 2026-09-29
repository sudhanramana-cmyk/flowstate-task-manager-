import {
  User,
  Project,
  Task,
  Comment,
  Notification,
  ActivityLog,
  FocusSession,
  Achievement,
  TimeCapsule,
  NextActionResponse,
  DayScheduleItem,
  AnalyticsData,
  Priority,
  TaskStatus,
  EnergyLevel,
} from '../types/index.ts';

const TOKEN_KEY = 'flowstate_auth_token';

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const setStoredToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const removeStoredToken = () => localStorage.removeItem(TOKEN_KEY);

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (payload: { name: string; email: string; password: string; workingToward?: string; productivityStyle?: string }) =>
    request<{ user: User; token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),

  login: (payload: { email: string; password: string }) =>
    request<{ user: User; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),

  demoLogin: () =>
    request<{ user: User; token: string }>('/auth/demo', { method: 'POST' }),

  forgotPassword: (email: string) =>
    request<{ message: string; tempCode: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (payload: { email: string; newPassword: string }) =>
    request<{ message: string }>('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),

  getMe: () =>
    request<{ user: User }>('/auth/me'),

  logout: () =>
    request<{ success: boolean }>('/auth/logout', { method: 'POST' }),

  updatePreferences: (payload: Partial<User>) =>
    request<{ user: User }>('/auth/preferences', { method: 'PATCH', body: JSON.stringify(payload) }),

  // Projects
  getProjects: () =>
    request<Project[]>('/projects'),

  createProject: (payload: Partial<Project>) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(payload) }),

  updateProject: (id: number, payload: Partial<Project>) =>
    request<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  deleteProject: (id: number) =>
    request<{ success: boolean }>(`/projects/${id}`, { method: 'DELETE' }),

  // Tasks
  getTasks: () =>
    request<Task[]>('/tasks'),

  createTask: (payload: {
    projectId: number;
    title: string;
    description?: string;
    priority?: Priority;
    status?: TaskStatus;
    dueDate?: string;
    dueTime?: string;
    estimatedDuration?: number;
    energyRequired?: EnergyLevel;
    assigneeName?: string;
    subtasks?: string[];
    tagNames?: string[];
    dependsOnTaskIds?: number[];
  }) => request<Task>('/tasks', { method: 'POST', body: JSON.stringify(payload) }),

  updateTask: (id: number, payload: Partial<Task>) =>
    request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  updateTaskStatus: (id: number, status: TaskStatus) =>
    request<Task>(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  deleteTask: (id: number) =>
    request<{ success: boolean }>(`/tasks/${id}`, { method: 'DELETE' }),

  toggleSubtask: (subtaskId: number) =>
    request<{ id: number; isCompleted: boolean }>(`/subtasks/${subtaskId}/toggle`, { method: 'PATCH' }),

  decomposeTask: (payload: { title: string; description?: string }) =>
    request<{ subtasks: string[] }>('/tasks/decompose', { method: 'POST', body: JSON.stringify(payload) }),

  // Dependencies
  addDependency: (taskId: number, dependsOnTaskId: number) =>
    request<any>(`/tasks/${taskId}/dependencies`, { method: 'POST', body: JSON.stringify({ dependsOnTaskId }) }),

  removeDependency: (taskId: number, dependsOnTaskId: number) =>
    request<{ success: boolean }>(`/tasks/${taskId}/dependencies/${dependsOnTaskId}`, { method: 'DELETE' }),

  getDependencyGraph: () =>
    request<{ nodes: Array<{ id: string; title: string; status: string; priority: string; projectId: number }>; edges: Array<{ id: string; source: string; target: string }> }>('/dependencies/graph'),

  // Focus
  endFocusSession: (payload: { taskId?: number; durationMinutes: number; completedSuccessfully?: boolean; notes?: string }) =>
    request<FocusSession>('/focus/end', { method: 'POST', body: JSON.stringify(payload) }),

  getFocusHistory: () =>
    request<FocusSession[]>('/focus/history'),

  // Smart Recommendations
  getNextAction: () =>
    request<NextActionResponse>('/smart/next-action'),

  getDayPlanner: () =>
    request<{ totalPlannedHours: number; schedule: DayScheduleItem[] }>('/smart/day-planner'),

  // Comments
  getComments: (taskId: number) =>
    request<Comment[]>(`/tasks/${taskId}/comments`),

  addComment: (taskId: number, content: string) =>
    request<Comment>(`/tasks/${taskId}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),

  // Notifications
  getNotifications: () =>
    request<Notification[]>('/notifications'),

  markNotificationRead: (id: number) =>
    request<Notification>(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/notifications/read-all', { method: 'POST' }),

  // Time Capsules
  getTimeCapsules: () =>
    request<TimeCapsule[]>('/time-capsules'),

  createTimeCapsule: (payload: { goalStatement: string; targetDate: string; reflectionNotes?: string }) =>
    request<TimeCapsule>('/time-capsules', { method: 'POST', body: JSON.stringify(payload) }),

  // Analytics & Gamification
  getAnalytics: () =>
    request<AnalyticsData>('/analytics'),

  getAchievements: () =>
    request<Achievement[]>('/achievements'),

  getActivityLogs: () =>
    request<ActivityLog[]>('/activity'),
};
