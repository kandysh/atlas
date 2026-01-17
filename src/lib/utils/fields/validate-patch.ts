import { FieldConfig } from "@/src/lib/db/schema";

/**
 * Validation result for a patch
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  sanitizedPatch: Record<string, unknown>;
}

/**
 * Individual validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code: "UNKNOWN_FIELD" | "TYPE_MISMATCH" | "REQUIRED" | "INVALID_VALUE" | "MAX_ITEMS";
}

/**
 * Max items limit for array fields (tags) to prevent abuse
 */
const MAX_TAGS_DEFAULT = 20;

/**
 * Validate a patch against field configurations
 * Server-side validation to prevent unknown keys/types from being written
 */
export function validatePatch(
  fieldConfigs: FieldConfig[],
  patch: Record<string, unknown>
): ValidationResult {
  const errors: ValidationError[] = [];
  const sanitizedPatch: Record<string, unknown> = {};

  // Build a map of valid field keys to their configs
  const fieldMap = new Map<string, FieldConfig>();
  for (const config of fieldConfigs) {
    fieldMap.set(config.key, config);
  }

  for (const [key, value] of Object.entries(patch)) {
    const fieldConfig = fieldMap.get(key);

    // Check for unknown fields (config drift protection)
    if (!fieldConfig) {
      errors.push({
        field: key,
        message: `Unknown field: ${key}. Field may have been removed from configuration.`,
        code: "UNKNOWN_FIELD",
      });
      continue;
    }

    // Validate type
    const typeError = validateFieldType(fieldConfig, value);
    if (typeError) {
      errors.push(typeError);
      continue;
    }

    // Validate required fields
    if (fieldConfig.options?.required && isEmptyValue(value)) {
      errors.push({
        field: key,
        message: `${fieldConfig.name} is required`,
        code: "REQUIRED",
      });
      continue;
    }

    // Validate choices for select-type fields
    const choicesError = validateChoices(fieldConfig, value);
    if (choicesError) {
      errors.push(choicesError);
      continue;
    }

    // Validate array size limits (for tags)
    const maxItemsError = validateMaxItems(fieldConfig, value);
    if (maxItemsError) {
      errors.push(maxItemsError);
      continue;
    }

    // Sanitize and add to result
    sanitizedPatch[key] = sanitizeValue(fieldConfig, value);
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitizedPatch: errors.length === 0 ? sanitizedPatch : {},
  };
}

/**
 * Validate field type matches expected type
 */
function validateFieldType(
  fieldConfig: FieldConfig,
  value: unknown
): ValidationError | null {
  const { key, type, name } = fieldConfig;

  // Allow null/undefined for optional fields
  if (value === null || value === undefined) {
    return null;
  }

  switch (type) {
    case "editable-text":
    case "text":
    case "status":
    case "priority":
    case "editable-owner":
    case "editable-combobox":
    case "select":
      if (typeof value !== "string") {
        return {
          field: key,
          message: `${name} must be a string`,
          code: "TYPE_MISMATCH",
        };
      }
      break;

    case "editable-number":
    case "number":
      if (typeof value !== "number" || isNaN(value)) {
        return {
          field: key,
          message: `${name} must be a number`,
          code: "TYPE_MISMATCH",
        };
      }
      break;

    case "editable-date":
    case "date":
      // Accept Date objects, ISO strings, or null
      if (value !== null && !(value instanceof Date) && typeof value !== "string") {
        return {
          field: key,
          message: `${name} must be a date`,
          code: "TYPE_MISMATCH",
        };
      }
      // Validate date string is parseable
      if (typeof value === "string" && isNaN(Date.parse(value))) {
        return {
          field: key,
          message: `${name} is not a valid date`,
          code: "INVALID_VALUE",
        };
      }
      break;

    case "editable-tags":
    case "multiselect":
    case "badge-list":
      if (!Array.isArray(value)) {
        return {
          field: key,
          message: `${name} must be an array`,
          code: "TYPE_MISMATCH",
        };
      }
      // Validate array items are strings
      if (!value.every((item) => typeof item === "string")) {
        return {
          field: key,
          message: `${name} must contain only strings`,
          code: "TYPE_MISMATCH",
        };
      }
      break;

    case "checkbox":
      if (typeof value !== "boolean") {
        return {
          field: key,
          message: `${name} must be a boolean`,
          code: "TYPE_MISMATCH",
        };
      }
      break;
  }

  return null;
}

