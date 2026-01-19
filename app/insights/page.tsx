'use client';

import { useCallback } from 'react';
import {
  CumulativeFlowChart,
  CycleTimeChart,
  HoursSavedWorkedChart,
  TasksStatusBreakdownDonut,
  ChartLineInteractive,
  ToolsUsedChart,
  OwnerProductivityChart,
  TeamsWorkloadChart,
  AssetClassPortfolioChart,
  PriorityAgingChart,
  HoursEfficiencyChart,
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

  // Fetch analytics from server with filters
  const {
    data,
    isLoading: analyticsLoading,
    error,
  } = useServerAnalytics(currentWorkspace?.id || '', filters);

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
    kpiSummary: {
      totalTasks: 0,
      openTasks: 0,
      avgCycleDays: 0,
      totalHoursSaved: 0,
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
          Real-time analytics and performance metrics
          {analyticsLoading && ' • Refreshing...'}
        </p>
      </div>

      {/* Filter Controls */}
      <nav
        className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 -my-2"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DonutChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <DonutChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section: Overview */}
          <section>
            <h2 className="text-lg font-medium text-muted-foreground mb-4">
              Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <TasksStatusBreakdownDonut
                chartData={analyticsData.statusCounts}
              />
              <CumulativeFlowChart
                chartData={analyticsData.remainingWorkTrend}
              />
              <PriorityAgingChart
                chartData={analyticsData.priorityAging}
                onPriorityClick={handlePriorityClick}
              />
            </div>
          </section>

          {/* Section: Performance */}
          <section>
            <h2 className="text-lg font-medium text-muted-foreground mb-4">
              Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <ChartLineInteractive
                chartData={analyticsData.throughputOverTime}
              />
              <CycleTimeChart chartData={analyticsData.cycleTime} />
              <HoursEfficiencyChart chartData={analyticsData.hoursEfficiency} />
            </div>
          </section>

          {/* Section: Team & Resources */}
          <section>
            <h2 className="text-lg font-medium text-muted-foreground mb-4">
              Team & Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <OwnerProductivityChart
                chartData={analyticsData.ownerProductivity}
                onOwnerClick={handleOwnerClick}
              />
              <TeamsWorkloadChart
                chartData={analyticsData.teamsWorkload}
                onTeamClick={handleTeamClick}
              />
              <HoursSavedWorkedChart
                chartData={analyticsData.hoursSavedWorked}
              />
            </div>
          </section>

          {/* Section: Portfolio */}
          <section>
            <h2 className="text-lg font-medium text-muted-foreground mb-4">
              Portfolio & Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AssetClassPortfolioChart
                chartData={analyticsData.assetClassDistribution}
                onAssetClassClick={handleAssetClassClick}
              />
              <ToolsUsedChart chartData={analyticsData.toolsUsed} />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
