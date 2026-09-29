import { db } from '../db/index.ts';
import {
  users,
  projects,
  tasks,
  subtasks,
  tags,
  taskTags,
  taskDependencies,
  comments,
  notifications,
  activityLogs,
  focusSessions,
  achievements,
  userAchievements,
  timeCapsules,
} from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export async function seedUserData(userId: number, userName: string) {
  // Check if user already has projects
  const existingProjects = await db.select().from(projects).where(eq(projects.userId, userId));
  if (existingProjects.length > 0) return;

  // 1. Create Projects
  const [proj1, proj2, proj3] = await db.insert(projects).values([
    {
      userId,
      name: 'Autonomous SaaS Engine',
      description: 'Core infrastructure, real-time messaging, and cognitive task planning platform.',
      color: '#6366f1', // Electric Indigo
      icon: 'Rocket',
      progress: 68,
      targetDate: '2026-10-15',
    },
    {
      userId,
      name: 'AI Architecture & Workflows',
      description: 'Heuristic task decomposition, dependency graph analysis, and velocity estimation.',
      color: '#8b5cf6', // Electric Violet
      icon: 'Cpu',
      progress: 52,
      targetDate: '2026-10-30',
    },
    {
      userId,
      name: 'Q4 Product Launch',
      description: 'Landing experience, interactive demo onboarding, and public release.',
      color: '#06b6d4', // Vibrant Cyan
      icon: 'TrendingUp',
      progress: 40,
      targetDate: '2026-11-10',
    },
  ]).returning();

  // 2. Create Tags
  const [tagCore, tagArch, tagUI, tagRealtime] = await db.insert(tags).values([
    { userId, name: 'Core Engine', color: '#6366f1' },
    { userId, name: 'Architecture', color: '#8b5cf6' },
    { userId, name: 'Glassmorphism UI', color: '#06b6d4' },
    { userId, name: 'Realtime Sync', color: '#10b981' },
  ]).returning();

  // Today and tomorrow date strings
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  // 3. Create Tasks
  const createdTasks = await db.insert(tasks).values([
    {
      userId,
      projectId: proj1.id,
      title: 'Architect PostgreSQL Relational Schema',
      description: 'Define relational tables with foreign key cascades, connection pooling, and optimized indexing.',
      priority: 'high',
      status: 'completed',
      dueDate: today,
      dueTime: '11:00',
      estimatedDuration: 45,
      energyRequired: 'high',
      assigneeName: userName,
      completedAt: new Date(Date.now() - 3600000 * 4),
    },
    {
      userId,
      projectId: proj1.id,
      title: 'Finish API Authentication & Session Security',
      description: 'Implement dual Firebase OAuth and JWT authorization with cryptographic password hashing.',
      priority: 'urgent',
      status: 'in_progress',
      dueDate: today,
      dueTime: '16:00',
      estimatedDuration: 60,
      energyRequired: 'high',
      assigneeName: userName,
    },
    {
      userId,
      projectId: proj2.id,
      title: 'Smart Next Action Heuristic Recommendation',
      description: 'Synthesize priority weight, upcoming deadlines, blocker dependencies, and user energy level.',
      priority: 'urgent',
      status: 'planned',
      dueDate: tomorrow,
      dueTime: '14:00',
      estimatedDuration: 75,
      energyRequired: 'high',
      assigneeName: userName,
    },
    {
      userId,
      projectId: proj2.id,
      title: 'Interactive Visual Dependency Graph',
      description: 'Render interactive nodes, directional links, and animated status badges for prerequisites.',
      priority: 'high',
      status: 'planned',
      dueDate: tomorrow,
      dueTime: '18:00',
      estimatedDuration: 60,
      energyRequired: 'medium',
      assigneeName: userName,
    },
    {
      userId,
      projectId: proj1.id,
      title: 'Full-Duplex WebSocket Synchronization',
      description: 'Stream instant updates on task creation, drag & drop status shifts, and active collaborator presence.',
      priority: 'high',
      status: 'review',
      dueDate: nextWeek,
      dueTime: '15:00',
      estimatedDuration: 45,
      energyRequired: 'medium',
      assigneeName: 'Alex Rivera',
    },
    {
      userId,
      projectId: proj3.id,
      title: 'Distraction-Free Focus Mode Environment',
      description: 'Fullscreen Pomodoro timer with state tracking, audio haptics, and automatic productivity analytics.',
      priority: 'medium',
      status: 'planned',
      dueDate: nextWeek,
      dueTime: '17:30',
      estimatedDuration: 30,
      energyRequired: 'low',
      assigneeName: userName,
    },
    {
      userId,
      projectId: proj3.id,
      title: 'Global Command Palette (Ctrl+K)',
      description: 'Instant fuzzy indexing across tasks, projects, actions, and settings with hotkey navigation.',
      priority: 'medium',
      status: 'backlog',
      dueDate: nextWeek,
      dueTime: '12:00',
      estimatedDuration: 40,
      energyRequired: 'low',
      assigneeName: 'Sarah Chen',
    },
  ]).returning();

  // 4. Subtasks for key tasks
  await db.insert(subtasks).values([
    { taskId: createdTasks[1].id, title: 'Verify token expiration edge cases', isCompleted: true, orderIndex: 0 },
    { taskId: createdTasks[1].id, title: 'Inject user profile into Express context', isCompleted: true, orderIndex: 1 },
    { taskId: createdTasks[1].id, title: 'Write integration test suite for /api/auth/login', isCompleted: false, orderIndex: 2 },
    { taskId: createdTasks[2].id, title: 'Calculate urgency multiplier for < 24h deadlines', isCompleted: true, orderIndex: 0 },
    { taskId: createdTasks[2].id, title: 'Evaluate blocker chain weight', isCompleted: false, orderIndex: 1 },
    { taskId: createdTasks[2].id, title: 'Match user energy level to task intensity', isCompleted: false, orderIndex: 2 },
    { taskId: createdTasks[3].id, title: 'Compute topological sort for DAG', isCompleted: false, orderIndex: 0 },
    { taskId: createdTasks[3].id, title: 'Add animated glowing blocker connectors', isCompleted: false, orderIndex: 1 },
  ]);

  // 5. Task Dependencies (Signature Feature: Task 1 -> Task 2 -> Task 3 -> Task 4)
  // Task 2 depends on Task 1 (Prerequisite is Task 1, which is completed!)
  // Task 3 depends on Task 2 (Blocked! Task 2 is in_progress)
  // Task 4 depends on Task 3 (Blocked! Task 3 is planned)
  await db.insert(taskDependencies).values([
    { taskId: createdTasks[1].id, dependsOnTaskId: createdTasks[0].id },
    { taskId: createdTasks[2].id, dependsOnTaskId: createdTasks[1].id },
    { taskId: createdTasks[3].id, dependsOnTaskId: createdTasks[2].id },
  ]);

  // 6. Assign Tags
  await db.insert(taskTags).values([
    { taskId: createdTasks[0].id, tagId: tagCore.id },
    { taskId: createdTasks[1].id, tagId: tagCore.id },
    { taskId: createdTasks[2].id, tagId: tagArch.id },
    { taskId: createdTasks[3].id, tagId: tagUI.id },
    { taskId: createdTasks[4].id, tagId: tagRealtime.id },
  ]);

  // 7. Seed Comments
  await db.insert(comments).values([
    {
      taskId: createdTasks[1].id,
      userId,
      userName: 'Alex Rivera',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      content: 'JWT signing and Bearer token parsing are validated against Postgres. Looking solid!',
    },
    {
      taskId: createdTasks[2].id,
      userId,
      userName,
      content: 'Make sure tasks blocking 2 or more downstream items receive a +35% priority surge.',
    },
  ]);

  // 8. Seed Activity Logs
  await db.insert(activityLogs).values([
    {
      userId,
      taskId: createdTasks[0].id,
      action: 'completed',
      details: 'Marked "Architect PostgreSQL Relational Schema" as completed',
    },
    {
      userId,
      taskId: createdTasks[1].id,
      action: 'status_changed',
      details: 'Moved "Finish API Authentication & Session Security" to In Progress',
    },
    {
      userId,
      taskId: createdTasks[2].id,
      action: 'priority_changed',
      details: 'Elevated priority of "Smart Next Action Recommendation" to Urgent',
    },
  ]);

  // 9. Seed Notifications
  await db.insert(notifications).values([
    {
      userId,
      title: '⚠️ Critical Blocker Alert',
      message: '"Smart Next Action Recommendation" is waiting on "Finish API Authentication".',
      type: 'deadline',
      isRead: false,
    },
    {
      userId,
      title: '🔥 3-Day Momentum Streak',
      message: 'You have hit your daily productivity target for 3 consecutive days! Keep going.',
      type: 'streak',
      isRead: false,
    },
    {
      userId,
      title: '🎯 Focus Session Milestone',
      message: 'Completed 2 Focus Sessions today (50 minutes total). Momentum at 78%.',
      type: 'completed',
      isRead: true,
    },
  ]);

  // 10. Seed Focus Sessions
  await db.insert(focusSessions).values([
    {
      userId,
      taskId: createdTasks[0].id,
      taskTitle: 'Architect PostgreSQL Relational Schema',
      durationMinutes: 25,
      completedSuccessfully: true,
      notes: 'Finalized index definitions and foreign keys',
    },
    {
      userId,
      taskId: createdTasks[1].id,
      taskTitle: 'Finish API Authentication & Session Security',
      durationMinutes: 25,
      completedSuccessfully: true,
      notes: 'Tested token verification middleware',
    },
  ]);

  // 11. Seed Time Capsule
  await db.insert(timeCapsules).values([
    {
      userId,
      goalStatement: 'Launch FlowState public beta with real-time dependency resolution and achieve 90%+ daily momentum.',
      targetDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      reflectionNotes: 'Focusing on clean architecture and frictionless user experience.',
      status: 'active',
      snapshotProgress: 53,
    },
  ]);

  // 12. Seed Default User Achievements
  const allAchievements = await db.select().from(achievements);
  const firstLaunch = allAchievements.find(a => a.slug === 'first_launch');
  if (firstLaunch) {
    await db.insert(userAchievements).values({
      userId,
      achievementId: firstLaunch.id,
    });
  }
}
