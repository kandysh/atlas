import { NewFieldConfig } from "@/src/lib/db/schema";
import { DrawerConfig, AnalyticsConfig } from "./field-options";

/**
 * Extended options type including drawer and analytics configs
 */
interface FieldOptions {
  choices?: string[];
  defaultValue?: string | number | boolean;
  required?: boolean;
  suffix?: string;
  maxItems?: number;
  drawer?: DrawerConfig;
  analytics?: AnalyticsConfig;
}

/**
 * Generate default field configurations for a new workspace
 * Includes drawer and analytics configurations for metadata-driven UI
 */
export function getDefaultFieldConfigs(
  workspaceId: string,
): Omit<NewFieldConfig, "id" | "createdAt" | "updatedAt">[] {
  return [
    {
      workspaceId,
      key: "title",
      name: "Title",
      type: "editable-text",
      options: { 
        required: true,
        drawer: { section: "Core", width: "full" },
        analytics: { enabled: false },
      } satisfies FieldOptions,
      order: 0,
      visible: true,
    },
    {
      workspaceId,
      key: "owner",
      name: "Owner",
      type: "editable-owner",
      options: { 
        choices: [], 
        required: true,
        drawer: { section: "Core", width: "half" },
        analytics: { enabled: true, chart: "bar", topN: 10 },
      } satisfies FieldOptions,
      order: 1,
      visible: true,
    },
    {
      workspaceId,
      key: "status",
      name: "Status",
      type: "status",
      options: {
        choices: [
          "todo",
          "in-progress",
          "testing",
          "done",
          "completed",
          "blocked",
        ],
        defaultValue: "todo",
        required: true,
        drawer: { section: "Core", width: "half" },
        analytics: { enabled: true, chart: "donut" },
      } satisfies FieldOptions,
      order: 2,
      visible: true,
    },
    {
      workspaceId,
      key: "priority",
      name: "Priority",
      type: "priority",
      options: {
        choices: ["low", "medium", "high", "urgent"],
        defaultValue: "medium",
        required: true,
        drawer: { section: "Core", width: "half" },
        analytics: { enabled: true, chart: "bar" },
      } satisfies FieldOptions,
      order: 3,
      visible: true,
    },
    {
      workspaceId,
      key: "assetClass",
      name: "Asset Class",
      type: "editable-combobox",
      options: { 
        choices: [], 
        required: false,
        drawer: { section: "Core", width: "half" },
        analytics: { enabled: true, chart: "donut" },
      } satisfies FieldOptions,
      order: 4,
      visible: true,
    },
    {
      workspaceId,
      key: "theme",
      name: "Theme",
      type: "editable-combobox",
      options: { 
        choices: [], 
        required: false,
        drawer: { section: "Core", width: "half" },
        analytics: { enabled: true, chart: "donut" },
      } satisfies FieldOptions,
      order: 5,
      visible: false,
    },
    {
      workspaceId,
      key: "teamsInvolved",
      name: "Teams Involved",
      type: "editable-tags",
      options: { 
        choices: [], 
        required: false,
        maxItems: 20,
        drawer: { section: "Details", width: "full" },
        analytics: { enabled: true, chart: "bar", topN: 10 },
      } satisfies FieldOptions,
      order: 6,
      visible: true,
    },
    {
      workspaceId,
      key: "problemStatement",
      name: "Problem Statement",
      type: "editable-text",
      options: { 
        required: false,
        drawer: { section: "Details", width: "full" },
        analytics: { enabled: false },
      } satisfies FieldOptions,
      order: 7,
      visible: false,
    },
    {
      workspaceId,
      key: "solutionDesign",
      name: "Solution Design",
      type: "editable-text",
      options: { 
        required: false,
        drawer: { section: "Details", width: "full" },
        analytics: { enabled: false },
      } satisfies FieldOptions,
      order: 8,
      visible: false,
    },
    {
      workspaceId,
      key: "benefits",
      name: "Benefits",
      type: "editable-text",
      options: { 
        required: false,
        drawer: { section: "Details", width: "full" },
        analytics: { enabled: false },
      } satisfies FieldOptions,
      order: 9,
      visible: false,
    },
    {
      workspaceId,
      key: "currentHrs",
      name: "Estimated Hours",
      type: "editable-number",
      options: { 
        defaultValue: 0, 
        required: false, 
        suffix: "h",
        drawer: { section: "Hours", width: "half" },
        analytics: { enabled: true, chart: "line", aggregation: "sum" },
      } satisfies FieldOptions,
      order: 10,
      visible: true,
    },
    {
      workspaceId,
      key: "workedHrs",
      name: "Worked Hours",
      type: "editable-number",
      options: { 
        defaultValue: 0, 
        required: false, 
        suffix: "h",
        drawer: { section: "Hours", width: "half" },
        analytics: { enabled: true, chart: "line", aggregation: "sum" },
      } satisfies FieldOptions,
      order: 11,
      visible: true,
    },
    {
      workspaceId,
      key: "savedHrs",
      name: "Saved Hours",
      type: "editable-number",
      options: { 
        defaultValue: 0, 
        required: false, 
        suffix: "h",
        drawer: { section: "Hours", width: "half" },
        analytics: { enabled: true, chart: "line", aggregation: "sum" },
      } satisfies FieldOptions,
      order: 12,
      visible: false,
    },
    {
      workspaceId,
      key: "tools",
      name: "Tools",
      type: "editable-tags",
      options: { 
        choices: [], 
        required: false,
        maxItems: 20,
        drawer: { section: "Details", width: "full" },
        analytics: { enabled: true, chart: "bar", topN: 10 },
      } satisfies FieldOptions,
      order: 13,
      visible: false,
    },
    {
      workspaceId,
      key: "tags",
      name: "Tags",
      type: "editable-tags",
      options: { 
        choices: [], 
        required: false,
        maxItems: 20,
        drawer: { section: "Details", width: "full" },
        analytics: { enabled: true, chart: "heatmap", topN: 10 },
      } satisfies FieldOptions,
      order: 14,
      visible: false,
    },
    {
      workspaceId,
      key: "otherUseCases",
      name: "Other Use Cases",
      type: "editable-text",
      options: { 
        required: false,
        drawer: { section: "Details", width: "full" },
        analytics: { enabled: false },
      } satisfies FieldOptions,
      order: 15,
      visible: false,
    },
    {
      workspaceId,
      key: "completionDate",
      name: "Completion Date",
      type: "editable-date",
      options: { 
        required: false,
        drawer: { section: "Timeline", width: "half" },
        analytics: { enabled: true, chart: "line", groupBy: "week" },
      } satisfies FieldOptions,
      order: 16,
      visible: true,
    },
  ];
}
