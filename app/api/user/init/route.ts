import { NextRequest, NextResponse } from "next/server";
import { db, users } from "@/src/lib/db";
import { eq } from "drizzle-orm";
import { getUserInfo } from "@/src/lib/utils/user-info";

/**
 * GET /api/user/init
 * Initialize or get current user from USERINFO environment variable
 */
export async function GET(request: NextRequest) {
  try {
    const userInfo = getUserInfo();
    
    if (!userInfo) {
      return NextResponse.json(
        { error: "User information not available" },
        { status: 500 }
      );
    }

    // Check if user already exists
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, userInfo.email))
      .limit(1);

    // Create user if doesn't exist
    if (!user) {
      [user] = await db
        .insert(users)
        .values({
          email: userInfo.email,
          name: userInfo.name,
          avatar: null,
        })
        .returning();
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error initializing user:", error);
    return NextResponse.json(
      { error: "Failed to initialize user" },
      { status: 500 }
    );
  }
}
