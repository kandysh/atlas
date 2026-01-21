/**
 * Seed script for Atlas - generates up to 100 historical-like tasks
 *
 * This file:
 * - Ensures a default user and workspace exist (using USERINFO env)
 * - Ensures default field configs are created for a new workspace
 * - Generates 100 tasks with fields aligned to `getDefaultFieldConfigs`
 * - Creates `displayId` in the form `TSK-{workspacesequence}-{tasksequence}`
 * - Adds `createdAt` and `updatedAt` timestamps with reasonable historical spread
 *
 * Notes:
 * - workspace sequence uses `workspace.sequenceNumber` if present, otherwise falls back to `1`
 * - This script will skip inserting tasks if any tasks already exist for the workspace
 */

import { getDefaultFieldConfigs } from '../utils';
import { db } from './index';
import { workspaces, users, tasks, fieldConfigs } from './schema';
import { eq } from 'drizzle-orm';

function pick<T>(arr: T[], idx: number) {
  return arr[idx % arr.length];
}

function pickMany<T>(arr: T[], idx: number, count: number) {
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    result.push(arr[(idx + i) % arr.length]);
  }
  return result;
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Create a deterministic-ish offset from an index to spread dates historically
 */
function daysOffsetFromIndex(i: number, maxDays = 2000) {
  // simple deterministic pseudo-random-ish mapping using arithmetic
  return (i * 37) % maxDays;
}

function dateDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function dateDaysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function computeCreatedUpdatedForTask(
  idx: number,
  status: string,
  completionDate: Date | undefined | null,
) {
  // returns { createdAt: Date, updatedAt: Date }
  if (completionDate) {
    // Task completed at completionDate; created sometime before that
    const compMs = completionDate.getTime();
    const daysBefore = randInt(7, 180); // created 1-~6 months (or more) before completion
    const createdAt = new Date(compMs - daysBefore * MS_PER_DAY);
    // updatedAt is completionDate + 0..14 days (small wrap-up)
    const daysAfter = randInt(0, 14);
    const updatedAt = new Date(compMs + daysAfter * MS_PER_DAY);
    return { createdAt, updatedAt };
  }

  // Not completed: created earlier, updated more recently
  // Make created earlier for older indices
  const baseDaysAgo = 30 + daysOffsetFromIndex(idx, 900); // 30..930 days
  const createdAt = dateDaysAgo(baseDaysAgo);
  // updatedAt is between createdAt and now (biased toward recent)
  const updatedDaysAgo = randInt(0, Math.min(30, baseDaysAgo));
  const updatedAt = dateDaysAgo(updatedDaysAgo);
  return { createdAt, updatedAt };
}

