"use server";

import { db, users, User } from "@/src/lib/db";
import { eq } from "drizzle-orm";
import { getUserInfo } from "@/src/lib/utils/user-info";

/**
 * Initialize or get current user from USERINFO environment variable
 */
export async function initUser(): Promise<
  { success: true; user: User } | { success: false; error: string }
> {
  try {
    const userInfo = getUserInfo();

    if (!userInfo) {
      return { success: false, error: "User information not available" };
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

    return { success: true, user };
  } catch (error) {
    console.error("Error initializing user:", error);
    return { success: false, error: "Failed to initialize user" };
  }
}
