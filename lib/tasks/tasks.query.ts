"use client";
import { mockTasks } from "@/data/mock-tasks";
import { useQuery } from "@tanstack/react-query";
import {
  mockDataForCycleTime,
  mockDataForHoursSavedWorked,
  mockDataForRemainingWorkTrend,
  mockDataToDonut,
  mockDataToThroughputOverTime,
} from "../analytics";
import { taskKeys } from "./tasks.keys";
import { Task } from "@/data/project";
import { CLIENT_PUBLIC_FILES_PATH } from "next/dist/shared/lib/constants";

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
