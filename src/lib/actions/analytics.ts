'use server';

import { db, tasks } from '@/src/lib/db';
import { sql, SQL } from 'drizzle-orm';
import { getTableConfig } from 'drizzle-orm/pg-core';
import {
  DonutChartData,
  ThroughPutOverTimeData,
  ToolsUsed,
} from '@/src/lib/types/analytics';
import { logger } from '@/src/lib/logger';

// Get the actual table name from the schema (handles env-specific table naming and schema prefix)
const tableConfig = getTableConfig(tasks);
const tasksTable = tableConfig.schema
  ? sql`${sql.identifier(tableConfig.schema)}.${sql.identifier(tableConfig.name)}`
  : sql.identifier(tableConfig.name);

// Types for analytics queries
export interface RollingCycle {
  month: string;
  avgCycleDays: number;
  rollingAvg: number;
}

export interface MonthlyHoursPoint {
  month: string;
  worked: number;
  saved: number;
  net: number;
}

export interface RemainingWorkTrend {
  month: string;
  remaining: number;
}

// New types for the 5 additional charts
export interface OwnerProductivity {
  owner: string;
  completedTasks: number;
  avgCycleDays: number;
  totalHoursSaved: number;
}

export interface TeamsWorkload {
  team: string;
  count: number;
}

export interface AssetClassDistribution {
  assetClass: string;
  count: number;
  fill: string;
  [key: string]: string | number;
}

export interface PriorityAging {
  priority: string;
  bucket0to3: number;
  bucket3to7: number;
  bucket7to14: number;
  bucket14plus: number;
}

export interface HoursEfficiency {
  month: string;
  currentHrs: number;
  workedHrs: number;
  efficiency: number;
}

// KPI summary data
export interface KpiSummary {
  totalTasks: number;
  openTasks: number;
  avgCycleDays: number;
  totalHoursSaved: number;
}

export type AnalyticsFilters = {
  assetClass?: string | string[];
  status?: string | string[];
  priority?: string | string[];
  assignee?: string | string[];
  team?: string | string[];
  dateFrom?: string;
  dateTo?: string;
  ownerCellKey?: string; // Configurable owner cell key for analytics
};

export type AnalyticsData = {
  statusCounts: DonutChartData[];
  throughputOverTime: ThroughPutOverTimeData[];
  cycleTime: RollingCycle[];
  hoursSavedWorked: MonthlyHoursPoint[];
  remainingWorkTrend: RemainingWorkTrend[];
  toolsUsed: ToolsUsed[];
  assetClasses: string[];
  // New data for 5 additional charts
  ownerProductivity: OwnerProductivity[];
  teamsWorkload: TeamsWorkload[];
  assetClassDistribution: AssetClassDistribution[];
  priorityAging: PriorityAging[];
  hoursEfficiency: HoursEfficiency[];
  // KPI summary
  kpiSummary: KpiSummary;
  // Filter options
  owners: string[];
  teams: string[];
  priorities: string[];
  statuses: string[];
};

type AnalyticsResult =
  | { success: true; data: AnalyticsData }
  | { success: false; error: string };

/**
 * Get all analytics data for a workspace with server-side aggregation
 *
 * @param workspaceId - The workspace ID to fetch analytics for
 * @param filters - Optional filters to apply to the analytics data
 * @param filters.ownerCellKey - The JSONB key to use for owner/assignee data (defaults to 'owner')
 *                                This allows analytics to be generated for any owner-like field in your data
 * @returns Promise resolving to analytics data or error
 *
 * @example
 * // Use default 'owner' field
 * getAnalytics('workspace-123', { status: 'completed' })
 *
 * @example
 * // Use custom 'assignedTo' field for owner charts
 * getAnalytics('workspace-123', { ownerCellKey: 'assignedTo' })
 */
