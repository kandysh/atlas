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
   Data Selectors
======================= */

const statusData = (projects: Project[]) =>
  Object.values(
    projects.reduce(
      (acc, p) => {
        acc[p.status] ??= { name: p.status, value: 0 };
        acc[p.status].value++;
        return acc;
      },
      {} as Record<string, { name: string; value: number }>,
    ),
  );

const hrsByTheme = (projects: Project[]) =>
  Object.values(
    projects.reduce(
      (acc, p) => {
        acc[p.theme] ??= { theme: p.theme, hrs: 0 };
        acc[p.theme].hrs += p.annualHrsSaved;
        return acc;
      },
      {} as Record<string, { theme: string; hrs: number }>,
    ),
  );

const toolsUsage = (projects: Project[]) =>
  Object.values(
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

/* =======================
   Shared UI
======================= */

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {/* CRITICAL: explicit height */}
      <div className="w-full h-[300px]">{children}</div>
    </div>
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
  const data = statusData(projects);

  return (
    <ChartCard
      title="Initiative Status"
      subtitle="Distribution across lifecycle stages"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={90}
            label
          >
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
    </ChartCard>
  );
}

export function HoursSavedByThemeChart({ projects }: { projects: Project[] }) {
  const data = hrsByTheme(projects);

  return (
    <ChartCard title="Annual Hours Saved" subtitle="Value delivered by theme">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="theme" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="hrs" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DevTimeVsImpactChart({ projects }: { projects: Project[] }) {
  return (
    <ChartCard
      title="Effort vs Impact"
      subtitle="Development time vs annual hours saved"
    >
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <XAxis dataKey="developmentTime" name="Dev Time" unit=" hrs" />
          <YAxis dataKey="annualHrsSaved" name="Impact" unit=" hrs" />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Scatter data={projects} />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ToolsUsageChart({ projects }: { projects: Project[] }) {
  const data = toolsUsage(projects);

  return (
    <ChartCard title="Tools Usage" subtitle="Adoption across initiatives">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data}>
          <XAxis type="number" />
          <YAxis type="category" dataKey="tool" />
          <Tooltip />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function TimeReductionChart({ projects }: { projects: Project[] }) {
  return (
    <ChartCard title="Time Reduction" subtitle="Before vs after automation">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={projects}>
          <XAxis dataKey="title" hide />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="currentTimeItakes" name="Before" />
          <Bar dataKey="developmentTime" name="After" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
