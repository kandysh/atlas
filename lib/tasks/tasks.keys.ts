export const taskKeys = {
  all: ["tasks"],
  allTaskWithStatusCount: () => [...taskKeys.all, "statusCount"],
  allTaskWithThroughputOverTime: () => [...taskKeys.all, "throughputOverTime"],
  allTasksWithCycleTime: () => [...taskKeys.all, "cycleTime"],
};
