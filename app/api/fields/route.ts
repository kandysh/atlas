import { NextRequest, NextResponse } from "next/server";
import { db, fieldConfigs } from "@/src/lib/db";
import { eq, asc } from "drizzle-orm";

// GET /api/fields?workspaceId=1
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Fetch field configurations for the workspace
    const fields = await db
      .select()
      .from(fieldConfigs)
      .where(eq(fieldConfigs.workspaceId, workspaceId))
      .orderBy(asc(fieldConfigs.order));

    return NextResponse.json({ fields });
  } catch (error) {
    console.error("Error fetching fields:", error);
    return NextResponse.json(
      { error: "Failed to fetch fields" },
      { status: 500 }
    );
  }
}
