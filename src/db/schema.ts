import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase UID or Auth token ID
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  avatar: text('avatar'),
  productivityStyle: text('productivity_style').default('focused').notNull(),
  workingToward: text('working_toward').default('Startup').notNull(),
  energyLevel: text('energy_level').default('high').notNull(), // 'high' | 'medium' | 'low'
  streak: integer('streak').default(3).notNull(),
  focusMinutes: integer('focus_minutes').default(120).notNull(),
  defaultDuration: integer('default_duration').default(30).notNull(),
  defaultPriority: text('default_priority').default('medium').notNull(),
  theme: text('theme').default('dark').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Projects table
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description').default('').notNull(),
  color: text('color').default('#6366f1').notNull(),
  icon: text('icon').default('Folder').notNull(),
  progress: integer('progress').default(0).notNull(),
  targetDate: text('target_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tasks table
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description').default('').notNull(),
  priority: text('priority').default('medium').notNull(), // 'urgent' | 'high' | 'medium' | 'low'
  status: text('status').default('planned').notNull(), // 'backlog' | 'planned' | 'in_progress' | 'review' | 'completed'
  dueDate: text('due_date'), // YYYY-MM-DD
  dueTime: text('due_time'), // HH:mm
  estimatedDuration: integer('estimated_duration').default(30).notNull(), // minutes
  energyRequired: text('energy_required').default('medium').notNull(), // 'high' | 'medium' | 'low'
  assigneeName: text('assignee_name').default('You').notNull(),
  assigneeAvatar: text('assignee_avatar'),
  orderIndex: integer('order_index').default(0).notNull(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Subtasks table
export const subtasks = pgTable('subtasks', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  orderIndex: integer('order_index').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tags table
export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  color: text('color').default('#8b5cf6').notNull(),
});

// TaskTags join table
export const taskTags = pgTable('task_tags', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  tagId: integer('tag_id').references(() => tags.id, { onDelete: 'cascade' }).notNull(),
});

// TaskDependencies table (Signature feature: Task A depends on Task B)
export const taskDependencies = pgTable('task_dependencies', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(), // The blocked task
  dependsOnTaskId: integer('depends_on_task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(), // The prerequisite task
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Comments table
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  userName: text('user_name').notNull(),
  userAvatar: text('user_avatar'),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').default('system').notNull(), // 'deadline' | 'assigned' | 'completed' | 'system' | 'streak'
  isRead: boolean('is_read').default(false).notNull(),
  link: text('link'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ActivityLogs table
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  details: text('details').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// FocusSessions table
export const focusSessions = pgTable('focus_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'set null' }),
  taskTitle: text('task_title'),
  durationMinutes: integer('duration_minutes').notNull(),
  completedSuccessfully: boolean('completed_successfully').default(true).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Achievements table
export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  category: text('category').default('productivity').notNull(),
});

// UserAchievements join table
export const userAchievements = pgTable('user_achievements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  achievementId: integer('achievement_id').references(() => achievements.id, { onDelete: 'cascade' }).notNull(),
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
});

// TimeCapsules table
export const timeCapsules = pgTable('time_capsules', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  goalStatement: text('goal_statement').notNull(),
  targetDate: text('target_date').notNull(), // YYYY-MM-DD
  reflectionNotes: text('reflection_notes'),
  status: text('status').default('active').notNull(), // 'active' | 'unlocked' | 'archived'
  snapshotProgress: integer('snapshot_progress').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// TaskTemplates table
export const taskTemplates = pgTable('task_templates', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category').default('General').notNull(),
  tasksJson: text('tasks_json').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  tasks: many(tasks),
  tags: many(tags),
  comments: many(comments),
  notifications: many(notifications),
  activityLogs: many(activityLogs),
  focusSessions: many(focusSessions),
  userAchievements: many(userAchievements),
  timeCapsules: many(timeCapsules),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  user: one(users, { fields: [tasks.userId], references: [users.id] }),
  subtasks: many(subtasks),
  taskTags: many(taskTags),
  dependencies: many(taskDependencies, { relationName: 'taskDependencies' }),
  blockedBy: many(taskDependencies, { relationName: 'dependsOnTask' }),
  comments: many(comments),
  activityLogs: many(activityLogs),
}));

export const subtasksRelations = relations(subtasks, ({ one }) => ({
  task: one(tasks, { fields: [subtasks.taskId], references: [tasks.id] }),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, { fields: [tags.userId], references: [users.id] }),
  taskTags: many(taskTags),
}));

export const taskTagsRelations = relations(taskTags, ({ one }) => ({
  task: one(tasks, { fields: [taskTags.taskId], references: [tasks.id] }),
  tag: one(tags, { fields: [taskTags.tagId], references: [tags.id] }),
}));

export const taskDependenciesRelations = relations(taskDependencies, ({ one }) => ({
  task: one(tasks, { fields: [taskDependencies.taskId], references: [tasks.id], relationName: 'taskDependencies' }),
  dependsOnTask: one(tasks, { fields: [taskDependencies.dependsOnTaskId], references: [tasks.id], relationName: 'dependsOnTask' }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  task: one(tasks, { fields: [comments.taskId], references: [tasks.id] }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const focusSessionsRelations = relations(focusSessions, ({ one }) => ({
  user: one(users, { fields: [focusSessions.userId], references: [users.id] }),
  task: one(tasks, { fields: [focusSessions.taskId], references: [tasks.id] }),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, { fields: [userAchievements.userId], references: [users.id] }),
  achievement: one(achievements, { fields: [userAchievements.achievementId], references: [achievements.id] }),
}));

export const timeCapsulesRelations = relations(timeCapsules, ({ one }) => ({
  user: one(users, { fields: [timeCapsules.userId], references: [users.id] }),
}));
