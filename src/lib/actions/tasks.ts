"use server";

import { db, tasks, workspaces, Task } from "@/src/lib/db";
import { eq, desc, sql } from "drizzle-orm";
import { generateTaskDisplayId } from "@/src/lib/utils";
import { broadcastTaskUpdate } from "@/src/lib/sse/server";

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

    return { success: true, task: newTask };
  } catch (error) {
    console.error("Error creating task:", error);
    return { success: false, error: "Failed to create task" };
  }
}

/**
 * Update a task with a partial patch
 */
export async function updateTask(
  taskId: string,
  patch: Record<string, unknown>
): Promise<{ success: true; task: Task } | { success: false; error: string }> {
  try {
    if (!taskId) {
      return { success: false, error: "taskId is required" };
    }

    if (!patch || typeof patch !== "object") {
      return { success: false, error: "patch object is required" };
    }

    // Update the task using JSONB merge (data || patch)
    const [updatedTask] = await db
      .update(tasks)
      .set({
        data: sql`${tasks.data} || ${JSON.stringify(patch)}::jsonb`,
        version: sql`${tasks.version} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();

    if (!updatedTask) {
      return { success: false, error: "Task not found" };
    }

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
