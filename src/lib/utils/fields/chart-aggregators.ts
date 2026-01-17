import { FieldConfig } from "@/src/lib/db/schema";
import { getAnalyticsConfig, AnalyticsConfig } from "./field-options";

/**
 * Chart type definitions
 */
export type ChartType = "donut" | "bar" | "heatmap" | "line" | "area";

/**
 * Aggregation strategy for different field types
 */
export type AggregationStrategy = "distribution" | "frequency" | "sum" | "avg" | "trend";

/**
 * Chart data point for distribution charts (donut, bar)
 */
export interface DistributionDataPoint {
  label: string;
  value: number;
  percentage?: number;
  fill?: string;
}

/**
 * Chart data point for trend charts (line, area)
 */
export interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

/**
 * Unified chart data contract
 */
export interface ChartData {
  fieldKey: string;
  fieldName: string;
  chartType: ChartType;
  aggregation: AggregationStrategy;
  data: DistributionDataPoint[] | TrendDataPoint[];
  meta: {
    total?: number;
    topN?: number;
    groupBy?: string;
    suffix?: string;
  };
}

/**
 * Chart colors palette
 */
export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
];

/**
 * Map field type to aggregation strategy
 */
export function getAggregationStrategy(fieldConfig: FieldConfig): AggregationStrategy {
  const type = fieldConfig.type;
  const analyticsConfig = getAnalyticsConfig(fieldConfig);

  switch (type) {
    case "status":
    case "priority":
    case "editable-combobox":
    case "select":
    case "editable-owner":
      return "distribution";

    case "editable-tags":
    case "multiselect":
    case "badge-list":
      return "frequency";

    case "editable-number":
    case "number":
      return analyticsConfig.aggregation === "avg" ? "avg" : "sum";

    case "editable-date":
    case "date":
      return "trend";

    default:
      return "distribution";
  }
}

/**
 * Map field type to recommended chart type
 */
export function getRecommendedChartType(fieldConfig: FieldConfig): ChartType {
  const analyticsConfig = getAnalyticsConfig(fieldConfig);
  if (analyticsConfig.chart) {
    return analyticsConfig.chart;
  }

  const strategy = getAggregationStrategy(fieldConfig);

  switch (strategy) {
    case "distribution":
      return "donut";
    case "frequency":
      return "bar";
    case "sum":
    case "avg":
      return "line";
    case "trend":
      return "line";
    default:
      return "bar";
  }
}

/**
 * Build SQL expression for field aggregation
 * Returns the SQL fragment for extracting and aggregating a JSONB field
 */
export function buildFieldAggregationSQL(fieldConfig: FieldConfig): {
  extractExpr: string;
  groupExpr: string;
  aggregateExpr: string;
} {
  const { key, type } = fieldConfig;
  const strategy = getAggregationStrategy(fieldConfig);

  switch (strategy) {
    case "distribution":
      return {
        extractExpr: `COALESCE(data->>'${key}', 'unspecified')`,
        groupExpr: `COALESCE(data->>'${key}', 'unspecified')`,
        aggregateExpr: `COUNT(*)::int`,
      };

    case "frequency":
      // Explode array and count occurrences
      return {
        extractExpr: `jsonb_array_elements_text(COALESCE(data->'${key}', '[]'::jsonb))`,
        groupExpr: `LOWER(elem)`,
        aggregateExpr: `COUNT(*)::int`,
      };

    case "sum":
      return {
        extractExpr: `(data->>'${key}')::numeric`,
        groupExpr: `TO_CHAR(created_at, 'YYYY-MM')`,
        aggregateExpr: `SUM(COALESCE((data->>'${key}')::numeric, 0))::float`,
      };

    case "avg":
      return {
        extractExpr: `(data->>'${key}')::numeric`,
        groupExpr: `TO_CHAR(created_at, 'YYYY-MM')`,
        aggregateExpr: `AVG(COALESCE((data->>'${key}')::numeric, 0))::float`,
      };

    case "trend":
      return {
        extractExpr: `(data->>'${key}')::timestamp`,
        groupExpr: `DATE_TRUNC('week', (data->>'${key}')::timestamp)`,
        aggregateExpr: `COUNT(*)::int`,
      };

    default:
      return {
        extractExpr: `data->>'${key}'`,
        groupExpr: `data->>'${key}'`,
        aggregateExpr: `COUNT(*)::int`,
      };
  }
}

/**
 * Get chart configuration for a field
 */
export function getChartConfig(fieldConfig: FieldConfig): {
  chartType: ChartType;
  aggregation: AggregationStrategy;
  topN: number;
  groupBy: string;
} {
  const analyticsConfig = getAnalyticsConfig(fieldConfig);

  return {
    chartType: analyticsConfig.chart || getRecommendedChartType(fieldConfig),
    aggregation: getAggregationStrategy(fieldConfig),
    topN: analyticsConfig.topN || 10,
    groupBy: analyticsConfig.groupBy || "month",
  };
}

/**
 * Filter fields that should have charts generated
 */
export function getChartableFields(fieldConfigs: FieldConfig[]): FieldConfig[] {
  return fieldConfigs.filter((field) => {
    const config = getAnalyticsConfig(field);
    // Skip if explicitly disabled
    if (config.enabled === false) return false;
    // Skip text fields (not useful for charts)
    if (field.type === "editable-text" || field.type === "text") return false;
    // Skip checkbox (binary, not very useful)
    if (field.type === "checkbox") return false;
    return true;
  });
}

/**
 * Assign colors to chart data points
 */
export function assignChartColors(
  data: DistributionDataPoint[]
): DistributionDataPoint[] {
  return data.map((point, index) => ({
    ...point,
    fill: point.fill || CHART_COLORS[index % CHART_COLORS.length],
  }));
}

/**
 * Apply topN limit to chart data
 */
export function applyTopN(
  data: DistributionDataPoint[],
  topN: number
): DistributionDataPoint[] {
  if (data.length <= topN) {
    return data;
  }

  const sorted = [...data].sort((a, b) => b.value - a.value);
  const top = sorted.slice(0, topN - 1);
  const others = sorted.slice(topN - 1);
  const othersTotal = others.reduce((sum, item) => sum + item.value, 0);

  if (othersTotal > 0) {
    top.push({
      label: "Others",
      value: othersTotal,
      fill: CHART_COLORS[CHART_COLORS.length - 1],
    });
  }

  return top;
}

/**
 * Calculate percentages for distribution data
 */
export function calculatePercentages(
  data: DistributionDataPoint[]
): DistributionDataPoint[] {
  const total = data.reduce((sum, point) => sum + point.value, 0);
  if (total === 0) return data;

  return data.map((point) => ({
    ...point,
    percentage: Math.round((point.value / total) * 100 * 10) / 10,
  }));
}