async function seed() {
  console.log(
    '🌱 Seeding database with historical task data (up to 100 tasks)...',
  );

  try {
    const userData = JSON.parse(process.env.USERINFO!);

    // Ensure user
    let user = await db.query.users.findFirst({
      where: eq(users.email, userData.details.email),
    });

    if (!user) {
      const [newUser] = await db
        .insert(users)
        .values({
          name: userData.details.name,
          email: userData.details.email,
        })
        .returning();
      user = newUser;
      console.log('✅ Created user:', user.email);
    } else {
      console.log('✅ Found existing user:', user.email);
    }

    // Ensure workspace
    let workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.ownerUserId, user.id),
    });

    if (!workspace) {
      const [newWorkspace] = await db
        .insert(workspaces)
        .values({
          name: 'Demo Workspace',
          slug: 'demo-workspace',
          ownerUserId: user.id,
        })
        .returning();
      workspace = newWorkspace;
      console.log('✅ Created workspace:', workspace.name);

      // create default field configs for new workspace
      const defaultFields = getDefaultFieldConfigs(workspace.id);
      await db.insert(fieldConfigs).values(defaultFields);
      console.log('✅ Created default field configurations');
    } else {
      console.log('✅ Found existing workspace:', workspace.name);
    }

    // If tasks exist, skip seeding tasks
    const existingTasks = await db.query.tasks.findMany({
      where: eq(tasks.workspaceId, workspace.id),
    });

    if (existingTasks.length > 0) {
      console.log(
        `✅ Found ${existingTasks.length} existing tasks, skipping task seed`,
      );
      return;
    }

    // Pools of values to generate tasks
    const owners = [
      'Sarah Chen',
      'Michael Rodriguez',
      'Emily Johnson',
      'David Kim',
      'James Wilson',
      'Jennifer Martinez',
      'Amanda Lee',
      'Daniel Park',
      'Olivia Brown',
      'Liam Smith',
    ];

    const assignees = [
      'David Kim',
      'Emily Johnson',
      'James Wilson',
      'Michael Rodriguez',
      'Sarah Chen',
      'Jennifer Martinez',
      'Amanda Lee',
      'Daniel Park',
      'Olivia Brown',
      'Liam Smith',
    ];

    const assetClasses = [
      'Equities',
      'Fixed Income',
      'Derivatives',
      'Multi-Asset',
      'Cash',
      'Commodities',
    ];

    const themes = [
      'Automation',
      'Reporting',
      'Risk Management',
      'Process Improvement',
      'Data Integration',
      'Performance',
      'Compliance',
      'Analytics',
      'Portfolio Management',
    ];

    const teamNames = [
      'Operations',
      'Technology',
      'Risk',
      'Accounting',
      'Client Services',
      'Trading',
      'Portfolio Management',
      'Compliance',
      'Research',
    ];

    const toolsPool = [
      'Python',
      'SQL',
      'Alteryx',
      'Power BI',
      'DAX',
      'Azure',
      'Pandas',
      'NumPy',
      'Excel',
      'VBA',
      'Power Automate',
      'Tableau',
      'LaTeX',
      'R',
      'Shiny',
      'Splunk',
      'Elasticsearch',
      'Kibana',
      'JavaScript',
      'React',
      'Node.js',
      'C++',
      'CUDA',
      'UiPath',
      'Kafka',
      'Redis',
      'Go',
      'PostgreSQL',
      'MongoDB',
    ];

    const statuses = [
      'todo',
      'in-progress',
      'testing',
      'done',
      'completed',
      'blocked',
    ];
    const priorities = ['low', 'medium', 'high', 'urgent'];

    // Build 100 tasks
    const totalTasks = 10000;
    const sampleTasks: {
      sequenceNumber: number;
      data: Record<string, any>;
    }[] = [];

    for (let i = 1; i <= totalTasks; i++) {
      const idx = i - 1;

      // status distribution logic to create historical mix
      let status: string;
      if (i % 11 === 0) status = 'blocked';
      else if (i % 7 === 0) status = 'testing';
      else if (i % 5 === 0) status = 'completed';
      else if (i % 3 === 0) status = 'in-progress';
      else status = 'todo';

      // priority skew: more medium, fewer urgent
      const priority = pick(priorities, (idx * 3) % priorities.length);

      const owner = pick(owners, idx * 2 + 1);
      const assignee = pick(assignees, idx * 2 + 3);

      const assetClass = pick(assetClasses, idx * 5 + 2);
      const theme = pick(themes, idx * 7 + 4);
      const teamName = pick(teamNames, idx * 3 + 2);

      const tools = pickMany(toolsPool, idx * 4, 1 + (idx % 3)); // 1-3 tools

      const tags = [
        pick(
          [
            'automation',
            'reporting',
            'risk',
            'data',
            'integration',
            'performance',
            'compliance',
            'analytics',
          ],
          idx,
        ),
      ];

      // savedHrs and processesDemised sensible defaults
      const savedHrs =
        status === 'completed' || status === 'done'
          ? Math.max(0, ((idx * 13) % 200) - (idx % 10))
          : 0;

      const processesDemised = (idx * 7) % 5; // 0-4

      // Compose semi-realistic title variations
      const actionVerbs = [
        'Automate',
        'Build',
        'Implement',
        'Streamline',
        'Develop',
        'Optimize',
        'Create',
        'Enhance',
        'Design',
        'Refactor',
      ];
      const objects = [
        'Daily Reconciliation Process',
        'Real-time Portfolio Dashboard',
        'Automated Trade Validation',
        'Fund Accounting Workflows',
        'ESG Data Integration Pipeline',
        'Risk Calculation Engine',
        'Client Reporting Automation',
        'Trade Execution Analytics',
        'Compliance Monitoring System',
        'Position Management Tool',
        'Market Data Aggregation Layer',
        'Performance Attribution Dashboard',
        'Cash Management Automation',
        'Counterparty Risk Monitor',
      ];

      const title = `${pick(actionVerbs, idx)} ${pick(objects, idx + 3)}`;

      // Determine completionDate / plannedCompletion distribution
      // Use historical dates for completed/done, future approximate for todo/in-progress
      let completionDate: Date | null = null;
      if (status === 'completed' || status === 'done') {
        // completed sometime in the past (spread across ~5 years)
        const daysAgo = 200 + daysOffsetFromIndex(i, 365);
        completionDate = dateDaysAgo(daysAgo);
      } else if (status === 'in-progress' || status === 'testing') {
        // some planned near-term completion, or already partially completed historically
        const daysFromNow = (i % 6) * 10 - 15; // some negative, some positive
        completionDate =
          daysFromNow >= 0
            ? dateDaysFromNow(daysFromNow)
            : dateDaysAgo(-daysFromNow);
      } else {
        // todo / blocked: leave as a future planned date occasionally or null
        if (i % 4 === 0) {
          completionDate = dateDaysFromNow(30 + (i % 90));
        } else {
          completionDate = null;
        }
      }

      // package task data aligning to default-field-configs.ts keys
      const data: Record<string, any> = {
        title,
        status,
        priority,
        owner,
        assignee,
        assetClass,
        theme,
        teamName,
        tools,
        tags,
        savedHrs,
        processesDemised,
        otherUseCases: '',
      };

      if (completionDate) {
        data.completionDate = completionDate;
      }

      sampleTasks.push({
        sequenceNumber: i,
        data,
      });
    }

    // Determine workspace sequence (uses workspace.sequenceNumber if available, else fallback to 1)
    const workspaceSequence = (workspace as any).sequenceNumber ?? 1;

    // Insert tasks with displayId in form TSK-{workspacesequence}-{tasksequence}
    // Use batch insert and include createdAt/updatedAt
    const rowsToInsert = sampleTasks.map((task, idx) => {
      const completionDate: Date | undefined | null = task.data.completionDate;
      const { createdAt, updatedAt } = computeCreatedUpdatedForTask(
        idx + 1,
        task.data.status,
        completionDate,
      );

      return {
        workspaceId: workspace.id,
        displayId: `TSK-${workspaceSequence}-${task.sequenceNumber}`,
        sequenceNumber: task.sequenceNumber,
        data: task.data,
        createdAt,
        updatedAt,
      };
    });

    // Insert in smaller batches to avoid extremely large single inserts
    const batchSize = 50;
    for (let i = 0; i < rowsToInsert.length; i += batchSize) {
      const batch = rowsToInsert.slice(i, i + batchSize);
      await db.insert(tasks).values(batch);
      console.log(`Inserted tasks ${i + 1}..${i + batch.length}`);
    }

    console.log(`✅ Created ${sampleTasks.length} sample tasks`);
    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seed
seed()
  .then(() => {
    console.log('✅ Seed script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  });
