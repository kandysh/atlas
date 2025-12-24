"use client";
import { mockTasks } from "@/data/mock-tasks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { mockDataToDonut, mockDataToThroughputOverTime } from "../analytics";
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
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: taskKeys.allTaskWithStatusCount(),
    queryFn: () => {
      return mockDataToDonut(mockData);
    },
  });
};

export const useTasksWithThroughputOverTime = (mockData: Task[]) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: taskKeys.allTaskWithThroughputOverTime(),
    queryFn: () => {
      return mockDataToThroughputOverTime(mockData);
    },
  });
};
