"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  ScatterChart,
  Scatter,
} from "recharts";

/* =======================
   Types
======================= */

export type Project = {
  id: number;
  graduateName: string;
  title: string;
  teamAssetClass: string;
  theme: string;
  status: "active" | "completed" | "todo";
  annualHrsSaved: number;
  teamInvolved: string;
  toolsUsed: string[];
  currentTimeItakes: number;
  developmentTime: number;
};

/* =======================
   Utils (data shaping)
======================= */

export function getStatusData(projects: Project[]) {
  return Object.values(
    projects.reduce(
      (acc, p) => {
        acc[p.status] ??= { name: p.status, value: 0 };
        acc[p.status].value++;
        return acc;
      },
      {} as Record<string, { name: string; value: number }>,
    ),
  );
}

export function getHoursSavedByTheme(projects: Project[]) {
  return Object.values(
    projects.reduce(
      (acc, p) => {
        acc[p.theme] ??= { theme: p.theme, hrs: 0 };
        acc[p.theme].hrs += p.annualHrsSaved;
        return acc;
      },
      {} as Record<string, { theme: string; hrs: number }>,
    ),
  );
}

export function getToolUsage(projects: Project[]) {
  return Object.values(
    projects.reduce(
      (acc, p) => {
        p.toolsUsed.forEach((tool) => {
          acc[tool] ??= { tool, count: 0 };
          acc[tool].count++;
        });
        return acc;
      },
      {} as Record<string, { tool: string; count: number }>,
    ),
  );
}

/* =======================
   Charts
======================= */

const STATUS_COLORS = {
  active: "#22c55e",
  completed: "#3b82f6",
  todo: "#f97316",
};

export function StatusPieChart({ projects }: { projects: Project[] }) {
  const data = getStatusData(projects);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" label>
          {data.map((d) => (
            <Cell
              key={d.name}
              fill={STATUS_COLORS[d.name as keyof typeof STATUS_COLORS]}
            />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function HoursSavedByThemeChart({ projects }: { projects: Project[] }) {
  const data = getHoursSavedByTheme(projects);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="theme" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="hrs" name="Annual Hours Saved" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DevTimeVsImpactChart({ projects }: { projects: Project[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <ScatterChart>
        <XAxis dataKey="developmentTime" name="Development Time" unit="hrs" />
        <YAxis dataKey="annualHrsSaved" name="Annual Hours Saved" unit="hrs" />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Scatter data={projects} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export function TimeReductionChart({ projects }: { projects: Project[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={projects}>
        <XAxis dataKey="title" hide />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="currentTimeItakes" name="Before" />
        <Bar dataKey="developmentTime" name="After" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ToolsUsageChart({ projects }: { projects: Project[] }) {
  const data = getToolUsage(projects);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart layout="vertical" data={data}>
        <XAxis type="number" />
        <YAxis type="category" dataKey="tool" />
        <Tooltip />
        <Bar dataKey="count" name="Usage Count" />
      </BarChart>
    </ResponsiveContainer>
  );
}
