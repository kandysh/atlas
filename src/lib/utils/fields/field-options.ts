import { FieldConfig } from "@/src/lib/db/schema";

/**
 * Drawer configuration for field display
 */
export interface DrawerConfig {
  section?: "Core" | "Details" | "Hours" | "Timeline" | "Meta";
  width?: "full" | "half";
  helpText?: string;
  icon?: string;
}

/**
 * Analytics configuration for chart rendering
 */
export interface AnalyticsConfig {
  enabled?: boolean;
  chart?: "donut" | "bar" | "heatmap" | "line" | "area";
  groupBy?: "day" | "week" | "month" | "quarter";
  topN?: number;
  aggregation?: "count" | "sum" | "avg";
}

/**
 * Extended field options with drawer and analytics configs
 */
export interface ExtendedFieldOptions {
  choices?: string[];
  defaultValue?: string | number | boolean;
  required?: boolean;
  suffix?: string;
  drawer?: DrawerConfig;
  analytics?: AnalyticsConfig;
  maxItems?: number; // For tags, limit array size
  [key: string]: unknown;
}

/**
 * Section order for drawer grouping
 */
const SECTION_ORDER: Record<string, number> = {
  Core: 0,
  Details: 1,
  Hours: 2,
  Timeline: 3,
  Meta: 4,
};

/**
 * Default section assignments based on field type
 */
const DEFAULT_SECTIONS: Record<string, DrawerConfig["section"]> = {
  "editable-text": "Details",
  "editable-owner": "Core",
  status: "Core",
  priority: "Core",
  "editable-tags": "Details",
  "editable-number": "Hours",
  "editable-date": "Timeline",
  "editable-combobox": "Core",
  checkbox: "Details",
  multiselect: "Details",
};

/**
 * Default analytics config based on field type
 */
const DEFAULT_ANALYTICS: Record<string, AnalyticsConfig> = {
  status: { enabled: true, chart: "donut", aggregation: "count" },
  priority: { enabled: true, chart: "bar", aggregation: "count" },
  "editable-combobox": { enabled: true, chart: "donut", aggregation: "count" },
  "editable-tags": { enabled: true, chart: "bar", topN: 10, aggregation: "count" },
  "editable-number": { enabled: true, chart: "line", aggregation: "sum" },
  "editable-date": { enabled: true, chart: "line", groupBy: "week", aggregation: "count" },
  "editable-owner": { enabled: true, chart: "bar", topN: 10, aggregation: "count" },
};

/**
 * Get drawer config for a field, merging defaults with explicit options
 */
export function getDrawerConfig(fieldConfig: FieldConfig): DrawerConfig {
  const options = fieldConfig.options as ExtendedFieldOptions | undefined;
  const explicitConfig = options?.drawer || {};
  const defaultSection = DEFAULT_SECTIONS[fieldConfig.type] || "Details";

  return {
    section: explicitConfig.section || defaultSection,
    width: explicitConfig.width || "full",
    helpText: explicitConfig.helpText,
    icon: explicitConfig.icon,
  };
}

/**
 * Get analytics config for a field, merging defaults with explicit options
 */
export function getAnalyticsConfig(fieldConfig: FieldConfig): AnalyticsConfig {
  const options = fieldConfig.options as ExtendedFieldOptions | undefined;
  const explicitConfig = options?.analytics || {};
  const defaultConfig = DEFAULT_ANALYTICS[fieldConfig.type] || { enabled: false };

  return {
    ...defaultConfig,
    ...explicitConfig,
  };
}

/**
 * Group fields by drawer section
 */
export function groupFieldsBySection(
  fieldConfigs: FieldConfig[]
): Map<string, FieldConfig[]> {
  const groups = new Map<string, FieldConfig[]>();

  // Initialize sections in order
  Object.keys(SECTION_ORDER).forEach((section) => {
    groups.set(section, []);
  });

  // Sort fields by order first
  const sortedFields = [...fieldConfigs].sort((a, b) => a.order - b.order);

  // Group by section
  for (const field of sortedFields) {
    const drawerConfig = getDrawerConfig(field);
    const section = drawerConfig.section || "Details";
    const existing = groups.get(section) || [];
    existing.push(field);
    groups.set(section, existing);
  }

  // Remove empty sections
  for (const [section, fields] of groups) {
    if (fields.length === 0) {
      groups.delete(section);
    }
  }

  return groups;
}

/**
 * Get fields that have analytics enabled
 */
export function getAnalyticsEnabledFields(
  fieldConfigs: FieldConfig[]
): FieldConfig[] {
  return fieldConfigs.filter((field) => {
    const config = getAnalyticsConfig(field);
    return config.enabled !== false;
  });
}

/**
 * Fields that should always be excluded from drawer rendering
 * (they are rendered as special cases like header/title)
 */
const EXCLUDED_FROM_DRAWER = new Set(["title"]);

/**
 * Filter fields for drawer rendering
 */
export function getDrawerFields(fieldConfigs: FieldConfig[]): FieldConfig[] {
  return fieldConfigs.filter(
    (field) => !EXCLUDED_FROM_DRAWER.has(field.key)
  );
}
