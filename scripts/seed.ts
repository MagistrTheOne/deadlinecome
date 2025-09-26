#!/usr/bin/env tsx

/**
 * Development/Testing Seed Script for DeadLine
 *
 * This script populates the database with sample data for development and testing.
 * NEVER run this in production environments.
 *
 * Usage:
 *   pnpm tsx scripts/seed.ts
 */

import { db } from '../src/db/drizzle';
import { user, workspace, project, issue } from '../src/db/schema/schema';
import { board } from '../src/db/schema/schema-boards';

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // Check if we're in production
    if (process.env.NODE_ENV === 'production') {
      throw new Error('❌ Cannot run seed script in production environment!');
    }

    console.log('🧹 Clearing existing data...');

    // Clear tables in reverse dependency order
    await db.delete(issue);
    await db.delete(board);
    await db.delete(project);
    await db.delete(workspace);
    await db.delete(user);

    console.log('👤 Creating users...');

    const users = await db.insert(user).values([
      {
        name: 'Admin User',
        email: 'admin@deadline.dev',
        emailVerified: true,
        status: 'ONLINE' as const,
        language: 'ru',
        theme: 'DARK' as const,
      },
      {
        name: 'Developer User',
        email: 'dev@deadline.dev',
        emailVerified: true,
        status: 'ONLINE' as const,
        language: 'ru',
        theme: 'DARK' as const,
      },
      {
        name: 'QA User',
        email: 'qa@deadline.dev',
        emailVerified: true,
        status: 'AWAY' as const,
        language: 'en',
        theme: 'LIGHT' as const,
      },
    ]).returning();

    console.log('🏢 Creating workspace...');

    const workspaces = await db.insert(workspace).values([
      {
        name: 'DeadLine Development',
        description: 'Main workspace for DeadLine development',
        ownerId: users[0].id,
        settings: {
          timezone: 'UTC',
          workingHours: { start: '09:00', end: '18:00' },
        },
      },
    ]).returning();

    console.log('📁 Creating projects...');

    const projects = await db.insert(project).values([
      {
        name: 'DeadLine Core',
        description: 'Core functionality and API',
        workspaceId: workspaces[0].id,
        key: 'DL',
        ownerId: users[0].id,
      },
      {
        name: 'DeadLine Frontend',
        description: 'React/Next.js frontend application',
        workspaceId: workspaces[0].id,
        key: 'FE',
        ownerId: users[1].id,
      },
    ]).returning();

    console.log('📋 Creating boards...');

    const boards = await db.insert(board).values([
      {
        name: 'Core Development',
        description: 'Board for core development tasks',
        type: 'kanban',
        workspaceId: workspaces[0].id,
        projectId: projects[0].id,
        createdById: users[0].id,
        settings: {
          columns: [
            { id: 'backlog', name: 'Backlog', status: 'BACKLOG', order: 0 },
            { id: 'todo', name: 'To Do', status: 'TODO', order: 1 },
            { id: 'in-progress', name: 'In Progress', status: 'IN_PROGRESS', order: 2 },
            { id: 'done', name: 'Done', status: 'DONE', order: 3 },
          ],
        },
      },
      {
        name: 'Frontend Tasks',
        description: 'Board for frontend development',
        type: 'kanban',
        workspaceId: workspaces[0].id,
        projectId: projects[1].id,
        createdById: users[1].id,
        settings: {
          columns: [
            { id: 'backlog', name: 'Backlog', status: 'BACKLOG', order: 0 },
            { id: 'todo', name: 'To Do', status: 'TODO', order: 1 },
            { id: 'in-progress', name: 'In Progress', status: 'IN_PROGRESS', order: 2 },
            { id: 'done', name: 'Done', status: 'DONE', order: 3 },
          ],
        },
      },
    ]).returning();

    console.log('🎯 Creating sample issues...');

    await db.insert(issue).values([
      {
        key: 'DL-1',
        title: 'Implement user authentication',
        description: 'Add JWT-based authentication system',
        status: 'DONE' as const,
        priority: 'HIGH' as const,
        type: 'TASK' as const,
        projectId: projects[0].id,
        assigneeId: users[1].id,
        reporterId: users[0].id,
      },
      {
        key: 'DL-2',
        title: 'Create database schema',
        description: 'Design and implement PostgreSQL schema with Drizzle',
        status: 'DONE' as const,
        priority: 'HIGH' as const,
        type: 'TASK' as const,
        projectId: projects[0].id,
        assigneeId: users[0].id,
        reporterId: users[0].id,
      },
      {
        key: 'DL-3',
        title: 'Setup CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment',
        status: 'IN_PROGRESS' as const,
        priority: 'MEDIUM' as const,
        type: 'TASK' as const,
        projectId: projects[0].id,
        assigneeId: users[1].id,
        reporterId: users[0].id,
      },
      {
        key: 'FE-1',
        title: 'Design main dashboard',
        description: 'Create responsive dashboard layout with charts and metrics',
        status: 'TODO' as const,
        priority: 'HIGH' as const,
        type: 'STORY' as const,
        projectId: projects[1].id,
        assigneeId: users[1].id,
        reporterId: users[1].id,
      },
      {
        key: 'FE-2',
        title: 'Implement board view',
        description: 'Create Kanban board component with drag-and-drop functionality',
        status: 'IN_PROGRESS' as const,
        priority: 'HIGH' as const,
        type: 'STORY' as const,
        projectId: projects[1].id,
        assigneeId: users[2].id,
        reporterId: users[1].id,
      },
    ]);

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Created:`);
    console.log(`   - ${users.length} users`);
    console.log(`   - ${workspaces.length} workspaces`);
    console.log(`   - ${projects.length} projects`);
    console.log(`   - ${boards.length} boards`);
    console.log(`   - 5 sample issues`);

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

// Run seed only if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('🎉 Seed script completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seed script failed:', error);
      process.exit(1);
    });
}
