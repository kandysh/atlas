import { NextRequest, NextResponse } from "next/server";
import { db, tasks } from "@/src/lib/db";
import { eq, sql } from "drizzle-orm";
import { broadcastTaskUpdate } from "@/src/lib/sse/server";

// PATCH /api/tasks/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { patch } = body;

    if (!patch || typeof patch !== "object") {
      return NextResponse.json(
        { error: "patch object is required" },
        { status: 400 }
      );
    }

    // Update the task using JSONB merge (data || patch)
    // This merges the patch into existing data without overwriting
    const [updatedTask] = await db
      .update(tasks)
      .set({
        data: sql`${tasks.data} || ${JSON.stringify(patch)}::jsonb`,
        version: sql`${tasks.version} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    if (!updatedTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Broadcast the update to SSE clients
    broadcastTaskUpdate(updatedTask);

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
