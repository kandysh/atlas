import {
  pgTable,
  text,
  uuid,
  timestamp,
  jsonb,
  integer,
  pgEnum,
  index,
  serial,
  boolean,
  bigint,
  bigserial,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['owner', 'admin', 'member', 'viewer']);
export const fieldTypeEnum = pgEnum('field_type', [
  'text',
  'select',
  'multiselect',
  'date',
  'checkbox',
  'number',
  'editable-text',
  'editable-number',
  'editable-date',
  'editable-tags',
  'editable-combobox',
  'editable-owner',
  'status',
  'priority',
  'badge-list',
]);

// Workspaces Table
export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  numericId: serial('numeric_id').notNull().unique(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  ownerUserId: bigint('owner_user_id', { mode: 'number' })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Users Table
export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Workspace Members Table (Join Table)
export const workspaceMembers = pgTable('workspace_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: bigint('user_id', { mode: 'number' })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: roleEnum('role').notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Field Configs Table
export const fieldConfigs = pgTable('field_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  name: text('name').notNull(),
  type: fieldTypeEnum('type').notNull(),
  options: jsonb('options').$type<{
    choices?: string[];
    defaultValue?: string | number | boolean;
    required?: boolean;
    suffix?: string;
    [key: string]: string | string[] | number | boolean | undefined;
  }>(),
  order: integer('order').notNull().default(0),
  visible: boolean('visible').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Tasks Table
export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    displayId: text('display_id').notNull().unique(),
    sequenceNumber: integer('sequence_number').notNull(),
    data: jsonb('data')
      .notNull()
      .$type<Record<string, unknown>>()
      .default({}),
    subtasks: jsonb('subtasks')
      .$type<
        Array<{
          id: string;
          title: string;
          completed: boolean;
          [key: string]: unknown;
        }>
      >()
      .default([]),
    version: integer('version').notNull().default(1),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    workspaceSequenceIdx: index('workspace_sequence_idx').on(
      table.workspaceId,
      table.sequenceNumber,
    ),
  }),
);

// Task Comments Table
export const taskComments = pgTable('task_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  taskId: uuid('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  userId: bigint('user_id', { mode: 'number' })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Task Events Table - Audit log for task changes
export const taskEvents = pgTable(
  'task_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    taskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id, {
      onDelete: 'set null',
    }),
    eventType: text('event_type').notNull(), // 'created', 'updated', 'deleted', 'duplicated'
    field: text('field'), // Which field changed (null for create/delete)
    oldValue: jsonb('old_value'), // Previous value
    newValue: jsonb('new_value'), // New value
    metadata: jsonb('metadata').$type<{
      version?: number;
      displayId?: string;
      [key: string]: unknown;
    }>(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    taskEventIdx: index('task_event_idx').on(table.taskId, table.createdAt),
    workspaceEventIdx: index('workspace_event_idx').on(
      table.workspaceId,
      table.createdAt,
    ),
  }),
);

// Relations
export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, {
    fields: [workspaces.ownerUserId],
    references: [users.id],
  }),
  members: many(workspaceMembers),
  fieldConfigs: many(fieldConfigs),
  tasks: many(tasks),
  taskComments: many(taskComments),
}));

export const usersRelations = relations(users, ({ many }) => ({
  ownedWorkspaces: many(workspaces),
  memberships: many(workspaceMembers),
  comments: many(taskComments),
}));

export const workspaceMembersRelations = relations(
  workspaceMembers,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspaceMembers.workspaceId],
      references: [workspaces.id],
    }),
    user: one(users, {
      fields: [workspaceMembers.userId],
      references: [users.id],
    }),
  }),
);

export const fieldConfigsRelations = relations(fieldConfigs, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [fieldConfigs.workspaceId],
    references: [workspaces.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [tasks.workspaceId],
    references: [workspaces.id],
  }),
  comments: many(taskComments),
  events: many(taskEvents),
}));

export const taskCommentsRelations = relations(taskComments, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [taskComments.workspaceId],
    references: [workspaces.id],
  }),
  task: one(tasks, {
    fields: [taskComments.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskComments.userId],
    references: [users.id],
  }),
}));

export const taskEventsRelations = relations(taskEvents, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [taskEvents.workspaceId],
    references: [workspaces.id],
  }),
  task: one(tasks, {
    fields: [taskEvents.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskEvents.userId],
    references: [users.id],
  }),
}));

// Type exports
export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type NewWorkspaceMember = typeof workspaceMembers.$inferInsert;

export type FieldConfig = typeof fieldConfigs.$inferSelect;
export type NewFieldConfig = typeof fieldConfigs.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type TaskComment = typeof taskComments.$inferSelect;
export type NewTaskComment = typeof taskComments.$inferInsert;

export type TaskEvent = typeof taskEvents.$inferSelect;
export type NewTaskEvent = typeof taskEvents.$inferInsert;
