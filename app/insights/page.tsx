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
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          Insights
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Analytics and performance metrics
          {isLoading && " • Loading..."}
        </p>
        <AssetClassSelect
          assetClasses={assetClassOptions}
          currentAssetClass={currentAssetClass}
          setAssetClass={setCurrentAssetClass}
        />
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(480px,1fr))] gap-4">
        <TasksStatusBreakdownDonut chartData={data?.statusCounts || []} />
        <ToolsUsedChart chartData={data?.toolsUsed || []} />
        <ChartLineInteractive chartData={data?.throughputOverTime || []} />
        <CycleTimeChart chartData={data?.cycleTime || []} />
        <HoursSavedWorkedChart chartData={data?.hoursSavedWorked || []} />
        <CumulativeFlowChart chartData={data?.remainingWorkTrend || []} />
      </div>
    </div>
  );
}
