'use client';

import { Filter } from 'lucide-react';
import { MultiSelectFilter, ActiveFilterBadges } from './multi-select-filter';
import { AnalyticsFilters } from '@/src/lib/actions/analytics';

interface FilterControlsProps {
  filters: AnalyticsFilters;
  onFilterChange: (filters: AnalyticsFilters) => void;
  statuses: string[];
  priorities: string[];
  owners: string[];
  teams: string[];
  assetClasses: string[];
}

const statusLabels: Record<string, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  testing: 'Testing',
  done: 'Done',
  completed: 'Completed',
  blocked: 'Blocked',
};

const statusColors: Record<string, string> = {
  todo: 'var(--status-todo)',
  'in-progress': 'var(--status-in-progress)',
  testing: 'var(--status-testing)',
  done: 'var(--status-done)',
  completed: 'var(--status-completed)',
  blocked: 'var(--status-blocked)',
};

const priorityLabels: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

const priorityColors: Record<string, string> = {
  low: 'var(--priority-low)',
  medium: 'var(--priority-medium)',
  high: 'var(--priority-high)',
  urgent: 'var(--priority-urgent)',
};

// Helper to normalize filter value to array
function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function FilterControls({
  filters,
  onFilterChange,
  statuses,
  priorities,
  owners,
  teams,
  assetClasses,
}: FilterControlsProps) {
  const handleFilterChange = (
    key: keyof AnalyticsFilters,
    values: string[],
  ) => {
    onFilterChange({
      ...filters,
      [key]: values.length > 0 ? values : undefined,
    });
  };

  const clearFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key as keyof AnalyticsFilters];
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    onFilterChange({});
  };

  const hasFilters =
    toArray(filters.status).length > 0 ||
    toArray(filters.priority).length > 0 ||
    toArray(filters.assignee).length > 0 ||
    toArray(filters.team).length > 0 ||
    toArray(filters.assetClass).filter((v) => v !== 'All').length > 0;

  return (
    <div className="space-y-3">
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <MultiSelectFilter
          title="Status"
          options={statuses}
          selected={toArray(filters.status)}
          onChange={(values) => handleFilterChange('status', values)}
          labelMap={statusLabels}
          colorMap={statusColors}
        />
        <MultiSelectFilter
          title="Priority"
          options={priorities}
          selected={toArray(filters.priority)}
          onChange={(values) => handleFilterChange('priority', values)}
          labelMap={priorityLabels}
          colorMap={priorityColors}
        />
        <MultiSelectFilter
          title="Assignee"
          options={owners}
          selected={toArray(filters.assignee)}
          onChange={(values) => handleFilterChange('assignee', values)}
        />
        <MultiSelectFilter
          title="Team"
          options={teams}
          selected={toArray(filters.team)}
          onChange={(values) => handleFilterChange('team', values)}
        />
        <MultiSelectFilter
          title="Asset Class"
          options={assetClasses}
          selected={toArray(filters.assetClass).filter((v) => v !== 'All')}
          onChange={(values) => handleFilterChange('assetClass', values)}
        />

        {!hasFilters && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span>Click to add filters</span>
          </div>
        )}
      </div>

      {/* Active Filter Badges */}
      <ActiveFilterBadges
        filters={{
          status: filters.status,
          priority: filters.priority,
          assignee: filters.assignee,
          team: filters.team,
          assetClass: toArray(filters.assetClass).filter((v) => v !== 'All'),
        }}
        labelMaps={{
          status: statusLabels,
          priority: priorityLabels,
        }}
        onClearFilter={clearFilter}
        onClearAll={clearAllFilters}
      />
    </div>
  );
}
