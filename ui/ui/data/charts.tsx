"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  TooltipProps,
  LegendProps,
} from "recharts";

/* =======================
   Types
======================= */

/**
 * Project shape used by the charts.
 */
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
  currentTime: number;
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
   Theme / Palette utilities
   - Reads CSS variables from document root
   - Provides palette array and named status colors
======================= */

const DEFAULT_PALETTE = [
  "#22c55e", // green
  "#3b82f6", // blue
  "#f97316", // orange
  "#f59e0b", // amber
  "#a78bfa", // purple
];

type Palette = {
  palette: string[]; // generic palette entries
  statusColors: Record<string, string>; // mapping for statuses
  tooltipBg: string;
  tooltipFg: string;
  legendBorder: string;
};

/**
 * Hook to read CSS variables for charts (client-only).
 * Falls back to defaults if variables are absent.
 */
function useThemePalette(): Palette {
  const [paletteState, setPaletteState] = useState<Palette | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const s = getComputedStyle(document.documentElement);

      const readColor = (names: string[], fallback: string) => {
        for (const n of names) {
          const v = s.getPropertyValue(n);
          if (v && v.trim()) return v.trim();
        }
        return fallback;
      };

      const palette = [1, 2, 3, 4, 5].map((n, i) =>
        readColor([`--color-chart-${n}`, `--chart-${n}`], DEFAULT_PALETTE[i]),
      );

      const statusColors = {
        active: readColor(
          ["--status-active", "--color-status-active"],
          palette[0],
        ),
        completed: readColor(
          ["--status-completed", "--color-status-completed"],
          palette[1],
        ),
        todo: readColor(["--status-todo", "--color-status-todo"], palette[2]),
      };

      const tooltipBg = readColor(["--tooltip-bg", "--card-bg"], "#111827");
      const tooltipFg = readColor(
        ["--tooltip-fg", "--card-fg", "--foreground"],
        "#ffffff",
      );
      const legendBorder = readColor(
        ["--legend-border", "--border"],
        "rgba(0,0,0,0.08)",
      );

      setPaletteState({
        palette,
        statusColors,
        tooltipBg,
        tooltipFg,
        legendBorder,
      });
    } catch {
      setPaletteState({
        palette: DEFAULT_PALETTE,
        statusColors: {
          active: DEFAULT_PALETTE[0],
          completed: DEFAULT_PALETTE[1],
          todo: DEFAULT_PALETTE[2],
        },
        tooltipBg: "#111827",
        tooltipFg: "#fff",
        legendBorder: "rgba(0,0,0,0.08)",
      });
    }
  }, []);

  return (
    paletteState ?? {
      palette: DEFAULT_PALETTE,
      statusColors: {
        active: DEFAULT_PALETTE[0],
        completed: DEFAULT_PALETTE[1],
        todo: DEFAULT_PALETTE[2],
      },
      tooltipBg: "#111827",
      tooltipFg: "#fff",
      legendBorder: "rgba(0,0,0,0.08)",
    }
  );
}

/* =======================
   Custom Legend
   - Renders color swatches and labels.
   - Recharts passes `payload` describing series.
======================= */

