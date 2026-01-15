import { DonutChartData, ThroughPutOverTimeData, ToolsUsed } from "../types";
import { Task, Status } from "../types";

const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;

export const computeStatusCount = (tasks: Task[]): DonutChartData[] => {
  if (!tasks || tasks.length === 0) return [];
  
  const statusCounts = tasks.reduce(
    (acc, task) => {
      const status = task.status || "todo";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<Status, number>,
  );

  return [
    {
      status: "To Do",
      count: statusCounts.todo || 0,
      fill: "var(--chart-1)",
    },
    {
      status: "In Progress",
      count: statusCounts["in-progress"] || 0,
      fill: "var(--chart-2)",
    },
    {
      status: "Testing",
      count: statusCounts.testing || 0,
      fill: "var(--chart-3)",
    },
    {
      status: "Done",
      count: statusCounts.done || 0,
      fill: "var(--chart-4)",
    },
    {
      status: "Completed",
      count: statusCounts.completed || 0,
      fill: "var(--chart-5)",
    },
    {
      status: "Blocked",
      count: statusCounts.blocked || 0,
      fill: "hsl(var(--destructive))",
    },
  ].filter(item => item.count > 0);
};

export const computeThroughputOverTime = (
  tasks: Task[],
): ThroughPutOverTimeData[] => {
  if (!tasks || tasks.length === 0) return [];
  
  const completed = tasks
    .filter((x) => x.status === "completed" && x.completionDate)
    .sort(
      (a, b) =>
        a.completionDate!.getUTCMonth() - b.completionDate!.getUTCMonth(),
    )
    .map((x) => ({
      date: x.completionDate,
      hours: x.savedHrs || 0,
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
    .filter((x) => x.status === "completed" && x.completionDate)
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

export const computeCycleTime = (tasks: Task[]) => {
  if (!tasks || tasks.length === 0) return [];
  
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

export const computeHoursSavedWorked = (
  tasks: Task[],
): MonthlyHoursPoint[] => {
  if (!tasks || tasks.length === 0) return [];
  
  const monthlyMap = new Map<string, { worked: number; saved: number }>();

  tasks
    .filter((t) => t.status === "completed" && t.completionDate)
    .forEach((task) => {
      const month = task.completionDate!.toISOString().slice(0, 7); // yyyy-MM

      const prev = monthlyMap.get(month) ?? {
        worked: 0,
        saved: 0,
      };

      monthlyMap.set(month, {
        worked: prev.worked + (task.workedHrs || 0),
        saved: prev.saved + (task.savedHrs || 0),
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

export interface RemainingWorkTrend {
  month: string;
  remaining: number;
}

export const computeRemainingWorkTrend = (tasks: Task[]): RemainingWorkTrend[] => {
  if (tasks.length === 0) return [];

  const createdDates = tasks.map((t) => t.createdAt);
  const completedTasks = tasks.filter((t) => t.status === "completed" && t.completionDate);
  
  if (completedTasks.length === 0) return [];
  
  const start = new Date(Math.min(...createdDates.map((d) => d.getTime())));
  const end = new Date(
    Math.max(...completedTasks.map((t) => t.completionDate!.getTime())),
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

  const points: RemainingWorkTrend[] = [];
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

export const computeToolsUsed = (tasks: Task[]): ToolsUsed[] => {
  if (!tasks || tasks.length === 0) return [];
  const toolMap = new Map<string, number>();

  tasks.forEach((task) => {
    if (task.tools && task.tools.length > 0) {
      task.tools.forEach((tool) => {
        if (tool) {
          toolMap.set(
            tool.toLowerCase(),
            (toolMap.get(tool.toLowerCase()) ?? 0) + 1,
          );
        }
      });
    }
  });

  return Array.from(toolMap.entries()).map(([tool, count]) => ({
    tool,
    count,
  }));
};
