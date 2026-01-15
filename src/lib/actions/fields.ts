"use server";

import { db, fieldConfigs, FieldConfig } from "@/src/lib/db";
import { eq, asc } from "drizzle-orm";

/**
 * Get field configurations for a workspace
 */
export async function getFields(
  workspaceId: string
): Promise<{ success: true; fields: FieldConfig[] } | { success: false; error: string }> {
  try {
    if (!workspaceId) {
      return { success: false, error: "workspaceId is required" };
    }

    const fields = await db
      .select()
      .from(fieldConfigs)
      .where(eq(fieldConfigs.workspaceId, workspaceId))
      .orderBy(asc(fieldConfigs.order));

    return { success: true, fields };
  } catch (error) {
    console.error("Error fetching fields:", error);
    return { success: false, error: "Failed to fetch fields" };
  }
}