function CustomLegend({ payload, style }: LegendProps & { style?: any }) {
  const { palette, legendBorder } = useThemePalette();

  if (!payload || !Array.isArray(payload)) return null;

  return (
    <div
      className="flex gap-3 flex-wrap items-center"
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        ...style,
      }}
    >
      {payload.map((entry: any, idx: number) => {
        // If entry has color already, prefer it, else pick from palette
        const color = entry.color ?? palette[idx % palette.length];
        return (
          <div
            key={`legend-${entry.value ?? entry.name ?? idx}`}
            className="flex items-center gap-2"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: color,
                border: `1px solid ${legendBorder}`,
                display: "inline-block",
              }}
            />
            <span className="text-xs" style={{ fontSize: 12 }}>
              {entry.value ?? entry.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* =======================
   Custom Tooltip
   - Styled to read CSS variables.
   - Works for Bar, Pie, Scatter tooltips.
======================= */

function CustomTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  const { tooltipBg, tooltipFg } = useThemePalette();

  if (!active || !payload || payload.length === 0) return null;

  // payload is an array of series for the hovered point
  return (
    <div
      className="rounded-md p-2"
      style={{
        background: tooltipBg,
        color: tooltipFg,
        padding: 10,
        borderRadius: 8,
        boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
        minWidth: 140,
      }}
    >
      {label !== undefined && (
        <div className="text-xs opacity-80 mb-1" style={{ fontSize: 12 }}>
          {label}
        </div>
      )}
      {payload.map((p: any, i: number) => (
        <div
          key={i}
          className="flex gap-2 items-center"
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            margin: "4px 0",
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: p.color ?? p.payload?.fill ?? p.fill ?? "#666",
              display: "inline-block",
            }}
          />
          <div style={{ fontSize: 13 }}>
            <div style={{ fontWeight: 600 }}>
              {p.name ?? p.dataKey ?? p.seriesName}
            </div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>{p.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =======================
   Charts
======================= */

/**
 * StatusPieChart
 * - Uses status color mapping
 * - Shows custom tooltip and legend
 */
export function StatusPieChart({ projects }: { projects: Project[] }) {
  const data = statusData(projects);
  const { statusColors } = useThemePalette();

  // Prepare payload for legend so it shows counts
  const legendPayload = data.map((d) => ({
    value: `${d.name} (${d.value})`,
    color: statusColors[d.name] ?? DEFAULT_PALETTE[0],
  }));

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
                fill={statusColors[d.name] ?? DEFAULT_PALETTE[0]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            content={(props) => (
              <CustomLegend
                {...(props as LegendProps)}
                payload={legendPayload as any}
              />
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/**
 * HoursSavedByThemeChart
 * - Bars colored from the theme palette
 * - Styled tooltip and custom legend
 */
export function HoursSavedByThemeChart({ projects }: { projects: Project[] }) {
  const data = hrsByTheme(projects);
  const { palette } = useThemePalette();

  // Legend payload: theme names with colors
  const legendPayload = data.map((d, idx) => ({
    value: d.theme,
    color: palette[idx % palette.length],
  }));

  return (
    <ChartCard title="Annual Hours Saved" subtitle="Value delivered by theme">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="theme" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            content={(props) => (
              <CustomLegend
                {...(props as LegendProps)}
                payload={legendPayload as any}
              />
            )}
          />
          <Bar dataKey="hrs" radius={[6, 6, 0, 0]}>
            {data.map((_, idx) => (
              <Cell key={`cell-${idx}`} fill={palette[idx % palette.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/**
 * DevTimeVsImpactChart
 * - Per-point coloring by `status` using the status mapping
 * - Uses a custom shape renderer to color points
 * - Custom tooltip shows project title + values
 */
function ScatterPoint({
  cx,
  cy,
  payload,
  statusColors,
}: {
  cx?: number;
  cy?: number;
  payload?: any;
  statusColors: Record<string, string>;
}) {
  if (cx === undefined || cy === undefined || !payload) return null;
  const color = statusColors[payload.status] ?? "#666";
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={color}
        stroke="rgba(0,0,0,0.06)"
        strokeWidth={1}
      />
      {/* small inner dot for contrast */}
      <circle cx={cx} cy={cy} r={2} fill="rgba(255,255,255,0.9)" />
    </g>
  );
}

export function DevTimeVsImpactChart({ projects }: { projects: Project[] }) {
  const { statusColors } = useThemePalette();

  // scatter expects x/y keys on data, we pass developmentTime and annualHrsSaved
  const scatterData = projects.map((p) => ({
    ...p,
    x: p.developmentTime,
    y: p.annualHrsSaved,
  }));

  return (
    <ChartCard
      title="Effort vs Impact"
      subtitle="Development time vs annual hours saved"
    >
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <XAxis dataKey="x" name="Dev Time" unit=" hrs" />
          <YAxis dataKey="y" name="Impact" unit=" hrs" />
          <Tooltip content={<CustomTooltip />} />
          <Scatter
            data={scatterData}
            // use custom shape so each point can use status color
            shape={(props) => (
              <ScatterPoint {...(props as any)} statusColors={statusColors} />
            )}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/**
 * ToolsUsageChart
 * - vertical bars colored from palette
 * - custom legend + tooltip
 */
export function ToolsUsageChart({ projects }: { projects: Project[] }) {
  const data = toolsUsage(projects);
  const { palette } = useThemePalette();

  const legendPayload = data.map((d, idx) => ({
    value: d.tool,
    color: palette[idx % palette.length],
  }));

  return (
    <ChartCard title="Tools Usage" subtitle="Adoption across initiatives">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data}>
          <XAxis type="number" />
          <YAxis type="category" dataKey="tool" />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            content={(props) => (
              <CustomLegend
                {...(props as LegendProps)}
                payload={legendPayload as any}
              />
            )}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {data.map((_, idx) => (
              <Cell
                key={`tool-cell-${idx}`}
                fill={palette[idx % palette.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/**
 * TimeReductionChart
 * - before/after bars colored via palette
 * - custom legend and tooltip
 */
export function TimeReductionChart({ projects }: { projects: Project[] }) {
  const { palette } = useThemePalette();

  const beforeColor = palette[0];
  const afterColor = palette[1];

  const legendPayload = [
    { value: "Before", color: beforeColor },
    { value: "After", color: afterColor },
  ];

  return (
    <ChartCard title="Time Reduction" subtitle="Before vs after automation">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={projects}>
          <XAxis dataKey="title" hide />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            content={(props) => (
              <CustomLegend
                {...(props as LegendProps)}
                payload={legendPayload as any}
              />
            )}
          />
          <Bar dataKey="currentTimeItakes" name="Before" fill={beforeColor} />
          <Bar dataKey="developmentTime" name="After" fill={afterColor} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
