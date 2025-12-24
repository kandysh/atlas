import { DonutChartData } from "@/components/insights/task-status-breakdown";
import { ThroughPutOverTimeData } from "@/components/insights/throughput-over-time";
import { Task } from "@/data/project";

const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;

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
      (a, b) =>
        a.completionDate!.getUTCMonth() - b.completionDate!.getUTCMonth(),
    )
    .map((x) => ({
      date: x.completionDate,
      hours: x.savedHrs,
    }));
  const data = completed.reduce((acc, x) => {
    const existing = acc.find(
      (y) => new Date(y.date).getMonth() === new Date(x.date!).getMonth(),
    );
    if (existing) {
      existing.hours += x.hours;
      existing.count += 1;
    } else {
      acc.push({ date: x.date!.toISOString(), hours: x.hours, count: 1 });
    }
    return acc;
  }, [] as ThroughPutOverTimeData[]);

  return data;
};
interface CyclePoint {
  completedAt: Date;
  cycleDays: number;
}

interface MonthlyCycle {
  month: string;
  avgCycleDays: number;
}

export interface RollingCycle extends MonthlyCycle {
  rollingAvg: number;
}
export const getCompletedCyclePoints = (tasks: Task[]): CyclePoint[] =>
  tasks
    .filter((x) => x.status === "completed")
    .sort((a, b) => a.completionDate!.getTime() - b.completionDate!.getTime())
    .map((t) => ({
      completedAt: t.completionDate!,
      cycleDays:
        (t.completionDate!.getTime() - t.createdAt.getTime()) /
        MILLISECONDS_IN_DAY,
    }));

export const getMonthlyAvgCycleTime = (
  points: CyclePoint[],
): MonthlyCycle[] => {
  const map = new Map<string, number[]>();

  points.forEach((point) => {
    const key = point.completedAt.toLocaleDateString("en-us", {
      month: "long",
    });
    map.set(key, [...(map.get(key) ?? []), point.cycleDays]);
  });

  return Array.from(map.entries()).map(([month, cycleDays]) => ({
    month,
    avgCycleDays: cycleDays.reduce((acc, x) => acc + x, 0) / cycleDays.length,
  }));
};

export const getRollingAverage = (
  data: MonthlyCycle[],
  window = 3,
): RollingCycle[] =>
  data.map((_, idx) => {
    const slice = data.slice(Math.max(0, idx - window + 1), idx + 1);

    return {
      month: data[idx].month,
      rollingAvg: slice.reduce((a, b) => a + b.avgCycleDays, 0) / slice.length,
      avgCycleDays: data[idx].avgCycleDays,
    };
  });

export const mockDataForCycleTime = (tasks: Task[]) => {
  const cyclePoints = getCompletedCyclePoints(tasks);
  const monthlyAvg = getMonthlyAvgCycleTime(cyclePoints);
  const rollingAvg = getRollingAverage(monthlyAvg);

  return rollingAvg;
};
