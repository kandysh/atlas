"use client";

import { useState, useMemo } from "react";
import {
  CumulativeFlowChart,
  CycleTimeChart,
  HoursSavedWorkedChart,
  TasksStatusBreakdownDonut,
  ChartLineInteractive,
  ToolsUsedChart,
  OwnerProductivityChart,
  TeamsWorkloadChart,
  GroupDistributionChart,
  PriorityAgingChart,
  HoursEfficiencyChart,
  HeroKPIs,
  ChartSkeleton,
  KPISkeleton,
  DynamicFilterControls,
  InsightsCard,
  generateInsights,
} from "@/src/components/features/insights";
import { useServerAnalytics } from "@/src/hooks/analytics";
import { useWorkspace } from "@/src/providers";
import { AnalyticsFilters } from "@/src/lib/actions/analytics";

export default function InsightsPage() {
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const { currentWorkspace, isLoading: workspaceLoading } = useWorkspace();

  // Fetch analytics from server with filters (single aggregated request)
  const { data, isLoading: analyticsLoading, error } = useServerAnalytics(
    currentWorkspace?.id || "",
    filters
  );

  const isLoading = workspaceLoading || analyticsLoading;

  // Generate intelligent insights
  const insights = useMemo(() => {
    if (!data) return [];
    return generateInsights({
      kpis: data.kpis,
      priorityAging: data.priorityAging,
      ownerProductivity: data.ownerProductivity,
    });
  }, [data]);

  if (workspaceLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            Insights
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Loading workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="space-y-6">
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
      <div className="space-y-6">
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

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          Insights
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Analytics and performance metrics
          {isLoading && " • Loading..."}
        </p>
      </div>

      {/* Dynamic Filter Controls - driven by field configs */}
      <DynamicFilterControls
        filters={filters}
        onFiltersChange={setFilters}
        filterableFields={data?.filterableFields || []}
        filterOptions={data?.filterOptions || {}}
        isLoading={isLoading}
      />

      {/* Hero KPIs Section */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <KPISkeleton key={i} />
          ))}
        </div>
      ) : (
        <HeroKPIs
          kpis={data?.kpis || { totalTasks: 0, openTasks: 0, avgCycleTime: 0, hoursSaved: 0, customMetrics: {} }}
          isLoading={isLoading}
        />
      )}

      {/* AI-like Insights Cards */}
      {!isLoading && insights.length > 0 && (
        <InsightsCard insights={insights} />
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            {[...Array(11)].map((_, i) => (
              <ChartSkeleton key={i} />
            ))}
          </>
        ) : (
          <>
            {/* Row 1 */}
            <TasksStatusBreakdownDonut chartData={data?.statusCounts || []} />
            <CumulativeFlowChart chartData={data?.remainingWorkTrend || []} />
            <OwnerProductivityChart chartData={data?.ownerProductivity || []} />

            {/* Row 2 */}
            <ToolsUsedChart chartData={data?.toolsUsed || []} />
            <TeamsWorkloadChart chartData={data?.teamsWorkload || []} />
            
            {/* Dynamic group distributions from combobox fields */}
            {Object.entries(data?.groupDistributions || {}).map(([fieldKey, chartData]) => (
              <GroupDistributionChart 
                key={fieldKey}
                fieldKey={fieldKey}
                chartData={chartData}
                fieldName={data?.filterableFields?.find(f => f.key === fieldKey)?.name || fieldKey}
              />
            ))}

            {/* Row 3 - Full width charts */}
            <div className="md:col-span-2 lg:col-span-3">
              <ChartLineInteractive chartData={data?.throughputOverTime || []} />
            </div>

            {/* Row 4 */}
            <CycleTimeChart chartData={data?.cycleTime || []} />
            <HoursSavedWorkedChart chartData={data?.hoursSavedWorked || []} />
            <PriorityAgingChart chartData={data?.priorityAging || []} />

            {/* Row 5 */}
            <div className="md:col-span-2 lg:col-span-1">
              <HoursEfficiencyChart chartData={data?.hoursEfficiency || []} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
