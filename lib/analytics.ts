import { DonutChartData } from "@/components/insights/task-status-breakdown";
import { ThroughPutOverTimeData } from "@/components/insights/throughput-over-time";
import { ToolsUsed } from "@/components/insights/tools-used";
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

export interface MonthlyHoursPoint {
  month: string;
  worked: number;
  saved: number;
  net: number;
}

export const mockDataForHoursSavedWorked = (
  tasks: Task[],
): MonthlyHoursPoint[] => {
  const monthlyMap = new Map<string, { worked: number; saved: number }>();

  tasks
    .filter((t) => t.status === "completed")
    .forEach((task) => {
      const month = task.completionDate!.toISOString().slice(0, 7); // yyyy-MM

      const prev = monthlyMap.get(month) ?? {
        worked: 0,
        saved: 0,
      };

      monthlyMap.set(month, {
        worked: prev.worked + task.workedHrs,
        saved: prev.saved + task.savedHrs,
      });
    });

  // sort months chronologically
  return Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, values]) => ({
      month,
      worked: values.worked,
      saved: values.saved,
      net: values.saved - values.worked,
    }));
};

export interface RemaingWorkTrend {
  month: string;
  remaining: number;
}

export const mockDataForRemainingWorkTrend = (tasks: Task[]) => {
  if (tasks.length === 0) return [];

  const createdDates = tasks.map((t) => t.createdAt);
  const start = new Date(Math.min(...createdDates.map((d) => d.getTime())));
  const end = new Date(
    Math.max(
      ...tasks
        .filter((t) => t.status === "completed" && t.completionDate)
        .map((t) => t.completionDate!.getTime()),
    ),
  );

  const createdPerMonth = new Map<string, number>();
  const completedPerMonth = new Map<string, number>();

  tasks.forEach((task) => {
    const createdMonth = task.createdAt.toISOString().slice(0, 7);
    createdPerMonth.set(
      createdMonth,
      (createdPerMonth.get(createdMonth) ?? 0) + 1,
    );

    if (task.status === "completed" && task.completionDate) {
      const completedMonth = task.completionDate.toISOString().slice(0, 7);
      completedPerMonth.set(
        completedMonth,
        (completedPerMonth.get(completedMonth) ?? 0) + 1,
      );
    }
  });

  const points: RemaingWorkTrend[] = [];
  let totalCreated = 0;
  let totalCompleted = 0;

  for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
    const month = d.toISOString().slice(0, 7);

    totalCreated += createdPerMonth.get(month) ?? 0;
    totalCompleted += completedPerMonth.get(month) ?? 0;

    points.push({
      month: new Date(month).toLocaleDateString("en-US", { month: "long" }),
      remaining: totalCreated - totalCompleted,
    });
  }

  return points;
};

export const mockDataForToolsUsed = (tasks: Task[]): ToolsUsed[] => {
  if (tasks.length === 0) return [];
  const toolMap = new Map<string, number>();

  tasks.forEach((task) => {
    if (task.tools.length > 0) {
      task.tools.forEach((tool) => {
        toolMap.set(
          tool.toLowerCase(),
          (toolMap.get(tool.toLowerCase()) ?? 0) + 1,
        );
      });
    }
  });

  return Array.from(toolMap.entries()).map(([tool, count]) => ({
    tool,
    count,
  }));
};
