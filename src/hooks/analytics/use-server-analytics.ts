'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getAnalytics,
  AnalyticsFilters,
  AnalyticsData,
} from '@/src/lib/actions/analytics';
import { queryKeys } from '@/src/lib/query/keys';

/**
 * Hook to fetch server-computed analytics with React Query caching
 * Supports filters for instant cache-based filter switching
 */
export function useServerAnalytics(
  workspaceId: string,
  filters: AnalyticsFilters = {},
) {
  return useQuery<AnalyticsData>({
    queryKey: queryKeys.analytics.byWorkspace(workspaceId, filters),
    queryFn: async () => {
      const result = await getAnalytics(workspaceId, filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 30000, // 30 seconds - analytics can be cached longer
    enabled: !!workspaceId,
  });
}

export type { AnalyticsFilters, AnalyticsData };
