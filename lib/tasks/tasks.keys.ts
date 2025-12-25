export const taskKeys = {
  all: ["tasks"],
  allTaskWithStatusCount: () => [...taskKeys.all, "statusCount"],
  allTaskWithThroughputOverTime: () => [...taskKeys.all, "throughputOverTime"],
  allTasksWithCycleTime: () => [...taskKeys.all, "cycleTime"],
  allTasksWithHoursSavedWorked: () => [...taskKeys.all, "hoursSavedWorked"],
  allTasksRemainingWorkTrend: () => [...taskKeys.all, "remainingWorkTrend"],
  allTasksToolsUsed: () => [...taskKeys.all, "toolsUsed"],
  assestClasses: () => [...taskKeys.all, "assestClasses"],
};