export async function getAnalytics(
  workspaceId: string,
  filters: AnalyticsFilters = {},
): Promise<AnalyticsResult> {
  try {
    if (!workspaceId) {
      return { success: false, error: 'workspaceId is required' };
    }

    // Build parameterized filter conditions
    const filterCondition = buildFilterCondition(filters);

    // Use configured owner cell key or default to 'owner'
    const ownerCellKey = filters.ownerCellKey || 'owner';

    // Execute all queries in parallel
    const [
      statusCountsResult,
      throughputResult,
      cycleTimeResult,
      hoursSavedWorkedResult,
      remainingWorkResult,
      toolsUsedResult,
      assetClassesResult,
      // New queries
      ownerProductivityResult,
      teamsWorkloadResult,
      assetClassDistributionResult,
      priorityAgingResult,
      hoursEfficiencyResult,
      kpiSummaryResult,
      // Filter options
      ownersResult,
      teamsResult,
      prioritiesResult,
      statusesResult,
    ] = await Promise.all([
      getStatusCounts(workspaceId, filterCondition),
      getThroughputOverTime(workspaceId, filterCondition),
      getCycleTimeData(workspaceId, filterCondition),
      getHoursSavedWorked(workspaceId, filterCondition),
      getRemainingWorkTrend(workspaceId, filterCondition),
      getToolsUsed(workspaceId, filterCondition),
      getAssetClasses(workspaceId),
      // New queries
      getOwnerProductivity(workspaceId, filterCondition, ownerCellKey),
      getTeamsWorkload(workspaceId, filterCondition),
      getAssetClassDistribution(workspaceId, filterCondition),
      getPriorityAging(workspaceId, filterCondition),
      getHoursEfficiency(workspaceId, filterCondition),
      getKpiSummary(workspaceId, filterCondition),
      // Filter options
      getOwners(workspaceId, ownerCellKey),
      getTeams(workspaceId),
      getPriorities(workspaceId),
      getStatuses(workspaceId),
    ]);

    return {
      success: true,
      data: {
        statusCounts: statusCountsResult,
        throughputOverTime: throughputResult,
        cycleTime: cycleTimeResult,
        hoursSavedWorked: hoursSavedWorkedResult,
        remainingWorkTrend: remainingWorkResult,
        toolsUsed: toolsUsedResult,
        assetClasses: assetClassesResult,
        // New data
        ownerProductivity: ownerProductivityResult,
        teamsWorkload: teamsWorkloadResult,
        assetClassDistribution: assetClassDistributionResult,
        priorityAging: priorityAgingResult,
        hoursEfficiency: hoursEfficiencyResult,
        kpiSummary: kpiSummaryResult,
        // Filter options
        owners: ownersResult,
        teams: teamsResult,
        priorities: prioritiesResult,
        statuses: statusesResult,
      },
    };
  } catch (error) {
    logger.error({ workspaceId, filters, error }, 'Error fetching analytics');
    return { success: false, error: 'Failed to fetch analytics' };
  }
}

function buildFilterCondition(filters: AnalyticsFilters): SQL | null {
  const conditions: SQL[] = [];
  const ownerCellKey = filters.ownerCellKey || 'owner';

  // Helper to build IN clause for array or single value
  const buildInCondition = (
    field: string,
    value: string | string[] | undefined,
    jsonPath: string,
  ): SQL | null => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    const values = Array.isArray(value) ? value : [value];
    if (values.length === 1) {
      return sql`${sql.raw(jsonPath)} = ${values[0]}`;
    }
    const valueList = values.map((v) => sql`${v}`);
    return sql`${sql.raw(jsonPath)} IN (${sql.join(valueList, sql`, `)})`;
  };

  if (filters.assetClass) {
    const values = Array.isArray(filters.assetClass)
      ? filters.assetClass.filter((v) => v !== 'All')
      : filters.assetClass !== 'All'
        ? [filters.assetClass]
        : [];
    if (values.length > 0) {
      if (values.length === 1) {
        conditions.push(sql`LOWER(data->>'assetClass') = LOWER(${values[0]})`);
      } else {
        const lowerValues = values.map((v) => sql`LOWER(${v})`);
        conditions.push(
          sql`LOWER(data->>'assetClass') IN (${sql.join(lowerValues, sql`, `)})`,
        );
      }
    }
  }

  const statusCond = buildInCondition(
    'status',
    filters.status,
    "data->>'status'",
  );
  if (statusCond) conditions.push(statusCond);

  const priorityCond = buildInCondition(
    'priority',
    filters.priority,
    "data->>'priority'",
  );
  if (priorityCond) conditions.push(priorityCond);

  const assigneeCond = buildInCondition(
    'assignee',
    filters.assignee,
    `data->>'${ownerCellKey}'`,
  );
  if (assigneeCond) conditions.push(assigneeCond);

  if (filters.team) {
    const teamValues = Array.isArray(filters.team)
      ? filters.team
      : [filters.team];
    if (teamValues.length === 1) {
      conditions.push(sql`data->>'teamName' = ${teamValues[0]}`);
    } else {
      // Match any of the teams
      const teamValuesList = teamValues.map((t) => sql`${t}`);
      conditions.push(
        sql`data->>'teamName' IN (${sql.join(teamValuesList, sql`, `)})`,
      );
    }
  }

  if (filters.dateFrom) {
    conditions.push(sql`created_at >= ${filters.dateFrom}::timestamp`);
  }
  if (filters.dateTo) {
    conditions.push(sql`created_at <= ${filters.dateTo}::timestamp`);
  }

  if (conditions.length === 0) return null;
  if (conditions.length === 1) return conditions[0];

  return sql.join(conditions, sql` AND `);
}

