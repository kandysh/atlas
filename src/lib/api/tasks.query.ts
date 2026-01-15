"use client";
import { mockTasks } from "@/src/data/mock-tasks";
import { useQuery } from "@tanstack/react-query";
import {
  mockDataForCycleTime,
  mockDataForHoursSavedWorked,
  mockDataForRemainingWorkTrend,
  mockDataForToolsUsed,
  mockDataToDonut,
  mockDataToThroughputOverTime,
} from "@/src/lib/utils/analytics";
import { queryKeys } from "@/src/lib/query/keys";
import { Task } from "@/src/lib/types";

export const useTasks = (assetClass: string) => {
  return useQuery({
    queryKey: queryKeys.tasks.all,
    queryFn: () => {
      if (assetClass === "All") return mockTasks;
      return mockTasks.filter(
        (x) => x.assetClass.toLowerCase() === assetClass.toLowerCase(),
      );
    },
  });
};

export const useTasksWithStatusCount = (mockData: Task[]) => {
  return useQuery({
    queryKey: queryKeys.tasks.statusCount(),
    queryFn: () => {
      return mockDataToDonut(mockData);
    },
  });
};

export const useTasksWithThroughputOverTime = (mockData: Task[]) => {
  return useQuery({
    queryKey: queryKeys.tasks.throughputOverTime(),
    queryFn: () => {
      return mockDataToThroughputOverTime(mockData);
    },
  });
};

export const useTasksWithCycleTime = (mockData: Task[]) => {
  return useQuery({
    queryKey: queryKeys.tasks.cycleTime(),
    queryFn: () => {
      return mockDataForCycleTime(mockData);
    },
  });
};

export const useTasksWithHoursSavedWorked = (mockData: Task[]) => {
  return useQuery({
    queryKey: queryKeys.tasks.hoursSavedWorked(),
    queryFn: () => {
      return mockDataForHoursSavedWorked(mockData);
    },
  });
};

export const useTasksRemainingWorkTrend = (mockData: Task[]) => {
  return useQuery({
    queryKey: queryKeys.tasks.remainingWorkTrend(),
    queryFn: () => {
      return mockDataForRemainingWorkTrend(mockData);
    },
  });
};
export const useTasksToolUsed = (mockData: Task[]) => {
  return useQuery({
    queryKey: queryKeys.tasks.toolsUsed(),
    queryFn: () => {
      return mockDataForToolsUsed(mockData);
    },
  });
};

export const useTaskAssestClasses = () => {
  return useQuery({
    queryKey: queryKeys.tasks.assetClasses(),
    queryFn: () => {
      return new Set(mockTasks.map((x) => x.assetClass.toLowerCase()));
    },
  });
};
