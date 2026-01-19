'use server';

import {
  db,
  workspaces,
  workspaceMembers,
  fieldConfigs,
  Workspace,
} from '@/src/lib/db';
import { eq, or } from 'drizzle-orm';
import { getDefaultFieldConfigs } from '@/src/lib/utils';

/**
 * Get all workspaces for a user (where user is owner or member)
 */
export async function getWorkspaces(
  userId: number,
): Promise<
  { success: true; workspaces: Workspace[] } | { success: false; error: string }
> {
  try {
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
        eq(workspaces.id, workspaceMembers.workspaceId),
      )
      .where(
        or(
          eq(workspaces.ownerUserId, userId),
          eq(workspaceMembers.userId, userId),
        ),
      );

    return { success: true, workspaces: userWorkspaces };
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return { success: false, error: 'Failed to fetch workspaces' };
  }
}

/**
 * Get a workspace by ID
 */
export async function getWorkspaceById(
  workspaceId: string,
): Promise<
  { success: true; workspace: Workspace } | { success: false; error: string }
> {
  try {
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.id, workspaceId),
    });

    if (!workspace) {
      return { success: false, error: 'Workspace not found' };
    }

    return { success: true, workspace };
  } catch (error) {
    console.error('Error fetching workspace:', error);
    return { success: false, error: 'Failed to fetch workspace' };
  }
}

/**
 * Get a workspace by slug
 */
export async function getWorkspaceBySlug(
  slug: string,
): Promise<
  { success: true; workspace: Workspace } | { success: false; error: string }
> {
  try {
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.slug, slug),
    });

    if (!workspace) {
      return { success: false, error: 'Workspace not found' };
    }

    return { success: true, workspace };
  } catch (error) {
    console.error('Error fetching workspace:', error);
    return { success: false, error: 'Failed to fetch workspace' };
  }
}

/**
 * Create a new workspace with default field configurations
 */
export async function createWorkspace(
  name: string,
  ownerUserId: number,
): Promise<
  { success: true; workspace: Workspace } | { success: false; error: string }
> {
  try {
    if (!name || ownerUserId === undefined) {
      return { success: false, error: 'name and ownerUserId are required' };
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

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
      role: 'owner',
    });

    // Create default field configurations
    const defaultFields = getDefaultFieldConfigs(workspace.id);
    await db.insert(fieldConfigs).values(defaultFields);

    return { success: true, workspace };
  } catch (error) {
    console.error('Error creating workspace:', error);
    return { success: false, error: 'Failed to create workspace' };
  }
}
