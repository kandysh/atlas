"use server";

import { db, fieldConfigs, FieldConfig } from "@/src/lib/db";
import { sql, SQL, eq, asc } from "drizzle-orm";
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

export interface OwnerProductivity {
  owner: string;
  completed: number;
  avgCycleDays: number;
  hoursSaved: number;
}

export interface TeamsWorkload {
  team: string;
  count: number;
  avgHours: number;
}

export interface GroupDistribution {
  group: string;
  count: number;
  percentage: number;
  fill: string;
}

export interface PriorityAging {
  priority: string;
  ageBucket: string;
  count: number;
}

export interface HoursEfficiency {
  month: string;
  efficiency: number;
  currentHrs: number;
  workedHrs: number;
}

// KPI Metrics - dynamic based on available fields
export interface KPIMetrics {
  totalTasks: number;
  openTasks: number;
  avgCycleTime: number;
  hoursSaved: number;
  // Dynamic KPIs based on number fields
  customMetrics: Record<string, number>;
}

// Field metadata for dynamic filtering
export interface FieldMeta {
  key: string;
  name: string;
  type: string;
  choices: string[];
}

export type AnalyticsFilters = {
  [key: string]: string | undefined;
};

export type AnalyticsData = {
  // Core charts
  statusCounts: DonutChartData[];
  throughputOverTime: ThroughPutOverTimeData[];
  cycleTime: RollingCycle[];
  hoursSavedWorked: MonthlyHoursPoint[];
  remainingWorkTrend: RemainingWorkTrend[];
  toolsUsed: ToolsUsed[];
  ownerProductivity: OwnerProductivity[];
  teamsWorkload: TeamsWorkload[];
  priorityAging: PriorityAging[];
  hoursEfficiency: HoursEfficiency[];
  // Dynamic group distributions (for combobox/select fields)
  groupDistributions: Record<string, GroupDistribution[]>;
  // KPIs and metadata
  kpis: KPIMetrics;
  // Dynamic field metadata for filters
  filterableFields: FieldMeta[];
  // Distinct values for each filterable field
  filterOptions: Record<string, string[]>;
};

type AnalyticsResult =
  | { success: true; data: AnalyticsData }
  | { success: false; error: string };

// Chart colors for dynamic distributions
const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
];

/**
 * Get field configurations for analytics
 */
async function getFieldConfigs(workspaceId: string): Promise<FieldConfig[]> {
  return db
    .select()
    .from(fieldConfigs)
    .where(eq(fieldConfigs.workspaceId, workspaceId))
    .orderBy(asc(fieldConfigs.order));
}

/**
 * Build filterable fields from field configs
 */
function buildFilterableFields(fields: FieldConfig[]): FieldMeta[] {
  const filterableTypes = ["status", "priority", "editable-combobox", "editable-owner", "select"];
  return fields
    .filter((f) => filterableTypes.includes(f.type))
    .map((f) => ({
      key: f.key,
      name: f.name,
      type: f.type,
      choices: (f.options?.choices as string[]) || [],
    }));
}

/**
 * Get distinct values for filterable fields from actual data
 */
async function getFilterOptions(
  workspaceId: string,
  filterableFields: FieldMeta[]
): Promise<Record<string, string[]>> {
  const options: Record<string, string[]> = {};

  for (const field of filterableFields) {
    const result = await db.execute(sql`
      SELECT DISTINCT data->>${sql.raw(`'${field.key}'`)} as value
      FROM tasks
      WHERE workspace_id = ${workspaceId}
        AND data->>${sql.raw(`'${field.key}'`)} IS NOT NULL
        AND data->>${sql.raw(`'${field.key}'`)} != ''
      ORDER BY value
    `);
    options[field.key] = (result.rows as { value: string }[]).map((r) => r.value);
  }

  return options;
}

/**
 * Get all analytics data for a workspace with server-side aggregation
 * Dynamically adapts to workspace field configurations
 */
