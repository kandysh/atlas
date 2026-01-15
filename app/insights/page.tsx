"use client";

import { useMemo, useState } from "react";
import {
  AssetClassSelect,
  CumulativeFlowChart,
  CycleTimeChart,
  HoursSavedWorkedChart,
  TasksStatusBreakdownDonut,
  ChartLineInteractive,
  ToolsUsedChart,
} from "@/src/components/features/insights";
import {
  useTaskAssetClasses,
  useTasksWithStatusCount,
  useTasksWithThroughputOverTime,
  useTasksWithCycleTime,
  useTasksWithHoursSavedWorked,
  useTasksRemainingWorkTrend,
  useTasksToolUsed,
} from "@/src/hooks/analytics";
import { useWorkspace } from "@/src/providers";
import { useWorkspaceTasks } from "@/src/lib/query/hooks";

export default function InsightsPage() {
  const [currentAssetClass, setCurrentAssetClass] = useState("All");
  const { currentWorkspace, isLoading: workspaceLoading } = useWorkspace();
  
  // Fetch tasks from DB (single source of truth)
  const { data, isLoading: tasksLoading, error } = useWorkspaceTasks(
    currentWorkspace?.id || "",
    0
  );

  // Filter tasks by asset class if needed
  const filteredTasks = useMemo(() => {
    const tasks = data?.tasks || [];
    if (currentAssetClass === "All") return tasks;
    return tasks.filter(
      (x) => x.assetClass?.toLowerCase() === currentAssetClass.toLowerCase()
    );
  }, [data?.tasks, currentAssetClass]);

  // Compute analytics from filtered tasks
  const donutData = useTasksWithStatusCount(filteredTasks);
  const throughPutOverTimeData = useTasksWithThroughputOverTime(filteredTasks);
  const cycleTimeData = useTasksWithCycleTime(filteredTasks);
  const hoursSavedWorkedData = useTasksWithHoursSavedWorked(filteredTasks);
  const remainingWorkTrendData = useTasksRemainingWorkTrend(filteredTasks);
  const toolsUsedData = useTasksToolUsed(filteredTasks);
  const assetClassesData = useTaskAssetClasses(data?.tasks || []);

  const isLoading = workspaceLoading || tasksLoading;

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
            Error loading tasks. Showing cached data if available.
          </p>
          <AssetClassSelect
            assetClasses={[...Array.from(assetClassesData || []), "All"].sort(
              (a, b) => a.localeCompare(b),
            )}
            currentAssetClass={currentAssetClass}
            setAssetClass={setCurrentAssetClass}
          />
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(480px,1fr))] gap-4">
          <TasksStatusBreakdownDonut chartData={donutData || []} />
          <ToolsUsedChart chartData={toolsUsedData || []} />
          <ChartLineInteractive chartData={throughPutOverTimeData || []} />
          <CycleTimeChart chartData={cycleTimeData || []} />
          <HoursSavedWorkedChart chartData={hoursSavedWorkedData || []} />
          <CumulativeFlowChart chartData={remainingWorkTrendData || []} />
        </div>
      </div>
    );
  }

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
          assetClasses={[...Array.from(assetClassesData || []), "All"].sort(
            (a, b) => a.localeCompare(b),
          )}
          currentAssetClass={currentAssetClass}
          setAssetClass={setCurrentAssetClass}
        />
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(480px,1fr))] gap-4">
        <TasksStatusBreakdownDonut chartData={donutData || []} />
        <ToolsUsedChart chartData={toolsUsedData || []} />
        <ChartLineInteractive chartData={throughPutOverTimeData || []} />
        <CycleTimeChart chartData={cycleTimeData || []} />
        <HoursSavedWorkedChart chartData={hoursSavedWorkedData || []} />
        <CumulativeFlowChart chartData={remainingWorkTrendData || []} />
      </div>
    </div>
  );
}
