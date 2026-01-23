'use client';

import { useCallback } from 'react';
import {
  CycleTimeChart,
  ProjectStatusBreakdownDonut,
  ChartLineInteractive,
  ToolsUsedRadar,
  TeamImpactChart,
  AssetClassPortfolioChart,
  PriorityAgingChart,
  HeroKpis,
  FilterControls,
  InsightsCards,
  ChartSkeleton,
  DonutChartSkeleton,
} from '@/src/components/features/insights';
import { useServerAnalytics, AnalyticsFilters } from '@/src/hooks/analytics';
import { useUrlFilters } from '@/src/hooks';
import { useWorkspace } from '@/src/providers';
import { Skeleton } from '@/src/components/ui/skeleton';

const FILTER_KEYS = ['status', 'priority', 'assignee', 'team', 'assetClass'];

export default function InsightsPage() {
  const { filters, setFilters } = useUrlFilters<AnalyticsFilters>({
    keys: FILTER_KEYS,
  });
  const { currentWorkspace, isLoading: workspaceLoading } = useWorkspace();

  // Fetch analytics from server with filters (using assignee field)
  const {
    data,
    isLoading: analyticsLoading,
    error,
  } = useServerAnalytics(currentWorkspace?.id || '', {
    ...filters,
    ownerCellKey: 'assignee', // Use assignee field for owner analytics
  });

  // Helper to toggle a value in a filter array
  const toggleFilterValue = useCallback(
    (key: keyof AnalyticsFilters, value: string) => {
      const current = filters[key];
      const currentArray = Array.isArray(current)
        ? current
        : current
          ? [current]
          : [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((v) => v !== value)
        : [...currentArray, value];
      setFilters({
        ...filters,
        [key]: newArray.length > 0 ? newArray : undefined,
      });
    },
    [filters, setFilters],
  );

  const handleFilterChange = useCallback(
    (newFilters: AnalyticsFilters) => {
      setFilters(newFilters);
    },
    [setFilters],
  );

  // Chart click handlers for cross-filtering (toggle behavior)
  const handleOwnerClick = useCallback(
    (owner: string) => {
      toggleFilterValue('assignee', owner);
    },
    [toggleFilterValue],
  );

  const handleTeamClick = useCallback(
    (team: string) => {
      toggleFilterValue('team', team);
    },
    [toggleFilterValue],
  );

  const handleAssetClassClick = useCallback(
    (assetClass: string) => {
      toggleFilterValue('assetClass', assetClass);
    },
    [toggleFilterValue],
  );

  const handlePriorityClick = useCallback(
    (priority: string) => {
      toggleFilterValue('priority', priority);
    },
    [toggleFilterValue],
  );

  if (workspaceLoading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            Insights
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Loading workspace...
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(11)].map((_, i) => (
            <ChartSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            Insights
          </h1>
          <p className="text-sm text-destructive mt-1">
            No workspace available. Please create or join a workspace.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            Insights
          </h1>
          <p className="text-sm text-destructive mt-1">
            Error loading analytics. Please try again.
          </p>
        </div>
      </div>
    );
  }

  // Default empty data structure
  const analyticsData = data || {
    statusCounts: [],
    throughputOverTime: [],
    cycleTime: [],
    hoursSavedWorked: [],
    remainingWorkTrend: [],
    toolsUsed: [],
    assetClasses: [],
    ownerProductivity: [],
    teamsWorkload: [],
    assetClassDistribution: [],
    priorityAging: [],
    hoursEfficiency: [],
    teamImpactQuadrant: [],
    kpiSummary: {
      totalTasks: 0,
      openTasks: 0,
      avgCycleDays: 0,
      totalHoursSaved: 0,
      totalProcessesDemised: 0,
    },
    owners: [],
    teams: [],
    priorities: [],
    statuses: [],
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          Insights
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {currentWorkspace.name}
          {analyticsLoading && ' • Refreshing...'}
        </p>
      </div>

      {/* Filter Controls */}
      <nav
        className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 py-2 -my-2"
        aria-label="Dashboard filters"
      >
        <FilterControls
          filters={filters}
          onFilterChange={handleFilterChange}
          statuses={analyticsData.statuses}
          priorities={analyticsData.priorities}
          owners={analyticsData.owners}
          teams={analyticsData.teams}
          assetClasses={analyticsData.assetClasses}
        />
      </nav>

      {/* Hero KPIs */}
      <HeroKpis data={analyticsData.kpiSummary} isLoading={analyticsLoading} />

      {/* Actionable Insights */}
      {!analyticsLoading && data && (
        <InsightsCards
          data={analyticsData}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Charts Grid */}
      {analyticsLoading ? (
        <div className="space-y-4">
          {/* Row 1: 3 compact charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DonutChartSkeleton />
            <DonutChartSkeleton />
            <ChartSkeleton />
          </div>
          {/* Row 2: 2 medium charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
          {/* Row 3: 1 large chart */}
          <div className="grid grid-cols-1 gap-4">
            <ChartSkeleton />
          </div>
          {/* Row 4: 1 large chart */}
          <div className="grid grid-cols-1 gap-4">
            <ChartSkeleton />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Row 1: Compact Charts - Donuts and Simple Bar Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ProjectStatusBreakdownDonut
              chartData={analyticsData.statusCounts}
            />
            <AssetClassPortfolioChart
              chartData={analyticsData.assetClassDistribution}
              onAssetClassClick={handleAssetClassClick}
            />
            <PriorityAgingChart
              chartData={analyticsData.priorityAging}
              onPriorityClick={handlePriorityClick}
            />
          </div>

          {/* Row 2: Medium Charts - Line and Bar Charts */}
          <div className="grid grid-cols-1 gap-4">
            <ChartLineInteractive
              chartData={analyticsData.throughputOverTime}
            />
          </div>

          {/* Row 3: Large Chart - Tools Used Radar (needs symmetric space) */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <CycleTimeChart chartData={analyticsData.cycleTime} />
            <ToolsUsedRadar chartData={analyticsData.toolsUsed} />
            <TeamImpactChart
              data={analyticsData.teamImpactQuadrant}
              onTeamClick={handleTeamClick}
            />
          </div>
        </div>
      )}
    </div>
  );
}
