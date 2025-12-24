"use client";
import { mockTasks } from "@/data/mock-tasks";
import { useQuery } from "@tanstack/react-query";
import {
  mockDataForCycleTime,
  mockDataToDonut,
  mockDataToThroughputOverTime,
} from "../analytics";
import { taskKeys } from "./tasks.keys";
import { Task } from "@/data/project";

export const useTasks = () => {
  return useQuery({
    queryKey: taskKeys.all,
    queryFn: () => {
      return mockTasks;
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
