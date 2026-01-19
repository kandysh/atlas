'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';
import type { ColumnFiltersState } from '@tanstack/react-table';

interface UseTableUrlFiltersOptions {
  /** Column keys to sync with URL */
  keys?: string[];
  /** Key for global search filter */
  searchKey?: string;
}

// Helper to compare column filters
function areFiltersEqual(
  a: ColumnFiltersState,
  b: ColumnFiltersState,
): boolean {
  if (a.length !== b.length) return false;
  return a.every((filterA) => {
    const filterB = b.find((f) => f.id === filterA.id);
    if (!filterB) return false;
    const valuesA = filterA.value as string[];
    const valuesB = filterB.value as string[];
    if (!Array.isArray(valuesA) || !Array.isArray(valuesB)) return false;
    if (valuesA.length !== valuesB.length) return false;
    return valuesA.every((v) => valuesB.includes(v));
  });
}

/**
 * Hook to sync tanstack-table column filters with URL search params.
 * Converts between ColumnFiltersState (array of {id, value}) and URL params.
 */
export function useTableUrlFilters(options: UseTableUrlFiltersOptions = {}) {
  const { keys, searchKey = 'q' } = options;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const lastFiltersRef = useRef<ColumnFiltersState>([]);
  const lastGlobalFilterRef = useRef<string>('');

  // Parse column filters from URL
  const columnFilters = useMemo((): ColumnFiltersState => {
    const filters: ColumnFiltersState = [];
    const keysToRead = keys || Array.from(searchParams.keys());

    keysToRead.forEach((key) => {
      if (key === searchKey) return; // Skip search key
      const values = searchParams.getAll(key);
      if (values.length > 0) {
        // Multi-select filters are stored as arrays
        filters.push({ id: key, value: values });
      }
    });

    return filters;
  }, [searchParams, keys, searchKey]);

  // Parse global filter from URL
  const globalFilter = useMemo(() => {
    return searchParams.get(searchKey) || '';
  }, [searchParams, searchKey]);

  // Update URL with new column filters
  const setColumnFilters = useCallback(
    (filters: ColumnFiltersState) => {
      // Skip if filters haven't changed (prevents infinite loops)
      if (areFiltersEqual(filters, lastFiltersRef.current)) {
        return;
      }
      lastFiltersRef.current = filters;

      const params = new URLSearchParams();

      // Preserve search key if present
      const currentSearch = searchParams.get(searchKey);
      if (currentSearch) {
        params.set(searchKey, currentSearch);
      }

      // Preserve existing params that aren't being managed
      if (keys) {
        searchParams.forEach((value, key) => {
          if (!keys.includes(key) && key !== searchKey) {
            params.append(key, value);
          }
        });
      }

      // Add filter values
      filters.forEach((filter) => {
        const values = filter.value as string[];
        if (Array.isArray(values)) {
          values.forEach((v) => {
            if (v) params.append(filter.id, v);
          });
        }
      });

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [searchParams, pathname, router, keys, searchKey],
  );

  // Update URL with new global filter
  const setGlobalFilter = useCallback(
    (value: string) => {
      // Skip if value hasn't changed
      if (value === lastGlobalFilterRef.current) {
        return;
      }
      lastGlobalFilterRef.current = value;

      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(searchKey, value);
      } else {
        params.delete(searchKey);
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [searchParams, pathname, router, searchKey],
  );

  return {
    columnFilters,
    globalFilter,
    setColumnFilters,
    setGlobalFilter,
  };
}