async function getStatusCounts(
  workspaceId: string,
  filterCondition: SQL | null,
): Promise<DonutChartData[]> {
  const whereClause = filterCondition
    ? sql`workspace_id = ${workspaceId} AND ${filterCondition}`
    : sql`workspace_id = ${workspaceId}`;

  const result = await db.execute(sql`
    SELECT 
      COALESCE(data->>'status', 'todo') as status,
      COUNT(*)::int as count
    FROM ${tasksTable}
    WHERE ${whereClause}
    GROUP BY COALESCE(data->>'status', 'todo')
  `);

  const statusMap: Record<string, { label: string; fill: string }> = {
    todo: { label: 'To Do', fill: 'var(--status-todo)' },
    'in-progress': { label: 'In Progress', fill: 'var(--status-in-progress)' },
    testing: { label: 'Testing', fill: 'var(--status-testing)' },
    done: { label: 'Done', fill: 'var(--status-done)' },
    completed: { label: 'Completed', fill: 'var(--status-completed)' },
    blocked: { label: 'Blocked', fill: 'var(--status-blocked)' },
  };

  return (result.rows as { status: string; count: number }[])
    .filter((row) => row.count > 0)
    .map((row) => ({
      status: statusMap[row.status]?.label || row.status,
      count: row.count,
      fill: statusMap[row.status]?.fill || 'var(--chart-1)',
    }));
}

async function getThroughputOverTime(
  workspaceId: string,
  filterCondition: SQL | null,
): Promise<ThroughPutOverTimeData[]> {
  const baseCondition = sql`workspace_id = ${workspaceId}
    AND data->>'status' = 'completed'
    AND data->>'completionDate' IS NOT NULL`;
  const whereClause = filterCondition
    ? sql`${baseCondition} AND ${filterCondition}`
    : baseCondition;

  const result = await db.execute(sql`
    SELECT 
      TO_CHAR((data->>'completionDate')::timestamp, 'YYYY-MM-01') as date,
      SUM(COALESCE((data->>'savedHrs')::numeric, 0))::float as hours,
      COUNT(*)::int as count
    FROM ${tasksTable}
    WHERE ${whereClause}
    GROUP BY TO_CHAR((data->>'completionDate')::timestamp, 'YYYY-MM-01')
    ORDER BY date ASC
  `);

  return (result.rows as { date: string; hours: number; count: number }[]).map(
    (row) => ({
      date: row.date,
      hours: row.hours,
      count: row.count,
    }),
  );
}

