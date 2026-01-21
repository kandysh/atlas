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

    // Sample task data (fields aligned with default-field-configs.ts)
    const sampleTasks = [
      {
        sequenceNumber: 1,
        data: {
          title: 'Automate Daily Reconciliation Process',
          status: 'completed',
          priority: 'high',
          owner: 'Sarah Chen',
          assignee: 'David Kim',
          assetClass: 'Fixed Income',
          theme: 'Automation',
          teamName: 'Operations',
          tools: ['Python', 'SQL', 'Alteryx'],
          tags: ['reconciliation', 'automation'],
          savedHrs: 100,
          processesDemised: 2,
          otherUseCases: '',
          completionDate: new Date('2026-01-15'),
        },
      },
      {
        sequenceNumber: 2,
        data: {
          title: 'Build Real-time Portfolio Dashboard',
          status: 'in-progress',
          priority: 'urgent',
          owner: 'Michael Rodriguez',
          assignee: 'Emily Johnson',
          assetClass: 'Equities',
          theme: 'Reporting',
          teamName: 'Technology',
          tools: ['Power BI', 'DAX', 'Azure'],
          tags: ['dashboard', 'reporting'],
          savedHrs: 0,
          processesDemised: 0,
          otherUseCases: '',
          completionDate: new Date('2026-02-01'),
        },
      },
      {
        sequenceNumber: 3,
        data: {
          title: 'Implement Automated Trade Validation',
          status: 'testing',
          priority: 'high',
          owner: 'Emily Johnson',
          assignee: 'James Wilson',
          assetClass: 'Derivatives',
          theme: 'Risk Management',
          teamName: 'Risk',
          tools: ['Python', 'Pandas', 'NumPy'],
          tags: ['validation', 'trading'],
          savedHrs: 80,
          processesDemised: 1,
          otherUseCases: '',
          completionDate: new Date('2026-01-25'),
        },
      },
      {
        sequenceNumber: 4,
        data: {
          title: 'Streamline Fund Accounting Workflows',
          status: 'todo',
          priority: 'medium',
          owner: 'David Kim',
          assignee: 'Jennifer Martinez',
          assetClass: 'Multi-Asset',
          theme: 'Process Improvement',
          teamName: 'Accounting',
          tools: ['Excel', 'VBA', 'Power Automate'],
          tags: ['accounting', 'workflow'],
          savedHrs: 0,
          processesDemised: 0,
          otherUseCases: '',
          completionDate: new Date('2026-02-15'),
        },
      },
      {
        sequenceNumber: 5,
        data: {
          title: 'Develop ESG Data Integration Pipeline',
          status: 'in-progress',
          priority: 'high',
          owner: 'Sarah Chen',
          assignee: 'Michael Rodriguez',
          assetClass: 'Equities',
          theme: 'Data Integration',
          teamName: 'Technology',
          tools: ['Python', 'API', 'PostgreSQL'],
          tags: ['esg', 'data'],
          savedHrs: 0,
          processesDemised: 0,
          otherUseCases: '',
          completionDate: new Date('2026-02-10'),
        },
      },
      {
        sequenceNumber: 6,
        data: {
          title: 'Optimize Risk Calculation Engine',
          status: 'done',
          priority: 'medium',
          owner: 'James Wilson',
          assignee: 'Emily Johnson',
          assetClass: 'Fixed Income',
          theme: 'Performance',
          teamName: 'Risk',
          tools: ['C++', 'CUDA', 'Python'],
          tags: ['performance', 'risk'],
          savedHrs: 60,
          processesDemised: 0,
          otherUseCases: '',
          completionDate: new Date('2026-01-10'),
        },
      },
      {
        sequenceNumber: 7,
        data: {
          title: 'Create Client Reporting Automation',
          status: 'todo',
          priority: 'low',
          owner: 'Jennifer Martinez',
          assignee: 'Sarah Chen',
          assetClass: 'Multi-Asset',
          theme: 'Automation',
          teamName: 'Client Services',
          tools: ['Tableau', 'Python', 'LaTeX'],
          tags: ['client-reporting'],
          savedHrs: 0,
          processesDemised: 0,
          otherUseCases: '',
          completionDate: new Date('2026-03-01'),
        },
      },
      {
        sequenceNumber: 8,
        data: {
          title: 'Enhance Trade Execution Analytics',
          status: 'in-progress',
          priority: 'medium',
          owner: 'Michael Rodriguez',
          assignee: 'David Kim',
          assetClass: 'Equities',
          theme: 'Analytics',
          teamName: 'Trading',
          tools: ['R', 'Shiny', 'SQL'],
          tags: ['analytics', 'execution'],
          savedHrs: 0,
          processesDemised: 0,
          otherUseCases: '',
          completionDate: new Date('2026-01-30'),
        },
      },
      {
        sequenceNumber: 9,
        data: {
          title: 'Implement Compliance Monitoring System',
          status: 'blocked',
          priority: 'urgent',
          owner: 'Amanda Lee',
          assignee: 'James Wilson',
          assetClass: 'Multi-Asset',
          theme: 'Compliance',
          teamName: 'Compliance',
          tools: ['Splunk', 'Elasticsearch', 'Kibana'],
          tags: ['compliance'],
          savedHrs: 0,
          processesDemised: 0,
          otherUseCases: '',
          completionDate: new Date('2026-02-05'),
        },
      },
      {
        sequenceNumber: 10,
        data: {
          title: 'Build Position Management Tool',
          status: 'testing',
          priority: 'high',
          owner: 'David Kim',
          assignee: 'Michael Rodriguez',
          assetClass: 'Fixed Income',
          theme: 'Portfolio Management',
          teamName: 'Portfolio Management',
          tools: ['JavaScript', 'React', 'Node.js'],
          tags: ['position-management'],
          savedHrs: 70,
          processesDemised: 0,
          otherUseCases: '',
          completionDate: new Date('2026-01-28'),
        },
      },
      {
        sequenceNumber: 11,
        data: {
          title: 'Automate Regulatory Reporting',
          status: 'completed',
          priority: 'urgent',
          owner: 'Emily Johnson',
          assignee: 'Amanda Lee',
          assetClass: 'Multi-Asset',
          theme: 'Compliance',
          teamName: 'Compliance',
          tools: ['Python', 'XML', 'XBRL'],
          tags: ['regulatory'],
          savedHrs: 150,
          processesDemised: 3,
          otherUseCases: '',
          completionDate: new Date('2026-01-12'),
        },
      },
      {
        sequenceNumber: 12,
        data: {
          title: 'Develop Market Data Aggregation Layer',
          status: 'in-progress',
          priority: 'medium',
          owner: 'James Wilson',
          assignee: 'Sarah Chen',
          assetClass: 'Derivatives',
          theme: 'Data Integration',
          teamName: 'Technology',
          tools: ['Kafka', 'Redis', 'Go'],
          tags: ['market-data'],
          savedHrs: 0,
          processesDemised: 0,
          otherUseCases: '',
          completionDate: new Date('2026-02-08'),
        },
      },
      {
        sequenceNumber: 13,
        data: {
          title: 'Create Performance Attribution Dashboard',
          status: 'todo',
          priority: 'low',
          owner: 'Sarah Chen',
          assignee: 'Jennifer Martinez',
          assetClass: 'Equities',
          theme: 'Reporting',
          teamName: 'Portfolio Management',
          tools: ['Tableau', 'SQL', 'DAX'],
          tags: ['attribution', 'reporting'],
          savedHrs: 0,
          processesDemised: 0,
          otherUseCases: '',
          completionDate: new Date('2026-03-15'),
        },
      },
      {
        sequenceNumber: 14,
        data: {
          title: 'Implement Cash Management Automation',
          status: 'done',
          priority: 'high',
          owner: 'Jennifer Martinez',
          assignee: 'David Kim',
          assetClass: 'Fixed Income',
          theme: 'Automation',
          teamName: 'Operations',
          tools: ['UiPath', 'Python', 'SAP'],
          tags: ['cash-management', 'automation'],
          savedHrs: 90,
          processesDemised: 1,
          otherUseCases: '',
          completionDate: new Date('2026-01-18'),
        },
      },
      {
        sequenceNumber: 15,
        data: {
          title: 'Build Counterparty Risk Monitor',
          status: 'in-progress',
          priority: 'urgent',
          owner: 'Michael Rodriguez',
          assignee: 'Emily Johnson',
          assetClass: 'Derivatives',
          theme: 'Risk Management',
          teamName: 'Risk',
          tools: ['Python', 'Bloomberg API', 'MongoDB'],
          tags: ['counterparty', 'risk'],
          savedHrs: 0,
          processesDemised: 0,
          otherUseCases: '',
          completionDate: new Date('2026-01-31'),
        },
      },
    ];

    // Determine workspace sequence (uses workspace.sequenceNumber if available, else fallback to 1)
    const workspaceSequence = (workspace as any).sequenceNumber ?? 1;

    // Insert tasks with displayId in form TSK-{workspacesequence}-{tasksequence}
    await db.insert(tasks).values(
      sampleTasks.map((task) => ({
        workspaceId: workspace.id,
        displayId: `TSK-${workspaceSequence}-${task.sequenceNumber}`,
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
