'use server';

import { db, tasks } from '@/src/lib/db';
import { sql, SQL } from 'drizzle-orm';
import { getTableConfig } from 'drizzle-orm/pg-core';
import {
  DonutChartData,
  ThroughPutOverTimeData,
  ToolsUsed,
  CumulativeImpactData,
  ImpactMatrixData,
  ImpactVsCycleTimeData,
  EfficiencyRatioData,
  ImpactDensityByTeamData,
  TeamImpactQuadrantData,
  AssetClassROIData,
  ToolsImpactData,
  TopAutomationData,
  ParetoCurveData,
} from '@/src/lib/types/analytics';
import { logger } from '@/src/lib/logger/logger';

// Get the actual table name from the schema (handles env-specific table naming and schema prefix)
const tableConfig = getTableConfig(tasks);
const tasksTable = tableConfig.schema
  ? sql`${sql.identifier(tableConfig.schema)}.${sql.identifier(tableConfig.name)}`
  : sql.identifier(tableConfig.name);

// Business impact calculation constants
const PROCESS_WEIGHT = 10; // Weight factor for processes in total impact calculation

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
  totalProcessesDemised: number;
}

export interface TeamsWorkload {
  team: string;
  count: number;
  savedHrs: number;
  processesDemised: number;
}

export interface AssetClassDistribution {
  assetClass: string;
  count: number;
  savedHrs: number;
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
  totalProcessesDemised: number;
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
  // New Business Impact Intelligence dashboards
  cumulativeImpact: CumulativeImpactData[];
  impactMatrix: ImpactMatrixData[];
  impactVsCycleTime: ImpactVsCycleTimeData[];
  efficiencyRatio: EfficiencyRatioData[];
  impactDensityByTeam: ImpactDensityByTeamData[];
  teamImpactQuadrant: TeamImpactQuadrantData[];
  assetClassROI: AssetClassROIData[];
  toolsImpact: ToolsImpactData[];
  topAutomations: TopAutomationData[];
  paretoCurveSavedHours: ParetoCurveData[];
  paretoCurveProcesses: ParetoCurveData[];
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
      // New Business Impact queries
      cumulativeImpactResult,
      impactMatrixResult,
      impactVsCycleTimeResult,
      efficiencyRatioResult,
      impactDensityByTeamResult,
      teamImpactQuadrantResult,
      assetClassROIResult,
      toolsImpactResult,
      topAutomationsResult,
      paretoCurveSavedHoursResult,
      paretoCurveProcessesResult,
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
      // New Business Impact queries
      getCumulativeImpact(workspaceId, filterCondition),
      getImpactMatrix(workspaceId, filterCondition),
      getImpactVsCycleTime(workspaceId, filterCondition),
      getEfficiencyRatio(workspaceId, filterCondition),
      getImpactDensityByTeam(workspaceId, filterCondition),
      getTeamImpactQuadrant(workspaceId, filterCondition),
      getAssetClassROI(workspaceId, filterCondition),
      getToolsImpact(workspaceId, filterCondition),
      getTopAutomations(workspaceId, filterCondition),
      getParetoCurveSavedHours(workspaceId, filterCondition),
      getParetoCurveProcesses(workspaceId, filterCondition),
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
        // New Business Impact Intelligence dashboards
        cumulativeImpact: cumulativeImpactResult,
        impactMatrix: impactMatrixResult,
        impactVsCycleTime: impactVsCycleTimeResult,
        efficiencyRatio: efficiencyRatioResult,
        impactDensityByTeam: impactDensityByTeamResult,
        teamImpactQuadrant: teamImpactQuadrantResult,
        assetClassROI: assetClassROIResult,
        toolsImpact: toolsImpactResult,
        topAutomations: topAutomationsResult,
        paretoCurveSavedHours: paretoCurveSavedHoursResult,
        paretoCurveProcesses: paretoCurveProcessesResult,
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
      conditions.push(sql`LOWER(data->>'teamName') = LOWER(${teamValues[0]})`);
    } else {
      // Match any of the teams (case insensitive)
      const teamValuesList = teamValues.map((t) => sql`LOWER(${t})`);
      conditions.push(
        sql`LOWER(data->>'teamName') IN (${sql.join(teamValuesList, sql`, `)})`,
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
    AND data->>'status' IN ('done', 'completed')
    AND data->>'completionDate' IS NOT NULL`;
  const whereClause = filterCondition
    ? sql`${baseCondition} AND ${filterCondition}`
    : baseCondition;

  const result = await db.execute(sql`
    SELECT
      TO_CHAR((data->>'completionDate')::timestamp, 'YYYY-MM-01') as date,
      SUM(COALESCE((data->>'savedHrs')::numeric, 0))::float as hours,
      COUNT(*)::int as count,
      SUM(COALESCE((data->>'processesDemised')::numeric, 0))::float as processes_demised
    FROM ${tasksTable}
    WHERE ${whereClause}
    GROUP BY TO_CHAR((data->>'completionDate')::timestamp, 'YYYY-MM-01')
    ORDER BY date ASC
  `);

  return (
    result.rows as {
      date: string;
      hours: number;
      count: number;
      processes_demised: number;
    }[]
  ).map((row) => ({
    date: row.date,
    hours: row.hours,
    count: row.count,
    processesDemised: row.processes_demised,
  }));
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
    WITH tool_tasks AS (
      SELECT
        LOWER(tool) as tool,
        t.id,
        COALESCE((t.data->>'savedHrs')::numeric, 0) as saved_hrs
      FROM ${tasksTable} t,
        jsonb_array_elements_text(COALESCE(t.data->'tools', '[]'::jsonb)) as tool
      WHERE ${whereClause}
        AND tool IS NOT NULL
        AND tool != ''
    )
    SELECT
      tool,
      COUNT(*)::int as count,
      SUM(saved_hrs)::float as saved_hrs
    FROM tool_tasks
    GROUP BY tool
    ORDER BY saved_hrs DESC, count DESC
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
    AND data->>'status' IN ('done', 'completed')
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
      SUM(COALESCE((data->>'savedHrs')::numeric, 0))::float as total_hours_saved,
      SUM(COALESCE((data->>'processesDemised')::numeric, 0))::float as total_processes_demised
    FROM ${tasksTable}
    WHERE ${whereClause}
    GROUP BY ${ownerField}
    ORDER BY total_hours_saved DESC
    LIMIT 5
  `);

  return (
    result.rows as {
      owner: string;
      completed_tasks: number;
      avg_cycle_days: number;
      total_hours_saved: number;
      total_processes_demised: number;
    }[]
  ).map((row) => ({
    owner: row.owner,
    completedTasks: row.completed_tasks,
    avgCycleDays: row.avg_cycle_days || 0,
    totalHoursSaved: row.total_hours_saved || 0,
    totalProcessesDemised: row.total_processes_demised || 0,
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
      COUNT(*)::int as count,
      SUM(COALESCE((data->>'savedHrs')::numeric, 0))::float as saved_hrs,
      SUM(COALESCE((data->>'processesDemised')::numeric, 0))::float as processes_demised
    FROM ${tasksTable}
    WHERE ${whereClause}
      AND data->>'teamName' IS NOT NULL
      AND data->>'teamName' != ''
    GROUP BY LOWER(data->>'teamName')
    ORDER BY saved_hrs DESC, count DESC
    LIMIT 10
  `);

  return (
    result.rows as {
      team: string;
      count: number;
      saved_hrs: number;
      processes_demised: number;
    }[]
  ).map((row) => ({
    team: row.team,
    count: row.count,
    savedHrs: row.saved_hrs || 0,
    processesDemised: row.processes_demised || 0,
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
      COUNT(*)::int as count,
      SUM(COALESCE((data->>'savedHrs')::numeric, 0))::float as saved_hrs
    FROM ${tasksTable}
    WHERE ${whereClause}
    GROUP BY COALESCE(NULLIF(data->>'assetClass', ''), 'Unassigned')
    ORDER BY saved_hrs DESC
  `);

  const colors = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
  ];

  return (
    result.rows as { asset_class: string; count: number; saved_hrs: number }[]
  ).map((row, index) => ({
    assetClass: row.asset_class,
    count: row.count,
    savedHrs: row.saved_hrs || 0,
    fill: colors[index % colors.length],
  }));
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
      SUM(COALESCE((data->>'savedHrs')::numeric, 0))::float as total_hours_saved,
      SUM(COALESCE((data->>'processesDemised')::numeric, 0))::float as total_processes_demised
    FROM ${tasksTable}
    WHERE ${whereClause}
  `);

  const row = result.rows[0] as {
    total_tasks: number;
    open_tasks: number;
    avg_cycle_days: number | null;
    total_hours_saved: number;
    total_processes_demised: number;
  };

  return {
    totalTasks: row.total_tasks || 0,
    openTasks: row.open_tasks || 0,
    avgCycleDays: row.avg_cycle_days || 0,
    totalHoursSaved: row.total_hours_saved || 0,
    totalProcessesDemised: row.total_processes_demised || 0,
  };
}

// New Business Impact Intelligence query functions

async function getCumulativeImpact(
  workspaceId: string,
  filterCondition: SQL | null,
): Promise<CumulativeImpactData[]> {
  const baseCondition = sql`workspace_id = ${workspaceId}
    AND data->>'status' IN ('done', 'completed')
    AND data->>'completionDate' IS NOT NULL`;
  const whereClause = filterCondition
    ? sql`${baseCondition} AND ${filterCondition}`
    : baseCondition;

  const result = await db.execute(sql`
    WITH monthly_data AS (
      SELECT
        TO_CHAR((data->>'completionDate')::timestamp, 'YYYY-MM-01') as date,
        SUM(COALESCE((data->>'processesDemised')::numeric, 0))::float as processes,
        SUM(COALESCE((data->>'savedHrs')::numeric, 0))::float as hours
      FROM ${tasksTable}
      WHERE ${whereClause}
      GROUP BY TO_CHAR((data->>'completionDate')::timestamp, 'YYYY-MM-01')
    )
    SELECT
      date,
      SUM(processes) OVER (ORDER BY date)::float as cumulative_processes,
      SUM(hours) OVER (ORDER BY date)::float as cumulative_hours
    FROM monthly_data
    ORDER BY date ASC
  `);

  return (
    result.rows as {
      date: string;
      cumulative_processes: number;
      cumulative_hours: number;
    }[]
  ).map((row) => ({
    date: row.date,
    cumulativeProcesses: row.cumulative_processes,
    cumulativeHours: row.cumulative_hours,
  }));
}

async function getImpactMatrix(
  workspaceId: string,
  filterCondition: SQL | null,
): Promise<ImpactMatrixData[]> {
  const baseCondition = sql`workspace_id = ${workspaceId}
    AND data->>'status' IN ('done', 'completed')`;
  const whereClause = filterCondition
    ? sql`${baseCondition} AND ${filterCondition}`
    : baseCondition;

  const result = await db.execute(sql`
    SELECT
      id as task_id,
      data->>'title' as title,
      COALESCE((data->>'processesDemised')::numeric, 0)::float as processes_demised,
      COALESCE((data->>'savedHrs')::numeric, 0)::float as saved_hrs,
      COALESCE(data->>'assetClass', 'Unassigned') as asset_class
    FROM ${tasksTable}
    WHERE ${whereClause}
      AND (COALESCE((data->>'processesDemised')::numeric, 0) > 0
        OR COALESCE((data->>'savedHrs')::numeric, 0) > 0)
    LIMIT 100
  `);

  return (
    result.rows as {
      task_id: string;
      title: string;
      processes_demised: number;
      saved_hrs: number;
      asset_class: string;
    }[]
  ).map((row) => ({
    taskId: row.task_id,
    title: row.title || 'Untitled',
    processesDemised: row.processes_demised,
    savedHrs: row.saved_hrs,
    assetClass: row.asset_class,
  }));
}

async function getImpactVsCycleTime(
  workspaceId: string,
  filterCondition: SQL | null,
): Promise<ImpactVsCycleTimeData[]> {
  const baseCondition = sql`workspace_id = ${workspaceId}
    AND data->>'status' IN ('done', 'completed')
    AND data->>'completionDate' IS NOT NULL`;
  const whereClause = filterCondition
    ? sql`${baseCondition} AND ${filterCondition}`
    : baseCondition;

  const result = await db.execute(sql`
    SELECT
      id as task_id,
      data->>'title' as title,
      EXTRACT(EPOCH FROM (
        (data->>'completionDate')::timestamp - created_at
      )) / 86400 as cycle_days,
      COALESCE((data->>'savedHrs')::numeric, 0)::float as saved_hrs,
      COALESCE((data->>'processesDemised')::numeric, 0)::float as processes_demised,
      (COALESCE((data->>'savedHrs')::numeric, 0) + COALESCE((data->>'processesDemised')::numeric, 0) * ${PROCESS_WEIGHT})::float as total_impact
    FROM ${tasksTable}
    WHERE ${whereClause}
      AND (COALESCE((data->>'processesDemised')::numeric, 0) > 0
        OR COALESCE((data->>'savedHrs')::numeric, 0) > 0)
    LIMIT 100
  `);

  return (
    result.rows as {
      task_id: string;
      title: string;
      cycle_days: number;
      total_impact: number;
      saved_hrs: number;
      processes_demised: number;
    }[]
  ).map((row) => ({
    taskId: row.task_id,
    title: row.title || 'Untitled',
    cycleDays: row.cycle_days || 0,
    totalImpact: row.total_impact,
    savedHrs: row.saved_hrs,
    processesDemised: row.processes_demised,
  }));
}

async function getEfficiencyRatio(
  workspaceId: string,
  filterCondition: SQL | null,
): Promise<EfficiencyRatioData[]> {
  const baseCondition = sql`workspace_id = ${workspaceId}
    AND data->>'status' IN ('done', 'completed')`;
  const whereClause = filterCondition
    ? sql`${baseCondition} AND ${filterCondition}`
    : baseCondition;

  const result = await db.execute(sql`
    SELECT
      id as task_id,
      data->>'title' as title,
      COALESCE((data->>'savedHrs')::numeric, 0)::float as saved_hrs,
      COALESCE((data->>'processesDemised')::numeric, 0)::float as processes_demised,
      CASE
        WHEN COALESCE((data->>'processesDemised')::numeric, 0) > 0
        THEN (COALESCE((data->>'savedHrs')::numeric, 0) / (data->>'processesDemised')::numeric)::float
        ELSE 0
      END as efficiency
    FROM ${tasksTable}
    WHERE ${whereClause}
      AND COALESCE((data->>'processesDemised')::numeric, 0) > 0
    LIMIT 100
  `);

  return (
    result.rows as {
      task_id: string;
      title: string;
      efficiency: number;
      saved_hrs: number;
      processes_demised: number;
    }[]
  ).map((row) => ({
    taskId: row.task_id,
    title: row.title || 'Untitled',
    efficiency: row.efficiency,
    savedHrs: row.saved_hrs,
    processesDemised: row.processes_demised,
  }));
}

async function getImpactDensityByTeam(
  workspaceId: string,
  filterCondition: SQL | null,
): Promise<ImpactDensityByTeamData[]> {
  const baseCondition = sql`workspace_id = ${workspaceId}
    AND data->>'status' IN ('done', 'completed')
    AND data->>'completionDate' IS NOT NULL
    AND data->>'teamName' IS NOT NULL
    AND data->>'teamName' != ''`;
  const whereClause = filterCondition
    ? sql`${baseCondition} AND ${filterCondition}`
    : baseCondition;

  const result = await db.execute(sql`
    SELECT
      LOWER(data->>'teamName') as team,
      SUM(COALESCE((data->>'processesDemised')::numeric, 0))::float as processes_demised,
      AVG(
        EXTRACT(EPOCH FROM (
          (data->>'completionDate')::timestamp - created_at
        )) / 86400
      )::float as avg_cycle_days,
      COUNT(*)::int as task_count,
      CASE
        WHEN AVG(EXTRACT(EPOCH FROM ((data->>'completionDate')::timestamp - created_at)) / 86400) > 0
        THEN (SUM(COALESCE((data->>'processesDemised')::numeric, 0)) /
              AVG(EXTRACT(EPOCH FROM ((data->>'completionDate')::timestamp - created_at)) / 86400))::float
        ELSE 0
      END as impact_density
    FROM ${tasksTable}
    WHERE ${whereClause}
    GROUP BY LOWER(data->>'teamName')
    ORDER BY impact_density DESC
    LIMIT 10
  `);

  return (
    result.rows as {
      team: string;
      processes_demised: number;
      avg_cycle_days: number;
      task_count: number;
      impact_density: number;
    }[]
  ).map((row) => ({
    team: row.team,
    impactDensity: row.impact_density,
    processesDemised: row.processes_demised,
    avgCycleDays: row.avg_cycle_days || 0,
    taskCount: row.task_count,
  }));
}

async function getTeamImpactQuadrant(
  workspaceId: string,
  filterCondition: SQL | null,
): Promise<TeamImpactQuadrantData[]> {
  const baseCondition = sql`workspace_id = ${workspaceId}
    AND data->>'status' IN ('done', 'completed')
    AND data->>'teamName' IS NOT NULL
    AND data->>'teamName' != ''`;
  const whereClause = filterCondition
    ? sql`${baseCondition} AND ${filterCondition}`
    : baseCondition;

  const result = await db.execute(sql`
    SELECT
      LOWER(data->>'teamName') as team,
      SUM(COALESCE((data->>'processesDemised')::numeric, 0))::float as total_processes_demised,
      SUM(COALESCE((data->>'savedHrs')::numeric, 0))::float as total_saved_hrs,
      COUNT(*)::int as task_count
    FROM ${tasksTable}
    WHERE ${whereClause}
    GROUP BY LOWER(data->>'teamName')
    ORDER BY total_saved_hrs DESC
    LIMIT 20
  `);

  return (
    result.rows as {
      team: string;
      total_processes_demised: number;
      total_saved_hrs: number;
      task_count: number;
    }[]
  ).map((row) => ({
    team: row.team,
    totalProcessesDemised: row.total_processes_demised,
    totalSavedHrs: row.total_saved_hrs,
    taskCount: row.task_count,
  }));
}

async function getAssetClassROI(
  workspaceId: string,
  filterCondition: SQL | null,
): Promise<AssetClassROIData[]> {
  const baseCondition = sql`workspace_id = ${workspaceId}
    AND data->>'status' IN ('done', 'completed')
    AND data->>'completionDate' IS NOT NULL`;
  const whereClause = filterCondition
    ? sql`${baseCondition} AND ${filterCondition}`
    : baseCondition;

  const result = await db.execute(sql`
    SELECT
      COALESCE(NULLIF(data->>'assetClass', ''), 'Unassigned') as asset_class,
      SUM(COALESCE((data->>'savedHrs')::numeric, 0))::float as saved_hrs,
      AVG(
        EXTRACT(EPOCH FROM (
          (data->>'completionDate')::timestamp - created_at
        )) / 86400
      )::float as avg_cycle_days,
      COUNT(*)::int as task_count,
      CASE
        WHEN AVG(EXTRACT(EPOCH FROM ((data->>'completionDate')::timestamp - created_at)) / 86400) > 0
        THEN (SUM(COALESCE((data->>'savedHrs')::numeric, 0)) /
              AVG(EXTRACT(EPOCH FROM ((data->>'completionDate')::timestamp - created_at)) / 86400))::float
        ELSE 0
      END as roi_score
    FROM ${tasksTable}
    WHERE ${whereClause}
    GROUP BY COALESCE(NULLIF(data->>'assetClass', ''), 'Unassigned')
    ORDER BY roi_score DESC
    LIMIT 15
  `);

  return (
    result.rows as {
      asset_class: string;
      saved_hrs: number;
      avg_cycle_days: number;
      task_count: number;
      roi_score: number;
    }[]
  ).map((row) => ({
    assetClass: row.asset_class,
    roiScore: row.roi_score,
    savedHrs: row.saved_hrs,
    avgCycleDays: row.avg_cycle_days || 0,
    taskCount: row.task_count,
  }));
}

async function getToolsImpact(
  workspaceId: string,
  filterCondition: SQL | null,
): Promise<ToolsImpactData[]> {
  const whereClause = filterCondition
    ? sql`workspace_id = ${workspaceId} AND ${filterCondition}`
    : sql`workspace_id = ${workspaceId}`;

  const result = await db.execute(sql`
    WITH tool_tasks AS (
      SELECT
        LOWER(tool) as tool,
        t.id,
        COALESCE((t.data->>'savedHrs')::numeric, 0) as saved_hrs,
        COALESCE((t.data->>'processesDemised')::numeric, 0) as processes_demised
      FROM ${tasksTable} t,
        jsonb_array_elements_text(COALESCE(t.data->'tools', '[]'::jsonb)) as tool
      WHERE ${whereClause}
        AND tool IS NOT NULL
        AND tool != ''
        AND t.data->>'status' IN ('done', 'completed')
    )
    SELECT
      tool,
      SUM(saved_hrs)::float as saved_hrs,
      SUM(processes_demised)::float as processes_demised,
      COUNT(*)::int as task_count
    FROM tool_tasks
    GROUP BY tool
    ORDER BY saved_hrs DESC, processes_demised DESC
    LIMIT 15
  `);

  return (
    result.rows as {
      tool: string;
      saved_hrs: number;
      processes_demised: number;
      task_count: number;
    }[]
  ).map((row) => ({
    tool: row.tool,
    savedHrs: row.saved_hrs,
    processesDemised: row.processes_demised,
    taskCount: row.task_count,
  }));
}

async function getTopAutomations(
  workspaceId: string,
  filterCondition: SQL | null,
): Promise<TopAutomationData[]> {
  const baseCondition = sql`workspace_id = ${workspaceId}
    AND data->>'status' IN ('done', 'completed')`;
  const whereClause = filterCondition
    ? sql`${baseCondition} AND ${filterCondition}`
    : baseCondition;

  const result = await db.execute(sql`
    SELECT
      id as task_id,
      display_id,
      data->>'title' as title,
      COALESCE((data->>'savedHrs')::numeric, 0)::float as saved_hrs,
      COALESCE((data->>'processesDemised')::numeric, 0)::float as processes_demised,
      (COALESCE((data->>'savedHrs')::numeric, 0) + COALESCE((data->>'processesDemised')::numeric, 0) * ${PROCESS_WEIGHT})::float as total_impact,
      COALESCE(data->>'completionDate', '') as completion_date
    FROM ${tasksTable}
    WHERE ${whereClause}
    ORDER BY total_impact DESC
    LIMIT 10
  `);

  return (
    result.rows as {
      task_id: string;
      display_id: string;
      title: string;
      saved_hrs: number;
      processes_demised: number;
      total_impact: number;
      completion_date: string;
    }[]
  ).map((row) => ({
    taskId: row.task_id,
    displayId: row.display_id,
    title: row.title || 'Untitled',
    savedHrs: row.saved_hrs,
    processesDemised: row.processes_demised,
    totalImpact: row.total_impact,
    completionDate: row.completion_date,
  }));
}

async function getParetoCurveSavedHours(
  workspaceId: string,
  filterCondition: SQL | null,
): Promise<ParetoCurveData[]> {
  const baseCondition = sql`workspace_id = ${workspaceId}
    AND data->>'status' IN ('done', 'completed')
    AND COALESCE((data->>'savedHrs')::numeric, 0) > 0`;
  const whereClause = filterCondition
    ? sql`${baseCondition} AND ${filterCondition}`
    : baseCondition;

  const result = await db.execute(sql`
    WITH ranked_tasks AS (
      SELECT
        id as task_id,
        display_id,
        data->>'title' as title,
        COALESCE((data->>'savedHrs')::numeric, 0)::float as value
      FROM ${tasksTable}
      WHERE ${whereClause}
      ORDER BY value DESC
      LIMIT 50
    ),
    cumulative AS (
      SELECT
        task_id,
        display_id,
        title,
        value,
        SUM(value) OVER (ORDER BY value DESC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as cumulative_value
      FROM ranked_tasks
    ),
    total AS (
      SELECT SUM(value) as total_value FROM ranked_tasks
    )
    SELECT
      c.task_id,
      c.display_id,
      c.title,
      c.value,
      c.cumulative_value,
      (c.cumulative_value / NULLIF(t.total_value, 0) * 100)::float as cumulative_percentage
    FROM cumulative c
    CROSS JOIN total t
    ORDER BY c.value DESC
  `);

  return (
    result.rows as {
      task_id: string;
      display_id: string;
      title: string;
      value: number;
      cumulative_value: number;
      cumulative_percentage: number;
    }[]
  ).map((row) => ({
    taskId: row.task_id,
    displayId: row.display_id,
    title: row.title || 'Untitled',
    value: row.value,
    cumulativeValue: row.cumulative_value,
    cumulativePercentage: row.cumulative_percentage || 0,
  }));
}

async function getParetoCurveProcesses(
  workspaceId: string,
  filterCondition: SQL | null,
): Promise<ParetoCurveData[]> {
  const baseCondition = sql`workspace_id = ${workspaceId}
    AND data->>'status' IN ('done', 'completed')
    AND COALESCE((data->>'processesDemised')::numeric, 0) > 0`;
  const whereClause = filterCondition
    ? sql`${baseCondition} AND ${filterCondition}`
    : baseCondition;

  const result = await db.execute(sql`
    WITH ranked_tasks AS (
      SELECT
        id as task_id,
        display_id,
        data->>'title' as title,
        COALESCE((data->>'processesDemised')::numeric, 0)::float as value
      FROM ${tasksTable}
      WHERE ${whereClause}
      ORDER BY value DESC
      LIMIT 50
    ),
    cumulative AS (
      SELECT
        task_id,
        display_id,
        title,
        value,
        SUM(value) OVER (ORDER BY value DESC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as cumulative_value
      FROM ranked_tasks
    ),
    total AS (
      SELECT SUM(value) as total_value FROM ranked_tasks
    )
    SELECT
      c.task_id,
      c.display_id,
      c.title,
      c.value,
      c.cumulative_value,
      (c.cumulative_value / NULLIF(t.total_value, 0) * 100)::float as cumulative_percentage
    FROM cumulative c
    CROSS JOIN total t
    ORDER BY c.value DESC
  `);

  return (
    result.rows as {
      task_id: string;
      display_id: string;
      title: string;
      value: number;
      cumulative_value: number;
      cumulative_percentage: number;
    }[]
  ).map((row) => ({
    taskId: row.task_id,
    displayId: row.display_id,
    title: row.title || 'Untitled',
    value: row.value,
    cumulativeValue: row.cumulative_value,
    cumulativePercentage: row.cumulative_percentage || 0,
  }));
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
