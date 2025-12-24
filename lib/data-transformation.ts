import { DonutChartData } from "@/components/insights/task-status-breakdown";
import { ThroughPutOverTimeData } from "@/components/insights/throughput-over-time";
import { Task } from "@/data/project";
import { mock } from "node:test";

export const mockDataToDonut = (mockData: Task[]): DonutChartData[] => {
  const statusCounts = mockData.reduce(
    (acc, task) => {
      acc[task.status] += 1;
      return acc;
    },
    {
      pending: 0,
      completed: 0,
      "in-progress": 0,
    },
  );

  return [
    {
      status: "Pending",
      count: statusCounts.pending,
      fill: "var(--chart-1)",
    },
    {
      status: "Completed",
      count: statusCounts.completed,
      fill: "var(--chart-2)",
    },
    {
      status: "In Progress",
      count: statusCounts["in-progress"],
      fill: "var(--chart-3)",
    },
  ];
};

export const mockDataToThroughputOverTime = (
  mockData: Task[],
): ThroughPutOverTimeData[] => {
  const completed = mockData
    .filter((x) => x.status === "completed")
    .sort(
      (a, b) => a.completionDate.getUTCMonth() - b.completionDate.getUTCMonth(),
    )
    .map((x) => ({
      date: x.completionDate,
      hours: x.savedHrs,
    }));
  const data = completed.reduce((acc, x) => {
    const existing = acc.find(
      (y) => new Date(y.date).getMonth() === new Date(x.date).getMonth(),
    );
    if (existing) {
      existing.hours += x.hours;
      existing.count += 1;
    } else {
      acc.push({ date: x.date.toISOString(), hours: x.hours, count: 1 });
    }
    return acc;
  }, [] as ThroughPutOverTimeData[]);

  return data;
};
