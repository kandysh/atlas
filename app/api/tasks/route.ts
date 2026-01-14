import { NextRequest, NextResponse } from "next/server";
import { db, tasks, workspaces } from "@/src/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { generateTaskDisplayId } from "@/src/lib/utils/task-id-generator";

// GET /api/tasks?workspaceId=1&page=0
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get("workspaceId");
    const page = parseInt(searchParams.get("page") || "0", 10);
    const perPage = 50;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Fetch paginated tasks for the workspace
    const result = await db
      .select()
      .from(tasks)
      .where(eq(tasks.workspaceId, workspaceId))
      .orderBy(desc(tasks.sequenceNumber))
      .limit(perPage)
      .offset(page * perPage);

    return NextResponse.json({
      tasks: result,
      page,
      perPage,
      hasMore: result.length === perPage,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/tasks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, data } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "data is required" },
        { status: 400 }
      );
    }

    // Get the next sequence number for this workspace
    const latestTask = await db
      .select()
      .from(tasks)
      .where(eq(tasks.workspaceId, workspaceId))
      .orderBy(desc(tasks.sequenceNumber))
      .limit(1);

    const sequenceNumber = latestTask.length > 0 ? latestTask[0].sequenceNumber + 1 : 1;

    // Get workspace numeric ID from workspaces table
    const [workspace] = await db
      .select({ numericId: workspaces.numericId })
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);
    
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
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

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
