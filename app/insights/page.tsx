"use client";

import { useState } from "react";
import {
  AssetClassSelect,
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
  HeroKPIs,
} from "@/src/components/features/insights";
import { useServerAnalytics } from "@/src/hooks/analytics";
import { useWorkspace } from "@/src/providers";

export default function InsightsPage() {
  const [currentAssetClass, setCurrentAssetClass] = useState("All");
  const { currentWorkspace, isLoading: workspaceLoading } = useWorkspace();

  // Fetch analytics from server with filters (single aggregated request)
  const { data, isLoading: analyticsLoading, error } = useServerAnalytics(
    currentWorkspace?.id || "",
    { assetClass: currentAssetClass }
  );

  const isLoading = workspaceLoading || analyticsLoading;

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

  // Build asset class options from server data
  const assetClassOptions = [
    ...Array.from(data?.assetClasses || []),
    "All",
  ].sort((a, b) => a.localeCompare(b));

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
        <div className="mt-4">
          <AssetClassSelect
            assetClasses={assetClassOptions}
            currentAssetClass={currentAssetClass}
            setAssetClass={setCurrentAssetClass}
          />
        </div>
      </div>

      {/* Hero KPIs Section */}
      <HeroKPIs
        kpis={data?.kpis || { totalTasks: 0, openTasks: 0, avgCycleTime: 0, hoursSaved: 0 }}
        isLoading={isLoading}
      />

      {/* Charts Grid - 11 Total Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Row 1 */}
        <TasksStatusBreakdownDonut chartData={data?.statusCounts || []} />
        <CumulativeFlowChart chartData={data?.remainingWorkTrend || []} />
        <OwnerProductivityChart chartData={data?.ownerProductivity || []} />

        {/* Row 2 */}
        <ToolsUsedChart chartData={data?.toolsUsed || []} />
        <TeamsWorkloadChart chartData={data?.teamsWorkload || []} />
        <AssetClassPortfolioChart chartData={data?.assetClassDistribution || []} />

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
      </div>
    </div>
  );
}
