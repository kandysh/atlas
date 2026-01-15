import { FieldConfig } from "@/src/lib/db";

/**
 * Validate field values based on field type
 */
export function validateFields(
  patch: Record<string, unknown>,
  fieldConfigs: FieldConfig[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [key, value] of Object.entries(patch)) {
    const fieldConfig = fieldConfigs.find((f) => f.key === key);

    if (!fieldConfig) {
      continue; // Skip validation for fields not in config
    }

    const { type, options } = fieldConfig;

    try {
      switch (type) {
        case "text":
          if (typeof value !== "string") {
            errors.push(`${fieldConfig.name} must be a string`);
          }
          break;

        case "number":
          if (typeof value !== "number" || isNaN(value)) {
            errors.push(`${fieldConfig.name} must be a number`);
          }
          break;

        case "checkbox":
          if (typeof value !== "boolean") {
            errors.push(`${fieldConfig.name} must be a boolean`);
          }
          break;

        case "date":
          if (!(value instanceof Date) && typeof value !== "string") {
            errors.push(`${fieldConfig.name} must be a date`);
          }
          break;

        case "select":
          if (typeof value !== "string") {
            errors.push(`${fieldConfig.name} must be a string`);
          } else if (options?.choices && !options.choices.includes(value)) {
            errors.push(
              `${fieldConfig.name} must be one of: ${options.choices.join(", ")}`
            );
          }
          break;

        case "multiselect":
          if (!Array.isArray(value)) {
            errors.push(`${fieldConfig.name} must be an array`);
          } else if (options?.choices) {
            const invalidChoices = value.filter(
              (v) => !options.choices?.includes(v)
            );
            if (invalidChoices.length > 0) {
              errors.push(
                `${fieldConfig.name} contains invalid choices: ${invalidChoices.join(", ")}`
              );
            }
          }
          break;
      }

      // Check required fields
      if (
        options?.required &&
        (value === null || value === undefined || value === "")
      ) {
        errors.push(`${fieldConfig.name} is required`);
      }
    } catch (error) {
      errors.push(`${fieldConfig.name} validation failed`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
