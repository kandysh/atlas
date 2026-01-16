"use server";

import { db } from "@/src/lib/db";
import { sql, SQL } from "drizzle-orm";
import {
  DonutChartData,
  ThroughPutOverTimeData,
  ToolsUsed,
} from "@/src/lib/types/analytics";

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
  assetClass?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  team?: string;
  dateFrom?: string;
  dateTo?: string;
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
 */
export async function getAnalytics(
  workspaceId: string,
  filters: AnalyticsFilters = {}
): Promise<AnalyticsResult> {
  try {
    if (!workspaceId) {
      return { success: false, error: "workspaceId is required" };
    }

    // Build parameterized filter conditions
    const filterCondition = buildFilterCondition(filters);

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
      getOwnerProductivity(workspaceId, filterCondition),
      getTeamsWorkload(workspaceId, filterCondition),
      getAssetClassDistribution(workspaceId, filterCondition),
      getPriorityAging(workspaceId, filterCondition),
      getHoursEfficiency(workspaceId, filterCondition),
      getKpiSummary(workspaceId, filterCondition),
      // Filter options
      getOwners(workspaceId),
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
    console.error("Error fetching analytics:", error);
    return { success: false, error: "Failed to fetch analytics" };
  }
}

function buildFilterCondition(filters: AnalyticsFilters): SQL | null {
  const conditions: SQL[] = [];

  if (filters.assetClass && filters.assetClass !== "All") {
    conditions.push(
      sql`LOWER(data->>'assetClass') = LOWER(${filters.assetClass})`
    );
  }
  if (filters.status) {
    conditions.push(sql`data->>'status' = ${filters.status}`);
  }
  if (filters.priority) {
    conditions.push(sql`data->>'priority' = ${filters.priority}`);
  }
  if (filters.assignee) {
    conditions.push(sql`data->>'owner' = ${filters.assignee}`);
  }
  if (filters.team) {
    conditions.push(sql`data->'teamsInvolved' ? ${filters.team}`);
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
  filterCondition: SQL | null
): Promise<DonutChartData[]> {
  const whereClause = filterCondition
    ? sql`workspace_id = ${workspaceId} AND ${filterCondition}`
    : sql`workspace_id = ${workspaceId}`;

  const result = await db.execute(sql`
    SELECT 
      COALESCE(data->>'status', 'todo') as status,
      COUNT(*)::int as count
    FROM tasks
    WHERE ${whereClause}
    GROUP BY COALESCE(data->>'status', 'todo')
  `);

  const statusMap: Record<string, { label: string; fill: string }> = {
    todo: { label: "To Do", fill: "var(--chart-1)" },
    "in-progress": { label: "In Progress", fill: "var(--chart-2)" },
    testing: { label: "Testing", fill: "var(--chart-3)" },
    done: { label: "Done", fill: "var(--chart-4)" },
    completed: { label: "Completed", fill: "var(--chart-5)" },
    blocked: { label: "Blocked", fill: "hsl(var(--destructive))" },
  };

  return (result.rows as { status: string; count: number }[])
    .filter((row) => row.count > 0)
    .map((row) => ({
      status: statusMap[row.status]?.label || row.status,
      count: row.count,
      fill: statusMap[row.status]?.fill || "var(--chart-1)",
    }));
}

async function getThroughputOverTime(
  workspaceId: string,
  filterCondition: SQL | null
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
    FROM tasks
    WHERE ${whereClause}
    GROUP BY TO_CHAR((data->>'completionDate')::timestamp, 'YYYY-MM-01')
    ORDER BY date ASC
  `);

  return (result.rows as { date: string; hours: number; count: number }[]).map(
    (row) => ({
      date: row.date,
      hours: row.hours,
      count: row.count,
    })
  );
}

async function getCycleTimeData(
  workspaceId: string,
  filterCondition: SQL | null
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
      FROM tasks
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
  filterCondition: SQL | null
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
    FROM tasks
    WHERE ${whereClause}
    GROUP BY TO_CHAR((data->>'completionDate')::timestamp, 'YYYY-MM')
    ORDER BY month ASC
  `);

  return (
    result.rows as { month: string; worked: number; saved: number; net: number }[]
  ).map((row) => ({
    month: row.month,
    worked: row.worked,
    saved: row.saved,
    net: row.net,
  }));
}

async function getRemainingWorkTrend(
  workspaceId: string,
  filterCondition: SQL | null
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
      FROM tasks
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
      FROM tasks
      WHERE ${baseWhereClause}
      GROUP BY DATE_TRUNC('month', created_at)
    ),
    completed_per_month AS (
      SELECT 
        DATE_TRUNC('month', (data->>'completionDate')::timestamp) as month,
        COUNT(*)::int as completed
      FROM tasks
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
  filterCondition: SQL | null
): Promise<ToolsUsed[]> {
  const whereClause = filterCondition
    ? sql`workspace_id = ${workspaceId} AND ${filterCondition}`
    : sql`workspace_id = ${workspaceId}`;

  const result = await db.execute(sql`
    SELECT 
      LOWER(tool) as tool,
      COUNT(*)::int as count
    FROM tasks,
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
    FROM tasks
    WHERE workspace_id = ${workspaceId}
      AND data->>'assetClass' IS NOT NULL
      AND data->>'assetClass' != ''
    ORDER BY asset_class ASC
  `);

  return (result.rows as { asset_class: string }[]).map(
    (row) => row.asset_class
  );
}

// New analytics query functions for 5 additional charts

