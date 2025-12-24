"use client";
import { CumulativeFlowChart } from "@/components/insights/cumulative-flow";
import CycleTimeChart from "@/components/insights/cycle-time";
import HoursSavedWorkedChart from "@/components/insights/hours-saved-worked";
import { TasksStatusBreakdownDonut } from "@/components/insights/task-status-breakdown";
import { ChartLineInteractive } from "@/components/insights/throughput-over-time";
import { ToolsUsedChart } from "@/components/insights/tools-used";
import {
  useTasks,
  useTasksRemainingWorkTrend,
  useTasksToolUsed,
  useTasksWithCycleTime,
  useTasksWithHoursSavedWorked,
  useTasksWithStatusCount,
  useTasksWithThroughputOverTime,
} from "@/lib/tasks/tasks.query";

export default function InsightsPage() {
  const { data: tasks } = useTasks();
  const { data: donutData } = useTasksWithStatusCount(tasks!);
  const { data: throughPutOverTimeData } = useTasksWithThroughputOverTime(
    tasks!,
  );
  const { data: cycleTimeData } = useTasksWithCycleTime(tasks!);
  const { data: hoursSavedWorkedData } = useTasksWithHoursSavedWorked(tasks!);
  const { data: remainingWorkTrendData } = useTasksRemainingWorkTrend(tasks!);
  const { data: toolsUsedData } = useTasksToolUsed(tasks!);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          Insights
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Analytics and performance metrics
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TasksStatusBreakdownDonut chartData={donutData || []} />
      </div>
      <ChartLineInteractive chartData={throughPutOverTimeData || []} />
      <CycleTimeChart chartData={cycleTimeData || []} />
      <HoursSavedWorkedChart chartData={hoursSavedWorkedData || []} />
      <CumulativeFlowChart chartData={remainingWorkTrendData || []} />
      <ToolsUsedChart chartData={toolsUsedData || []} />
    </div>
  );
}
