/**
 * Task ID Generator
 * Generates Jira-style human-readable task IDs
 * Format: TSK-{workspaceId:03}-{sequence:04}
 * 
 * Examples:
 * - Workspace 1: TSK-001-0001, TSK-001-0002, ...
 * - Workspace 42: TSK-042-0001, TSK-042-0002, ...
 * - Workspace 123: TSK-123-0001, TSK-123-0002, ...
 */

/**
 * Generates a display ID for a task
 * @param workspaceNumericId - The numeric ID of the workspace (1-999)
 * @param sequenceNumber - The sequence number for the task in the workspace (1-9999)
 * @returns The formatted display ID (e.g., "TSK-001-0001")
 */
export function generateTaskDisplayId(
  workspaceNumericId: number,
  sequenceNumber: number
): string {
  const workspaceIdPadded = String(workspaceNumericId).padStart(3, "0");
  const sequencePadded = String(sequenceNumber).padStart(4, "0");
  return `TSK-${workspaceIdPadded}-${sequencePadded}`;
}

/**
 * Parses a display ID and extracts workspace ID and sequence number
 * @param displayId - The display ID to parse (e.g., "TSK-001-0001")
 * @returns Object with workspaceNumericId and sequenceNumber, or null if invalid
 */
export function parseTaskDisplayId(displayId: string): {
  workspaceNumericId: number;
  sequenceNumber: number;
} | null {
  const pattern = /^TSK-(\d{3})-(\d{4})$/;
  const match = displayId.match(pattern);
  
  if (!match) {
    return null;
  }
  
  return {
    workspaceNumericId: parseInt(match[1], 10),
    sequenceNumber: parseInt(match[2], 10),
  };
}

/**
 * Validates if a display ID is in the correct format
 * @param displayId - The display ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidTaskDisplayId(displayId: string): boolean {
  return parseTaskDisplayId(displayId) !== null;
}
