"use client";
import { mockTasks } from "@/data/mock-tasks";
import { useQuery } from "@tanstack/react-query";
import {
  mockDataForCycleTime,
  mockDataForHoursSavedWorked,
  mockDataForRemainingWorkTrend,
  mockDataForToolsUsed,
  mockDataToDonut,
  mockDataToThroughputOverTime,
} from "../analytics";
import { taskKeys } from "./tasks.keys";
import { Task } from "@/data/project";

export const useTasks = (assetClass: string) => {
  return useQuery({
    queryKey: taskKeys.all,
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
    queryKey: taskKeys.allTaskWithStatusCount(),
    queryFn: () => {
      return mockDataToDonut(mockData);
    },
  });
};

export const useTasksWithThroughputOverTime = (mockData: Task[]) => {
  return useQuery({
    queryKey: taskKeys.allTaskWithThroughputOverTime(),
    queryFn: () => {
      return mockDataToThroughputOverTime(mockData);
    },
  });
};

export const useTasksWithCycleTime = (mockData: Task[]) => {
  return useQuery({
    queryKey: taskKeys.allTasksWithCycleTime(),
    queryFn: () => {
      return mockDataForCycleTime(mockData);
    },
  });
};

export const useTasksWithHoursSavedWorked = (mockData: Task[]) => {
  return useQuery({
    queryKey: taskKeys.allTasksWithHoursSavedWorked(),
    queryFn: () => {
      return mockDataForHoursSavedWorked(mockData);
    },
  });
};

export const useTasksRemainingWorkTrend = (mockData: Task[]) => {
  return useQuery({
    queryKey: taskKeys.allTasksRemainingWorkTrend(),
    queryFn: () => {
      return mockDataForRemainingWorkTrend(mockData);
    },
  });
};
export const useTasksToolUsed = (mockData: Task[]) => {
  return useQuery({
    queryKey: taskKeys.allTasksToolsUsed(),
    queryFn: () => {
      return mockDataForToolsUsed(mockData);
    },
  });
};

export const useTaskAssestClasses = () => {
  return useQuery({
    queryKey: taskKeys.assestClasses(),
    queryFn: () => {
      return new Set(mockTasks.map((x) => x.assetClass.toLowerCase()));
    },
  });
};
