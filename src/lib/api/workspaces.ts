"use server";

import { db, workspaces, workspaceMembers } from "@/src/lib/db";
import { eq, or } from "drizzle-orm";

export async function getWorkspaces(userId: string) {
  try {
    // Get all workspaces where user is owner or member
    const userWorkspaces = await db
      .selectDistinct({
        id: workspaces.id,
        numericId: workspaces.numericId,
        name: workspaces.name,
        slug: workspaces.slug,
        ownerUserId: workspaces.ownerUserId,
        createdAt: workspaces.createdAt,
        updatedAt: workspaces.updatedAt,
      })
      .from(workspaces)
      .leftJoin(
        workspaceMembers,
        eq(workspaces.id, workspaceMembers.workspaceId)
      )
      .where(
        or(
          eq(workspaces.ownerUserId, userId),
          eq(workspaceMembers.userId, userId)
        )
      );

    return { success: true, workspaces: userWorkspaces };
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return { success: false, error: "Failed to fetch workspaces" };
  }
}

export async function getWorkspaceById(workspaceId: string) {
  try {
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.id, workspaceId),
    });

    if (!workspace) {
      return { success: false, error: "Workspace not found" };
    }

    return { success: true, workspace };
  } catch (error) {
    console.error("Error fetching workspace:", error);
    return { success: false, error: "Failed to fetch workspace" };
  }
}

export async function getWorkspaceBySlug(slug: string) {
  try {
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.slug, slug),
    });

    if (!workspace) {
      return { success: false, error: "Workspace not found" };
    }

    return { success: true, workspace };
  } catch (error) {
    console.error("Error fetching workspace:", error);
    return { success: false, error: "Failed to fetch workspace" };
  }
}
