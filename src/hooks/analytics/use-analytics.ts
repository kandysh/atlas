"use client";
import { useMemo } from "react";
import {
  computeStatusCount,
  computeThroughputOverTime,
  computeCycleTime,
  computeHoursSavedWorked,
  computeRemainingWorkTrend,
  computeToolsUsed,
} from "@/src/lib/utils/tasks/analytics";
import { Task } from "@/src/lib/types";

/**
 * Custom hook to compute status count from tasks
 */
export const useTasksWithStatusCount = (tasks: Task[]) => {
  return useMemo(() => computeStatusCount(tasks), [tasks]);
};

/**
 * Custom hook to compute throughput over time from tasks
 */
export const useTasksWithThroughputOverTime = (tasks: Task[]) => {
  return useMemo(() => computeThroughputOverTime(tasks), [tasks]);
};

/**
 * Custom hook to compute cycle time from tasks
 */
export const useTasksWithCycleTime = (tasks: Task[]) => {
  return useMemo(() => computeCycleTime(tasks), [tasks]);
};

/**
 * Custom hook to compute hours saved/worked from tasks
 */
export const useTasksWithHoursSavedWorked = (tasks: Task[]) => {
  return useMemo(() => computeHoursSavedWorked(tasks), [tasks]);
};

/**
 * Custom hook to compute remaining work trend from tasks
 */
export const useTasksRemainingWorkTrend = (tasks: Task[]) => {
  return useMemo(() => computeRemainingWorkTrend(tasks), [tasks]);
};

/**
 * Custom hook to compute tools used from tasks
 */
export const useTasksToolUsed = (tasks: Task[]) => {
  return useMemo(() => computeToolsUsed(tasks), [tasks]);
};

/**
 * Custom hook to get unique asset classes from tasks
 */
export const useTaskAssetClasses = (tasks: Task[]) => {
  return useMemo(() => {
    return new Set(
      tasks
        .map((x) => x.assetClass)
        .filter(Boolean)
        .map((x) => x.toLowerCase())
    );
  }, [tasks]);
};
