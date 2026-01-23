// Chart and analytics data types
export type DonutChartData = {
  status: string;
  count: number;
  fill: string;
};

export type ThroughPutOverTimeData = {
  date: string;
  hours: number;
  count: number;
  processesDemised: number;
};

export type ToolsUsed = {
  tool: string;
  count: number;
  savedHrs: number;
};

export type TeamImpactQuadrantData = {
  team: string;
  totalProcessesDemised: number;
  totalSavedHrs: number;
  taskCount: number;
};