async function getCycleTimeData(
  workspaceId: string,
  filterCondition: SQL | null,
): Promise<RollingCycle[]> {
  const baseCondition = sql`workspace_id = ${workspaceId}
    AND data->>'status' = 'completed'
    AND data->>'completionDate' IS NOT NULL`;
  const whereClause = filterCondition
    ? sql`${baseCondition} AND ${filterCondition}`
    : baseCondition;

  const result = await db.execute(sql`
    WITH cycle_points AS (
      SELECT 
        TO_CHAR((data->>'completionDate')::timestamp, 'Month') as month,
        TO_CHAR((data->>'completionDate')::timestamp, 'YYYY-MM') as month_sort,
        EXTRACT(EPOCH FROM (
          (data->>'completionDate')::timestamp - created_at
        )) / 86400 as cycle_days
      FROM ${tasksTable}
      WHERE ${whereClause}
    ),
    monthly_avg AS (
      SELECT 
        TRIM(month) as month,
        month_sort,
        AVG(cycle_days)::float as avg_cycle_days
      FROM cycle_points
      GROUP BY month, month_sort
      ORDER BY month_sort ASC
    )
    SELECT 
      month,
      avg_cycle_days,
      AVG(avg_cycle_days) OVER (
        ORDER BY month_sort 
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
      )::float as rolling_avg
    FROM monthly_avg
    ORDER BY month_sort ASC
  `);

  return (
    result.rows as {
      month: string;
      avg_cycle_days: number;
      rolling_avg: number;
    }[]
  ).map((row) => ({
    month: row.month,
    avgCycleDays: row.avg_cycle_days,
    rollingAvg: row.rolling_avg,
  }));
}

async function getHoursSavedWorked(
  workspaceId: string,
  filterCondition: SQL | null,
): Promise<MonthlyHoursPoint[]> {
  const baseCondition = sql`workspace_id = ${workspaceId}
    AND data->>'status' = 'completed'
    AND data->>'completionDate' IS NOT NULL`;
  const whereClause = filterCondition
    ? sql`${baseCondition} AND ${filterCondition}`
    : baseCondition;

  const result = await db.execute(sql`
    SELECT 
      TO_CHAR((data->>'completionDate')::timestamp, 'YYYY-MM') as month,
      SUM(COALESCE((data->>'workedHrs')::numeric, 0))::float as worked,
      SUM(COALESCE((data->>'savedHrs')::numeric, 0))::float as saved,
      (SUM(COALESCE((data->>'savedHrs')::numeric, 0)) - 
       SUM(COALESCE((data->>'workedHrs')::numeric, 0)))::float as net
    FROM ${tasksTable}
    WHERE ${whereClause}
    GROUP BY TO_CHAR((data->>'completionDate')::timestamp, 'YYYY-MM')
    ORDER BY month ASC
  `);

  return (
    result.rows as {
      month: string;
      worked: number;
      saved: number;
      net: number;
    }[]
  ).map((row) => ({
    month: row.month,
    worked: row.worked,
    saved: row.saved,
    net: row.net,
  }));
}

async function getRemainingWorkTrend(
  workspaceId: string,
  filterCondition: SQL | null,
): Promise<RemainingWorkTrend[]> {
  const baseWhereClause = filterCondition
    ? sql`workspace_id = ${workspaceId} AND ${filterCondition}`
    : sql`workspace_id = ${workspaceId}`;

  const completedWhereClause = filterCondition
    ? sql`workspace_id = ${workspaceId}
        AND data->>'status' = 'completed'
        AND data->>'completionDate' IS NOT NULL
        AND ${filterCondition}`
    : sql`workspace_id = ${workspaceId}
        AND data->>'status' = 'completed'
        AND data->>'completionDate' IS NOT NULL`;

  const result = await db.execute(sql`
    WITH date_range AS (
      SELECT 
        DATE_TRUNC('month', MIN(created_at)) as start_month,
        DATE_TRUNC('month', GREATEST(
          MAX(created_at),
          COALESCE(MAX((data->>'completionDate')::timestamp), MAX(created_at))
        )) as end_month
      FROM ${tasksTable}
      WHERE ${baseWhereClause}
    ),
    months AS (
      SELECT generate_series(
        (SELECT start_month FROM date_range),
        (SELECT end_month FROM date_range),
        '1 month'::interval
      ) as month
    ),
    created_per_month AS (
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*)::int as created
      FROM ${tasksTable}
      WHERE ${baseWhereClause}
      GROUP BY DATE_TRUNC('month', created_at)
    ),
    completed_per_month AS (
      SELECT 
        DATE_TRUNC('month', (data->>'completionDate')::timestamp) as month,
        COUNT(*)::int as completed
      FROM ${tasksTable}
      WHERE ${completedWhereClause}
      GROUP BY DATE_TRUNC('month', (data->>'completionDate')::timestamp)
    )
    SELECT 
      TO_CHAR(m.month, 'Month') as month,
      (SUM(COALESCE(c.created, 0)) OVER (ORDER BY m.month) - 
       SUM(COALESCE(cp.completed, 0)) OVER (ORDER BY m.month))::int as remaining
    FROM months m
    LEFT JOIN created_per_month c ON c.month = m.month
    LEFT JOIN completed_per_month cp ON cp.month = m.month
    ORDER BY m.month ASC
  `);

  return (result.rows as { month: string; remaining: number }[]).map((row) => ({
    month: row.month.trim(),
    remaining: row.remaining,
  }));
}

