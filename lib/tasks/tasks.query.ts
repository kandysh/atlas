"use client";
import { mockTasks } from "@/data/mock-tasks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { mockDataToDonut } from "../data-transformation";
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
    queryKey: taskKeys.statusCount(),
    queryFn: () => {
      return mockDataToDonut(mockData);
    },
  });
};
