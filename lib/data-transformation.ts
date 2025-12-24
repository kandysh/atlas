import { DonutChartData } from "@/components/insights/task-status-breakdown";
import { Task } from "@/data/project";

export const mockDataToDonut = (mockData: Task[]): DonutChartData[] => {
  const statusCounts = mockData.reduce(
    (acc, task, idx) => {
      if (task.status === "pending") {
        acc.pending += 1;
      } else if (task.status === "completed") {
        acc.completed += 1;
      } else if (task.status === "in-progress") {
        acc["in-progress"] += 1;
      }
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