async function getToolsUsed(
  workspaceId: string,
  filterCondition: SQL | null,
): Promise<ToolsUsed[]> {
  const whereClause = filterCondition
    ? sql`workspace_id = ${workspaceId} AND ${filterCondition}`
    : sql`workspace_id = ${workspaceId}`;

  const result = await db.execute(sql`
    SELECT 
      LOWER(tool) as tool,
      COUNT(*)::int as count
    FROM ${tasksTable},
      jsonb_array_elements_text(COALESCE(data->'tools', '[]'::jsonb)) as tool
    WHERE ${whereClause}
      AND tool IS NOT NULL
      AND tool != ''
    GROUP BY LOWER(tool)
    ORDER BY count DESC
  `);

  return result.rows as ToolsUsed[];
}

async function getAssetClasses(workspaceId: string): Promise<string[]> {
  const result = await db.execute(sql`
    SELECT DISTINCT LOWER(data->>'assetClass') as asset_class
    FROM ${tasksTable}
    WHERE workspace_id = ${workspaceId}
      AND data->>'assetClass' IS NOT NULL
      AND data->>'assetClass' != ''
    ORDER BY asset_class ASC
  `);

  return (result.rows as { asset_class: string }[]).map(
    (row) => row.asset_class,
  );
}

// New analytics query functions for 5 additional charts

async function getOwnerProductivity(
  workspaceId: string,
  filterCondition: SQL | null,
  ownerCellKey: string = 'owner',
): Promise<OwnerProductivity[]> {
  const ownerField = sql.raw(`data->>'${ownerCellKey}'`);

  const baseCondition = sql`workspace_id = ${workspaceId}
    AND data->>'status' = 'completed'
    AND ${ownerField} IS NOT NULL
    AND ${ownerField} != ''`;
  const whereClause = filterCondition
    ? sql`${baseCondition} AND ${filterCondition}`
    : baseCondition;

  const result = await db.execute(sql`
    SELECT 
      ${ownerField} as owner,
      COUNT(*)::int as completed_tasks,
      AVG(
        EXTRACT(EPOCH FROM (
          COALESCE((data->>'completionDate')::timestamp, updated_at) - created_at
        )) / 86400
      )::float as avg_cycle_days,
      SUM(COALESCE((data->>'savedHrs')::numeric, 0))::float as total_hours_saved
    FROM ${tasksTable}
    WHERE ${whereClause}
    GROUP BY ${ownerField}
    ORDER BY completed_tasks DESC
    LIMIT 5
  `);

  return (
    result.rows as {
      owner: string;
      completed_tasks: number;
      avg_cycle_days: number;
      total_hours_saved: number;
    }[]
  ).map((row) => ({
    owner: row.owner,
    completedTasks: row.completed_tasks,
    avgCycleDays: row.avg_cycle_days || 0,
    totalHoursSaved: row.total_hours_saved || 0,
  }));
}

