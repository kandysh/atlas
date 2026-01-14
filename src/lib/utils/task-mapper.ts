import { Task as DbTask } from "@/src/lib/db";
import { Task as UiTask, Status, Priority } from "@/src/lib/types";

/**
 * Convert database task (with JSONB data field) to UI task (flat structure)
 */
export function dbTaskToUiTask(dbTask: DbTask): UiTask {
  const data = dbTask.data as Record<string, any>;
  
  return {
    id: dbTask.displayId, // Use displayId as the UI id (TSK-001-0001)
    owner: data.owner || "",
    title: data.title || "",
    assetClass: data.assetClass || "",
    teamsInvolved: data.teamsInvolved || [],
    theme: data.theme || "",
    problemStatement: data.problemStatement || "",
    solutionDesign: data.solutionDesign || "",
    status: (data.status as Status) || "todo",
    priority: (data.priority as Priority) || "medium",
    benefits: data.benefits || "",
    currentHrs: data.currentHrs || 0,
    savedHrs: data.savedHrs || 0,
    workedHrs: data.workedHrs || 0,
    tools: data.tools || [],
    otherUseCases: data.otherUseCases || "",
    tags: data.tags || [],
    completionDate: data.completionDate ? new Date(data.completionDate) : null,
    createdAt: new Date(dbTask.createdAt),
    updatedAt: new Date(dbTask.updatedAt),
  };
}

/**
 * Convert UI task data to database JSONB data format
 */
export function uiTaskToDbData(uiTask: Partial<UiTask>): Record<string, any> {
  const dbData: Record<string, any> = {};
  
  if (uiTask.owner !== undefined) dbData.owner = uiTask.owner;
  if (uiTask.title !== undefined) dbData.title = uiTask.title;
  if (uiTask.assetClass !== undefined) dbData.assetClass = uiTask.assetClass;
  if (uiTask.teamsInvolved !== undefined) dbData.teamsInvolved = uiTask.teamsInvolved;
  if (uiTask.theme !== undefined) dbData.theme = uiTask.theme;
  if (uiTask.problemStatement !== undefined) dbData.problemStatement = uiTask.problemStatement;
  if (uiTask.solutionDesign !== undefined) dbData.solutionDesign = uiTask.solutionDesign;
  if (uiTask.status !== undefined) dbData.status = uiTask.status;
  if (uiTask.priority !== undefined) dbData.priority = uiTask.priority;
  if (uiTask.benefits !== undefined) dbData.benefits = uiTask.benefits;
  if (uiTask.currentHrs !== undefined) dbData.currentHrs = uiTask.currentHrs;
  if (uiTask.savedHrs !== undefined) dbData.savedHrs = uiTask.savedHrs;
  if (uiTask.workedHrs !== undefined) dbData.workedHrs = uiTask.workedHrs;
  if (uiTask.tools !== undefined) dbData.tools = uiTask.tools;
  if (uiTask.otherUseCases !== undefined) dbData.otherUseCases = uiTask.otherUseCases;
  if (uiTask.tags !== undefined) dbData.tags = uiTask.tags;
  if (uiTask.completionDate !== undefined) dbData.completionDate = uiTask.completionDate;
  
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
