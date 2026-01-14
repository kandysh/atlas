"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@/src/lib/db";
import {
  getWorkspaceTasks,
  getWorkspaceFields,
  createTask as createTaskApi,
  updateTask as updateTaskApi,
} from "./queries";
import { toast } from "sonner";

/**
 * Query keys factory
 */
export const queryKeys = {
  tasks: (workspaceId: string, page: number) => [
    "tasks",
    { workspaceId, page },
  ],
  fields: (workspaceId: string) => ["fields", { workspaceId }],
  allTasks: (workspaceId: string) => ["tasks", { workspaceId }],
};

/**
 * Hook to fetch workspace tasks with pagination
 */
export function useWorkspaceTasks(workspaceId: string, page: number = 0) {
  return useQuery({
    queryKey: queryKeys.tasks(workspaceId, page),
    queryFn: () => getWorkspaceTasks(workspaceId, page),
    staleTime: 30000, // 30 seconds
    enabled: !!workspaceId,
  });
}

/**
 * Hook to fetch workspace field configurations
 */
export function useWorkspaceFields(workspaceId: string) {
  return useQuery({
    queryKey: queryKeys.fields(workspaceId),
    queryFn: () => getWorkspaceFields(workspaceId),
    staleTime: 300000, // 5 minutes - field configs change rarely
    enabled: !!workspaceId,
  });
}

/**
 * Hook to create a new task
 */
export function useCreateTask(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, any>) =>
      createTaskApi(workspaceId, data),
    onSuccess: (newTask) => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({
        queryKey: queryKeys.allTasks(workspaceId),
      });
      toast.success("Task created successfully");
    },
    onError: (error) => {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task");
    },
  });
}

/**
 * Hook to update a task with optimistic updates
 */
export function useUpdateTask(workspaceId: string, page: number = 0) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, patch }: { taskId: string; patch: Record<string, any> }) =>
      updateTaskApi(taskId, patch),
    
    // Optimistic update
    onMutate: async ({ taskId, patch }) => {
      const queryKey = queryKeys.tasks(workspaceId, page);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old?.tasks) return old;

        return {
          ...old,
          tasks: old.tasks.map((task: Task) =>
            task.id === taskId
              ? {
                  ...task,
                  data: { ...task.data, ...patch },
                  version: task.version + 1,
                  updatedAt: new Date(),
                }
              : task
          ),
        };
      });

      // Return context with previous data for rollback
      return { previousData, queryKey };
    },

    // On success, show toast
    onSuccess: () => {
      toast.success("Saved");
    },

    // On error, rollback and show error
    onError: (error, variables, context) => {
      console.error("Failed to update task:", error);
      
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      
      toast.error("Failed to save changes");
    },

    // Always refetch after error or success to sync with server
    onSettled: (data, error, variables, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });
}