async function getTeamsWorkload(
  workspaceId: string,
  filterCondition: SQL | null,
): Promise<TeamsWorkload[]> {
  const whereClause = filterCondition
    ? sql`workspace_id = ${workspaceId} AND ${filterCondition}`
    : sql`workspace_id = ${workspaceId}`;

  const result = await db.execute(sql`
    SELECT 
      LOWER(data->>'teamName') as team,
      COUNT(*)::int as count
    FROM ${tasksTable}
    WHERE ${whereClause}
      AND data->>'teamName' IS NOT NULL
      AND data->>'teamName' != ''
    GROUP BY LOWER(data->>'teamName')
    ORDER BY count DESC
    LIMIT 10
  `);

  return (result.rows as { team: string; count: number }[]).map((row) => ({
    team: row.team,
    count: row.count,
  }));
}

async function getAssetClassDistribution(
  workspaceId: string,
  filterCondition: SQL | null,
): Promise<AssetClassDistribution[]> {
  const whereClause = filterCondition
    ? sql`workspace_id = ${workspaceId} AND ${filterCondition}`
    : sql`workspace_id = ${workspaceId}`;

  const result = await db.execute(sql`
    SELECT 
      COALESCE(NULLIF(data->>'assetClass', ''), 'Unassigned') as asset_class,
      COUNT(*)::int as count
    FROM ${tasksTable}
    WHERE ${whereClause}
    GROUP BY COALESCE(NULLIF(data->>'assetClass', ''), 'Unassigned')
    ORDER BY count DESC
  `);

  const colors = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
  ];

  return (result.rows as { asset_class: string; count: number }[]).map(
    (row, index) => ({
      assetClass: row.asset_class,
      count: row.count,
      fill: colors[index % colors.length],
    }),
  );
}

async function getPriorityAging(
  workspaceId: string,
  filterCondition: SQL | null,
): Promise<PriorityAging[]> {
  // Only count open tasks (not completed/done)
  const baseCondition = sql`workspace_id = ${workspaceId}
    AND data->>'status' NOT IN ('completed', 'done')`;
  const whereClause = filterCondition
    ? sql`${baseCondition} AND ${filterCondition}`
    : baseCondition;

  const result = await db.execute(sql`
    SELECT 
      COALESCE(data->>'priority', 'medium') as priority,
      COUNT(*) FILTER (WHERE EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400 <= 3)::int as bucket_0_3,
      COUNT(*) FILTER (WHERE EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400 > 3 
        AND EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400 <= 7)::int as bucket_3_7,
      COUNT(*) FILTER (WHERE EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400 > 7 
        AND EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400 <= 14)::int as bucket_7_14,
      COUNT(*) FILTER (WHERE EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400 > 14)::int as bucket_14_plus
    FROM ${tasksTable}
    WHERE ${whereClause}
    GROUP BY COALESCE(data->>'priority', 'medium')
    ORDER BY 
      CASE COALESCE(data->>'priority', 'medium')
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
        ELSE 5
      END
  `);

  return (
    result.rows as {
      priority: string;
      bucket_0_3: number;
      bucket_3_7: number;
      bucket_7_14: number;
      bucket_14_plus: number;
    }[]
  ).map((row) => ({
    priority: row.priority.charAt(0).toUpperCase() + row.priority.slice(1),
    bucket0to3: row.bucket_0_3,
    bucket3to7: row.bucket_3_7,
    bucket7to14: row.bucket_7_14,
    bucket14plus: row.bucket_14_plus,
  }));
}

async function getHoursEfficiency(
  workspaceId: string,
  filterCondition: SQL | null,
): Promise<HoursEfficiency[]> {
  const baseCondition = sql`workspace_id = ${workspaceId}
    AND data->>'completionDate' IS NOT NULL`;
  const whereClause = filterCondition
    ? sql`${baseCondition} AND ${filterCondition}`
    : baseCondition;

  const result = await db.execute(sql`
    SELECT 
      TO_CHAR((data->>'completionDate')::timestamp, 'YYYY-MM') as month,
      SUM(COALESCE((data->>'currentHrs')::numeric, 0))::float as current_hrs,
      SUM(COALESCE((data->>'workedHrs')::numeric, 0))::float as worked_hrs,
      CASE 
        WHEN SUM(COALESCE((data->>'currentHrs')::numeric, 0)) > 0 
        THEN (SUM(COALESCE((data->>'workedHrs')::numeric, 0)) / 
              SUM(COALESCE((data->>'currentHrs')::numeric, 0)) * 100)::float
        ELSE 0
      END as efficiency
    FROM ${tasksTable}
    WHERE ${whereClause}
    GROUP BY TO_CHAR((data->>'completionDate')::timestamp, 'YYYY-MM')
    ORDER BY month ASC
  `);

  return (
    result.rows as {
      month: string;
      current_hrs: number;
      worked_hrs: number;
      efficiency: number;
    }[]
  ).map((row) => ({
    month: row.month,
    currentHrs: row.current_hrs || 0,
    workedHrs: row.worked_hrs || 0,
    efficiency: row.efficiency || 0,
  }));
}