export async function getAnalytics(
  workspaceId: string,
  filters: AnalyticsFilters = {}
): Promise<AnalyticsResult> {
  try {
    if (!workspaceId) {
      return { success: false, error: "workspaceId is required" };
    }

    // Get field configurations for this workspace
    const fields = await getFieldConfigs(workspaceId);
    const filterableFields = buildFilterableFields(fields);

    // Find key field types for dynamic queries
    const statusField = fields.find((f) => f.type === "status");
    const priorityField = fields.find((f) => f.type === "priority");
    const ownerField = fields.find((f) => f.type === "editable-owner");
    const numberFields = fields.filter((f) => f.type === "editable-number");
    const comboboxFields = fields.filter((f) => f.type === "editable-combobox");
    const tagFields = fields.filter((f) => f.type === "editable-tags");

    // Build dynamic filter conditions
    const filterCondition = buildDynamicFilterCondition(filters, filterableFields);

    // Execute all queries in parallel
    const [
      statusCountsResult,
      throughputResult,
      cycleTimeResult,
      hoursSavedWorkedResult,
      remainingWorkResult,
      toolsUsedResult,
      ownerProductivityResult,
      teamsWorkloadResult,
      priorityAgingResult,
      hoursEfficiencyResult,
      kpisResult,
      filterOptionsResult,
      groupDistributionsResult,
    ] = await Promise.all([
      getStatusCounts(workspaceId, filterCondition, statusField),
      getThroughputOverTime(workspaceId, filterCondition, statusField, numberFields),
      getCycleTimeData(workspaceId, filterCondition, statusField),
      getHoursSavedWorked(workspaceId, filterCondition, statusField, numberFields),
      getRemainingWorkTrend(workspaceId, filterCondition, statusField),
      getToolsUsed(workspaceId, filterCondition, tagFields),
      getOwnerProductivity(workspaceId, filterCondition, statusField, ownerField, numberFields),
      getTeamsWorkload(workspaceId, filterCondition, tagFields, numberFields),
      getPriorityAging(workspaceId, filterCondition, statusField, priorityField),
      getHoursEfficiency(workspaceId, filterCondition, statusField, numberFields),
      getKPIs(workspaceId, filterCondition, statusField, numberFields),
      getFilterOptions(workspaceId, filterableFields),
      getGroupDistributions(workspaceId, filterCondition, comboboxFields),
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
        ownerProductivity: ownerProductivityResult,
        teamsWorkload: teamsWorkloadResult,
        priorityAging: priorityAgingResult,
        hoursEfficiency: hoursEfficiencyResult,
        groupDistributions: groupDistributionsResult,
        kpis: kpisResult,
        filterableFields,
        filterOptions: filterOptionsResult,
      },
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return { success: false, error: "Failed to fetch analytics" };
  }
}

/**
 * Build dynamic filter conditions based on field configs
 */
function buildDynamicFilterCondition(
  filters: AnalyticsFilters,
  filterableFields: FieldMeta[]
): SQL | null {
  const conditions: SQL[] = [];

  for (const [key, value] of Object.entries(filters)) {
    if (!value || value === "All") continue;

    // Handle special date filters
    if (key === "dateFrom") {
      conditions.push(sql`created_at >= ${value}::timestamp`);
    } else if (key === "dateTo") {
      conditions.push(sql`created_at <= ${value}::timestamp`);
    } else {
      // Dynamic field filter
      const field = filterableFields.find((f) => f.key === key);
      if (field) {
        conditions.push(sql`data->>${sql.raw(`'${key}'`)} = ${value}`);
      }
    }
  }

  if (conditions.length === 0) return null;
  if (conditions.length === 1) return conditions[0];

  return sql.join(conditions, sql` AND `);
}

/**
 * Helper to create a status array check expression for dynamic status fields
 */
function createStatusArrayCheck(statusKey: string, statuses: string[]): SQL {
  const arrayLiteral = `ARRAY[${statuses.map(s => `'${s.replace(/'/g, "''")}'`).join(',')}]`;
  return sql.raw(`data->>'${statusKey}' = ANY(${arrayLiteral})`);
}

/**
 * Get group distributions for combobox fields
 */
