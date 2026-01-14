import { NextRequest, NextResponse } from "next/server";
import { db, workspaces, workspaceMembers, fieldConfigs } from "@/src/lib/db";
import { getDefaultFieldConfigs } from "@/src/lib/utils/default-field-configs";

/**
 * POST /api/workspaces
 * Create a new workspace with default field configurations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, ownerUserId } = body;

    if (!name || !ownerUserId) {
      return NextResponse.json(
        { error: "name and ownerUserId are required" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Create workspace
    const [workspace] = await db
      .insert(workspaces)
      .values({
        name,
        slug,
        ownerUserId,
      })
      .returning();

    // Add owner as workspace member
    await db.insert(workspaceMembers).values({
      workspaceId: workspace.id,
      userId: ownerUserId,
      role: "owner",
    });

    // Create default field configurations
    const defaultFields = getDefaultFieldConfigs(workspace.id);
    await db.insert(fieldConfigs).values(defaultFields);

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    console.error("Error creating workspace:", error);
    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 }
    );
  }
}
