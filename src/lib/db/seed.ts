import { getDefaultFieldConfigs } from '../utils';
import { db } from './index';
import { workspaces, users, tasks, fieldConfigs } from './schema';
import { eq } from 'drizzle-orm';

/**
 * Seed the database with sample data
 */
async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Get or create default user
    const userData = JSON.parse(process.env.USERINFO!);

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

    // Get or create default workspace
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

      // Create default field configurations
      const defaultFields = getDefaultFieldConfigs(workspace.id);
      await db.insert(fieldConfigs).values(defaultFields);
      console.log('✅ Created default field configurations');
    } else {
      console.log('✅ Found existing workspace:', workspace.name);
    }

    // Check if tasks already exist
    const existingTasks = await db.query.tasks.findMany({
      where: eq(tasks.workspaceId, workspace.id),
    });

    if (existingTasks.length > 0) {
      console.log(
        `✅ Found ${existingTasks.length} existing tasks, skipping seed`,
      );
      return;
    }

    // Sample task data
    const sampleTasks = [
      {
        displayId: 'TSK-1',
        sequenceNumber: 1,
        data: {
          title: 'Automate Daily Reconciliation Process',
          status: 'completed',
          priority: 'high',
          owner: 'Sarah Chen',
          assignee: 'David Kim',
          assetClass: 'Fixed Income',
          theme: 'Automation',
          teamsInvolved: ['Operations', 'Technology'],
          tools: ['Python', 'SQL', 'Alteryx'],
          currentHrs: 120,
          savedHrs: 100,
          workedHrs: 80,
          completionDate: new Date('2026-01-15'),
        },
      },
      {
        displayId: 'TSK-2',
        sequenceNumber: 2,
        data: {
          title: 'Build Real-time Portfolio Dashboard',
          status: 'in-progress',
          priority: 'urgent',
          owner: 'Michael Rodriguez',
          assignee: 'Emily Johnson',
          assetClass: 'Equities',
          theme: 'Reporting',
          teamsInvolved: ['Technology', 'Portfolio Management'],
          tools: ['Power BI', 'DAX', 'Azure'],
          currentHrs: 200,
          savedHrs: 0,
          workedHrs: 120,
          completionDate: new Date('2026-02-01'),
        },
      },
      {
        displayId: 'TSK-3',
        sequenceNumber: 3,
        data: {
          title: 'Implement Automated Trade Validation',
          status: 'testing',
          priority: 'high',
          owner: 'Emily Johnson',
          assignee: 'James Wilson',
          assetClass: 'Derivatives',
          theme: 'Risk Management',
          teamsInvolved: ['Risk', 'Technology'],
          tools: ['Python', 'Pandas', 'NumPy'],
          currentHrs: 160,
          savedHrs: 80,
          workedHrs: 140,
          completionDate: new Date('2026-01-25'),
        },
      },
      {
        displayId: 'TSK-4',
        sequenceNumber: 4,
        data: {
          title: 'Streamline Fund Accounting Workflows',
          status: 'todo',
          priority: 'medium',
          owner: 'David Kim',
          assignee: 'Jennifer Martinez',
          assetClass: 'Multi-Asset',
          theme: 'Process Improvement',
          teamsInvolved: ['Accounting', 'Operations'],
          tools: ['Excel', 'VBA', 'Power Automate'],
          currentHrs: 180,
          savedHrs: 0,
          workedHrs: 0,
          completionDate: new Date('2026-02-15'),
        },
      },
      {
        displayId: 'TSK-5',
        sequenceNumber: 5,
        data: {
          title: 'Develop ESG Data Integration Pipeline',
          status: 'in-progress',
          priority: 'high',
          owner: 'Sarah Chen',
          assignee: 'Michael Rodriguez',
          assetClass: 'Equities',
          theme: 'Data Integration',
          teamsInvolved: ['Technology', 'Research'],
          tools: ['Python', 'API', 'PostgreSQL'],
          currentHrs: 240,
          savedHrs: 0,
          workedHrs: 100,
          completionDate: new Date('2026-02-10'),
        },
      },
      {
        displayId: 'TSK-6',
        sequenceNumber: 6,
        data: {
          title: 'Optimize Risk Calculation Engine',
          status: 'done',
          priority: 'medium',
          owner: 'James Wilson',
          assignee: 'Emily Johnson',
          assetClass: 'Fixed Income',
          theme: 'Performance',
          teamsInvolved: ['Risk', 'Technology'],
          tools: ['C++', 'CUDA', 'Python'],
          currentHrs: 140,
          savedHrs: 60,
          workedHrs: 120,
          completionDate: new Date('2026-01-10'),
        },
      },
      {
        displayId: 'TSK-7',
        sequenceNumber: 7,
        data: {
          title: 'Create Client Reporting Automation',
          status: 'todo',
          priority: 'low',
          owner: 'Jennifer Martinez',
          assignee: 'Sarah Chen',
          assetClass: 'Multi-Asset',
          theme: 'Automation',
          teamsInvolved: ['Client Services', 'Technology'],
          tools: ['Tableau', 'Python', 'LaTeX'],
          currentHrs: 100,
          savedHrs: 0,
          workedHrs: 0,
          completionDate: new Date('2026-03-01'),
        },
      },
      {
        displayId: 'TSK-8',
        sequenceNumber: 8,
        data: {
          title: 'Enhance Trade Execution Analytics',
          status: 'in-progress',
          priority: 'medium',
          owner: 'Michael Rodriguez',
          assignee: 'David Kim',
          assetClass: 'Equities',
          theme: 'Analytics',
          teamsInvolved: ['Trading', 'Technology'],
          tools: ['R', 'Shiny', 'SQL'],
          currentHrs: 90,
          savedHrs: 0,
          workedHrs: 45,
          completionDate: new Date('2026-01-30'),
        },
      },
      {
        displayId: 'TSK-9',
        sequenceNumber: 9,
        data: {
          title: 'Implement Compliance Monitoring System',
          status: 'blocked',
          priority: 'urgent',
          owner: 'Amanda Lee',
          assignee: 'James Wilson',
          assetClass: 'Multi-Asset',
          theme: 'Compliance',
          teamsInvolved: ['Compliance', 'Technology'],
          tools: ['Splunk', 'Elasticsearch', 'Kibana'],
          currentHrs: 220,
          savedHrs: 0,
          workedHrs: 60,
          completionDate: new Date('2026-02-05'),
        },
      },
      {
        displayId: 'TSK-10',
        sequenceNumber: 10,
        data: {
          title: 'Build Position Management Tool',
          status: 'testing',
          priority: 'high',
          owner: 'David Kim',
          assignee: 'Michael Rodriguez',
          assetClass: 'Fixed Income',
          theme: 'Portfolio Management',
          teamsInvolved: ['Portfolio Management', 'Technology'],
          tools: ['JavaScript', 'React', 'Node.js'],
          currentHrs: 160,
          savedHrs: 70,
          workedHrs: 150,
          completionDate: new Date('2026-01-28'),
        },
      },
      {
        displayId: 'TSK-11',
        sequenceNumber: 11,
        data: {
          title: 'Automate Regulatory Reporting',
          status: 'completed',
          priority: 'urgent',
          owner: 'Emily Johnson',
          assignee: 'Amanda Lee',
          assetClass: 'Multi-Asset',
          theme: 'Compliance',
          teamsInvolved: ['Compliance', 'Operations', 'Technology'],
          tools: ['Python', 'XML', 'XBRL'],
          currentHrs: 200,
          savedHrs: 150,
          workedHrs: 180,
          completionDate: new Date('2026-01-12'),
        },
      },
      {
        displayId: 'TSK-12',
        sequenceNumber: 12,
        data: {
          title: 'Develop Market Data Aggregation Layer',
          status: 'in-progress',
          priority: 'medium',
          owner: 'James Wilson',
          assignee: 'Sarah Chen',
          assetClass: 'Derivatives',
          theme: 'Data Integration',
          teamsInvolved: ['Technology', 'Trading'],
          tools: ['Kafka', 'Redis', 'Go'],
          currentHrs: 150,
          savedHrs: 0,
          workedHrs: 80,
          completionDate: new Date('2026-02-08'),
        },
      },
      {
        displayId: 'TSK-13',
        sequenceNumber: 13,
        data: {
          title: 'Create Performance Attribution Dashboard',
          status: 'todo',
          priority: 'low',
          owner: 'Sarah Chen',
          assignee: 'Jennifer Martinez',
          assetClass: 'Equities',
          theme: 'Reporting',
          teamsInvolved: ['Portfolio Management', 'Technology'],
          tools: ['Tableau', 'SQL', 'DAX'],
          currentHrs: 130,
          savedHrs: 0,
          workedHrs: 0,
          completionDate: new Date('2026-03-15'),
        },
      },
      {
        displayId: 'TSK-14',
        sequenceNumber: 14,
        data: {
          title: 'Implement Cash Management Automation',
          status: 'done',
          priority: 'high',
          owner: 'Jennifer Martinez',
          assignee: 'David Kim',
          assetClass: 'Fixed Income',
          theme: 'Automation',
          teamsInvolved: ['Operations', 'Technology'],
          tools: ['UiPath', 'Python', 'SAP'],
          currentHrs: 110,
          savedHrs: 90,
          workedHrs: 100,
          completionDate: new Date('2026-01-18'),
        },
      },
      {
        displayId: 'TSK-15',
        sequenceNumber: 15,
        data: {
          title: 'Build Counterparty Risk Monitor',
          status: 'in-progress',
          priority: 'urgent',
          owner: 'Michael Rodriguez',
          assignee: 'Emily Johnson',
          assetClass: 'Derivatives',
          theme: 'Risk Management',
          teamsInvolved: ['Risk', 'Technology'],
          tools: ['Python', 'Bloomberg API', 'MongoDB'],
          currentHrs: 180,
          savedHrs: 0,
          workedHrs: 90,
          completionDate: new Date('2026-01-31'),
        },
      },
    ];

    // Insert tasks
    await db.insert(tasks).values(
      sampleTasks.map((task) => ({
        workspaceId: workspace.id,
        displayId: task.displayId,
        sequenceNumber: task.sequenceNumber,
        data: task.data,
      })),
    );

    console.log(`✅ Created ${sampleTasks.length} sample tasks`);
    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('✅ Seed script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  });
