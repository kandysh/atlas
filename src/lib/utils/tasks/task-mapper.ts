import { Task as DbTask } from "@/src/lib/db";
import { Task as UiTask } from "@/src/lib/types";

/**
 * Convert database task (with JSONB data field) to UI task (flat structure)
 * Dynamically maps all fields from the data column without hardcoding field names
 */
export function dbTaskToUiTask(dbTask: DbTask): UiTask {
  const data = dbTask.data as Record<string, unknown>;
  
  // Process data to handle date conversions
  const processedData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    // Convert ISO date strings to Date objects for date-like fields
    if (typeof value === "string" && key.toLowerCase().includes("date") && !isNaN(Date.parse(value))) {
      processedData[key] = new Date(value);
    } else {
      processedData[key] = value;
    }
  }
  
  return {
    id: dbTask.displayId, // Use displayId as the UI id (TSK-001-0001)
    ...processedData,
    createdAt: new Date(dbTask.createdAt),
    updatedAt: new Date(dbTask.updatedAt),
  };
}

/**
 * Convert UI task data to database JSONB data format
 * Dynamically maps all fields without hardcoding
 */
export function uiTaskToDbData(uiTask: Partial<UiTask>): Record<string, unknown> {
  const dbData: Record<string, unknown> = {};
  
  // Skip system fields that should not be stored in the data column
  const systemFields = new Set(["id", "createdAt", "updatedAt"]);
  
  for (const [key, value] of Object.entries(uiTask)) {
    if (!systemFields.has(key) && value !== undefined) {
      dbData[key] = value;
    }
  }
  
  return dbData;
}

/**
 * Get the database task ID from a UI task ID (displayId)
 * This is a helper for components that need to find the actual DB ID
 */
export function getDbTaskId(displayId: string, dbTasks: DbTask[]): string | null {
  const task = dbTasks.find((t) => t.displayId === displayId);
  return task?.id || null;
}
