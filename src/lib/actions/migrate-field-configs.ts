"use server";

import { db, fieldConfigs } from "@/src/lib/db";
import { eq, sql } from "drizzle-orm";
import { DrawerConfig, AnalyticsConfig } from "@/src/lib/utils/fields/field-options";

/**
 * Default drawer/analytics configurations by field key
 * Used to backfill existing field configs
 */
const FIELD_DEFAULTS: Record<
  string,
  { drawer?: DrawerConfig; analytics?: AnalyticsConfig; maxItems?: number }
> = {
  title: {
    drawer: { section: "Core", width: "full" },
    analytics: { enabled: false },
  },
  owner: {
    drawer: { section: "Core", width: "half" },
    analytics: { enabled: true, chart: "bar", topN: 10 },
  },
  status: {
    drawer: { section: "Core", width: "half" },
    analytics: { enabled: true, chart: "donut" },
  },
  priority: {
    drawer: { section: "Core", width: "half" },
    analytics: { enabled: true, chart: "bar" },
  },
  assetClass: {
    drawer: { section: "Core", width: "half" },
    analytics: { enabled: true, chart: "donut" },
  },
  theme: {
    drawer: { section: "Core", width: "half" },
    analytics: { enabled: true, chart: "donut" },
  },
  teamsInvolved: {
    drawer: { section: "Details", width: "full" },
    analytics: { enabled: true, chart: "bar", topN: 10 },
    maxItems: 20,
  },
  problemStatement: {
    drawer: { section: "Details", width: "full" },
    analytics: { enabled: false },
  },
  solutionDesign: {
    drawer: { section: "Details", width: "full" },
    analytics: { enabled: false },
  },
  benefits: {
    drawer: { section: "Details", width: "full" },
    analytics: { enabled: false },
  },
  currentHrs: {
    drawer: { section: "Hours", width: "half" },
    analytics: { enabled: true, chart: "line", aggregation: "sum" },
  },
  workedHrs: {
    drawer: { section: "Hours", width: "half" },
    analytics: { enabled: true, chart: "line", aggregation: "sum" },
  },
  savedHrs: {
    drawer: { section: "Hours", width: "half" },
    analytics: { enabled: true, chart: "line", aggregation: "sum" },
  },
  tools: {
    drawer: { section: "Details", width: "full" },
    analytics: { enabled: true, chart: "bar", topN: 10 },
    maxItems: 20,
  },
  tags: {
    drawer: { section: "Details", width: "full" },
    analytics: { enabled: true, chart: "heatmap", topN: 10 },
    maxItems: 20,
  },
  otherUseCases: {
    drawer: { section: "Details", width: "full" },
    analytics: { enabled: false },
  },
  completionDate: {
    drawer: { section: "Timeline", width: "half" },
    analytics: { enabled: true, chart: "line", groupBy: "week" },
  },
};

/**
 * Default drawer config by field type (for custom fields)
 */
const TYPE_DEFAULTS: Record<
  string,
  { drawer: DrawerConfig; analytics: AnalyticsConfig }
> = {
  "editable-text": {
    drawer: { section: "Details", width: "full" },
    analytics: { enabled: false },
  },
  "editable-owner": {
    drawer: { section: "Core", width: "half" },
    analytics: { enabled: true, chart: "bar", topN: 10 },
  },
  status: {
    drawer: { section: "Core", width: "half" },
    analytics: { enabled: true, chart: "donut" },
  },
  priority: {
    drawer: { section: "Core", width: "half" },
    analytics: { enabled: true, chart: "bar" },
  },
  "editable-combobox": {
    drawer: { section: "Core", width: "half" },
    analytics: { enabled: true, chart: "donut" },
  },
  "editable-tags": {
    drawer: { section: "Details", width: "full" },
    analytics: { enabled: true, chart: "bar", topN: 10 },
  },
  "editable-number": {
    drawer: { section: "Hours", width: "half" },
    analytics: { enabled: true, chart: "line", aggregation: "sum" },
  },
  "editable-date": {
    drawer: { section: "Timeline", width: "half" },
    analytics: { enabled: true, chart: "line", groupBy: "week" },
  },
  checkbox: {
    drawer: { section: "Details", width: "half" },
    analytics: { enabled: false },
  },
  multiselect: {
    drawer: { section: "Details", width: "full" },
    analytics: { enabled: true, chart: "bar", topN: 10 },
  },
  select: {
    drawer: { section: "Core", width: "half" },
    analytics: { enabled: true, chart: "donut" },
  },
  text: {
    drawer: { section: "Details", width: "full" },
    analytics: { enabled: false },
  },
  number: {
    drawer: { section: "Hours", width: "half" },
    analytics: { enabled: true, chart: "line", aggregation: "sum" },
  },
  date: {
    drawer: { section: "Timeline", width: "half" },
    analytics: { enabled: true, chart: "line", groupBy: "week" },
  },
};

/**
 * Migrate existing field configs to include drawer and analytics options
 * Safe to run multiple times - only updates fields missing these options
 */
export async function migrateFieldConfigOptions(): Promise<{
  success: boolean;
  updated: number;
  error?: string;
}> {
  try {
    // Get all field configs
    const allConfigs = await db.select().from(fieldConfigs);

    let updated = 0;

    for (const config of allConfigs) {
      const existingOptions = (config.options || {}) as Record<string, unknown>;

      // Skip if already has drawer and analytics
      if (existingOptions.drawer && existingOptions.analytics) {
        continue;
      }

      // Get defaults by field key first, then by type
      const keyDefaults = FIELD_DEFAULTS[config.key];
      const typeDefaults = TYPE_DEFAULTS[config.type] || {
        drawer: { section: "Details", width: "full" },
        analytics: { enabled: false },
      };

      const newOptions = {
        ...existingOptions,
        drawer: existingOptions.drawer || keyDefaults?.drawer || typeDefaults.drawer,
        analytics: existingOptions.analytics || keyDefaults?.analytics || typeDefaults.analytics,
      };

      // Add maxItems for tag fields if not present
      if (
        (config.type === "editable-tags" || config.type === "multiselect") &&
        !existingOptions.maxItems
      ) {
        (newOptions as Record<string, unknown>).maxItems = keyDefaults?.maxItems || 20;
      }

      // Update the field config
      await db
        .update(fieldConfigs)
        .set({
          options: newOptions,
          updatedAt: new Date(),
        })
        .where(eq(fieldConfigs.id, config.id));

      updated++;
    }

    return { success: true, updated };
  } catch (error) {
    console.error("Error migrating field configs:", error);
    return {
      success: false,
      updated: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if field configs need migration
 */
export async function checkFieldConfigMigrationNeeded(): Promise<{
  needed: boolean;
  count: number;
}> {
  try {
    // Count fields missing drawer or analytics options
    const result = await db.execute(sql`
      SELECT COUNT(*)::int as count
      FROM field_configs
      WHERE options->>'drawer' IS NULL
         OR options->>'analytics' IS NULL
    `);

    const count = (result.rows[0] as { count: number })?.count || 0;
    return { needed: count > 0, count };
  } catch (error) {
    console.error("Error checking migration status:", error);
    return { needed: false, count: 0 };
  }
}
