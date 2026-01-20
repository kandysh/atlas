'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Task as DbTask } from '@/src/lib/db';
import { Task as UiTask } from '@/src/lib/types';
import { queryKeys } from '@/src/lib/query/keys';
import { dbTaskToUiTask } from '@/src/lib/utils';
import { logger } from '@/src/lib/logger';

/**
 * Hook to listen to task updates via SSE
 */
export function useTaskEvents(workspaceId: string, page: number = 0) {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  /**
   * Update a task in the query cache
   */
  const updateTaskInCache = useCallback(
    (updatedTask: DbTask) => {
      const queryKey = queryKeys.tasks.paginated(workspaceId, page);

      queryClient.setQueryData(
        queryKey,
        (old: { tasks?: UiTask[]; dbTasks?: DbTask[] } | undefined) => {
          if (!old?.tasks) return old;

          // Compare using displayId (UI's task.id)
          const taskExists = old.tasks.some(
            (t: UiTask) => t.id === updatedTask.displayId,
          );

          if (taskExists) {
            // Update existing task - convert DB task to UI task
            const uiTask = dbTaskToUiTask(updatedTask);
            return {
              ...old,
              tasks: old.tasks.map((task: UiTask) =>
                task.id === updatedTask.displayId ? uiTask : task,
              ),
              // Also update dbTasks if present
              dbTasks: old.dbTasks?.map((t: DbTask) =>
                t.id === updatedTask.id ? updatedTask : t,
              ),
            };
          } else {
            // Add new task to the beginning
            const uiTask = dbTaskToUiTask(updatedTask);
            return {
              ...old,
              tasks: [uiTask, ...old.tasks],
              dbTasks: old.dbTasks
                ? [updatedTask, ...old.dbTasks]
                : [updatedTask],
            };
          }
        },
      );
    },
    [workspaceId, page, queryClient],
  );

  useEffect(() => {
    if (!workspaceId) return;

    // Create EventSource connection
    const eventSource = new EventSource(`/api/events/${workspaceId}`);
    eventSourceRef.current = eventSource;

    // Handle connection open
    eventSource.addEventListener('open', () => {
      logger.info({ workspaceId }, 'SSE connection established');
    });

    // Handle messages
    eventSource.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'connected':
            logger.info({ workspaceId, clientId: data.clientId }, 'SSE connected');
            break;

          case 'initial_state':
            // Update query cache with initial state
            queryClient.setQueryData(
              queryKeys.tasks.paginated(workspaceId, page),
              {
                tasks: data.tasks,
                page,
                perPage: 50,
                hasMore: data.tasks.length === 50,
              },
            );
            break;

          case 'task_update':
            // Update the specific task in cache
            updateTaskInCache(data.task as DbTask);
            break;

          default:
            logger.warn({ workspaceId, messageType: data.type }, 'Unknown SSE message type');
        }
      } catch (error) {
        logger.error({ workspaceId, error }, 'Error parsing SSE message');
      }
    });

    // Handle errors
    eventSource.addEventListener('error', (error) => {
      logger.error({ workspaceId, error }, 'SSE connection error');

      // EventSource will automatically reconnect
      // But we can add custom logic here if needed
    });

    // Cleanup on unmount
    return () => {
      logger.info({ workspaceId }, 'Closing SSE connection');
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [workspaceId, page, queryClient, updateTaskInCache]);

  return {
    // Note: isConnected status should be tracked via state if needed for rendering
  };
}