async function getOwnerProductivity(
  workspaceId: string,
  filterCondition: SQL | null
): Promise<OwnerProductivity[]> {
  const baseCondition = sql`workspace_id = ${workspaceId}
    AND data->>'status' = 'completed'
    AND data->>'owner' IS NOT NULL
    AND data->>'owner' != ''`;
  const whereClause = filterCondition
    ? sql`${baseCondition} AND ${filterCondition}`
    : baseCondition;

  const result = await db.execute(sql`
    SELECT 
      data->>'owner' as owner,
      COUNT(*)::int as completed_tasks,
      AVG(
        EXTRACT(EPOCH FROM (
          COALESCE((data->>'completionDate')::timestamp, updated_at) - created_at
        )) / 86400
      )::float as avg_cycle_days,
      SUM(COALESCE((data->>'savedHrs')::numeric, 0))::float as total_hours_saved
    FROM tasks
    WHERE ${whereClause}
    GROUP BY data->>'owner'
    ORDER BY completed_tasks DESC
    LIMIT 5
  `);

  return (result.rows as {
    owner: string;
    completed_tasks: number;
    avg_cycle_days: number;
    total_hours_saved: number;
  }[]).map((row) => ({
    owner: row.owner,
    completedTasks: row.completed_tasks,
    avgCycleDays: row.avg_cycle_days || 0,
    totalHoursSaved: row.total_hours_saved || 0,
  }));
}

async function getTeamsWorkload(
  workspaceId: string,
  filterCondition: SQL | null
): Promise<TeamsWorkload[]> {
  const whereClause = filterCondition
    ? sql`workspace_id = ${workspaceId} AND ${filterCondition}`
    : sql`workspace_id = ${workspaceId}`;

  const result = await db.execute(sql`
    SELECT 
      LOWER(team) as team,
      COUNT(*)::int as count
    FROM tasks,
      jsonb_array_elements_text(COALESCE(data->'teamsInvolved', '[]'::jsonb)) as team
    WHERE ${whereClause}
      AND team IS NOT NULL
      AND team != ''
    GROUP BY LOWER(team)
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
  filterCondition: SQL | null
): Promise<AssetClassDistribution[]> {
  const whereClause = filterCondition
    ? sql`workspace_id = ${workspaceId} AND ${filterCondition}`
    : sql`workspace_id = ${workspaceId}`;

  const result = await db.execute(sql`
    SELECT 
      COALESCE(NULLIF(data->>'assetClass', ''), 'Unassigned') as asset_class,
      COUNT(*)::int as count
    FROM tasks
    WHERE ${whereClause}
    GROUP BY COALESCE(NULLIF(data->>'assetClass', ''), 'Unassigned')
    ORDER BY count DESC
  `);

  const colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  return (result.rows as { asset_class: string; count: number }[]).map(
    (row, index) => ({
      assetClass: row.asset_class,
      count: row.count,
      fill: colors[index % colors.length],
    })
  );
}

async function getPriorityAging(
  workspaceId: string,
  filterCondition: SQL | null
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
    FROM tasks
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

  return (result.rows as {
    priority: string;
    bucket_0_3: number;
    bucket_3_7: number;
    bucket_7_14: number;
    bucket_14_plus: number;
  }[]).map((row) => ({
    priority: row.priority.charAt(0).toUpperCase() + row.priority.slice(1),
    bucket0to3: row.bucket_0_3,
    bucket3to7: row.bucket_3_7,
    bucket7to14: row.bucket_7_14,
    bucket14plus: row.bucket_14_plus,
  }));
}

async function getHoursEfficiency(
  workspaceId: string,
  filterCondition: SQL | null
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
    FROM tasks
    WHERE ${whereClause}
    GROUP BY TO_CHAR((data->>'completionDate')::timestamp, 'YYYY-MM')
    ORDER BY month ASC
  `);

  return (result.rows as {
    month: string;
    current_hrs: number;
    worked_hrs: number;
    efficiency: number;
  }[]).map((row) => ({
    month: row.month,
    currentHrs: row.current_hrs || 0,
    workedHrs: row.worked_hrs || 0,
    efficiency: row.efficiency || 0,
  }));
}

async function getKpiSummary(
  workspaceId: string,
  filterCondition: SQL | null
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
    FROM tasks
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

async function getOwners(workspaceId: string): Promise<string[]> {
  const result = await db.execute(sql`
    SELECT DISTINCT data->>'owner' as owner
    FROM tasks
    WHERE workspace_id = ${workspaceId}
      AND data->>'owner' IS NOT NULL
      AND data->>'owner' != ''
    ORDER BY owner ASC
  `);

  return (result.rows as { owner: string }[]).map((row) => row.owner);
}

async function getTeams(workspaceId: string): Promise<string[]> {
  const result = await db.execute(sql`
    SELECT DISTINCT LOWER(team) as team
    FROM tasks,
      jsonb_array_elements_text(COALESCE(data->'teamsInvolved', '[]'::jsonb)) as team
    WHERE workspace_id = ${workspaceId}
      AND team IS NOT NULL
      AND team != ''
    ORDER BY team ASC
  `);

  return (result.rows as { team: string }[]).map((row) => row.team);
}

async function getPriorities(workspaceId: string): Promise<string[]> {
  const result = await db.execute(sql`
    SELECT DISTINCT data->>'priority' as priority
    FROM tasks
    WHERE workspace_id = ${workspaceId}
      AND data->>'priority' IS NOT NULL
    ORDER BY 
      CASE data->>'priority'
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
        ELSE 5
      END
  `);

  return (result.rows as { priority: string }[]).map((row) => row.priority);
}

async function getStatuses(workspaceId: string): Promise<string[]> {
  const result = await db.execute(sql`
    SELECT DISTINCT data->>'status' as status
    FROM tasks
    WHERE workspace_id = ${workspaceId}
      AND data->>'status' IS NOT NULL
    ORDER BY status ASC
  `);

  return (result.rows as { status: string }[]).map((row) => row.status);
}
