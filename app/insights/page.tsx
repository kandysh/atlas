'use client';

import { useState, useCallback } from 'react';
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
import { useWorkspace } from '@/src/providers';
import { Skeleton } from '@/src/components/ui/skeleton';

export default function InsightsPage() {
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const { currentWorkspace, isLoading: workspaceLoading } = useWorkspace();

  // Fetch analytics from server with filters
  const {
    data,
    isLoading: analyticsLoading,
    error,
  } = useServerAnalytics(currentWorkspace?.id || '', filters);

  const handleFilterChange = useCallback((newFilters: AnalyticsFilters) => {
    setFilters(newFilters);
  }, []);

  // Chart click handlers for cross-filtering
  const handleOwnerClick = useCallback((owner: string) => {
    setFilters((prev) => ({ ...prev, assignee: owner }));
  }, []);

  const handleTeamClick = useCallback((team: string) => {
    setFilters((prev) => ({ ...prev, team }));
  }, []);

  const handleAssetClassClick = useCallback((assetClass: string) => {
    setFilters((prev) => ({ ...prev, assetClass }));
  }, []);

  const handlePriorityClick = useCallback((priority: string) => {
    setFilters((prev) => ({ ...prev, priority }));
  }, []);

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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          Insights
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Analytics and performance metrics
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
      <HeroKpis 
        data={analyticsData.kpiSummary} 
        isLoading={analyticsLoading} 
        onFilterChange={handleFilterChange}
      />

      {/* Insights Cards */}
      {!analyticsLoading && data && (
        <InsightsCards
          data={analyticsData}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Charts Grid - 11 Charts in 3-column responsive layout */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Row 1: Status, Pending Work Trend, Owner Productivity */}
          <TasksStatusBreakdownDonut chartData={analyticsData.statusCounts} />
          <CumulativeFlowChart chartData={analyticsData.remainingWorkTrend} />
          <OwnerProductivityChart
            chartData={analyticsData.ownerProductivity}
            onOwnerClick={handleOwnerClick}
          />

          {/* Row 2: Tools Heatmap, Teams Workload, Asset Portfolio */}
          <ToolsUsedChart chartData={analyticsData.toolsUsed} />
          <TeamsWorkloadChart
            chartData={analyticsData.teamsWorkload}
            onTeamClick={handleTeamClick}
          />
          <AssetClassPortfolioChart
            chartData={analyticsData.assetClassDistribution}
            onAssetClassClick={handleAssetClassClick}
          />

          {/* Row 3: Throughput, Cycle Time, Hours Saved */}
          <ChartLineInteractive chartData={analyticsData.throughputOverTime} />
          <CycleTimeChart chartData={analyticsData.cycleTime} />
          <HoursSavedWorkedChart chartData={analyticsData.hoursSavedWorked} />

          {/* Row 4: Priority Aging, Hours Efficiency */}
          <PriorityAgingChart
            chartData={analyticsData.priorityAging}
            onPriorityClick={handlePriorityClick}
          />
          <HoursEfficiencyChart chartData={analyticsData.hoursEfficiency} />
        </div>
      )}
    </div>
  );
}
