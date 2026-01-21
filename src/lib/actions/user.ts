'use server';

import { db, users, User } from '@/src/lib/db';
import { eq } from 'drizzle-orm';
import { getUserInfo } from '@/src/lib/utils/user-info';
import { logger } from '@/src/lib/logger';

/**
 * Initialize or get current user from USERINFO environment variable
 */
export async function initUser(): Promise<
  { success: true; user: User } | { success: false; error: string }
> {
  try {
    const userInfo = getUserInfo();

    if (!userInfo) {
      return { success: false, error: 'User information not available' };
    }

    // Check if user already exists
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userInfo.id))
      .limit(1);

    // Create user if doesn't exist
    if (!user) {
      [user] = await db
        .insert(users)
        .values({
          id: userInfo.id,
          email: userInfo.details.email,
          name: userInfo.details.name,
          avatar: null,
        })
        .returning();
    }

    return { success: true, user };
  } catch (error) {
    logger.error({ error }, 'Error initializing user');
    return { success: false, error: 'Failed to initialize user' };
  }
}

/**
 * Get the current user ID from USERINFO environment variable
 * This is a lightweight function that doesn't hit the database
 */
export async function getCurrentUserId(): Promise<number | null> {
  try {
    const userInfo = getUserInfo();
    return userInfo?.id ?? null;
  } catch (error) {
    logger.error({ error }, 'Error getting current user ID');
    return null;
  }
}
