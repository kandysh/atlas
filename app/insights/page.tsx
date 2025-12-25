"use client";
import AssetClassSelect from "@/components/insights/assest-class-select";
import { CumulativeFlowChart } from "@/components/insights/cumulative-flow";
import CycleTimeChart from "@/components/insights/cycle-time";
import HoursSavedWorkedChart from "@/components/insights/hours-saved-worked";
import { TasksStatusBreakdownDonut } from "@/components/insights/task-status-breakdown";
import { ChartLineInteractive } from "@/components/insights/throughput-over-time";
import { ToolsUsedChart } from "@/components/insights/tools-used";
import {
  useTaskAssestClasses,
  useTasks,
  useTasksRemainingWorkTrend,
  useTasksToolUsed,
  useTasksWithCycleTime,
  useTasksWithHoursSavedWorked,
  useTasksWithStatusCount,
  useTasksWithThroughputOverTime,
} from "@/lib/tasks/tasks.query";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function InsightsPage() {
  const [currentAssetClass, setCurrentAssetClass] = useState("All");
  const { data: tasks } = useTasks(currentAssetClass);
  const { data: donutData } = useTasksWithStatusCount(tasks!);
  const { data: throughPutOverTimeData } = useTasksWithThroughputOverTime(
    tasks!,
  );
  const { data: cycleTimeData } = useTasksWithCycleTime(tasks!);
  const { data: hoursSavedWorkedData } = useTasksWithHoursSavedWorked(tasks!);
  const { data: remainingWorkTrendData } = useTasksRemainingWorkTrend(tasks!);
  const { data: toolsUsedData } = useTasksToolUsed(tasks!);
  const { data: assetClassesData } = useTaskAssestClasses();
  const queryClient = useQueryClient();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          Insights
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Analytics and performance metrics
        </p>
        <AssetClassSelect
          assestClasses={[...Array.from(assetClassesData || []), "All"].sort(
            (a, b) => a.localeCompare(b),
          )}
          currentAssetClass={currentAssetClass}
          setAssestClass={(value) => {
            setCurrentAssetClass(value);
            queryClient.invalidateQueries();
          }}
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