/**
 * Validate value is in allowed choices (for select-type fields)
 */
function validateChoices(
  fieldConfig: FieldConfig,
  value: unknown
): ValidationError | null {
  const { key, type, name, options } = fieldConfig;
  const choices = options?.choices as string[] | undefined;

  // Only validate if choices are defined and not empty
  if (!choices || choices.length === 0) {
    return null;
  }

  // For select/combobox fields, value must be in choices (or allow new values for combobox)
  if (type === "status" || type === "priority" || type === "select") {
    if (typeof value === "string" && !choices.includes(value)) {
      return {
        field: key,
        message: `${name} must be one of: ${choices.join(", ")}`,
        code: "INVALID_VALUE",
      };
    }
  }

  // For multiselect, all values must be in choices
  if (type === "multiselect" && Array.isArray(value)) {
    const invalidValues = value.filter((v) => !choices.includes(v));
    if (invalidValues.length > 0) {
      return {
        field: key,
        message: `${name} contains invalid values: ${invalidValues.join(", ")}`,
        code: "INVALID_VALUE",
      };
    }
  }

  return null;
}

/**
 * Validate array size limits
 */
function validateMaxItems(
  fieldConfig: FieldConfig,
  value: unknown
): ValidationError | null {
  const { key, type, name, options } = fieldConfig;

  if (type !== "editable-tags" && type !== "multiselect" && type !== "badge-list") {
    return null;
  }

  if (!Array.isArray(value)) {
    return null;
  }

  const maxItems = (options?.maxItems as number) || MAX_TAGS_DEFAULT;
  if (value.length > maxItems) {
    return {
      field: key,
      message: `${name} cannot have more than ${maxItems} items`,
      code: "MAX_ITEMS",
    };
  }

  return null;
}

/**
 * Check if value is empty
 */
function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

/**
 * Sanitize value based on field type
 */
function sanitizeValue(fieldConfig: FieldConfig, value: unknown): unknown {
  const { type } = fieldConfig;

  switch (type) {
    case "editable-text":
    case "text":
    case "status":
    case "priority":
    case "editable-owner":
    case "editable-combobox":
    case "select":
      // Trim strings
      return typeof value === "string" ? value.trim() : value;

    case "editable-number":
    case "number":
      // Ensure number is finite
      return typeof value === "number" && isFinite(value) ? value : 0;

    case "editable-date":
    case "date":
      // Normalize to ISO string or null
      if (value === null) return null;
      if (value instanceof Date) return value.toISOString();
      if (typeof value === "string") return new Date(value).toISOString();
      return null;

    case "editable-tags":
    case "multiselect":
    case "badge-list":
      // Trim and filter empty strings from arrays
      if (Array.isArray(value)) {
        return value
          .map((v) => (typeof v === "string" ? v.trim() : v))
          .filter((v) => v !== "");
      }
      return value;

    default:
      return value;
  }
}

/**
 * Check if a field exists in the current configuration
 * Used for config drift detection
 */
export function isFieldConfigured(
  fieldConfigs: FieldConfig[],
  fieldKey: string
): boolean {
  return fieldConfigs.some((config) => config.key === fieldKey);
}

/**
 * Get unknown keys from task data that aren't in field configs
 * Useful for detecting orphaned data from removed fields
 */
export function getOrphanedKeys(
  fieldConfigs: FieldConfig[],
  taskData: Record<string, unknown>
): string[] {
  const configuredKeys = new Set(fieldConfigs.map((config) => config.key));
  return Object.keys(taskData).filter((key) => !configuredKeys.has(key));
}
