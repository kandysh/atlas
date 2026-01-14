import { db } from "@/src/lib/db";
import { tasks, workspaces } from "@/src/lib/db/schema";
import { eq, max, and } from "drizzle-orm";
import { generateTaskDisplayId } from "@/src/lib/utils/task-id-generator";

/**
 * Gets the next sequence number for a task in a workspace
 * @param workspaceId - The UUID of the workspace
 * @returns The next sequence number
 */
export async function getNextTaskSequence(
  workspaceId: string
): Promise<number> {
  const result = await db
    .select({ maxSequence: max(tasks.sequenceNumber) })
    .from(tasks)
    .where(eq(tasks.workspaceId, workspaceId));

  const currentMax = result[0]?.maxSequence ?? 0;
  return currentMax + 1;
}

/**
 * Generates a display ID for a new task in a workspace
 * @param workspaceId - The UUID of the workspace
 * @returns The generated display ID (e.g., "TSK-001-0001")
 */
export async function generateDisplayIdForTask(
  workspaceId: string
): Promise<{ displayId: string; sequenceNumber: number }> {
  // Get workspace numeric ID
  const workspace = await db
    .select({ numericId: workspaces.numericId })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (!workspace.length) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const workspaceNumericId = workspace[0].numericId;
  const sequenceNumber = await getNextTaskSequence(workspaceId);

  const displayId = generateTaskDisplayId(workspaceNumericId, sequenceNumber);

  return { displayId, sequenceNumber };
}

/**
 * Creates a new task with automatic display ID generation
 * @param workspaceId - The UUID of the workspace
 * @param data - The task data
 * @returns The created task with display ID
 */
export async function createTaskWithDisplayId(
  workspaceId: string,
  data: Record<string, any>
) {
  const { displayId, sequenceNumber } = await generateDisplayIdForTask(
    workspaceId
  );

  const [newTask] = await db
    .insert(tasks)
    .values({
      workspaceId,
      displayId,
      sequenceNumber,
      data,
    })
    .returning();

  return newTask;
}
