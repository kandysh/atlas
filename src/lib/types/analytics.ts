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

// New types for Business Impact Intelligence Platform

export type CumulativeImpactData = {
  date: string;
  cumulativeProcesses: number;
  cumulativeHours: number;
};

export type ImpactMatrixData = {
  taskId: string;
  title: string;
  processesDemised: number;
  savedHrs: number;
  assetClass: string;
};

export type ImpactVsCycleTimeData = {
  taskId: string;
  title: string;
  cycleDays: number;
  totalImpact: number; // savedHrs + processesDemised weighted
  savedHrs: number;
  processesDemised: number;
};

export type EfficiencyRatioData = {
  taskId: string;
  title: string;
  efficiency: number; // savedHrs / processesDemised
  savedHrs: number;
  processesDemised: number;
};

export type ImpactDensityByTeamData = {
  team: string;
  impactDensity: number; // processesDemised / avgCycleTime
  processesDemised: number;
  avgCycleDays: number;
  taskCount: number;
};

export type TeamImpactQuadrantData = {
  team: string;
  totalProcessesDemised: number;
  totalSavedHrs: number;
  taskCount: number;
};

export type AssetClassROIData = {
  assetClass: string;
  roiScore: number; // savedHrs / avgCycleTime
  savedHrs: number;
  avgCycleDays: number;
  taskCount: number;
};

export type ToolsImpactData = {
  tool: string;
  savedHrs: number;
  processesDemised: number;
  taskCount: number;
};

export type TopAutomationData = {
  taskId: string;
  displayId: string;
  title: string;
  savedHrs: number;
  processesDemised: number;
  totalImpact: number; // combined impact score
  completionDate: string;
};

export type ParetoCurveData = {
  taskId: string;
  displayId: string;
  title: string;
  value: number;
  cumulativeValue: number;
  cumulativePercentage: number;
};
