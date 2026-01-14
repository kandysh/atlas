import { z } from "zod";
import { Task, FieldConfig } from "@/src/lib/db";

/**
 * Fetch tasks for a workspace with pagination
 */
export async function getWorkspaceTasks(
  workspaceId: string,
  page: number = 0
): Promise<{ tasks: Task[]; page: number; perPage: number; hasMore: boolean }> {
  const response = await fetch(
    `/api/tasks?workspaceId=${workspaceId}&page=${page}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  return response.json();
}

/**
 * Fetch field configurations for a workspace
 */
export async function getWorkspaceFields(
  workspaceId: string
): Promise<{ fields: FieldConfig[] }> {
  const response = await fetch(`/api/fields?workspaceId=${workspaceId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch fields");
  }

  return response.json();
}

/**
 * Create a new task
 */
export async function createTask(
  workspaceId: string,
  data: Record<string, any>
): Promise<Task> {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workspaceId, data }),
  });

  if (!response.ok) {
    throw new Error("Failed to create task");
  }

  return response.json();
}

/**
 * Update a task with a partial patch
 */
export async function updateTask(
  taskId: string,
  patch: Record<string, any>
): Promise<Task> {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patch }),
  });

  if (!response.ok) {
    throw new Error("Failed to update task");
  }

  return response.json();
}

/**
 * Validate field values based on field type
 */
export function validateFields(
  patch: Record<string, any>,
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
          if (options?.choices && !options.choices.includes(value)) {
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
      if (options?.required && (value === null || value === undefined || value === "")) {
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
