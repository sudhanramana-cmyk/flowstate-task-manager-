export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'backlog' | 'planned' | 'in_progress' | 'review' | 'completed';
export type EnergyLevel = 'high' | 'medium' | 'low';
export type ProductivityStyle = 'focused' | 'flexible' | 'deadline-driven' | 'balanced';

export interface User {
  id: number;
  uid: string;
  name: string;
  email: string;
  avatar?: string;
  productivityStyle: ProductivityStyle;
  workingToward: string;
  energyLevel: EnergyLevel;
  streak: number;
  focusMinutes: number;
  defaultDuration: number;
  defaultPriority: Priority;
  theme: string;
  createdAt: string;
}

export interface Project {
  id: number;
  userId: number;
  name: string;
  description: string;
  color: string;
  icon: string;
  progress: number;
  targetDate?: string;
  totalTasks?: number;
  completedTasks?: number;
  createdAt: string;
}

export interface Subtask {
  id: number;
  taskId: number;
  title: string;
  isCompleted: boolean;
  orderIndex: number;
  createdAt: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface TaskPrerequisite {
  id: number;
  title: string;
  status: TaskStatus;
  isCompleted: boolean;
}

export interface Task {
  id: number;
  userId: number;
  projectId: number;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string;
  dueTime?: string;
  estimatedDuration: number;
  energyRequired: EnergyLevel;
  assigneeName: string;
  assigneeAvatar?: string;
  orderIndex: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  subtasks?: Subtask[];
  tags?: Tag[];
  prerequisites?: TaskPrerequisite[];
  isBlocked?: boolean;
  blocksCount?: number;
}

export interface Comment {
  id: number;
  taskId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'deadline' | 'assigned' | 'completed' | 'system' | 'streak';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: number;
  userId: number;
  taskId?: number;
  action: string;
  details: string;
  createdAt: string;
}

export interface FocusSession {
  id: number;
  userId: number;
  taskId?: number;
  taskTitle?: string;
  durationMinutes: number;
  completedSuccessfully: boolean;
  notes?: string;
  createdAt: string;
}

export interface Achievement {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface TimeCapsule {
  id: number;
  userId: number;
  goalStatement: string;
  targetDate: string;
  reflectionNotes?: string;
  status: 'active' | 'unlocked' | 'archived';
  snapshotProgress: number;
  createdAt: string;
}

export interface NextActionResponse {
  hasAction: boolean;
  isAllBlocked?: boolean;
  task?: Task;
  score?: number;
  reason?: string;
  message?: string;
}

export interface DayScheduleItem {
  time: string;
  endTime: string;
  taskId?: number;
  title: string;
  type: 'task' | 'break';
  duration: number;
  priority?: Priority;
}

export interface AnalyticsData {
  totalTasks: number;
  completedCount: number;
  inProgressCount: number;
  overdueCount: number;
  completionRate: number;
  streak: number;
  totalFocusHours: number;
  productivityScore: number;
  scoreBreakdown: {
    planning: number;
    consistency: number;
    completion: number;
    focus: number;
  };
  priorityDistribution: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
  heatmap: Array<{ date: string; count: number; level: number }>;
  weeklyTrend: Array<{ day: string; completed: number; focusMinutes: number }>;
}

export interface OnlineUser {
  userId?: number;
  name: string;
  avatar?: string;
  activeTaskId?: number | null;
}
