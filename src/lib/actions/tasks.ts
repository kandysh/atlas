"use server";

import { db, tasks, workspaces, taskEvents, fieldConfigs, Task } from "@/src/lib/db";
import { eq, desc, sql, asc } from "drizzle-orm";
import { generateTaskDisplayId } from "@/src/lib/utils";
import { broadcastTaskUpdate } from "@/src/lib/sse/server";
import { getCurrentUserId } from "./user";
import { validatePatch } from "@/src/lib/utils/fields/validate-patch";

export type TasksResult = {
  tasks: Task[];
  page: number;
  perPage: number;
  hasMore: boolean;
};

/**
 * Get paginated tasks for a workspace
 */
export async function getTasks(
  workspaceId: string,
  page: number = 0
): Promise<{ success: true; data: TasksResult } | { success: false; error: string }> {
  try {
    if (!workspaceId) {
      return { success: false, error: "workspaceId is required" };
    }

    const perPage = 50;

    const result = await db
      .select()
      .from(tasks)
      .where(eq(tasks.workspaceId, workspaceId))
      .orderBy(desc(tasks.sequenceNumber))
      .limit(perPage)
      .offset(page * perPage);

    return {
      success: true,
      data: {
        tasks: result,
        page,
        perPage,
        hasMore: result.length === perPage,
      },
    };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return { success: false, error: "Failed to fetch tasks" };
  }
}

/**
 * Create a new task
 */
export async function createTask(
  workspaceId: string,
  data: Record<string, unknown>
): Promise<{ success: true; task: Task } | { success: false; error: string }> {
  try {
    if (!workspaceId) {
      return { success: false, error: "workspaceId is required" };
    }

    if (!data) {
      return { success: false, error: "data is required" };
    }

    // Get the next sequence number for this workspace
    const latestTask = await db
      .select()
      .from(tasks)
      .where(eq(tasks.workspaceId, workspaceId))
      .orderBy(desc(tasks.sequenceNumber))
      .limit(1);

    const sequenceNumber =
      latestTask.length > 0 ? latestTask[0].sequenceNumber + 1 : 1;

    // Get workspace numeric ID from workspaces table
    const [workspace] = await db
      .select({ numericId: workspaces.numericId })
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (!workspace) {
      return { success: false, error: "Workspace not found" };
    }

    const displayId = generateTaskDisplayId(workspace.numericId, sequenceNumber);

    // Insert the new task
    const [newTask] = await db
      .insert(tasks)
      .values({
        workspaceId,
        displayId,
        sequenceNumber,
        data,
        version: 1,
      })
      .returning();

    // Log creation event
    const userId = await getCurrentUserId();
    await db.insert(taskEvents).values({
      workspaceId,
      taskId: newTask.id,
      userId,
      eventType: "created",
      newValue: data,
      metadata: { version: 1, displayId },
    });

    return { success: true, task: newTask };
  } catch (error) {
    console.error("Error creating task:", error);
    return { success: false, error: "Failed to create task" };
  }
}

/**
 * Update a task with a partial patch
 * Validates patch against field configurations before writing
 */
export async function updateTask(
  taskId: string,
  patch: Record<string, unknown>,
  options?: { skipValidation?: boolean }
): Promise<{ success: true; task: Task } | { success: false; error: string; validationErrors?: Array<{ field: string; message: string; code: string }> }> {
  try {
    if (!taskId) {
      return { success: false, error: "taskId is required" };
    }

    if (!patch || typeof patch !== "object") {
      return { success: false, error: "patch object is required" };
    }

    // Get current task to log changes
    const [currentTask] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!currentTask) {
      return { success: false, error: "Task not found" };
    }

    // Validate patch against field configurations (unless skipped)
    let validatedPatch = patch;
    if (!options?.skipValidation) {
      const fields = await db
        .select()
        .from(fieldConfigs)
        .where(eq(fieldConfigs.workspaceId, currentTask.workspaceId))
        .orderBy(asc(fieldConfigs.order));

      const validation = validatePatch(fields, patch);
      if (!validation.valid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.map((e) => e.message).join(", ")}`,
          validationErrors: validation.errors,
        };
      }
      validatedPatch = validation.sanitizedPatch;
    }

    // Update the task using JSONB merge (data || patch)
    const [updatedTask] = await db
      .update(tasks)
      .set({
        data: sql`${tasks.data} || ${JSON.stringify(validatedPatch)}::jsonb`,
        version: sql`${tasks.version} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();

    // Log update events for each changed field
    const userId = await getCurrentUserId();
    const eventPromises = Object.entries(validatedPatch).map(([field, newValue]) => {
      const oldValue = (currentTask.data as Record<string, unknown>)?.[field];
      return db.insert(taskEvents).values({
        workspaceId: currentTask.workspaceId,
        taskId: currentTask.id,
        userId,
        eventType: "updated",
        field,
        oldValue: oldValue !== undefined ? oldValue : null,
        newValue: newValue !== undefined ? newValue : null,
        metadata: { version: updatedTask.version, displayId: currentTask.displayId },
      });
    });
    await Promise.all(eventPromises);

    // Broadcast the update to SSE clients
    broadcastTaskUpdate(updatedTask);

    return { success: true, task: updatedTask };
  } catch (error) {
    console.error("Error updating task:", error);
    return { success: false, error: "Failed to update task" };
  }
}