async function getKpiSummary(
  workspaceId: string,
  filterCondition: SQL | null,
): Promise<KpiSummary> {
  const whereClause = filterCondition
    ? sql`workspace_id = ${workspaceId} AND ${filterCondition}`
    : sql`workspace_id = ${workspaceId}`;

  const result = await db.execute(sql`
    SELECT 
      COUNT(*)::int as total_tasks,
      COUNT(*) FILTER (WHERE data->>'status' NOT IN ('completed', 'done'))::int as open_tasks,
      AVG(
        CASE WHEN data->>'status' IN ('completed', 'done') 
          AND data->>'completionDate' IS NOT NULL
        THEN EXTRACT(EPOCH FROM (
          (data->>'completionDate')::timestamp - created_at
        )) / 86400
        ELSE NULL END
      )::float as avg_cycle_days,
      SUM(COALESCE((data->>'savedHrs')::numeric, 0))::float as total_hours_saved
    FROM ${tasksTable}
    WHERE ${whereClause}
  `);

  const row = result.rows[0] as {
    total_tasks: number;
    open_tasks: number;
    avg_cycle_days: number | null;
    total_hours_saved: number;
  };

  return {
    totalTasks: row.total_tasks || 0,
    openTasks: row.open_tasks || 0,
    avgCycleDays: row.avg_cycle_days || 0,
    totalHoursSaved: row.total_hours_saved || 0,
  };
}

// Filter option helpers

async function getOwners(
  workspaceId: string,
  ownerCellKey: string = 'owner',
): Promise<string[]> {
  const ownerField = sql.raw(`data->>'${ownerCellKey}'`);

  const result = await db.execute(sql`
    SELECT DISTINCT ${ownerField} as owner
    FROM ${tasksTable}
    WHERE workspace_id = ${workspaceId}
      AND ${ownerField} IS NOT NULL
      AND ${ownerField} != ''
    ORDER BY owner ASC
  `);

  return (result.rows as { owner: string }[]).map((row) => row.owner);
}

async function getTeams(workspaceId: string): Promise<string[]> {
  const result = await db.execute(sql`
    SELECT DISTINCT LOWER(data->>'teamName') as team
    FROM ${tasksTable}
    WHERE workspace_id = ${workspaceId}
      AND data->>'teamName' IS NOT NULL
      AND data->>'teamName' != ''
    ORDER BY team ASC
  `);

  return (result.rows as { team: string }[]).map((row) => row.team);
}

async function getPriorities(workspaceId: string): Promise<string[]> {
  const result = await db.execute(sql`
    SELECT DISTINCT data->>'priority' as priority,
      CASE data->>'priority'
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
        ELSE 5
      END as sort_order
    FROM ${tasksTable}
    WHERE workspace_id = ${workspaceId}
      AND data->>'priority' IS NOT NULL
    ORDER BY sort_order
  `);

  return (result.rows as { priority: string }[]).map((row) => row.priority);
}

async function getStatuses(workspaceId: string): Promise<string[]> {
  const result = await db.execute(sql`
    SELECT DISTINCT data->>'status' as status
    FROM ${tasksTable}
    WHERE workspace_id = ${workspaceId}
      AND data->>'status' IS NOT NULL
    ORDER BY status ASC
  `);

  return (result.rows as { status: string }[]).map((row) => row.status);
}
