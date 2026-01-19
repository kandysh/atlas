'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export type FilterValue = string | string[] | undefined;
export type Filters = Record<string, FilterValue>;

interface UseUrlFiltersOptions {
  /** Keys to sync with URL (if not provided, syncs all keys) */
  keys?: string[];
  /** Whether to replace or push to history (default: replace) */
  replace?: boolean;
}

/**
 * Hook to sync filter state with URL search params.
 * Works with both single values (string) and multi-select (string[]).
 */
export function useUrlFilters<T extends Filters>(
  options: UseUrlFiltersOptions = {},
) {
  const { keys, replace = true } = options;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parse filters from URL
  const filters = useMemo(() => {
    const result: Filters = {};
    const keysToRead = keys || Array.from(searchParams.keys());

    keysToRead.forEach((key) => {
      const values = searchParams.getAll(key);
      if (values.length === 0) {
        // No value for this key
      } else if (values.length === 1) {
        // Single value - store as string
        result[key] = values[0];
      } else {
        // Multiple values - store as array
        result[key] = values;
      }
    });

    return result as T;
  }, [searchParams, keys]);

  // Update filters and sync to URL
  const setFilters = useCallback(
    (newFilters: T) => {
      const params = new URLSearchParams();

      // Preserve existing params that aren't being managed
      if (keys) {
        searchParams.forEach((value, key) => {
          if (!keys.includes(key)) {
            params.append(key, value);
          }
        });
      }

      // Add new filter values
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          // Skip empty values
          return;
        }
        if (Array.isArray(value)) {
          value.forEach((v) => {
            if (v) params.append(key, v);
          });
        } else {
          params.set(key, value);
        }
      });

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      if (replace) {
        router.replace(newUrl, { scroll: false });
      } else {
        router.push(newUrl, { scroll: false });
      }
    },
    [searchParams, pathname, router, replace, keys],
  );

  // Update a single filter value
  const setFilter = useCallback(
    (key: string, value: FilterValue) => {
      setFilters({ ...filters, [key]: value } as T);
    },
    [filters, setFilters],
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({} as T);
  }, [setFilters]);

  // Clear a single filter
  const clearFilter = useCallback(
    (key: string) => {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters(newFilters as T);
    },
    [filters, setFilters],
  );

  return {
    filters,
    setFilters,
    setFilter,
    clearFilters,
    clearFilter,
  };
}