/**
 * Delete a task by ID
 */
export async function deleteTask(
  taskId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    if (!taskId) {
      return { success: false, error: "taskId is required" };
    }

    const result = await db
      .delete(tasks)
      .where(eq(tasks.id, taskId))
      .returning({ id: tasks.id });

    if (result.length === 0) {
      return { success: false, error: "Task not found" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    return { success: false, error: "Failed to delete task" };
  }
}

/**
 * Delete multiple tasks by IDs
 */
export async function deleteTasks(
  taskIds: string[]
): Promise<{ success: true; deletedCount: number } | { success: false; error: string }> {
  try {
    if (!taskIds || taskIds.length === 0) {
      return { success: false, error: "taskIds array is required" };
    }

    let deletedCount = 0;
    for (const taskId of taskIds) {
      const result = await db
        .delete(tasks)
        .where(eq(tasks.id, taskId))
        .returning({ id: tasks.id });
      if (result.length > 0) deletedCount++;
    }

    return { success: true, deletedCount };
  } catch (error) {
    console.error("Error deleting tasks:", error);
    return { success: false, error: "Failed to delete tasks" };
  }
}

/**
 * Duplicate a task
 */
export async function duplicateTask(
  taskId: string
): Promise<{ success: true; task: Task } | { success: false; error: string }> {
  try {
    if (!taskId) {
      return { success: false, error: "taskId is required" };
    }

    // Get the original task
    const [originalTask] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!originalTask) {
      return { success: false, error: "Task not found" };
    }

    // Get next sequence number
    const latestTask = await db
      .select()
      .from(tasks)
      .where(eq(tasks.workspaceId, originalTask.workspaceId))
      .orderBy(desc(tasks.sequenceNumber))
      .limit(1);

    const sequenceNumber =
      latestTask.length > 0 ? latestTask[0].sequenceNumber + 1 : 1;

    // Get workspace numeric ID
    const [workspace] = await db
      .select({ numericId: workspaces.numericId })
      .from(workspaces)
      .where(eq(workspaces.id, originalTask.workspaceId))
      .limit(1);

    if (!workspace) {
      return { success: false, error: "Workspace not found" };
    }

    const displayId = generateTaskDisplayId(workspace.numericId, sequenceNumber);

    // Duplicate task data with modified title
    const duplicatedData = {
      ...(originalTask.data as Record<string, unknown>),
      title: `${(originalTask.data as Record<string, unknown>)?.title || "Task"} (Copy)`,
      status: "todo", // Reset status to todo
    };

    // Insert the duplicated task
    const [newTask] = await db
      .insert(tasks)
      .values({
        workspaceId: originalTask.workspaceId,
        displayId,
        sequenceNumber,
        data: duplicatedData,
        version: 1,
      })
      .returning();

    // Log duplication event
    const userId = await getCurrentUserId();
    await db.insert(taskEvents).values({
      workspaceId: originalTask.workspaceId,
      taskId: newTask.id,
      userId,
      eventType: "duplicated",
      newValue: duplicatedData,
      metadata: { 
        version: 1, 
        displayId, 
        sourceTaskId: originalTask.id,
        sourceDisplayId: originalTask.displayId,
      },
    });

    return { success: true, task: newTask };
  } catch (error) {
    console.error("Error duplicating task:", error);
    return { success: false, error: "Failed to duplicate task" };
  }
}

export type TaskEventWithUser = {
  id: string;
  eventType: string;
  field: string | null;
  oldValue: unknown;
  newValue: unknown;
  createdAt: Date;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
};

/**
 * Get recent events for a task
 */
export async function getTaskEvents(
  taskId: string,
  limit: number = 10
): Promise<{ success: true; events: TaskEventWithUser[] } | { success: false; error: string }> {
  try {
    if (!taskId) {
      return { success: false, error: "taskId is required" };
    }

    const events = await db.query.taskEvents.findMany({
      where: eq(taskEvents.taskId, taskId),
      orderBy: desc(taskEvents.createdAt),
      limit,
      with: {
        user: true,
      },
    });

    const formattedEvents: TaskEventWithUser[] = events.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      field: event.field,
      oldValue: event.oldValue,
      newValue: event.newValue,
      createdAt: event.createdAt,
      user: event.user ? {
        id: event.user.id,
        name: event.user.name,
        email: event.user.email,
      } : null,
    }));

    return { success: true, events: formattedEvents };
  } catch (error) {
    console.error("Error fetching task events:", error);
    return { success: false, error: "Failed to fetch task events" };
  }
}