async function getGroupDistributions(
  workspaceId: string,
  filterCondition: SQL | null,
  comboboxFields: FieldConfig[]
): Promise<Record<string, GroupDistribution[]>> {
  const result: Record<string, GroupDistribution[]> = {};

  for (const field of comboboxFields) {
    const whereClause = filterCondition
      ? sql`workspace_id = ${workspaceId} AND ${filterCondition}`
      : sql`workspace_id = ${workspaceId}`;

    const queryResult = await db.execute(sql`
      WITH group_counts AS (
        SELECT 
          COALESCE(LOWER(data->>${sql.raw(`'${field.key}'`)}), 'unspecified') as group_value,
          COUNT(*)::int as count
        FROM tasks
        WHERE ${whereClause}
        GROUP BY COALESCE(LOWER(data->>${sql.raw(`'${field.key}'`)}), 'unspecified')
      ),
      total AS (
        SELECT SUM(count)::int as total_count FROM group_counts
      )
      SELECT 
        gc.group_value,
        gc.count,
        CASE WHEN t.total_count > 0 
          THEN ROUND((gc.count::numeric / t.total_count * 100), 2)::float 
          ELSE 0 
        END as percentage
      FROM group_counts gc, total t
      ORDER BY gc.count DESC
    `);

    result[field.key] = (queryResult.rows as {
      group_value: string;
      count: number;
      percentage: number;
    }[]).map((row, index) => ({
      group: row.group_value,
      count: row.count,
      percentage: row.percentage,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }

  return result;
}

async function getStatusCounts(
  workspaceId: string,
  filterCondition: SQL | null,
  statusField: FieldConfig | undefined
): Promise<DonutChartData[]> {
  const statusKey = statusField?.key || "status";
  const defaultValue = (statusField?.options?.defaultValue as string) || "todo";
  const choices = (statusField?.options?.choices as string[]) || [];

  const whereClause = filterCondition
    ? sql`workspace_id = ${workspaceId} AND ${filterCondition}`
    : sql`workspace_id = ${workspaceId}`;

  // Use sql.raw to build the complete COALESCE expression
  const statusExpr = sql.raw(`COALESCE(data->>'${statusKey}', '${defaultValue}')`);
  
  const result = await db.execute(sql`
    SELECT 
      ${statusExpr} as status,
      COUNT(*)::int as count
    FROM tasks
    WHERE ${whereClause}
    GROUP BY ${statusExpr}
  `);

  // Build color map based on choice index
  return (result.rows as { status: string; count: number }[])
    .filter((row) => row.count > 0)
    .map((row, index) => ({
      status: row.status,
      count: row.count,
      fill: CHART_COLORS[choices.indexOf(row.status) % CHART_COLORS.length] || CHART_COLORS[index % CHART_COLORS.length],
    }));
}

async function getThroughputOverTime(
  workspaceId: string,
  filterCondition: SQL | null,
  statusField: FieldConfig | undefined,
  numberFields: FieldConfig[]
): Promise<ThroughPutOverTimeData[]> {
  const statusKey = statusField?.key || "status";
  // Find completed statuses (done or completed)
  const completedStatuses = (statusField?.options?.choices as string[])?.filter(
    (s) => s.toLowerCase().includes("done") || s.toLowerCase().includes("completed")
  ) || ["completed", "done"];
  
  // Find saved hours field
  const savedHrsField = numberFields.find((f) => f.key.toLowerCase().includes("saved"));
  const savedHrsKey = savedHrsField?.key || "savedHrs";

  // Build the status check with proper array literal
  const statusCheck = createStatusArrayCheck(statusKey, completedStatuses);
  const savedHrsExpr = sql.raw(`data->>'${savedHrsKey}'`);

  const baseCondition = sql`workspace_id = ${workspaceId}
    AND ${statusCheck}
    AND data->>'completionDate' IS NOT NULL`;
  const whereClause = filterCondition
    ? sql`${baseCondition} AND ${filterCondition}`
    : baseCondition;

  const result = await db.execute(sql`
    SELECT 
      TO_CHAR((data->>'completionDate')::timestamp, 'YYYY-MM-01') as date,
      SUM(COALESCE((${savedHrsExpr})::numeric, 0))::float as hours,
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
  filterCondition: SQL | null,
  statusField: FieldConfig | undefined
): Promise<RollingCycle[]> {
  const statusKey = statusField?.key || "status";
  const completedStatuses = (statusField?.options?.choices as string[])?.filter(
    (s) => s.toLowerCase().includes("done") || s.toLowerCase().includes("completed")
  ) || ["completed", "done"];

  const baseCondition = sql`workspace_id = ${workspaceId}
    AND data->>${sql.raw(`'${statusKey}'`)} = ANY(${completedStatuses})
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
  filterCondition: SQL | null,
  statusField: FieldConfig | undefined,
  numberFields: FieldConfig[]
): Promise<MonthlyHoursPoint[]> {
  const statusKey = statusField?.key || "status";
  const completedStatuses = (statusField?.options?.choices as string[])?.filter(
    (s) => s.toLowerCase().includes("done") || s.toLowerCase().includes("completed")
  ) || ["completed", "done"];

  const workedHrsField = numberFields.find((f) => f.key.toLowerCase().includes("worked"));
  const savedHrsField = numberFields.find((f) => f.key.toLowerCase().includes("saved"));
  const workedHrsKey = workedHrsField?.key || "workedHrs";
  const savedHrsKey = savedHrsField?.key || "savedHrs";

  const baseCondition = sql`workspace_id = ${workspaceId}
    AND data->>${sql.raw(`'${statusKey}'`)} = ANY(${completedStatuses})
    AND data->>'completionDate' IS NOT NULL`;
  const whereClause = filterCondition
    ? sql`${baseCondition} AND ${filterCondition}`
    : baseCondition;

  const result = await db.execute(sql`
    SELECT 
      TO_CHAR((data->>'completionDate')::timestamp, 'YYYY-MM') as month,
      SUM(COALESCE((data->>${sql.raw(`'${workedHrsKey}'`)})::numeric, 0))::float as worked,
      SUM(COALESCE((data->>${sql.raw(`'${savedHrsKey}'`)})::numeric, 0))::float as saved,
      (SUM(COALESCE((data->>${sql.raw(`'${savedHrsKey}'`)})::numeric, 0)) - 
       SUM(COALESCE((data->>${sql.raw(`'${workedHrsKey}'`)})::numeric, 0)))::float as net
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
  filterCondition: SQL | null,
  statusField: FieldConfig | undefined
): Promise<RemainingWorkTrend[]> {
  const statusKey = statusField?.key || "status";
  const completedStatuses = (statusField?.options?.choices as string[])?.filter(
    (s) => s.toLowerCase().includes("done") || s.toLowerCase().includes("completed")
  ) || ["completed", "done"];

  const baseWhereClause = filterCondition
    ? sql`workspace_id = ${workspaceId} AND ${filterCondition}`
    : sql`workspace_id = ${workspaceId}`;
  
  const completedWhereClause = filterCondition
    ? sql`workspace_id = ${workspaceId}
        AND data->>${sql.raw(`'${statusKey}'`)} = ANY(${completedStatuses})
        AND data->>'completionDate' IS NOT NULL
        AND ${filterCondition}`
    : sql`workspace_id = ${workspaceId}
        AND data->>${sql.raw(`'${statusKey}'`)} = ANY(${completedStatuses})
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
  filterCondition: SQL | null,
  tagFields: FieldConfig[]
): Promise<ToolsUsed[]> {
  // Find a tools field (tags type with "tools" in key)
  const toolsField = tagFields.find((f) => f.key.toLowerCase().includes("tool"));
  const toolsKey = toolsField?.key || "tools";

  const whereClause = filterCondition
    ? sql`workspace_id = ${workspaceId} AND ${filterCondition}`
    : sql`workspace_id = ${workspaceId}`;

  const result = await db.execute(sql`
    SELECT 
      LOWER(tool) as tool,
      COUNT(*)::int as count
    FROM tasks,
      jsonb_array_elements_text(COALESCE(data->${sql.raw(`'${toolsKey}'`)}, '[]'::jsonb)) as tool
    WHERE ${whereClause}
      AND tool IS NOT NULL
      AND tool != ''
    GROUP BY LOWER(tool)
    ORDER BY count DESC
  `);

  return result.rows as ToolsUsed[];
}

/**
 * Get owner productivity metrics - top 5 performers
 */
async function getOwnerProductivity(
  workspaceId: string,
  filterCondition: SQL | null,
  statusField: FieldConfig | undefined,
  ownerField: FieldConfig | undefined,
  numberFields: FieldConfig[]
): Promise<OwnerProductivity[]> {
  const statusKey = statusField?.key || "status";
  const ownerKey = ownerField?.key || "owner";
  const savedHrsField = numberFields.find((f) => f.key.toLowerCase().includes("saved"));
  const savedHrsKey = savedHrsField?.key || "savedHrs";

  const completedStatuses = (statusField?.options?.choices as string[])?.filter(
    (s) => s.toLowerCase().includes("done") || s.toLowerCase().includes("completed")
  ) || ["completed", "done"];

  const baseCondition = sql`workspace_id = ${workspaceId}
    AND data->>${sql.raw(`'${statusKey}'`)} = ANY(${completedStatuses})
    AND data->>${sql.raw(`'${ownerKey}'`)} IS NOT NULL
    AND data->>${sql.raw(`'${ownerKey}'`)} != '' AND TRIM(data->>${sql.raw(`'${ownerKey}'`)}) != ''`;
  const whereClause = filterCondition
    ? sql`${baseCondition} AND ${filterCondition}`
    : baseCondition;

  const result = await db.execute(sql`
    SELECT 
      data->>${sql.raw(`'${ownerKey}'`)} as owner,
      COUNT(*)::int as completed,
      AVG(
        EXTRACT(EPOCH FROM (
          COALESCE((data->>'completionDate')::timestamp, updated_at) - created_at
        )) / 86400
      )::float as avg_cycle_days,
      SUM(COALESCE((data->>${sql.raw(`'${savedHrsKey}'`)})::numeric, 0))::float as hours_saved
    FROM tasks
    WHERE ${whereClause}
    GROUP BY data->>${sql.raw(`'${ownerKey}'`)}
    ORDER BY completed DESC, hours_saved DESC
    LIMIT 5
  `);

  return (result.rows as {
    owner: string;
    completed: number;
    avg_cycle_days: number;
    hours_saved: number;
  }[]).map((row) => ({
    owner: row.owner,
    completed: row.completed,
    avgCycleDays: row.avg_cycle_days,
    hoursSaved: row.hours_saved,
  }));
}

/**
 * Get teams workload distribution
 */
async function getTeamsWorkload(
  workspaceId: string,
  filterCondition: SQL | null,
  tagFields: FieldConfig[],
  numberFields: FieldConfig[]
): Promise<TeamsWorkload[]> {
  // Find teams field
  const teamsField = tagFields.find((f) => f.key.toLowerCase().includes("team"));
  const teamsKey = teamsField?.key || "teamsInvolved";
  
  // Find current/estimated hours field
  const currentHrsField = numberFields.find((f) => 
    f.key.toLowerCase().includes("current") || f.key.toLowerCase().includes("estimated")
  );
  const currentHrsKey = currentHrsField?.key || "currentHrs";

  const whereClause = filterCondition
    ? sql`workspace_id = ${workspaceId} AND ${filterCondition}`
    : sql`workspace_id = ${workspaceId}`;

  const result = await db.execute(sql`
    SELECT 
      LOWER(team) as team,
      COUNT(*)::int as count,
      AVG(COALESCE((data->>${sql.raw(`'${currentHrsKey}'`)})::numeric, 0))::float as avg_hours
    FROM tasks,
      jsonb_array_elements_text(COALESCE(data->${sql.raw(`'${teamsKey}'`)}, '[]'::jsonb)) as team
    WHERE ${whereClause}
      AND team IS NOT NULL
      AND team != ''
    GROUP BY LOWER(team)
    ORDER BY count DESC
  `);

  return (result.rows as { team: string; count: number; avg_hours: number }[]).map(
    (row) => ({
      team: row.team,
      count: row.count,
      avgHours: row.avg_hours,
    })
  );
}

/**
 * Get priority aging distribution
 */
async function getPriorityAging(
  workspaceId: string,
  filterCondition: SQL | null,
  statusField: FieldConfig | undefined,
  priorityField: FieldConfig | undefined
): Promise<PriorityAging[]> {
  const statusKey = statusField?.key || "status";
  const priorityKey = priorityField?.key || "priority";
  const defaultPriority = (priorityField?.options?.defaultValue as string) || "medium";
  const priorityChoices = (priorityField?.options?.choices as string[]) || ["low", "medium", "high", "urgent"];

  // Get non-completed statuses
  const completedStatuses = (statusField?.options?.choices as string[])?.filter(
    (s) => s.toLowerCase().includes("done") || s.toLowerCase().includes("completed")
  ) || ["completed", "done"];

  const baseCondition = sql`workspace_id = ${workspaceId}
    AND NOT (data->>${sql.raw(`'${statusKey}'`)} = ANY(${completedStatuses}))`;
  const whereClause = filterCondition
    ? sql`${baseCondition} AND ${filterCondition}`
    : baseCondition;

  const result = await db.execute(sql`
    WITH task_ages AS (
      SELECT 
        COALESCE(data->>${sql.raw(`'${priorityKey}'`)}, ${defaultPriority}) as priority,
        CASE
          WHEN EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400 <= 3 THEN '0-3 days'
          WHEN EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400 <= 7 THEN '4-7 days'
          WHEN EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400 <= 14 THEN '8-14 days'
          WHEN EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400 <= 30 THEN '15-30 days'
          ELSE '30+ days'
        END as age_bucket
      FROM tasks
      WHERE ${whereClause}
    )
    SELECT 
      priority,
      age_bucket,
      COUNT(*)::int as count
    FROM task_ages
    GROUP BY priority, age_bucket
    ORDER BY 
      array_position(${priorityChoices}::text[], priority),
      CASE age_bucket
        WHEN '0-3 days' THEN 1
        WHEN '4-7 days' THEN 2
        WHEN '8-14 days' THEN 3
        WHEN '15-30 days' THEN 4
        WHEN '30+ days' THEN 5
      END
  `);

  return (result.rows as {
    priority: string;
    age_bucket: string;
    count: number;
  }[]).map((row) => ({
    priority: row.priority,
    ageBucket: row.age_bucket,
    count: row.count,
  }));
}

/**
 * Get hours efficiency over time
 */
async function getHoursEfficiency(
  workspaceId: string,
  filterCondition: SQL | null,
  statusField: FieldConfig | undefined,
  numberFields: FieldConfig[]
): Promise<HoursEfficiency[]> {
  const statusKey = statusField?.key || "status";
  const completedStatuses = (statusField?.options?.choices as string[])?.filter(
    (s) => s.toLowerCase().includes("done") || s.toLowerCase().includes("completed")
  ) || ["completed", "done"];

  const currentHrsField = numberFields.find((f) => 
    f.key.toLowerCase().includes("current") || f.key.toLowerCase().includes("estimated")
  );
  const workedHrsField = numberFields.find((f) => f.key.toLowerCase().includes("worked"));
  const currentHrsKey = currentHrsField?.key || "currentHrs";
  const workedHrsKey = workedHrsField?.key || "workedHrs";

  const baseCondition = sql`workspace_id = ${workspaceId}
    AND data->>${sql.raw(`'${statusKey}'`)} = ANY(${completedStatuses})
    AND data->>'completionDate' IS NOT NULL`;
  const whereClause = filterCondition
    ? sql`${baseCondition} AND ${filterCondition}`
    : baseCondition;

  const result = await db.execute(sql`
    SELECT 
      TO_CHAR((data->>'completionDate')::timestamp, 'YYYY-MM') as month,
      CASE
        WHEN SUM(COALESCE((data->>${sql.raw(`'${workedHrsKey}'`)})::numeric, 0)) > 0
        THEN (SUM(COALESCE((data->>${sql.raw(`'${currentHrsKey}'`)})::numeric, 0)) / 
              SUM(COALESCE((data->>${sql.raw(`'${workedHrsKey}'`)})::numeric, 0)))::float
        ELSE 0
      END as efficiency,
      SUM(COALESCE((data->>${sql.raw(`'${currentHrsKey}'`)})::numeric, 0))::float as current_hrs,
      SUM(COALESCE((data->>${sql.raw(`'${workedHrsKey}'`)})::numeric, 0))::float as worked_hrs
    FROM tasks
    WHERE ${whereClause}
    GROUP BY TO_CHAR((data->>'completionDate')::timestamp, 'YYYY-MM')
    ORDER BY month ASC
  `);

  return (result.rows as {
    month: string;
    efficiency: number;
    current_hrs: number;
    worked_hrs: number;
  }[]).map((row) => ({
    month: row.month,
    efficiency: row.efficiency,
    currentHrs: row.current_hrs,
    workedHrs: row.worked_hrs,
  }));
}

/**
 * Get KPI metrics
 */
async function getKPIs(
  workspaceId: string,
  filterCondition: SQL | null,
  statusField: FieldConfig | undefined,
  numberFields: FieldConfig[]
): Promise<KPIMetrics> {
  const statusKey = statusField?.key || "status";
  const completedStatuses = (statusField?.options?.choices as string[])?.filter(
    (s) => s.toLowerCase().includes("done") || s.toLowerCase().includes("completed")
  ) || ["completed", "done"];

  const savedHrsField = numberFields.find((f) => f.key.toLowerCase().includes("saved"));
  const savedHrsKey = savedHrsField?.key || "savedHrs";

  const baseWhereClause = filterCondition
    ? sql`workspace_id = ${workspaceId} AND ${filterCondition}`
    : sql`workspace_id = ${workspaceId}`;

  const completedWhereClause = filterCondition
    ? sql`workspace_id = ${workspaceId}
        AND data->>${sql.raw(`'${statusKey}'`)} = ANY(${completedStatuses})
        AND ${filterCondition}`
    : sql`workspace_id = ${workspaceId}
        AND data->>${sql.raw(`'${statusKey}'`)} = ANY(${completedStatuses})`;

  const result = await db.execute(sql`
    WITH stats AS (
      SELECT 
        COUNT(*)::int as total_tasks,
        COUNT(CASE WHEN NOT (data->>${sql.raw(`'${statusKey}'`)} = ANY(${completedStatuses})) THEN 1 END)::int as open_tasks,
        SUM(COALESCE((data->>${sql.raw(`'${savedHrsKey}'`)})::numeric, 0))::float as hours_saved
      FROM tasks
      WHERE ${baseWhereClause}
    ),
    cycle_stats AS (
      SELECT 
        AVG(
          EXTRACT(EPOCH FROM (
            COALESCE((data->>'completionDate')::timestamp, updated_at) - created_at
          )) / 86400
        )::float as avg_cycle_days
      FROM tasks
      WHERE ${completedWhereClause}
    )
    SELECT 
      s.total_tasks,
      s.open_tasks,
      COALESCE(cs.avg_cycle_days, 0) as avg_cycle_time,
      s.hours_saved
    FROM stats s
    CROSS JOIN cycle_stats cs
  `);

  const row = result.rows[0] as {
    total_tasks: number;
    open_tasks: number;
    avg_cycle_time: number;
    hours_saved: number;
  };

  // Calculate custom metrics from number fields
  const customMetrics: Record<string, number> = {};
  for (const field of numberFields) {
    const sumResult = await db.execute(sql`
      SELECT SUM(COALESCE((data->>${sql.raw(`'${field.key}'`)})::numeric, 0))::float as total
      FROM tasks
      WHERE ${baseWhereClause}
    `);
    customMetrics[field.key] = (sumResult.rows[0] as { total: number })?.total || 0;
  }

  return {
    totalTasks: row?.total_tasks || 0,
    openTasks: row?.open_tasks || 0,
    avgCycleTime: row?.avg_cycle_time || 0,
    hoursSaved: row?.hours_saved || 0,
    customMetrics,
  };
}
