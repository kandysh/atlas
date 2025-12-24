export const taskKeys = {
  all: ["tasks"],
  allTaskWithStatusCount: () => [...taskKeys.all, "statusCount"],
  allTaskWithThroughputOverTime: () => [...taskKeys.all, "throughputOverTime"],
};
