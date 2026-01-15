/**
 * Centralized query key factory for React Query
 * Follows the pattern: [entity, scope, filters...]
 */
export const queryKeys = {
  // User keys
  user: {
    all: ["user"] as const,
    current: () => [...queryKeys.user.all, "current"] as const,
  },

  // Workspace keys
  workspaces: {
    all: ["workspaces"] as const,
    byUser: (userId: number) =>
      [...queryKeys.workspaces.all, "user", userId] as const,
  },

  // Task keys
  tasks: {
    all: ["tasks"] as const,
    byWorkspace: (workspaceId: string) =>
      [...queryKeys.tasks.all, { workspaceId }] as const,
    paginated: (workspaceId: string, page: number) =>
      [...queryKeys.tasks.all, { workspaceId, page }] as const,
    statusCount: () => [...queryKeys.tasks.all, "statusCount"] as const,
    throughputOverTime: () =>
      [...queryKeys.tasks.all, "throughputOverTime"] as const,
    cycleTime: () => [...queryKeys.tasks.all, "cycleTime"] as const,
    hoursSavedWorked: () =>
      [...queryKeys.tasks.all, "hoursSavedWorked"] as const,
    remainingWorkTrend: () =>
      [...queryKeys.tasks.all, "remainingWorkTrend"] as const,
    toolsUsed: () => [...queryKeys.tasks.all, "toolsUsed"] as const,
    assetClasses: () => [...queryKeys.tasks.all, "assetClasses"] as const,
  },

  // Field config keys
  fields: {
    all: ["fields"] as const,
    byWorkspace: (workspaceId: string) =>
      [...queryKeys.fields.all, { workspaceId }] as const,
  },
} as const;

// Type helpers for query keys
export type QueryKeys = typeof queryKeys;
