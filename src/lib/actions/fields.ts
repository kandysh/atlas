'use server';

import { db, fieldConfigs, FieldConfig } from '@/src/lib/db';
import { eq, asc } from 'drizzle-orm';
import { logger } from '@/src/lib/logger';

/**
 * Get field configurations for a workspace
 */
export async function getFields(
  workspaceId: string,
): Promise<
  { success: true; fields: FieldConfig[] } | { success: false; error: string }
> {
  try {
    if (!workspaceId) {
      return { success: false, error: 'workspaceId is required' };
    }

    const fields = await db
      .select()
      .from(fieldConfigs)
      .where(eq(fieldConfigs.workspaceId, workspaceId))
      .orderBy(asc(fieldConfigs.order));

    return { success: true, fields };
  } catch (error) {
    logger.error({ workspaceId, error }, 'Error fetching fields');
    return { success: false, error: 'Failed to fetch fields' };
  }
}

/**
 * Update a field's visibility
 */
export async function updateFieldVisibility(
  fieldId: string,
  visible: boolean,
): Promise<
  { success: true; field: FieldConfig } | { success: false; error: string }
> {
  try {
    if (!fieldId) {
      return { success: false, error: 'fieldId is required' };
    }

    const [updatedField] = await db
      .update(fieldConfigs)
      .set({
        visible,
        updatedAt: new Date(),
      })
      .where(eq(fieldConfigs.id, fieldId))
      .returning();

    if (!updatedField) {
      return { success: false, error: 'Field not found' };
    }

    return { success: true, field: updatedField };
  } catch (error) {
    logger.error(
      { fieldId, visible, error },
      'Error updating field visibility',
    );
    return { success: false, error: 'Failed to update field visibility' };
  }
}

/**
 * Batch update multiple field visibilities
 */
export async function updateFieldsVisibility(
  updates: { fieldId: string; visible: boolean }[],
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    if (!updates || updates.length === 0) {
      return { success: false, error: 'updates array is required' };
    }

    await Promise.all(
      updates.map(({ fieldId, visible }) =>
        db
          .update(fieldConfigs)
          .set({ visible, updatedAt: new Date() })
          .where(eq(fieldConfigs.id, fieldId)),
      ),
    );

    return { success: true };
  } catch (error) {
    logger.error({ updates, error }, 'Error updating field visibilities');
    return { success: false, error: 'Failed to update field visibilities' };
  }
}
